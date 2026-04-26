using MiniYelp.Domain.Enums;

namespace MiniYelp.Domain.Entities;

public sealed class Order : BaseEntity
{
    public int UserId { get; set; }
    public int RestaurantId { get; set; }
    public int RestaurantBranchId { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string? Notes { get; set; }

    public Restaurant? Restaurant { get; set; }
    public RestaurantBranch? RestaurantBranch { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
