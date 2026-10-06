using FIt.Application.Account;

namespace Fit.Application.Interfaces
{
    public interface IUserContext
    {
        CurrentUser? GetCurrentUser();
    }
}
