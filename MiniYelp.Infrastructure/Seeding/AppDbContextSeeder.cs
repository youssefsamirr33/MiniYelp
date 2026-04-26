using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MiniYelp.Domain.Entities;
using MiniYelp.Domain.Enums;
using MiniYelp.Infrastructure.Identity;

namespace MiniYelp.Infrastructure.Seeding;

public static class AppDbContextSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<Persistence.AppDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        await dbContext.Database.MigrateAsync();

        foreach (var role in UserRole.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<int>(role));
            }
        }

        await SeedUsersAsync(userManager);
        await SeedCuisinesAsync(dbContext);
        await SeedRestaurantsAsync(dbContext, userManager);
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        await EnsureUserAsync(userManager, "admin@miniyelp.local", "MiniYelp Admin", "Admin123!", UserRole.Admin);
        await EnsureUserAsync(userManager, "owner@miniyelp.local", "Demo Owner", "Owner123!", UserRole.Owner);
        await EnsureUserAsync(userManager, "customer@miniyelp.local", "Demo Customer", "Customer123!", UserRole.Customer);
    }

    private static async Task EnsureUserAsync(UserManager<ApplicationUser> userManager, string email, string fullName, string password, string role)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                Email = email,
                UserName = email,
                FullName = fullName,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException($"Unable to seed user {email}: {string.Join(" ", createResult.Errors.Select(x => x.Description))}");
            }
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }
    }

    private static async Task SeedCuisinesAsync(Persistence.AppDbContext dbContext)
    {
        if (!await dbContext.Cuisines.AnyAsync())
        {
            dbContext.Cuisines.AddRange(
                new Cuisine { Name = "Egyptian", Description = "Traditional Egyptian cuisine." },
                new Cuisine { Name = "Italian", Description = "Pasta, pizza, and Italian classics." },
                new Cuisine { Name = "American", Description = "Burgers, steaks, and comfort food." },
                new Cuisine { Name = "Seafood", Description = "Fresh seafood specialties." },
                new Cuisine { Name = "Cafe", Description = "Coffee, desserts, and light meals." });

            await dbContext.SaveChangesAsync();
        }
    }

    private static async Task SeedRestaurantsAsync(Persistence.AppDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        if (await dbContext.Restaurants.AnyAsync())
        {
            return;
        }

        var owner = await userManager.FindByEmailAsync("owner@miniyelp.local")
            ?? throw new InvalidOperationException("Owner seed user was not found.");

        var customer = await userManager.FindByEmailAsync("customer@miniyelp.local")
            ?? throw new InvalidOperationException("Customer seed user was not found.");

        var italianCuisine = await dbContext.Cuisines.FirstAsync(x => x.Name == "Italian");
        var egyptianCuisine = await dbContext.Cuisines.FirstAsync(x => x.Name == "Egyptian");
        var cafeCuisine = await dbContext.Cuisines.FirstAsync(x => x.Name == "Cafe");

        var restaurants = new[]
        {
            new Restaurant
            {
                Name = "Trattoria Roma",
                Description = "Warm Italian dining with handmade pasta, pizza, and candle-lit evening reservations.",
                CuisineId = italianCuisine.Id,
                PriceRange = PriceRange.Expensive,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName = "Zamalek Branch",
                        Address = "14 Brazil Street, Zamalek",
                        City = "Cairo",
                        PhoneNumber = "+20 100 200 3001",
                        Capacity = 80,
                        OpeningHours = "Daily 12:00 PM - 12:00 AM"
                    },
                    new RestaurantBranch
                    {
                        BranchName = "New Cairo Branch",
                        Address = "Point 90 Mall, Fifth Settlement",
                        City = "New Cairo",
                        PhoneNumber = "+20 100 200 3002",
                        Capacity = 120,
                        OpeningHours = "Daily 1:00 PM - 1:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name = "Starters",
                        Description = "Small plates to begin the evening.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Bruschetta Trio", Description = "Tomato, mushroom, and olive bruschetta.", Price = 160, ImageUrl = "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Burrata Plate", Description = "Creamy burrata with basil oil and cherry tomatoes.", Price = 210, ImageUrl = "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name = "Signature Mains",
                        Description = "Best-selling dishes for dinner reservations and delivery.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Truffle Tagliatelle", Description = "Fresh pasta finished with truffle cream and parmesan.", Price = 320, ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Roma Margherita", Description = "Wood-fired pizza with buffalo mozzarella and basil.", Price = 275, ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Beautiful service, fast reservation handling, and excellent pasta." }
                }
            },
            new Restaurant
            {
                Name = "Bayt El Kebab",
                Description = "Classic Egyptian grill house known for mixed grills, family bookings, and reliable local flavor.",
                CuisineId = egyptianCuisine.Id,
                PriceRange = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName = "Heliopolis Branch",
                        Address = "Omar Ibn El Khattab Street, Heliopolis",
                        City = "Cairo",
                        PhoneNumber = "+20 100 200 3010",
                        Capacity = 95,
                        OpeningHours = "Daily 11:00 AM - 1:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name = "Grill Platters",
                        Description = "Big portions for sharing and delivery.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Mixed Grill Tray", Description = "Kofta, kebab, chicken shish, and rice.", Price = 340, ImageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Alexandrian Liver", Description = "Spicy liver skillet with baladi bread.", Price = 175, ImageUrl = "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                }
            },
            new Restaurant
            {
                Name = "Saffron Corner Cafe",
                Description = "A bright cafe for brunch, desserts, and laptop-friendly casual bookings.",
                CuisineId = cafeCuisine.Id,
                PriceRange = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName = "Maadi Branch",
                        Address = "Road 9, Maadi",
                        City = "Cairo",
                        PhoneNumber = "+20 100 200 3020",
                        Capacity = 60,
                        OpeningHours = "Daily 8:00 AM - 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name = "Brunch",
                        Description = "Comfort brunch favorites.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Avocado Halloumi Toast", Description = "Sourdough toast with smashed avocado and grilled halloumi.", Price = 190, ImageUrl = "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "French Toast Stack", Description = "Brioche toast with berries, cream, and syrup.", Price = 165, ImageUrl = "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name = "Coffee & Dessert",
                        Description = "Cafe staples for dine-in and takeaway.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Spanish Latte", Description = "Rich espresso with condensed milk and silky foam.", Price = 95, ImageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "San Sebastian Cheesecake", Description = "Burnt basque cheesecake with berry compote.", Price = 145, ImageUrl = "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                }
            }
        };

        dbContext.Restaurants.AddRange(restaurants);
        await dbContext.SaveChangesAsync();

        foreach (var restaurant in restaurants)
        {
            dbContext.RestaurantOwners.Add(new RestaurantOwner
            {
                RestaurantId = restaurant.Id,
                UserId = owner.Id
            });
        }

        await dbContext.SaveChangesAsync();
    }
}
