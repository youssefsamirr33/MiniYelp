using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniYelp.API.Common.Extensions;
using MiniYelp.Application.Features.Reservations;
using MiniYelp.Domain.Enums;

namespace MiniYelp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ReservationsController(IReservationService reservationService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationRequest request, CancellationToken cancellationToken)
    {
        var reservation = await reservationService.CreateReservationAsync(request, User.GetUserId(), cancellationToken);
        return Ok(reservation);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyCollection<ReservationDto>>> MyReservations(CancellationToken cancellationToken)
    {
        var reservations = await reservationService.GetMyReservationsAsync(User.GetUserId(), cancellationToken);
        return Ok(reservations);
    }

    [HttpGet("/api/owner/reservations")]
    [Authorize(Roles = $"{UserRole.Owner},{UserRole.Admin}")]
    public async Task<ActionResult<IReadOnlyCollection<ReservationDto>>> OwnerReservations(CancellationToken cancellationToken)
    {
        var reservations = await reservationService.GetOwnerReservationsAsync(User.GetUserId(), cancellationToken);
        return Ok(reservations);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = $"{UserRole.Owner},{UserRole.Admin}")]
    public async Task<ActionResult<ReservationDto>> UpdateStatus(int id, [FromBody] UpdateReservationStatusRequest request, CancellationToken cancellationToken)
    {
        var reservation = await reservationService.UpdateStatusAsync(id, request, User.GetUserId(), User.IsInRole(UserRole.Admin), cancellationToken);
        return Ok(reservation);
    }
}
