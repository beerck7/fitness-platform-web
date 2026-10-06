using Fit.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Fit.Domain.Interfaces
{
    public interface IUserWeightRepository
    {
        Task AddWeightEntryAsync(UserWeightHistory entry, CancellationToken cancellationToken);
        Task<List<UserWeightHistory>> GetHistoryAsync(Guid userId, DateTime? from, DateTime? to, CancellationToken cancellationToken);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
