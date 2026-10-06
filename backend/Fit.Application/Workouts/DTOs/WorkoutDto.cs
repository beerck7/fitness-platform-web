using System;

namespace Fit.Application.Workouts.DTOs
{
    public class WorkoutDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int ExercisesCount { get; set; }
        public string? BackgroundImageUrl { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsFavorite { get; set; }
        public List<WorkoutExerciseDto> Exercises { get; set; } = new();
    }
}