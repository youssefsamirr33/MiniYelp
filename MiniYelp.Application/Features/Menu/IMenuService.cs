namespace MiniYelp.Application.Features.Menu;

public interface IMenuService
{
    Task<IReadOnlyCollection<MenuSectionDto>> GetRestaurantMenuAsync(int restaurantId, CancellationToken cancellationToken = default);
}
