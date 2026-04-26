namespace MiniYelp.Domain.Entities;

public sealed class Review : BaseEntity
{
    public int UserId { get; set; }
    public int RestaurantId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;

    public Restaurant? Restaurant { get; set; }
}
