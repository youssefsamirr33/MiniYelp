namespace MiniYelp.Application.Features.Reservations;

public interface IReservationService
{
    Task<ReservationDto> CreateReservationAsync(CreateReservationRequest request, int currentUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReservationDto>> GetMyReservationsAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ReservationDto>> GetOwnerReservationsAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<ReservationDto> UpdateStatusAsync(int reservationId, UpdateReservationStatusRequest request, int currentUserId, bool isAdmin, CancellationToken cancellationToken = default);
}
