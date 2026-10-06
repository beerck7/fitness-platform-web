using Fit.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Domain.Interfaces
{
    public interface IWorkoutRepository
    {
        Task CreateAsync(Workout workout);
        Task UpdateAsync(Workout workout, CancellationToken cancellationToken);
        Task DeleteAsync(int id, CancellationToken cancellationToken);
        Task<Workout?> GetByIdAsync(int id, CancellationToken cancellationToken);
        Task<IEnumerable<Workout>> GetByUserIdAsync(Guid userId, DateTime? startDate, DateTime? endDate, bool? isCompleted, bool? isSharedPending, CancellationToken cancellationToken);
    }
}