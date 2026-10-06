using Fit.Domain.Entities;
using Fit.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fit.Domain.Interfaces;

namespace Fit.Infrastructure.Repositories
{
    public class UserRepository(IFitDbContext fitDbContext) : IUserRepository
    {
        private readonly IFitDbContext _fitDbContext = fitDbContext;

        public async Task AddUser(User user, CancellationToken cancellationToken)
        {
            _fitDbContext.Users.Add(user);
            await _fitDbContext.SaveChangesAsync(cancellationToken);
        }
        public async Task<User?> GetUserByEmailAsync(string email)
            => await _fitDbContext.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<bool> IsEmailUsedAsync(string email)
        => await _fitDbContext.Users.AnyAsync(u=>u.Email == email);
        public async Task<bool> IsPhoneNumberUsedAsync(string phoneNumber)
        => await _fitDbContext.Users.AnyAsync(u=>u.PhoneNumber == phoneNumber);

        public async Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken)
          => await _fitDbContext.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
           await _fitDbContext.SaveChangesAsync(cancellationToken);
        }

       
        public async Task DeleteUser(User user, CancellationToken cancellationToken)
        {
            _fitDbContext.Users.Remove(user);
            await _fitDbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
