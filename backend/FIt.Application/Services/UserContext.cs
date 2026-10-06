using Fit.Application.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using FIt.Application.Account;
namespace Fit.Application.Services
{
    public class UserContext(IHttpContextAccessor httpContextAccessor) : IUserContext
    {
        public CurrentUser? GetCurrentUser()
        {
            var user = httpContextAccessor?.HttpContext?.User
                ?? throw new InvalidOperationException("User context is not present");

            if (user.Identity == null || !user.Identity.IsAuthenticated)
                return null;

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = user.FindFirst(ClaimTypes.Email)?.Value;
            return Guid.TryParse(userId, out var id) && email is not null ? new CurrentUser(id, email) : null;
        }
    }
}
