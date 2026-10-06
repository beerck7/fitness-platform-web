using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Fit.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Infrastructure.Repositories
{
    public class WorkoutRepository(FitDbContext dbContext) : IWorkoutRepository
    {
        public async Task CreateAsync(Workout workout)
        {
            await dbContext.Workouts.AddAsync(workout);
            await dbContext.SaveChangesAsync();
        }

        public async Task UpdateAsync(Workout workout, CancellationToken cancellationToken)
        {
            dbContext.Workouts.Update(workout);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken)
        {
            var workout = await dbContext.Workouts.FindAsync(new object[] { id }, cancellationToken);
            if (workout != null)
            {
                dbContext.Workouts.Remove(workout);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task<Workout?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await dbContext.Workouts
                .Include(w => w.WorkoutExercises)
                    .ThenInclude(we => we.ExerciseSets)
                .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Workout>> GetByUserIdAsync(Guid userId, DateTime? startDate, DateTime? endDate, bool? isCompleted, bool? isSharedPending, CancellationToken cancellationToken)
        {
            var query = dbContext.Workouts
                .Where(w => w.UserId == userId)
                .Include(w => w.WorkoutExercises)
                    .ThenInclude(we => we.ExerciseSets)
                .Include(w => w.WorkoutExercises)
                    .ThenInclude(we => we.Exercise)
                .AsQueryable();

            if (isCompleted.HasValue)
            {
                query = query.Where(w => w.IsCompleted == isCompleted.Value);
            }

            if (isSharedPending.HasValue)
            {
                query = query.Where(w => w.IsSharedPending == isSharedPending.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(w => w.WorkoutDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                // Include the entire end day
                var end = endDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(w => w.WorkoutDate <= end);
            }

            return await query
                .OrderByDescending(w => w.WorkoutDate)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    }
}