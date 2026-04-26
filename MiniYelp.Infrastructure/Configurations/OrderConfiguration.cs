using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DeliveryAddress).HasMaxLength(300).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(500);
        builder.HasOne(x => x.Restaurant)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.RestaurantBranch)
            .WithMany()
            .HasForeignKey(x => x.RestaurantBranchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
