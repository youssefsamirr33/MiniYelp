using System.ComponentModel.DataAnnotations;
using MiniYelp.Domain.Enums;

namespace MiniYelp.Application.Features.Orders;

public sealed class CreateOrderItemRequest
{
    [Required]
    public int MenuItemId { get; set; }

    [Range(1, 50)]
    public int Quantity { get; set; }
}

public sealed class CreateOrderRequest
{
    [Required]
    public int RestaurantId { get; set; }

    [Required]
    public int RestaurantBranchId { get; set; }

    [Required]
    [MaxLength(300)]
    public string DeliveryAddress { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Notes { get; set; }

    [Required]
    [MinLength(1)]
    public IReadOnlyCollection<CreateOrderItemRequest> Items { get; set; } = Array.Empty<CreateOrderItemRequest>();
}

public sealed class OrderItemDto
{
    public int MenuItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public sealed class OrderDto
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public int RestaurantBranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public IReadOnlyCollection<OrderItemDto> Items { get; set; } = Array.Empty<OrderItemDto>();
    public DateTime CreatedAtUtc { get; set; }
}
