using System.Linq.Expressions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MiniYelp.Application.Common.Exceptions;
using MiniYelp.Application.Common.Interfaces;
using MiniYelp.Application.Features.Reservations;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Services;

public sealed class ReservationService(IApplicationDbContext dbContext) : IReservationService
{
    public async Task<ReservationDto> CreateReservationAsync(CreateReservationRequest request, int currentUserId, CancellationToken cancellationToken = default)
    {
        var branch = await dbContext.RestaurantBranches
            .AsNoTracking()
            .Include(x => x.Restaurant)
            .FirstOrDefaultAsync(x => x.Id == request.RestaurantBranchId, cancellationToken)
            ?? throw new AppException("Branch not found.", StatusCodes.Status404NotFound);

        var reservationDateTime = request.ReservationDate.ToDateTime(request.ReservationTime);
        if (reservationDateTime <= DateTime.Now)
        {
            throw new AppException("Reservation date and time must be in the future.", StatusCodes.Status400BadRequest);
        }

        var reservation = new Reservation
        {
            UserId = currentUserId,
            RestaurantBranchId = request.RestaurantBranchId,
            ReservationDate = request.ReservationDate,
            ReservationTime = request.ReservationTime,
            PartySize = request.PartySize,
            Notes = request.Notes?.Trim()
        };

        dbContext.Reservations.Add(reservation);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ReservationDto
        {
            Id = reservation.Id,
            UserId = reservation.UserId,
            RestaurantBranchId = branch.Id,
            RestaurantName = branch.Restaurant?.Name ?? string.Empty,
            BranchName = branch.BranchName,
            City = branch.City,
            ReservationDate = reservation.ReservationDate,
            ReservationTime = reservation.ReservationTime,
            PartySize = reservation.PartySize,
            Status = reservation.Status,
            Notes = reservation.Notes
        };
    }

    public async Task<IReadOnlyCollection<ReservationDto>> GetMyReservationsAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Reservations
            .AsNoTracking()
            .Include(x => x.RestaurantBranch)
            .ThenInclude(x => x!.Restaurant)
            .Where(x => x.UserId == currentUserId)
            .OrderByDescending(x => x.ReservationDate)
            .ThenByDescending(x => x.ReservationTime)
            .Select(MapProjection())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ReservationDto>> GetOwnerReservationsAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Reservations
            .AsNoTracking()
            .Include(x => x.RestaurantBranch)
            .ThenInclude(x => x!.Restaurant)
            .Where(x => dbContext.RestaurantOwners.Any(o => o.RestaurantId == x.RestaurantBranch!.RestaurantId && o.UserId == currentUserId))
            .OrderByDescending(x => x.ReservationDate)
            .ThenByDescending(x => x.ReservationTime)
            .Select(MapProjection())
            .ToListAsync(cancellationToken);
    }

    public async Task<ReservationDto> UpdateStatusAsync(int reservationId, UpdateReservationStatusRequest request, int currentUserId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var reservation = await dbContext.Reservations
            .Include(x => x.RestaurantBranch)
            .ThenInclude(x => x!.Restaurant)
            .FirstOrDefaultAsync(x => x.Id == reservationId, cancellationToken)
            ?? throw new AppException("Reservation not found.", StatusCodes.Status404NotFound);

        if (!isAdmin)
        {
            var ownsRestaurant = await dbContext.RestaurantOwners.AnyAsync(
                x => x.RestaurantId == reservation.RestaurantBranch!.RestaurantId && x.UserId == currentUserId,
                cancellationToken);

            if (!ownsRestaurant)
            {
                throw new AppException("You are not allowed to update this reservation.", StatusCodes.Status403Forbidden);
            }
        }

        reservation.Status = request.Status;
        reservation.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ReservationDto
        {
            Id = reservation.Id,
            UserId = reservation.UserId,
            RestaurantBranchId = reservation.RestaurantBranchId,
            RestaurantName = reservation.RestaurantBranch?.Restaurant?.Name ?? string.Empty,
            BranchName = reservation.RestaurantBranch?.BranchName ?? string.Empty,
            City = reservation.RestaurantBranch?.City ?? string.Empty,
            ReservationDate = reservation.ReservationDate,
            ReservationTime = reservation.ReservationTime,
            PartySize = reservation.PartySize,
            Status = reservation.Status,
            Notes = reservation.Notes
        };
    }

    private static Expression<Func<Reservation, ReservationDto>> MapProjection()
    {
        return x => new ReservationDto
        {
            Id = x.Id,
            UserId = x.UserId,
            RestaurantBranchId = x.RestaurantBranchId,
            RestaurantName = x.RestaurantBranch!.Restaurant!.Name,
            BranchName = x.RestaurantBranch.BranchName,
            City = x.RestaurantBranch.City,
            ReservationDate = x.ReservationDate,
            ReservationTime = x.ReservationTime,
            PartySize = x.PartySize,
            Status = x.Status,
            Notes = x.Notes
        };
    }
}
