

namespace Fit.Domain.Entities
{
    public class ExerciseSet
    {
        public int Id { get; set; }
        public int SetNumber { get; set; }
        public int Reps { get; set; }
        public decimal Weight { get; set; } // w kg
        public decimal? TargetWeight { get; set; } // w kg
        public int RestSeconds { get; set; }
        public string Notes { get; set; } = string.Empty;

        // Relacje
        public int WorkoutExerciseId { get; set; }
        public WorkoutExercise WorkoutExercise { get; set; } = null!;
    }
}