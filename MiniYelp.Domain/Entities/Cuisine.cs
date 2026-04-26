namespace MiniYelp.Domain.Entities;

public sealed class Cuisine : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<Restaurant> Restaurants { get; set; } = new List<Restaurant>();
}
