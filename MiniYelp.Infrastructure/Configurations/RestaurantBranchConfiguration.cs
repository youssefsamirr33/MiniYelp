using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Configurations;

public sealed class RestaurantBranchConfiguration : IEntityTypeConfiguration<RestaurantBranch>
{
    public void Configure(EntityTypeBuilder<RestaurantBranch> builder)
    {
        builder.ToTable("RestaurantBranches");
        builder.Property(x => x.BranchName).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Address).HasMaxLength(250).IsRequired();
        builder.Property(x => x.City).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(30).IsRequired();
        builder.Property(x => x.OpeningHours).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => x.City);
        builder.HasOne(x => x.Restaurant)
            .WithMany(x => x.Branches)
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
