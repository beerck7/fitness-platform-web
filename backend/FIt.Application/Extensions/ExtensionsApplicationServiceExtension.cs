using Fit.Application.Interfaces;
using Fit.Application.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace FIt.Application.Extensions;

public static class AplicationServiceExtension
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IUserContext, UserContext>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<INutritionCalculationService, NutritionCalculationService>();
        services.AddMediatR(options => options.RegisterServicesFromAssembly(typeof(AplicationServiceExtension).Assembly));
        services.AddHttpContextAccessor();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)),
                ValidateIssuer = true,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30),
                ValidAlgorithms = [SecurityAlgorithms.HmacSha512]
            };
        });
        services.AddAuthorization(options => options.DefaultPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser().RequireClaim(ClaimTypes.NameIdentifier).RequireClaim(ClaimTypes.Email).Build());
        return services;
    }
}
