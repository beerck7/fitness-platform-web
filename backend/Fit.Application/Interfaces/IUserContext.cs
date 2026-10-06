using Fit.Application.Account;

namespace Fit.Application.Interfaces
{
    public interface IUserContext
    {
        CurrentUser? GetCurrentUser();
    }
}
