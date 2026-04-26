using System.Security.Claims;
using MiniYelp.Application.Common.Exceptions;

namespace MiniYelp.API.Common.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userId, out var parsedUserId))
        {
            throw new AppException("User identifier is missing from token.", StatusCodes.Status401Unauthorized);
        }

        return parsedUserId;
    }
}
