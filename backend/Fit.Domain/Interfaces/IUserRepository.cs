using Fit.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task AddUser(User user, CancellationToken cancellationToken);
        Task<bool> IsEmailUsedAsync(string email);
        Task<bool> IsPhoneNumberUsedAsync(string phoneNumber);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken);

        Task SaveChangesAsync(CancellationToken cancellationToken);
        Task DeleteUser(User user, CancellationToken cancellationToken);
    }
}
