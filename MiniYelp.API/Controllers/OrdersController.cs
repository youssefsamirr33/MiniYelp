using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniYelp.API.Common.Extensions;
using MiniYelp.Application.Features.Orders;

namespace MiniYelp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var order = await orderService.CreateOrderAsync(request, User.GetUserId(), cancellationToken);
        return Ok(order);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyCollection<OrderDto>>> MyOrders(CancellationToken cancellationToken)
    {
        var orders = await orderService.GetMyOrdersAsync(User.GetUserId(), cancellationToken);
        return Ok(orders);
    }
}
