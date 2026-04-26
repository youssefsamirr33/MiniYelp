using Microsoft.EntityFrameworkCore;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Cuisine> Cuisines { get; }
    DbSet<Restaurant> Restaurants { get; }
    DbSet<RestaurantBranch> RestaurantBranches { get; }
    DbSet<RestaurantOwner> RestaurantOwners { get; }
    DbSet<Reservation> Reservations { get; }
    DbSet<Review> Reviews { get; }
    DbSet<MenuSection> MenuSections { get; }
    DbSet<MenuItem> MenuItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
