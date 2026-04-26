namespace MiniYelp.Domain.Entities;

public sealed class RestaurantOwner : BaseEntity
{
    public int RestaurantId { get; set; }
    public int UserId { get; set; }

    public Restaurant? Restaurant { get; set; }
}
