using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniYelp.Application.Features.Menu;

namespace MiniYelp.API.Controllers;

[ApiController]
[Route("api/restaurants/{restaurantId:int}/menu")]
public sealed class MenuController(IMenuService menuService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyCollection<MenuSectionDto>>> GetRestaurantMenu(int restaurantId, CancellationToken cancellationToken)
    {
        var menu = await menuService.GetRestaurantMenuAsync(restaurantId, cancellationToken);
        return Ok(menu);
    }
}
