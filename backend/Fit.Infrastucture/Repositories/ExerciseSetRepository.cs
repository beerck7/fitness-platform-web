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
    public class ExerciseSetRepository(FitDbContext dbContext) : IExerciseSetRepository
    {
        public async Task CreateAsync(ExerciseSet exerciseSet)
        {
            dbContext.ExerciseSets.Add(exerciseSet);
            await dbContext.SaveChangesAsync();
        }
    }
}
