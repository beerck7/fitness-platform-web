using Fit.Application.Interfaces;
using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Fit.Infrastructure.Repositories
{
    public class UserWeightRepository(IFitDbContext context) : IUserWeightRepository
    {
        public async Task AddWeightEntryAsync(UserWeightHistory entry, CancellationToken cancellationToken)
        {
            await context.UserWeightHistories.AddAsync(entry, cancellationToken);
        }

        public async Task<List<UserWeightHistory>> GetHistoryAsync(Guid userId, DateTime? from, DateTime? to, CancellationToken cancellationToken)
        {
            var query = context.UserWeightHistories
                .Where(x => x.UserId == userId);

            if (from.HasValue)
                query = query.Where(x => x.DateRecorded >= from.Value);
            
            if (to.HasValue)
                query = query.Where(x => x.DateRecorded <= to.Value);

            return await query
                .OrderBy(x => x.DateRecorded)
                .ToListAsync(cancellationToken);
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
