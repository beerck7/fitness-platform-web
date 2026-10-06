using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Fit.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Infrastructure.Repositories
{
    public class MuscleGroupRepository(FitDbContext dbContext) : IMuscleGroupRepository
    {
        public async Task CreateAsync(MuscleGroup muscleGroup)
        {
            dbContext.MuscleGroups.Add(muscleGroup);
            await dbContext.SaveChangesAsync();
        }
    }
}
