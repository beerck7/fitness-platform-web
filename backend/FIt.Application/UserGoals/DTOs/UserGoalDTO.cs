using Fit.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.UserGoals.DTOs
{
    public class UserGoalDTO
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public decimal CurrentWeightKg { get; set; }
        public int HeightCm { get; set; }

        public GoalType GoalType { get; set; }
        public decimal? TargetWeightKg { get; set; }
        public DateTime? TargetDate { get; set; }

        public int TrainingsPerWeekTarget { get; set; }
        public int? CardioSessionsPerWeekTarget { get; set; }

        public int TargetCalories { get; set; }
        public int ProteinGrams { get; set; }
        public int FatGrams { get; set; }
        public int CarbsGrams { get; set; }

        public ActivityLevel ActivityLevel { get; set; }
        public int StepsPerDayTarget { get; set; }
        public string? Notes { get; set; }

        public DateTimeOffset UpdatedAt { get; set; }
    }
}
