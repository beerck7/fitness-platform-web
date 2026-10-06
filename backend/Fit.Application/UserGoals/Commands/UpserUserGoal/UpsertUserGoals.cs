using Fit.Domain.Enums;
using Fit.Application.UserGoals.DTOs;
using MediatR;

public class UpsertUserGoalCommand : IRequest<UserGoalDTO>
{
    public string UserId { get; set; } = string.Empty;

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
}
