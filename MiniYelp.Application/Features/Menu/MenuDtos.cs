namespace MiniYelp.Application.Features.Menu;

public sealed class MenuItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
}

public sealed class MenuSectionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IReadOnlyCollection<MenuItemDto> Items { get; set; } = Array.Empty<MenuItemDto>();
}
