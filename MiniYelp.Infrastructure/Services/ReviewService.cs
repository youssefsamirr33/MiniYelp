using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MiniYelp.Application.Common.Exceptions;
using MiniYelp.Application.Common.Interfaces;
using MiniYelp.Application.Features.Reviews;
using MiniYelp.Domain.Entities;
using MiniYelp.Infrastructure.Identity;

namespace MiniYelp.Infrastructure.Services;

public sealed class ReviewService(
    IApplicationDbContext dbContext,
    UserManager<ApplicationUser> userManager) : IReviewService
{
    public async Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, int currentUserId, CancellationToken cancellationToken = default)
    {
        var restaurant = await dbContext.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.RestaurantId, cancellationToken)
            ?? throw new AppException("Restaurant not found.", StatusCodes.Status404NotFound);

        var existingReview = await dbContext.Reviews.AnyAsync(
            x => x.RestaurantId == request.RestaurantId && x.UserId == currentUserId,
            cancellationToken);

        if (existingReview)
        {
            throw new AppException("You already reviewed this restaurant.", StatusCodes.Status409Conflict);
        }

        var review = new Review
        {
            UserId = currentUserId,
            RestaurantId = request.RestaurantId,
            Rating = request.Rating,
            Comment = request.Comment.Trim()
        };

        dbContext.Reviews.Add(review);
        await dbContext.SaveChangesAsync(cancellationToken);

        var user = await userManager.Users.FirstAsync(x => x.Id == currentUserId, cancellationToken);

        return new ReviewDto
        {
            Id = review.Id,
            UserId = review.UserId,
            RestaurantId = review.RestaurantId,
            RestaurantName = restaurant.Name,
            UserName = user.FullName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAtUtc = review.CreatedAtUtc
        };
    }

    public async Task<IReadOnlyCollection<ReviewDto>> GetRestaurantReviewsAsync(int restaurantId, CancellationToken cancellationToken = default)
    {
        var restaurantExists = await dbContext.Restaurants.AnyAsync(x => x.Id == restaurantId, cancellationToken);
        if (!restaurantExists)
        {
            throw new AppException("Restaurant not found.", StatusCodes.Status404NotFound);
        }

        return await dbContext.Reviews
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .Join(userManager.Users,
                review => review.UserId,
                user => user.Id,
                (review, user) => new ReviewDto
                {
                    Id = review.Id,
                    UserId = review.UserId,
                    RestaurantId = review.RestaurantId,
                    RestaurantName = review.Restaurant!.Name,
                    UserName = user.FullName,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAtUtc = review.CreatedAtUtc
                })
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ReviewDto>> GetOwnerReviewsAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Reviews
            .AsNoTracking()
            .Where(x => dbContext.RestaurantOwners.Any(o => o.RestaurantId == x.RestaurantId && o.UserId == currentUserId))
            .Join(userManager.Users,
                review => review.UserId,
                user => user.Id,
                (review, user) => new ReviewDto
                {
                    Id = review.Id,
                    UserId = review.UserId,
                    RestaurantId = review.RestaurantId,
                    RestaurantName = review.Restaurant!.Name,
                    UserName = user.FullName,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAtUtc = review.CreatedAtUtc
                })
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
