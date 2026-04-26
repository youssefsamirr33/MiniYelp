namespace MiniYelp.Domain.Entities;

public sealed class RestaurantBranch : BaseEntity
{
    public int RestaurantId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string OpeningHours { get; set; } = string.Empty;

    public Restaurant? Restaurant { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
