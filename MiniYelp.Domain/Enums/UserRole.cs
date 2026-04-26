namespace MiniYelp.Domain.Enums;

public static class UserRole
{
    public const string Customer = "Customer";
    public const string Owner = "Owner";
    public const string Admin = "Admin";

    public static readonly string[] All = [Customer, Owner, Admin];
}
