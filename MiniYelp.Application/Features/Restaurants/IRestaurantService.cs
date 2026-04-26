namespace MiniYelp.Application.Features.Restaurants;

public interface IRestaurantService
{
    Task<IReadOnlyCollection<RestaurantListItemDto>> GetRestaurantsAsync(RestaurantFilterRequest filter, CancellationToken cancellationToken = default);
    Task<RestaurantDetailsDto> GetRestaurantByIdAsync(int restaurantId, CancellationToken cancellationToken = default);
    Task<RestaurantDetailsDto> CreateRestaurantAsync(CreateRestaurantRequest request, int currentUserId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<RestaurantBranchDto> AddBranchAsync(int restaurantId, AddRestaurantBranchRequest request, int currentUserId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CuisineDto>> GetCuisinesAsync(CancellationToken cancellationToken = default);
}
