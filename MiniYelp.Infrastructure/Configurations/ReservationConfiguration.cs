using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Configurations;

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("Reservations");
        builder.Property(x => x.PartySize).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(500);
        builder.HasIndex(x => new { x.RestaurantBranchId, x.ReservationDate });
        builder.HasOne(x => x.RestaurantBranch)
            .WithMany(x => x.Reservations)
            .HasForeignKey(x => x.RestaurantBranchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
