using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Configurations;

public sealed class RestaurantOwnerConfiguration : IEntityTypeConfiguration<RestaurantOwner>
{
    public void Configure(EntityTypeBuilder<RestaurantOwner> builder)
    {
        builder.ToTable("RestaurantOwners");
        builder.HasIndex(x => new { x.RestaurantId, x.UserId }).IsUnique();
        builder.HasOne(x => x.Restaurant)
            .WithMany(x => x.Owners)
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
