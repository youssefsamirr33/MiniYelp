namespace MiniYelp.Domain.Entities;

public sealed class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public Order? Order { get; set; }
    public MenuItem? MenuItem { get; set; }
}
