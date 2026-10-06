using Fit.Application.Interfaces;
using Fit.Application.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fit.Domain.Interfaces;
using FIt.Application.Account.DTOs;

namespace FIt.Application.Account.Commands.LoginUser
{
    public class LoginUserCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService) : IRequestHandler<LoginUserCommand, AuthResponse>
    {

        public async Task<AuthResponse> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailAsync(request.Email);
            if (user is null ||
                !passwordHasher.Verify(request.Password, user.PasswordHash)) {
                throw new UnauthorizedAccessException("Nieprawidłowy adres e-mail lub hasło.");
            }
            var (accessToken, refreshToken) = tokenService.GenerateTokens(user);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(30);

            await userRepository.SaveChangesAsync(cancellationToken);

            return new AuthResponse(accessToken, refreshToken, user.Name);

        }
    }
}
