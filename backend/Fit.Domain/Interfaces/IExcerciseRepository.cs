using Fit.Domain.Entities;

namespace Fit.Domain.Interfaces
{
    public interface IExcerciseRepository
    {
        Task CreateAsync(Exercise exercise);
        Task<Exercise?> GetExerciseById(int id, CancellationToken cancellationToken);
        Task<(IEnumerable<Exercise> Items, int TotalCount)> GetAllAsync(
        string search,
        int? muscleGroupId,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    }

}
