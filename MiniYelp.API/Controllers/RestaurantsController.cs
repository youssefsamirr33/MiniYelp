using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniYelp.API.Common.Extensions;
using MiniYelp.Application.Features.Restaurants;
using MiniYelp.Domain.Enums;

namespace MiniYelp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class RestaurantsController(IRestaurantService restaurantService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyCollection<RestaurantListItemDto>>> GetAll([FromQuery] RestaurantFilterRequest filter, CancellationToken cancellationToken)
    {
        var restaurants = await restaurantService.GetRestaurantsAsync(filter, cancellationToken);
        return Ok(restaurants);
    }

    [HttpGet("cuisines")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyCollection<CuisineDto>>> GetCuisines(CancellationToken cancellationToken)
    {
        var cuisines = await restaurantService.GetCuisinesAsync(cancellationToken);
        return Ok(cuisines);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<RestaurantDetailsDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var restaurant = await restaurantService.GetRestaurantByIdAsync(id, cancellationToken);
        return Ok(restaurant);
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRole.Owner},{UserRole.Admin}")]
    public async Task<ActionResult<RestaurantDetailsDto>> Create([FromBody] CreateRestaurantRequest request, CancellationToken cancellationToken)
    {
        var restaurant = await restaurantService.CreateRestaurantAsync(request, User.GetUserId(), User.IsInRole(UserRole.Admin), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = restaurant.Id }, restaurant);
    }

    [HttpPost("{id:int}/branches")]
    [Authorize(Roles = $"{UserRole.Owner},{UserRole.Admin}")]
    public async Task<ActionResult<RestaurantBranchDto>> AddBranch(int id, [FromBody] AddRestaurantBranchRequest request, CancellationToken cancellationToken)
    {
        var branch = await restaurantService.AddBranchAsync(id, request, User.GetUserId(), User.IsInRole(UserRole.Admin), cancellationToken);
        return Ok(branch);
    }
}
