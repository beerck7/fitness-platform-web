using Fit.Domain.Interfaces;
using FIt.Application.UserGoals.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.UserGoals.Queries.GetUserGoals
{
    public class GetUserGoalQueryHandler : IRequestHandler<GetUserGoalQuery, UserGoalDTO?>
    {
        private readonly IUserGoalRepository userGoalRepository;

        public GetUserGoalQueryHandler(IUserGoalRepository repo)
        {
            userGoalRepository = repo;
        }

        public async Task<UserGoalDTO?> Handle(GetUserGoalQuery request, CancellationToken ct)
        {
            var user = await userGoalRepository.GetByUserIdAsync(Guid.Parse(request.UserId), ct);
            if (user is null) return null;

            return new UserGoalDTO
            {
                Id = user.Id,
                UserId = user.UserId,
                CurrentWeightKg = user.CurrentWeightKg,
                HeightCm = user.HeightCm,
                GoalType = user.GoalType,
                TargetWeightKg = user.TargetWeightKg,
                TargetDate = user.TargetDate,
                TrainingsPerWeekTarget = user.TrainingsPerWeekTarget,
                CardioSessionsPerWeekTarget = user.CardioSessionsPerWeekTarget,
                TargetCalories = user.TargetCalories,
                ProteinGrams = user.ProteinGrams,
                FatGrams = user.FatGrams,
                CarbsGrams = user.CarbsGrams,
                ActivityLevel = user.ActivityLevel,
                StepsPerDayTarget = user.StepsPerDayTarget,
                Notes = user.Notes,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}
