using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Fit.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

namespace Fit.Infrastructure.Repositories
{
    public class ExcerciseRepository(FitDbContext dbContext) : IExcerciseRepository
    {
        public async Task CreateAsync(Exercise exercise)
        {
            await dbContext.Exercises.AddAsync(exercise);
            await dbContext.SaveChangesAsync();
        }

        public async Task<Exercise?> GetExerciseById(int id, CancellationToken cancellationToken)
        {
            return await dbContext.Exercises.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }


        public async Task<(IEnumerable<Exercise> Items, int TotalCount)> GetAllAsync(
        string search,
        int? muscleGroupId,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
        {
            var query = dbContext.Exercises.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(e => e.Name.ToLower().Contains(search.ToLower()));
            }

            if (muscleGroupId.HasValue && muscleGroupId > 0)
            {
                query = query.Where(e => e.MuscleGroupId == muscleGroupId.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderBy(e => e.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }
    }
}