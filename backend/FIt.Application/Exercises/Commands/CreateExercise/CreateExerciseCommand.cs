using Fit.Domain.Enums.Constant;
using MediatR;

namespace Fit.Application.Exercises.Commands.CreateExercise
{
    public class CreateExerciseCommand : IRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DifficultyLevel DifficultyLevel { get; set; }
        public string EquipmentRequired { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;

        public int MuscleGroupId { get; set; }
        public List<int> ExercisesIds { get; set; } = new List<int>();
    }
}
