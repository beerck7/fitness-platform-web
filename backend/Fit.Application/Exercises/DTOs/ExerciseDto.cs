using Fit.Domain.Enums.Constant;

namespace Fit.Application.Exercises.DTOs
{
    public class ExerciseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DifficultyLevel DifficultyLevel { get; set; }
        public string EquipmentRequired { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;

        public int MuscleGroupId { get; set; }
    }
}
