using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniYelp.Domain.Entities;

namespace MiniYelp.Infrastructure.Configurations;

public sealed class CuisineConfiguration : IEntityTypeConfiguration<Cuisine>
{
    public void Configure(EntityTypeBuilder<Cuisine> builder)
    {
        builder.ToTable("Cuisines");
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.HasIndex(x => x.Name).IsUnique();
    }
}
