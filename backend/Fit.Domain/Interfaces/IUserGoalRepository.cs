using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Interfaces
{
    public interface IUserGoalRepository
    {
        Task<UserGoal?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<UserGoal?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
        Task<List<UserGoal>> GetAllAsync(CancellationToken ct = default);

        Task AddAsync(UserGoal goal, CancellationToken ct = default);
        void Update(UserGoal goal);
        void Remove(UserGoal goal);

        Task<UserGoal> UpsertByUserIdAsync(UserGoal goal, CancellationToken ct = default);

        Task SaveChangesAsync(CancellationToken ct = default);
    }
}
