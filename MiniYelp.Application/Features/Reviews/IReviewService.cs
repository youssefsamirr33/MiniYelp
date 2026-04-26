namespace MiniYelp.Application.Features.Reviews;

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(CreateReviewRequest request, int currentUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReviewDto>> GetRestaurantReviewsAsync(int restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReviewDto>> GetOwnerReviewsAsync(int currentUserId, CancellationToken cancellationToken = default);
}
