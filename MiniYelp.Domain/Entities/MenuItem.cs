namespace MiniYelp.Domain.Entities;

public sealed class MenuItem : BaseEntity
{
    public int MenuSectionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; }

    public MenuSection? MenuSection { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
