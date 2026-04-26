using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MiniYelp.Application.Common.Exceptions;
using MiniYelp.Application.Common.Interfaces;
using MiniYelp.Application.Features.Menu;

namespace MiniYelp.Infrastructure.Services;

public sealed class MenuService(IApplicationDbContext dbContext) : IMenuService
{
    public async Task<IReadOnlyCollection<MenuSectionDto>> GetRestaurantMenuAsync(int restaurantId, CancellationToken cancellationToken = default)
    {
        var restaurantExists = await dbContext.Restaurants.AnyAsync(x => x.Id == restaurantId, cancellationToken);
        if (!restaurantExists)
        {
            throw new AppException("Restaurant not found.", StatusCodes.Status404NotFound);
        }

        return await dbContext.MenuSections
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new MenuSectionDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Items = x.Items
                    .OrderBy(item => item.Name)
                    .Select(item => new MenuItemDto
                    {
                        Id = item.Id,
                        Name = item.Name,
                        Description = item.Description,
                        Price = item.Price,
                        IsAvailable = item.IsAvailable,
                        ImageUrl = item.ImageUrl
                    })
                    .ToArray()
            })
            .ToListAsync(cancellationToken);
    }
}
