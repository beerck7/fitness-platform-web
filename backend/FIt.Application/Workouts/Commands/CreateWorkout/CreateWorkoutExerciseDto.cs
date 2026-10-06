using System.ComponentModel.DataAnnotations;

namespace Fit.Application.Workouts.Commands.CreateWorkout
{
    public class CreateWorkoutExerciseDto
    {
        public int ExerciseId { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        [Range(0, 500)]
        public decimal? TargetWeight { get; set; }
        [Range(0, 600)]
        public int RestSeconds { get; set; }
        public string? Notes { get; set; }
    }
}
