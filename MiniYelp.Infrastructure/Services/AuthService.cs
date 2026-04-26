using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MiniYelp.Application.Common.Exceptions;
using MiniYelp.Application.Common.Interfaces;
using MiniYelp.Application.Features.Auth;
using MiniYelp.Domain.Enums;
using MiniYelp.Infrastructure.Identity;

namespace MiniYelp.Infrastructure.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    IJwtTokenGenerator jwtTokenGenerator) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await userManager.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail.ToUpperInvariant(), cancellationToken);
        if (existingUser is not null)
        {
            throw new AppException("Email is already registered.", StatusCodes.Status409Conflict);
        }

        var user = new ApplicationUser
        {
            FullName = request.FullName.Trim(),
            UserName = normalizedEmail,
            Email = normalizedEmail,
            NormalizedEmail = normalizedEmail.ToUpperInvariant(),
            NormalizedUserName = normalizedEmail.ToUpperInvariant()
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new AppException(string.Join(" ", result.Errors.Select(x => x.Description)), StatusCodes.Status400BadRequest);
        }

        await userManager.AddToRoleAsync(user, UserRole.Customer);
        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail.ToUpperInvariant(), cancellationToken)
            ?? throw new AppException("Invalid email or password.", StatusCodes.Status401Unauthorized);

        var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            throw new AppException("Invalid email or password.", StatusCodes.Status401Unauthorized);
        }

        return await CreateAuthResponseAsync(user);
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new AppException("User not found.", StatusCodes.Status404NotFound);

        var roles = await userManager.GetRolesAsync(user);

        return new CurrentUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToArray()
        };
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail.ToUpperInvariant(), cancellationToken);

        if (user is null)
        {
            return new ForgotPasswordResponse
            {
                Message = "If the email exists, a password reset token has been generated."
            };
        }

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        return new ForgotPasswordResponse
        {
            Message = "Password reset token generated successfully. For local development, the token is returned in the response.",
            ResetToken = token
        };
    }

    public async Task<OperationResultResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail.ToUpperInvariant(), cancellationToken)
            ?? throw new AppException("Invalid email or reset token.", StatusCodes.Status400BadRequest);

        var result = await userManager.ResetPasswordAsync(user, request.ResetToken, request.NewPassword);
        if (!result.Succeeded)
        {
            throw new AppException(string.Join(" ", result.Errors.Select(x => x.Description)), StatusCodes.Status400BadRequest);
        }

        return new OperationResultResponse
        {
            Message = "Password reset successfully."
        };
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var token = jwtTokenGenerator.GenerateToken(user.Id, user.Email ?? string.Empty, user.FullName, roles);

        return new AuthResponse
        {
            Token = token,
            User = new CurrentUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Roles = roles.ToArray()
            }
        };
    }
}
