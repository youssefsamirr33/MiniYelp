using System.ComponentModel.DataAnnotations;
using MiniYelp.Domain.Enums;

namespace MiniYelp.Application.Features.Reservations;

public sealed class CreateReservationRequest
{
    [Required]
    public int RestaurantBranchId { get; set; }

    [Required]
    public DateOnly ReservationDate { get; set; }

    [Required]
    public TimeOnly ReservationTime { get; set; }

    [Range(1, 50)]
    public int PartySize { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public sealed class UpdateReservationStatusRequest
{
    [Required]
    public ReservationStatus Status { get; set; }
}

public sealed class ReservationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RestaurantBranchId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public DateOnly ReservationDate { get; set; }
    public TimeOnly ReservationTime { get; set; }
    public int PartySize { get; set; }
    public ReservationStatus Status { get; set; }
    public string? Notes { get; set; }
}
