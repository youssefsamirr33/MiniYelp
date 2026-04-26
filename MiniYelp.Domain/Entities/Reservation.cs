using MiniYelp.Domain.Enums;

namespace MiniYelp.Domain.Entities;

public sealed class Reservation : BaseEntity
{
    public int UserId { get; set; }
    public int RestaurantBranchId { get; set; }
    public DateOnly ReservationDate { get; set; }
    public TimeOnly ReservationTime { get; set; }
    public int PartySize { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public string? Notes { get; set; }

    public RestaurantBranch? RestaurantBranch { get; set; }
}
