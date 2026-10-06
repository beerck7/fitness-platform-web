using Fit.Domain.Enums.Constant;
namespace Fit.Domain.Entities
{
    public class Exercise
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DifficultyLevel DifficultyLevel { get; set; }
        public string EquipmentRequired { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;

        // Relacje
        public int MuscleGroupId { get; set; }
        public MuscleGroup MuscleGroup { get; set; } = null!;

        public ICollection<WorkoutExercise> WorkoutExercises { get; set; } = new List<WorkoutExercise>();
        //public ICollection<ExerciseSet> ExerciseSets { get; set; } = new List<ExerciseSet>();
    }
}