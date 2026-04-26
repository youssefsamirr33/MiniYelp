using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniYelp.API.Common.Extensions;
using MiniYelp.Application.Features.Reviews;
using MiniYelp.Domain.Enums;

namespace MiniYelp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ReviewsController(IReviewService reviewService) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewRequest request, CancellationToken cancellationToken)
    {
        var review = await reviewService.CreateReviewAsync(request, User.GetUserId(), cancellationToken);
        return Ok(review);
    }

    [HttpGet("/api/restaurants/{restaurantId:int}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyCollection<ReviewDto>>> RestaurantReviews(int restaurantId, CancellationToken cancellationToken)
    {
        var reviews = await reviewService.GetRestaurantReviewsAsync(restaurantId, cancellationToken);
        return Ok(reviews);
    }

    [HttpGet("/api/owner/reviews")]
    [Authorize(Roles = $"{UserRole.Owner},{UserRole.Admin}")]
    public async Task<ActionResult<IReadOnlyCollection<ReviewDto>>> OwnerReviews(CancellationToken cancellationToken)
    {
        var reviews = await reviewService.GetOwnerReviewsAsync(User.GetUserId(), cancellationToken);
        return Ok(reviews);
    }
}
