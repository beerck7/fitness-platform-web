using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using FIt.Application.UserGoals.DTOs;
using MediatR;

namespace Fit.Application.UserGoals.Commands.UpsertUserGoal
{
    public class UpsertUserGoalCommandHandler : IRequestHandler<UpsertUserGoalCommand, UserGoalDTO>
    {
        private readonly IUserGoalRepository _repo;

        public UpsertUserGoalCommandHandler(IUserGoalRepository repo)
        {
            _repo = repo;
        }

        public async Task<UserGoalDTO> Handle(UpsertUserGoalCommand command, CancellationToken ct)
        {
            var entity = new UserGoal
            {
                UserId = Guid.Parse(command.UserId),

                CurrentWeightKg = command.CurrentWeightKg,
                HeightCm = command.HeightCm,

                GoalType = command.GoalType,
                TargetWeightKg = command.TargetWeightKg,
                TargetDate = command.TargetDate,

                TrainingsPerWeekTarget = command.TrainingsPerWeekTarget,
                CardioSessionsPerWeekTarget = command.CardioSessionsPerWeekTarget,

                TargetCalories = command.TargetCalories,
                ProteinGrams = command.ProteinGrams,
                FatGrams = command.FatGrams,
                CarbsGrams = command.CarbsGrams,

                ActivityLevel = command.ActivityLevel,
                StepsPerDayTarget = command.StepsPerDayTarget,
                Notes = command.Notes,

                UpdatedAt = DateTimeOffset.UtcNow
            };

            var saved = await _repo.UpsertByUserIdAsync(entity, ct);
            await _repo.SaveChangesAsync(ct);

            return new UserGoalDTO
            {
                Id = saved.Id,
                UserId = saved.UserId,

                CurrentWeightKg = saved.CurrentWeightKg,
                HeightCm = saved.HeightCm,

                GoalType = saved.GoalType,
                TargetWeightKg = saved.TargetWeightKg,
                TargetDate = saved.TargetDate,

                TrainingsPerWeekTarget = saved.TrainingsPerWeekTarget,
                CardioSessionsPerWeekTarget = saved.CardioSessionsPerWeekTarget,

                TargetCalories = saved.TargetCalories,
                ProteinGrams = saved.ProteinGrams,
                FatGrams = saved.FatGrams,
                CarbsGrams = saved.CarbsGrams,

                ActivityLevel = saved.ActivityLevel,
                StepsPerDayTarget = saved.StepsPerDayTarget,
                Notes = saved.Notes,

                UpdatedAt = saved.UpdatedAt
            };
        }
    }
}
