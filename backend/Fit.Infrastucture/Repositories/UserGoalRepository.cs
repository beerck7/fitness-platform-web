using Fit.Application.Interfaces;
using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fit.Infrastructure.Repositories
{
    public class UserGoalRepository : IUserGoalRepository
    {
        private readonly IFitDbContext _fitDbContext;

        public UserGoalRepository(IFitDbContext fitDbContext)
        {
            _fitDbContext = fitDbContext;
        }

        public async Task<UserGoal?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _fitDbContext.UserGoals
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<UserGoal?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
        {
            return await _fitDbContext.UserGoals
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId, ct);
        }

        public async Task<List<UserGoal>> GetAllAsync(CancellationToken ct = default)
        {
            return await _fitDbContext.UserGoals
                .Include(x => x.User)
                .ToListAsync(ct);
        }

        public async Task AddAsync(UserGoal goal, CancellationToken ct = default)
        {
            await _fitDbContext.UserGoals.AddAsync(goal, ct);
        }

        public void Update(UserGoal goal)
        {
            _fitDbContext.UserGoals.Update(goal);
        }

        public void Remove(UserGoal goal)
        {
            _fitDbContext.UserGoals.Remove(goal);
        }

        // Przy 1 rekordzie celu na usera to jest najbardziej użyteczne
        public async Task<UserGoal> UpsertByUserIdAsync(UserGoal goal, CancellationToken ct = default)
        {
            var existing = await _fitDbContext.UserGoals
                .FirstOrDefaultAsync(x => x.UserId == goal.UserId, ct);

            if (existing is null)
            {
                await _fitDbContext.UserGoals.AddAsync(goal, ct);
                return goal;
            }

            existing.CurrentWeightKg = goal.CurrentWeightKg;
            existing.HeightCm = goal.HeightCm;

            existing.GoalType = goal.GoalType;
            existing.TargetWeightKg = goal.TargetWeightKg;
            existing.TargetDate = goal.TargetDate;

            existing.TrainingsPerWeekTarget = goal.TrainingsPerWeekTarget;
            existing.CardioSessionsPerWeekTarget = goal.CardioSessionsPerWeekTarget;

            existing.TargetCalories = goal.TargetCalories;
            existing.ProteinGrams = goal.ProteinGrams;
            existing.FatGrams = goal.FatGrams;
            existing.CarbsGrams = goal.CarbsGrams;

            existing.ActivityLevel = goal.ActivityLevel;
            existing.StepsPerDayTarget = goal.StepsPerDayTarget;
            existing.Notes = goal.Notes;

            existing.UpdatedAt = DateTimeOffset.UtcNow;

            return existing;
        }

        public Task SaveChangesAsync(CancellationToken ct = default)
        {
            return _fitDbContext.SaveChangesAsync(ct);
        }
    }
}
