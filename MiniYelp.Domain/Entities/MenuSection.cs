namespace MiniYelp.Domain.Entities;

public sealed class MenuSection : BaseEntity
{
    public int RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }

    public Restaurant? Restaurant { get; set; }
    public ICollection<MenuItem> Items { get; set; } = new List<MenuItem>();
}
