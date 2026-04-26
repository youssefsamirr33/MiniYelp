using System.ComponentModel.DataAnnotations;
using MiniYelp.Domain.Enums;

namespace MiniYelp.Application.Features.Restaurants;

public sealed class RestaurantFilterRequest
{
    public string? City { get; set; }
    public int? CuisineId { get; set; }
    public PriceRange? PriceRange { get; set; }
}

public sealed class CreateRestaurantRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public PriceRange PriceRange { get; set; }

    [Required]
    public int CuisineId { get; set; }
}

public sealed class AddRestaurantBranchRequest
{
    [Required]
    [MaxLength(120)]
    public string BranchName { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [Range(1, 10000)]
    public int Capacity { get; set; }

    [Required]
    [MaxLength(200)]
    public string OpeningHours { get; set; } = string.Empty;
}

public sealed class CuisineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class RestaurantBranchDto
{
    public int Id { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string OpeningHours { get; set; } = string.Empty;
}

public sealed class RestaurantListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PriceRange PriceRange { get; set; }
    public string CuisineName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
    public IReadOnlyCollection<string> Cities { get; set; } = Array.Empty<string>();
}

public sealed class RestaurantDetailsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PriceRange PriceRange { get; set; }
    public CuisineDto Cuisine { get; set; } = new();
    public bool IsActive { get; set; }
    public double AverageRating { get; set; }
    public int ReviewsCount { get; set; }
    public IReadOnlyCollection<RestaurantBranchDto> Branches { get; set; } = Array.Empty<RestaurantBranchDto>();
}
