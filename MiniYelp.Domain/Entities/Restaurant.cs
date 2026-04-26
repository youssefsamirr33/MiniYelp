using MiniYelp.Domain.Enums;

namespace MiniYelp.Domain.Entities;

public sealed class Restaurant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PriceRange PriceRange { get; set; }
    public bool IsActive { get; set; } = true;
    public int CuisineId { get; set; }

    public Cuisine? Cuisine { get; set; }
    public ICollection<RestaurantBranch> Branches { get; set; } = new List<RestaurantBranch>();
    public ICollection<RestaurantOwner> Owners { get; set; } = new List<RestaurantOwner>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<MenuSection> MenuSections { get; set; } = new List<MenuSection>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
