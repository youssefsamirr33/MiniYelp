using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Configurations;

public sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");
        builder.Property(x => x.Comment).HasMaxLength(2000).IsRequired();
        builder.Property(x => x.Rating).IsRequired();
        builder.HasIndex(x => new { x.UserId, x.RestaurantId }).IsUnique();
        builder.HasOne(x => x.Restaurant)
            .WithMany(x => x.Reviews)
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
