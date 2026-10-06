using Fit.Domain.Entities;

public class WorkoutExercise
{
    public int Id { get; set; }
    public int Order { get; set; } // Kolejność w treningu

    // Relacje
    public int WorkoutId { get; set; }
    public Workout Workout { get; set; } = null!;

    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; } = null!;

    public ICollection<ExerciseSet> ExerciseSets { get; set; } = new List<ExerciseSet>();
}