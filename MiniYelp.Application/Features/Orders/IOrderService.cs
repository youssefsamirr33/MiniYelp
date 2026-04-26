namespace MiniYelp.Application.Features.Orders;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, int currentUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OrderDto>> GetMyOrdersAsync(int currentUserId, CancellationToken cancellationToken = default);
}
