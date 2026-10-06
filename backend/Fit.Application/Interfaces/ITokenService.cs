using Fit.Domain.Entities;

namespace Fit.Application.Interfaces
{
    public interface ITokenService
    {
        (string accessToken, string refreshToken) GenerateTokens(User user);
    }
}
