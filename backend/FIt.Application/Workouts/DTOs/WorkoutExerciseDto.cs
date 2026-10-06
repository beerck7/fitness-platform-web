namespace Fit.Application.Workouts.DTOs
{
    public class WorkoutExerciseDto
    {
        public int Id { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Reps { get; set; }
        public decimal Weight { get; set; }
        public decimal TargetWeight { get; set; }
        public int? RestSeconds { get; set; }
    }
}
