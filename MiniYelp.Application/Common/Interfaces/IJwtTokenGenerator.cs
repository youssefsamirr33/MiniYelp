namespace MiniYelp.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(int userId, string email, string fullName, IEnumerable<string> roles);
}
