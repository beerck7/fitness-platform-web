using Fit.Domain.Entities;

namespace Fit.Domain.Entities;

public class Workout
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime WorkoutDate { get; set; } = DateTime.UtcNow;
    public string ? Notes { get; set; }
    public int DurationMinutes { get; set; }
    public bool IsFavorite { get; set; }

    // Relacje
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<WorkoutExercise> WorkoutExercises { get; set; } = new List<WorkoutExercise>();

    public bool IsCompleted { get; set; } = true;
    public bool IsSharedPending { get; set; } = false;
    public string? BackgroundImageUrl { get; set; }
    public int? TrainingPlanId { get; set; }
    public TrainingPlan TrainingPlan { get; set; } = null!;
}