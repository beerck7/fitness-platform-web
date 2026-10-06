using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Fit.Application.Workouts.Commands.CreateWorkout
{
    public class CreateWorkoutCommand : IRequest
    {
        [Required, MinLength(2), MaxLength(100)]
        public string Name { get; set; } = default!;
        public string? Notes { get; set; }
        [Range(1, 300)]
        public int DurationMinutes { get; set; }
        public DateTime WorkoutDate { get; set; }
        public Guid UserId { get; set; }
        public bool IsCompleted { get; set; } = true;
        public string? BackgroundImageUrl { get; set; }
        public List<CreateWorkoutExerciseDto> Exercises { get; set; } = new();
    }
}
