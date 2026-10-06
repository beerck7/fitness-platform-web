using Fit.Domain.Entities;
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

namespace FIt.Application.Account.Commands.RegisterUser
{
    public class RegisterCommandHandler
        (IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService
        ) : IRequestHandler<RegisterUserCommand, AuthResponse>
    {

        public async Task<AuthResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            if (await userRepository.IsEmailUsedAsync(request.Email))
                throw new InvalidOperationException("Ten adres e-mail jest już zarejestrowany.");

            if (await userRepository.IsPhoneNumberUsedAsync(request.PhoneNumber))
                throw new InvalidOperationException("Ten numer telefonu jest już zarejestrowany.");
            
            User user = new User()
            {
                Email  = request.Email,
                PhoneNumber = request.PhoneNumber,
                Name = request.Name,
                Gender = (Fit.Domain.Enums.Gender)request.Gender,
                DateOfBirth = request.DateOfBirth,
                Id = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow,
                PasswordHash = passwordHasher.Hash(request.Password)
            };
            var (accessToken, refreshToken) = tokenService.GenerateTokens(user);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpires = DateTime.UtcNow.AddDays(30);
            await userRepository.AddUser(user, cancellationToken);

            return new AuthResponse(accessToken, refreshToken, user.Name);
        }
       
    }
}
