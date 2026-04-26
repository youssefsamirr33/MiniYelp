using System.Linq.Expressions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MiniYelp.Application.Common.Exceptions;
using MiniYelp.Application.Common.Interfaces;
using MiniYelp.Application.Features.Orders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Services;

public sealed class OrderService(IApplicationDbContext dbContext) : IOrderService
{
    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, int currentUserId, CancellationToken cancellationToken = default)
    {
        var restaurant = await dbContext.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.RestaurantId, cancellationToken)
            ?? throw new AppException("Restaurant not found.", StatusCodes.Status404NotFound);

        var branch = await dbContext.RestaurantBranches
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.RestaurantBranchId && x.RestaurantId == request.RestaurantId, cancellationToken)
            ?? throw new AppException("Branch not found for the selected restaurant.", StatusCodes.Status404NotFound);

        var menuItemIds = request.Items.Select(x => x.MenuItemId).Distinct().ToArray();
        var menuItems = await dbContext.MenuItems
            .AsNoTracking()
            .Include(x => x.MenuSection)
            .Where(x => menuItemIds.Contains(x.Id) && x.MenuSection!.RestaurantId == request.RestaurantId && x.IsAvailable)
            .ToListAsync(cancellationToken);

        if (menuItems.Count != menuItemIds.Length)
        {
            throw new AppException("One or more menu items are unavailable.", StatusCodes.Status400BadRequest);
        }

        var orderItems = request.Items
            .Select(itemRequest =>
            {
                var menuItem = menuItems.First(x => x.Id == itemRequest.MenuItemId);
                return new OrderItem
                {
                    MenuItemId = menuItem.Id,
                    Quantity = itemRequest.Quantity,
                    UnitPrice = menuItem.Price
                };
            })
            .ToList();

        var totalAmount = orderItems.Sum(x => x.UnitPrice * x.Quantity);

        var order = new Order
        {
            UserId = currentUserId,
            RestaurantId = request.RestaurantId,
            RestaurantBranchId = request.RestaurantBranchId,
            DeliveryAddress = request.DeliveryAddress.Trim(),
            Notes = request.Notes?.Trim(),
            TotalAmount = totalAmount,
            Items = orderItems
        };

        dbContext.Orders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetOrderByIdAsync(order.Id, currentUserId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<OrderDto>> GetMyOrdersAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Orders
            .AsNoTracking()
            .Include(x => x.Restaurant)
            .Include(x => x.RestaurantBranch)
            .Include(x => x.Items)
            .ThenInclude(x => x.MenuItem)
            .Where(x => x.UserId == currentUserId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(MapOrder())
            .ToListAsync(cancellationToken);
    }

    private async Task<OrderDto> GetOrderByIdAsync(int orderId, int currentUserId, CancellationToken cancellationToken)
    {
        return await dbContext.Orders
            .AsNoTracking()
            .Include(x => x.Restaurant)
            .Include(x => x.RestaurantBranch)
            .Include(x => x.Items)
            .ThenInclude(x => x.MenuItem)
            .Where(x => x.Id == orderId && x.UserId == currentUserId)
            .Select(MapOrder())
            .FirstAsync(cancellationToken);
    }

    private static Expression<Func<Order, OrderDto>> MapOrder()
    {
        return order => new OrderDto
        {
            Id = order.Id,
            RestaurantId = order.RestaurantId,
            RestaurantName = order.Restaurant!.Name,
            RestaurantBranchId = order.RestaurantBranchId,
            BranchName = order.RestaurantBranch!.BranchName,
            DeliveryAddress = order.DeliveryAddress,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Notes = order.Notes,
            CreatedAtUtc = order.CreatedAtUtc,
            Items = order.Items.Select(item => new OrderItemDto
            {
                MenuItemId = item.MenuItemId,
                MenuItemName = item.MenuItem!.Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.UnitPrice * item.Quantity
            }).ToArray()
        };
    }
}
