using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MiniYelp.Application.Common.Exceptions;
using MiniYelp.Application.Common.Interfaces;
using MiniYelp.Application.Features.Restaurants;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Services;

public sealed class RestaurantService(IApplicationDbContext dbContext) : IRestaurantService
{
    public async Task<IReadOnlyCollection<RestaurantListItemDto>> GetRestaurantsAsync(RestaurantFilterRequest filter, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Restaurants
            .AsNoTracking()
            .Include(x => x.Cuisine)
            .Include(x => x.Branches)
            .Include(x => x.Reviews)
            .Where(x => x.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.City))
        {
            var city = filter.City.Trim().ToLower();
            query = query.Where(x => x.Branches.Any(b => b.City.ToLower() == city));
        }

        if (filter.CuisineId.HasValue)
        {
            query = query.Where(x => x.CuisineId == filter.CuisineId.Value);
        }

        if (filter.PriceRange.HasValue)
        {
            query = query.Where(x => x.PriceRange == filter.PriceRange.Value);
        }

        var restaurants = await query
            .OrderBy(x => x.Name)
            .Select(x => new RestaurantListItemDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                PriceRange = x.PriceRange,
                CuisineName = x.Cuisine!.Name,
                AverageRating = x.Reviews.Any() ? Math.Round(x.Reviews.Average(r => r.Rating), 2) : 0,
                ReviewsCount = x.Reviews.Count,
                Cities = x.Branches.Select(b => b.City).Distinct().OrderBy(c => c).ToArray()
            })
            .ToListAsync(cancellationToken);

        return restaurants;
    }

    public async Task<RestaurantDetailsDto> GetRestaurantByIdAsync(int restaurantId, CancellationToken cancellationToken = default)
    {
        var restaurant = await dbContext.Restaurants
            .AsNoTracking()
            .Include(x => x.Cuisine)
            .Include(x => x.Branches)
            .Include(x => x.Reviews)
            .FirstOrDefaultAsync(x => x.Id == restaurantId, cancellationToken)
            ?? throw new AppException("Restaurant not found.", StatusCodes.Status404NotFound);

        return MapDetails(restaurant);
    }

    public async Task<RestaurantDetailsDto> CreateRestaurantAsync(CreateRestaurantRequest request, int currentUserId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var cuisineExists = await dbContext.Cuisines.AnyAsync(x => x.Id == request.CuisineId, cancellationToken);
        if (!cuisineExists)
        {
            throw new AppException("Cuisine not found.", StatusCodes.Status404NotFound);
        }

        var restaurant = new Restaurant
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            PriceRange = request.PriceRange,
            CuisineId = request.CuisineId
        };

        dbContext.Restaurants.Add(restaurant);
        await dbContext.SaveChangesAsync(cancellationToken);

        if (!isAdmin)
        {
            dbContext.RestaurantOwners.Add(new RestaurantOwner
            {
                RestaurantId = restaurant.Id,
                UserId = currentUserId
            });
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return await GetRestaurantByIdAsync(restaurant.Id, cancellationToken);
    }

    public async Task<RestaurantBranchDto> AddBranchAsync(int restaurantId, AddRestaurantBranchRequest request, int currentUserId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var restaurant = await dbContext.Restaurants.FirstOrDefaultAsync(x => x.Id == restaurantId, cancellationToken)
            ?? throw new AppException("Restaurant not found.", StatusCodes.Status404NotFound);

        if (!isAdmin)
        {
            var ownsRestaurant = await dbContext.RestaurantOwners.AnyAsync(x => x.RestaurantId == restaurant.Id && x.UserId == currentUserId, cancellationToken);
            if (!ownsRestaurant)
            {
                throw new AppException("You are not allowed to manage this restaurant.", StatusCodes.Status403Forbidden);
            }
        }

        var branch = new RestaurantBranch
        {
            RestaurantId = restaurant.Id,
            BranchName = request.BranchName.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            Capacity = request.Capacity,
            OpeningHours = request.OpeningHours.Trim()
        };

        dbContext.RestaurantBranches.Add(branch);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new RestaurantBranchDto
        {
            Id = branch.Id,
            BranchName = branch.BranchName,
            Address = branch.Address,
            City = branch.City,
            PhoneNumber = branch.PhoneNumber,
            Capacity = branch.Capacity,
            OpeningHours = branch.OpeningHours
        };
    }

    public async Task<IReadOnlyCollection<CuisineDto>> GetCuisinesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Cuisines
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new CuisineDto
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToListAsync(cancellationToken);
    }

    private static RestaurantDetailsDto MapDetails(Restaurant restaurant)
    {
        return new RestaurantDetailsDto
        {
            Id = restaurant.Id,
            Name = restaurant.Name,
            Description = restaurant.Description,
            PriceRange = restaurant.PriceRange,
            IsActive = restaurant.IsActive,
            Cuisine = new CuisineDto
            {
                Id = restaurant.CuisineId,
                Name = restaurant.Cuisine?.Name ?? string.Empty
            },
            AverageRating = restaurant.Reviews.Any() ? Math.Round(restaurant.Reviews.Average(x => x.Rating), 2) : 0,
            ReviewsCount = restaurant.Reviews.Count,
            Branches = restaurant.Branches
                .OrderBy(x => x.City)
                .ThenBy(x => x.BranchName)
                .Select(x => new RestaurantBranchDto
                {
                    Id = x.Id,
                    BranchName = x.BranchName,
                    Address = x.Address,
                    City = x.City,
                    PhoneNumber = x.PhoneNumber,
                    Capacity = x.Capacity,
                    OpeningHours = x.OpeningHours
                })
                .ToArray()
        };
    }
}
