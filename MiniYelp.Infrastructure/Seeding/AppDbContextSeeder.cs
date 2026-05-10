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
                new Cuisine { Name = "Egyptian Street Food",   Description = "Traditional Egyptian breakfast and street food classics." },
                new Cuisine { Name = "Eastern Grills",         Description = "Charcoal-grilled meats and kebabs, Middle-Eastern style." },
                new Cuisine { Name = "Koshari & Casseroles",   Description = "Egyptian koshari, oven casseroles, and hearty local dishes." },
                new Cuisine { Name = "Seafood",                Description = "Fresh fish and seafood straight from the sea to the table." },
                new Cuisine { Name = "Levantine",              Description = "Lebanese and Levantine mezze, grills, and spreads." },
                new Cuisine { Name = "Syrian",                 Description = "Shawarma, fatteh, and authentic Syrian street food." },
                new Cuisine { Name = "Italian",                Description = "Neapolitan pizza, handmade pasta, and Italian classics." },
                new Cuisine { Name = "Asian Fusion",           Description = "Quick-fire Asian wok dishes with signature sauces." },
                new Cuisine { Name = "Japanese & Sushi",       Description = "Sushi rolls, sashimi, and nigiri prepared fresh daily." },
                new Cuisine { Name = "Indian",                 Description = "Curry, tikka masala, and fragrant biryani." },
                new Cuisine { Name = "Mexican",                Description = "Tacos, burritos, and nachos with authentic flavours." },
                new Cuisine { Name = "French",                 Description = "Classic refined French cuisine in an elegant atmosphere." },
                new Cuisine { Name = "Turkish",                Description = "Doner kebab, iskender, and traditional Turkish sweets." },
                new Cuisine { Name = "Burgers & Fast Food",    Description = "Smash burgers, crispy fries, and comfort fast food." },
                new Cuisine { Name = "Steakhouse",             Description = "Premium certified cuts cooked to perfection." },
                new Cuisine { Name = "Breakfast & Brunch",     Description = "Pancakes, eggs Benedict, and specialty coffee." },
                new Cuisine { Name = "Cafe & Desserts",        Description = "Fresh Western pastries and hot beverages." },
                new Cuisine { Name = "Healthy & Diet",         Description = "Calorie-counted balanced meals for a healthy lifestyle." },
                new Cuisine { Name = "Vegan",                  Description = "100% plant-based dishes, entirely animal-product-free." },
                new Cuisine { Name = "Juices & Smoothies",     Description = "Natural cold-pressed juices and detox fruit smoothies." }
            );

            await dbContext.SaveChangesAsync();
        }
    }

    private static async Task SeedRestaurantsAsync(Persistence.AppDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        if (await dbContext.Restaurants.AnyAsync())
            return;

        var owner    = await userManager.FindByEmailAsync("owner@miniyelp.local")
                       ?? throw new InvalidOperationException("Owner seed user was not found.");
        var customer = await userManager.FindByEmailAsync("customer@miniyelp.local")
                       ?? throw new InvalidOperationException("Customer seed user was not found.");

        // ── Cuisine lookups ──────────────────────────────────────────────────────
        Cuisine C(string name) => dbContext.Cuisines.First(x => x.Name == name);

        var restaurants = new[]
        {
            // ── 1. Qasr El Fool ─────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Qasr El Fool",
                Description = "Serving the finest authentic Egyptian breakfast dishes in the heart of Downtown Cairo.",
                CuisineId   = C("Egyptian Street Food").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Downtown Branch",
                        Address       = "Talaat Harb Street, Downtown",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1001",
                        Capacity      = 70,
                        OpeningHours  = "Daily 6:00 AM – 5:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Breakfast Staples",
                        Description  = "Classic Egyptian morning dishes.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Fool Medames Bowl",        Description = "Slow-cooked fava beans seasoned with cumin, lemon, and olive oil, served with baladi bread.",   Price = 35,  ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Ta'meya Plate",            Description = "Crispy Egyptian falafel made from fava beans, served with tahini and fresh vegetables.",           Price = 30,  ImageUrl = "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Eggs & Sausage Skillet",   Description = "Fried eggs with spiced Egyptian sausage (soujok) and fresh tomatoes.",                            Price = 45,  ImageUrl = "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Sides & Beverages",
                        Description  = "Accompaniments to your breakfast.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Baladi Bread Basket",  Description = "Freshly baked traditional Egyptian flatbread.",                          Price = 10, ImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Egyptian Mint Tea",    Description = "Freshly brewed black tea with dried mint leaves, served hot.",            Price = 15, ImageUrl = "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Best fool and ta'meya in Cairo – incredibly fresh and affordable!" }
                }
            },

            // ── 2. Mashawi El-Badiya ─────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Mashawi El-Badiya",
                Description = "Fresh charcoal-grilled meats and Eastern barbecue in an authentic Bedouin-inspired setting.",
                CuisineId   = C("Eastern Grills").Id,
                PriceRange  = PriceRange.Expensive,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Sheikh Zayed Branch",
                        Address       = "Arkan Mall, Sheikh Zayed",
                        City          = "Giza",
                        PhoneNumber   = "+20 100 100 2001",
                        Capacity      = 130,
                        OpeningHours  = "Daily 1:00 PM – 1:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Grill Selection",
                        Description  = "Hand-selected cuts grilled over live charcoal.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Mixed Grill Platter",    Description = "Kofta, lamb chops, chicken shish, and grilled vegetables with garlic sauce.",          Price = 420, ImageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Lamb Kofta Skewers",     Description = "Spiced minced lamb kofta on charcoal skewers, served with rice and salad.",           Price = 280, ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Whole Grilled Chicken",  Description = "Marinated whole chicken grilled over charcoal with chimichurri and pita.",            Price = 320, ImageUrl = "https://images.unsplash.com/photo-1598103442097-8b74394b95c8?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Sides & Dips",
                        Description  = "Perfect accompaniments to the grill.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Grilled Halloumi",  Description = "Thick-cut halloumi cheese grilled until golden.",       Price = 120, ImageUrl = "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Fattoush Salad",    Description = "Fresh vegetables with crispy pita chips and sumac dressing.", Price = 90, ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Unbelievable mixed grill – the lamb chops alone are worth the trip!" }
                }
            },

            // ── 3. Koshari El-Omda ──────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Koshari El-Omda",
                Description = "Egyptian koshari with a signature spice blend, alongside oven-baked casseroles and hearty local dishes.",
                CuisineId   = C("Koshari & Casseroles").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Nasr City Branch",
                        Address       = "Makram Ebeid Street, Nasr City",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 3001",
                        Capacity      = 90,
                        OpeningHours  = "Daily 10:00 AM – 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Koshari",
                        Description  = "Egypt's national dish in every size.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Classic Koshari (Small)",  Description = "Rice, lentils, pasta, crispy onions, and spiced tomato sauce.",                           Price = 35, ImageUrl = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Classic Koshari (Large)",  Description = "Generous portion of koshari with extra crispy onions and hot sauce.",                     Price = 55, ImageUrl = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Oven Casseroles",
                        Description  = "Slow-baked Egyptian casseroles.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Potato & Meat Casserole",  Description = "Layers of seasoned ground beef, sliced potatoes, and béchamel, oven-baked.",            Price = 85, ImageUrl = "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Stuffed Zucchini",         Description = "Tender zucchini stuffed with spiced rice and minced meat in tomato broth.",             Price = 75, ImageUrl = "https://images.unsplash.com/photo-1563699281-d3f1dc6d0e57?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Best koshari in the area – the crispy onions are perfect every time." }
                }
            },

            // ── 4. Loulou'et El-Bahr ────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Loulou'et El-Bahr",
                Description = "Fresh fish and seafood brought straight from the sea to your table, with specialty seafood casseroles.",
                CuisineId   = C("Seafood").Id,
                PriceRange  = PriceRange.Expensive,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Gleem Corniche Branch",
                        Address       = "Gleem District, Corniche",
                        City          = "Alexandria",
                        PhoneNumber   = "+20 100 100 4001",
                        Capacity      = 110,
                        OpeningHours  = "Daily 12:00 PM – 12:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Fresh Fish",
                        Description  = "Daily catch grilled, fried, or baked to order.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Grilled Sea Bass",       Description = "Whole sea bass seasoned with herbs and grilled over charcoal, served with grilled vegetables.", Price = 550, ImageUrl = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Fried Red Mullet",       Description = "Crispy fried red mullet served with tartar sauce and lemon wedges.",                           Price = 420, ImageUrl = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Seafood Casseroles",
                        Description  = "Oven-baked seafood specialties.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Shrimp Casserole",       Description = "Tiger prawns baked in spiced tomato sauce with green peppers and onions.",                     Price = 480, ImageUrl = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Calamari Rings",         Description = "Golden fried calamari rings served with aioli and a side salad.",                              Price = 310, ImageUrl = "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Freshest seafood in Alexandria – the grilled sea bass is absolutely outstanding!" }
                }
            },

            // ── 5. Arzet Lebnan ─────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Arzet Lebnan",
                Description = "An extensive Lebanese mezze spread – cold and hot starters, alongside authentic Levantine grills.",
                CuisineId   = C("Levantine").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "New Cairo Branch",
                        Address       = "Al-Teseen Street, New Cairo",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 5001",
                        Capacity      = 100,
                        OpeningHours  = "Daily 12:00 PM – 1:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Cold Mezze",
                        Description  = "Chilled starters and dips.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Hummus Plate",        Description = "Creamy hummus drizzled with olive oil and sprinkled with paprika, served with warm pita.", Price = 85,  ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Tabbouleh",           Description = "Fresh parsley, bulgur, tomato, and mint salad with lemon-olive oil dressing.",           Price = 75,  ImageUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Baba Ghanoush",       Description = "Smoky roasted eggplant dip with tahini and pomegranate seeds.",                         Price = 80,  ImageUrl = "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Hot Mezze & Grills",
                        Description  = "Warm starters and main grills.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Kibbeh Balls",        Description = "Fried bulgur shells stuffed with spiced minced beef and pine nuts.",                    Price = 110, ImageUrl = "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Aleppo Kebab",        Description = "Hand-spiced lamb kebab from the Aleppo tradition, served with grilled tomatoes.",      Price = 290, ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Authentic Lebanese flavours – the mezze spread is simply unmatched." }
                }
            },

            // ── 6. Dimashq El-Ateeka ─────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Dimashq El-Ateeka",
                Description = "Chicken and meat shawarma seasoned with Syrian spices, alongside fatteh and other Syrian street classics.",
                CuisineId   = C("Syrian").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Hosary Square Branch",
                        Address       = "Al-Hosary Square, 6th of October",
                        City          = "Giza",
                        PhoneNumber   = "+20 100 100 6001",
                        Capacity      = 65,
                        OpeningHours  = "Daily 10:00 AM – 2:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Shawarma",
                        Description  = "Slow-roasted Syrian-style wraps.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Chicken Shawarma Wrap",  Description = "Tender marinated chicken shawarma with garlic sauce, pickles, and fresh vegetables in flatbread.", Price = 120, ImageUrl = "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Meat Shawarma Wrap",     Description = "Sliced spiced beef shawarma with tahini sauce, tomatoes, and onions in flatbread.",               Price = 140, ImageUrl = "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Syrian Classics",
                        Description  = "Traditional Syrian crowd-pleasers.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Chicken Fatteh",         Description = "Shredded chicken over toasted pita, yogurt, tahini, and roasted nuts.",                         Price = 155, ImageUrl = "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Syrian Lentil Soup",     Description = "Velvety red lentil soup with cumin and a squeeze of lemon.",                                    Price = 70,  ImageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Incredible shawarma – crispy edges and perfectly seasoned meat every time." }
                }
            },

            // ── 7. Vita Bella ────────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Vita Bella",
                Description = "Neapolitan-style wood-fired pizza and handmade pasta crafted by an Italian chef.",
                CuisineId   = C("Italian").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Maadi Branch",
                        Address       = "Street 9, Maadi",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 7001",
                        Capacity      = 80,
                        OpeningHours  = "Daily 12:00 PM – 12:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Pizza",
                        Description  = "Wood-fired Neapolitan-style pizzas.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Margherita Classica",  Description = "San Marzano tomato, fresh buffalo mozzarella, and basil on a wood-fired base.",    Price = 260, ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Diavola",              Description = "Spicy salami, fior di latte, and chilli flakes on a smoky tomato base.",           Price = 310, ImageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Pasta",
                        Description  = "Fresh handmade pasta dishes.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Cacio e Pepe",         Description = "Tonnarelli pasta tossed in a creamy Pecorino Romano and black pepper sauce.",     Price = 275, ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Pappardelle al Ragu",  Description = "Wide handmade ribbons with slow-cooked beef ragù and a hint of red wine.",        Price = 305, ImageUrl = "https://images.unsplash.com/photo-1560684352-8497838a2229?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Authentically Italian – the wood-fired crust and handmade pasta are extraordinary." }
                }
            },

            // ── 8. Wok Pan ───────────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Wok Pan",
                Description = "Fast-fired Asian wok dishes bursting with bold flavours and signature house sauces.",
                CuisineId   = C("Asian Fusion").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Zamalek Branch",
                        Address       = "26th of July Street, Zamalek",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 8001",
                        Capacity      = 70,
                        OpeningHours  = "Daily 12:00 PM – 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Wok Mains",
                        Description  = "Signature wok-tossed dishes.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Pad Thai",              Description = "Rice noodles stir-fried with shrimp, egg, bean sprouts, and tamarind sauce.",          Price = 220, ImageUrl = "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Kung Pao Chicken",      Description = "Wok-fried chicken with peanuts, dried chillies, and Sichuan-inspired sauce.",          Price = 235, ImageUrl = "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Teriyaki Beef Rice",    Description = "Glazed tender beef strips over steamed jasmine rice with sesame and spring onion.",    Price = 255, ImageUrl = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Sides & Starters",
                        Description  = "Light bites before the main event.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Spring Rolls (4 pcs)",  Description = "Crispy vegetable spring rolls served with sweet chilli dipping sauce.",               Price = 95,  ImageUrl = "https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Miso Soup",             Description = "Traditional Japanese-style miso broth with tofu and wakame seaweed.",                 Price = 65,  ImageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Great Pad Thai and amazing wok atmosphere – fast service too!" }
                }
            },

            // ── 9. Tokyo Bites ───────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Tokyo Bites",
                Description = "Premium sushi rolls, sashimi platters, and fresh nigiri prepared daily by experienced sushi chefs.",
                CuisineId   = C("Japanese & Sushi").Id,
                PriceRange  = PriceRange.Expensive,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Heliopolis Branch",
                        Address       = "Al-Mirghani Street, Heliopolis",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 9001",
                        Capacity      = 60,
                        OpeningHours  = "Daily 12:00 PM – 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Sushi Rolls",
                        Description  = "Chef's specialty maki and uramaki rolls.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Dragon Roll (8 pcs)",    Description = "Shrimp tempura and cucumber inside, topped with avocado and unagi sauce.",              Price = 320, ImageUrl = "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Spicy Tuna Roll (8 pcs)",Description = "Fresh tuna with spicy mayo, cucumber, and sriracha, rolled in black sesame.",           Price = 295, ImageUrl = "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Sashimi & Nigiri",
                        Description  = "Premium sliced fish and hand-pressed sushi.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Salmon Sashimi (6 pcs)", Description = "Thick-cut premium Norwegian salmon served with pickled ginger and wasabi.",             Price = 350, ImageUrl = "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Assorted Nigiri (6 pcs)",Description = "Chef's selection of seasonal fish pressed on seasoned sushi rice.",                     Price = 340, ImageUrl = "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Freshest sushi in Cairo – the dragon roll is a masterpiece!" }
                }
            },

            // ── 10. Baharat Taj ──────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Baharat Taj",
                Description = "Rich curries, chicken tikka masala, and fragrant meat biryani from the heart of Indian cuisine.",
                CuisineId   = C("Indian").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "New Cairo Branch",
                        Address       = "Water Way, Fifth Settlement",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1010",
                        Capacity      = 85,
                        OpeningHours  = "Daily 12:00 PM – 11:30 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Curries",
                        Description  = "Slow-cooked aromatic Indian curries.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Chicken Tikka Masala",  Description = "Tender chicken tikka simmered in a rich, mildly spiced tomato and cream sauce.",   Price = 340, ImageUrl = "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Lamb Rogan Josh",       Description = "Slow-braised lamb in a Kashmiri spice gravy, served with basmati rice.",           Price = 370, ImageUrl = "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Biryani & Breads",
                        Description  = "Fragrant rice dishes and fresh-baked breads.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Meat Dum Biryani",      Description = "Slow-cooked basmati rice layered with spiced lamb and caramelised onions.",        Price = 395, ImageUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Garlic Naan",           Description = "Soft tandoor-baked flatbread brushed with garlic butter and fresh coriander.",     Price = 65,  ImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Absolutely authentic Indian food – the biryani is soul-warming!" }
                }
            },

            // ── 11. Taco Fiesta ──────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Taco Fiesta",
                Description = "Authentic Mexican tacos, hearty burritos, and loaded nachos in a lively fiesta atmosphere.",
                CuisineId   = C("Mexican").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "6th of October Branch",
                        Address       = "Capital Business Park, Sheikh Zayed",
                        City          = "Giza",
                        PhoneNumber   = "+20 100 100 1011",
                        Capacity      = 75,
                        OpeningHours  = "Daily 11:00 AM – 12:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Tacos",
                        Description  = "Street-style corn tortilla tacos.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Al Pastor Tacos (3 pcs)",    Description = "Marinated pork with pineapple salsa, onion, and coriander in corn tortillas.",      Price = 160, ImageUrl = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Grilled Chicken Tacos (3 pcs)",Description="Smoky grilled chicken with guacamole, pico de gallo, and lime crema.",             Price = 150, ImageUrl = "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Burritos & Sides",
                        Description  = "Hearty wraps and sharing sides.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Beef Burrito",           Description = "Flour tortilla loaded with spiced beef, rice, beans, cheese, and sour cream.",        Price = 195, ImageUrl = "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Loaded Nachos",          Description = "Crispy tortilla chips with melted cheese, jalapeños, guacamole, and salsa.",          Price = 175, ImageUrl = "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Great value Mexican food – the nachos and al pastor tacos are outstanding!" }
                }
            },

            // ── 12. La Maison ────────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "La Maison",
                Description = "Refined classic French cuisine in an elegant, calm dining room with impeccable service.",
                CuisineId   = C("French").Id,
                PriceRange  = PriceRange.Expensive,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Downtown Branch",
                        Address       = "Qasr El-Nil Street, Downtown",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1012",
                        Capacity      = 55,
                        OpeningHours  = "Mon–Sat 1:00 PM – 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Entrées",
                        Description  = "Elegant French starters.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "French Onion Soup",       Description = "Classic onion broth topped with a crouton and bubbling Gruyère crust.",              Price = 195, ImageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Foie Gras Terrine",       Description = "Silky duck foie gras served with brioche toast and fig chutney.",                    Price = 480, ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Plats Principaux",
                        Description  = "Signature French main courses.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Duck Confit",             Description = "Slow-cooked duck leg with lentils du Puy, roasted garlic, and thyme jus.",          Price = 720, ImageUrl = "https://images.unsplash.com/photo-1598103442097-8b74394b95c8?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Sole Meunière",           Description = "Pan-fried Dover sole in brown butter, capers, and parsley, served whole.",          Price = 850, ImageUrl = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "A flawless fine-dining experience – every dish is a work of art!" }
                }
            },

            // ── 13. Sultan Bosphorus ─────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Sultan Bosphorus",
                Description = "Authentic Turkish doner kebab, iskender, and traditional baklava in the heart of Cairo.",
                CuisineId   = C("Turkish").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "City Stars Branch",
                        Address       = "City Stars Mall, Nasr City",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1013",
                        Capacity      = 95,
                        OpeningHours  = "Daily 12:00 PM – 12:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Kebabs & Grills",
                        Description  = "Turkish grill favourites.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Iskender Kebab",          Description = "Sliced doner over flatbread with tomato sauce, browned butter, and yogurt.",        Price = 365, ImageUrl = "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Adana Kebab",             Description = "Spicy minced lamb skewer grilled over charcoal, served with bulgur and salad.",     Price = 320, ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Turkish Desserts",
                        Description  = "Sweet endings from Istanbul.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Pistachio Baklava",       Description = "Layers of crispy filo, crushed pistachios, and fragrant rose-water syrup.",         Price = 125, ImageUrl = "https://images.unsplash.com/photo-1518544866330-4e716499f800?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Künefe",                  Description = "Shredded wheat pastry filled with melted cheese, soaked in syrup, and topped with pistachios.", Price = 145, ImageUrl = "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "The iskender kebab is incredible – totally transported me to Istanbul!" }
                }
            },

            // ── 14. Smash & Crunch ───────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Smash & Crunch",
                Description = "Juicy smash burgers on brioche buns with seasoned crispy fries and loaded sides.",
                CuisineId   = C("Burgers & Fast Food").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Victor Emmanuel Square Branch",
                        Address       = "Victor Emmanuel Square, Smouha",
                        City          = "Alexandria",
                        PhoneNumber   = "+20 100 100 1014",
                        Capacity      = 70,
                        OpeningHours  = "Daily 11:00 AM – 1:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Burgers",
                        Description  = "Smash-style crispy-edged patties on brioche.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Classic Smash Burger",    Description = "Double smash patty with American cheese, pickles, onion, and house sauce in a brioche bun.", Price = 155, ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "BBQ Bacon Smash",         Description = "Triple smash patty with crispy bacon, cheddar, BBQ sauce, and caramelised onions.",         Price = 195, ImageUrl = "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Sides & Drinks",
                        Description  = "Perfect companions for your burger.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Seasoned Crunch Fries",   Description = "Crispy fries tossed in a secret spice blend with a side of house dipping sauce.",      Price = 65,  ImageUrl = "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Thick-Cut Onion Rings",   Description = "Beer-battered onion rings fried golden, served with ranch dip.",                       Price = 75,  ImageUrl = "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Best smash burger in Alexandria – those crispy edges are addictive!" }
                }
            },

            // ── 15. Prime Cut ────────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Prime Cut",
                Description = "Premium certified steaks and luxury cuts cooked to the perfect doneness in an upscale steakhouse setting.",
                CuisineId   = C("Steakhouse").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Cairo Festival City Branch",
                        Address       = "Cairo Festival City Mall, New Cairo",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1015",
                        Capacity      = 90,
                        OpeningHours  = "Daily 1:00 PM – 12:00 AM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Steaks",
                        Description  = "Premium-grade cuts cooked to order.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Wagyu Ribeye (300g)",      Description = "Grade A5 Wagyu ribeye grilled to perfection, served with truffle butter and jus.",    Price = 1100, ImageUrl = "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "USDA Tenderloin (250g)",   Description = "USDA prime tenderloin with garlic confit and roasted bone marrow.",                   Price = 890,  ImageUrl = "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Steakhouse Sides",
                        Description  = "Classic sides to complement your steak.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Truffle Mac & Cheese",    Description = "Creamy aged cheddar mac and cheese finished with black truffle oil.",                Price = 220, ImageUrl = "https://images.unsplash.com/photo-1543339520-aa62f0ffd8c9?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Creamed Spinach",         Description = "Wilted baby spinach in a rich cream and nutmeg sauce.",                              Price = 130, ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "The Wagyu ribeye is life-changing – flawless from start to finish." }
                }
            },

            // ── 16. Morning Sun ──────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Morning Sun",
                Description = "Fluffy pancakes, eggs Benedict, and specialty pour-over coffee in a cheerful all-day brunch spot.",
                CuisineId   = C("Breakfast & Brunch").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Arkan Plaza Branch",
                        Address       = "Arkan Plaza, Sheikh Zayed",
                        City          = "Giza",
                        PhoneNumber   = "+20 100 100 1016",
                        Capacity      = 65,
                        OpeningHours  = "Daily 7:00 AM – 5:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Brunch Classics",
                        Description  = "All-day breakfast favourites.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Buttermilk Pancake Stack",  Description = "Three thick buttermilk pancakes with fresh berries, whipped cream, and maple syrup.", Price = 175, ImageUrl = "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Eggs Benedict",             Description = "Poached eggs on toasted English muffin with Canadian bacon and hollandaise sauce.",    Price = 190, ImageUrl = "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Specialty Coffee",
                        Description  = "Artisan coffee drinks.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Single Origin Pour-Over",  Description = "Hand-poured single-origin filter coffee highlighting the bean's natural terroir.",     Price = 90,  ImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Iced Caramel Latte",       Description = "Double espresso over ice with house-made caramel syrup and cold oat milk.",          Price = 80,  ImageUrl = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Perfect Sunday brunch spot – the pancake stack is absolutely heavenly!" }
                }
            },

            // ── 17. Sweet Corner ─────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Sweet Corner",
                Description = "Fresh Western pastries, cakes, and hot beverages in a cosy neighbourhood café.",
                CuisineId   = C("Cafe & Desserts").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Korba Branch",
                        Address       = "Al-Korba District, Heliopolis",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1017",
                        Capacity      = 50,
                        OpeningHours  = "Daily 8:00 AM – 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Pastries & Cakes",
                        Description  = "Baked fresh in-house daily.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Croissant au Beurre",      Description = "Classic all-butter French croissant baked until perfectly flaky and golden.",          Price = 65,  ImageUrl = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Red Velvet Slice",         Description = "Moist red velvet cake layered with cream cheese frosting.",                           Price = 110, ImageUrl = "https://images.unsplash.com/photo-1542124948-dc391252a940?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Hot Beverages",
                        Description  = "Warming drinks for every mood.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Flat White",               Description = "Double ristretto espresso with a thin layer of velvety micro-foam milk.",              Price = 75,  ImageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Hot Chocolate",            Description = "Rich Belgian dark chocolate blended with steamed milk and topped with cream.",         Price = 90,  ImageUrl = "https://images.unsplash.com/photo-1542990253-a781e3686e08?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Lovely café with the best croissants and a really warm atmosphere." }
                }
            },

            // ── 18. Healthy Life ─────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Healthy Life",
                Description = "Calorie-counted, nutritionally balanced meals for a healthier lifestyle without compromising on flavour.",
                CuisineId   = C("Healthy & Diet").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Maadi Branch",
                        Address       = "Degla District, Maadi",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1018",
                        Capacity      = 60,
                        OpeningHours  = "Daily 8:00 AM – 10:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Power Bowls",
                        Description  = "Nutritious, balanced meal bowls.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Grilled Chicken Power Bowl",  Description = "Grilled lean chicken breast over brown rice with roasted vegetables and lemon-tahini dressing.", Price = 235, ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Salmon Quinoa Bowl",          Description = "Baked salmon fillet over quinoa with edamame, avocado, and miso glaze.",                        Price = 270, ImageUrl = "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Light Bites",
                        Description  = "Low-calorie snacks and sides.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Veggie Wrap",                 Description = "Wholegrain tortilla filled with hummus, roasted peppers, spinach, and feta.",                   Price = 155, ImageUrl = "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Mixed Nuts & Fruit Plate",    Description = "A selection of seasonal fresh fruit and unsalted mixed nuts.",                                  Price = 95,  ImageUrl = "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Finally a healthy restaurant that actually tastes great – the power bowls are addictive!" }
                }
            },

            // ── 19. Green Bites ──────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Green Bites",
                Description = "100% plant-based dishes entirely free of animal products – creative, flavourful, and sustainable.",
                CuisineId   = C("Vegan").Id,
                PriceRange  = PriceRange.Moderate,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Zamalek Branch",
                        Address       = "Brazil Street, Zamalek",
                        City          = "Cairo",
                        PhoneNumber   = "+20 100 100 1019",
                        Capacity      = 55,
                        OpeningHours  = "Daily 9:00 AM – 10:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Plant-Based Mains",
                        Description  = "Hearty, filling vegan main courses.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Jackfruit Pulled 'Pork' Burger",  Description = "Seasoned jackfruit on a brioche-style vegan bun with pickled slaw and chipotle mayo.", Price = 245, ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Lentil & Mushroom Shepherd's Pie",Description = "Hearty French green lentils with sautéed mushrooms, topped with creamy mashed potato.", Price = 220, ImageUrl = "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Raw & Fresh",
                        Description  = "Raw and minimally processed dishes.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Raw Zucchini Noodle Pesto",     Description = "Spiralised zucchini tossed in cashew basil pesto with cherry tomatoes and pine nuts.", Price = 185, ImageUrl = "https://images.unsplash.com/photo-1563699281-d3f1dc6d0e57?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Acai Superfoods Bowl",          Description = "Blended acai with banana topped with granola, fresh berries, and coconut flakes.",      Price = 170, ImageUrl = "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 5, Comment = "Incredible vegan food – even my non-vegan friends were blown away!" }
                }
            },

            // ── 20. Fresh Boost ──────────────────────────────────────────────────
            new Restaurant
            {
                Name        = "Fresh Boost",
                Description = "Natural cold-pressed juices and detox fruit smoothies crafted daily from the freshest seasonal ingredients.",
                CuisineId   = C("Juices & Smoothies").Id,
                PriceRange  = PriceRange.Budget,
                Branches =
                {
                    new RestaurantBranch
                    {
                        BranchName    = "Arab League Street Branch",
                        Address       = "Arab League Street, Mohandessin",
                        City          = "Giza",
                        PhoneNumber   = "+20 100 100 1020",
                        Capacity      = 40,
                        OpeningHours  = "Daily 7:00 AM – 11:00 PM"
                    }
                },
                MenuSections =
                {
                    new MenuSection
                    {
                        Name         = "Cold-Pressed Juices",
                        Description  = "Raw, nutrient-packed cold-press juices.",
                        DisplayOrder = 1,
                        Items =
                        {
                            new MenuItem { Name = "Green Detox Juice",      Description = "Spinach, cucumber, green apple, lemon, and ginger cold-pressed for maximum nutrients.", Price = 75, ImageUrl = "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Sunrise Carrot Juice",   Description = "Carrot, orange, turmeric, and a hint of black pepper for the ultimate morning boost.",  Price = 65, ImageUrl = "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&q=80" }
                        }
                    },
                    new MenuSection
                    {
                        Name         = "Smoothies",
                        Description  = "Thick fruit and protein smoothies.",
                        DisplayOrder = 2,
                        Items =
                        {
                            new MenuItem { Name = "Tropical Mango Smoothie",  Description = "Frozen mango, pineapple, coconut milk, and a squeeze of lime blended silky smooth.",   Price = 80, ImageUrl = "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80" },
                            new MenuItem { Name = "Berry Protein Smoothie",   Description = "Mixed berries, banana, Greek yogurt, and whey protein – post-workout perfect.",         Price = 90, ImageUrl = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80" }
                        }
                    }
                },
                Reviews =
                {
                    new Review { UserId = customer.Id, Rating = 4, Comment = "Freshest juices I've had in Cairo – the green detox is my daily ritual now!" }
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
                UserId       = owner.Id
            });
        }

        await dbContext.SaveChangesAsync();
    }
}