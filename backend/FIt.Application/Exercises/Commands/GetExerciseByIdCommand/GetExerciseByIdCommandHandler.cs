using Fit.Application.Exercises.DTOs;
using Fit.Domain.Interfaces;
using MediatR;

namespace Fit.Application.Exercises.Commands.GetExerciseByIdCommand
{
    public class GetExerciseByIdCommandHandler(IExcerciseRepository excerciseRepository) : IRequestHandler<GetExerciseByIdCommand, ExerciseDto>
    {
        public async Task<ExerciseDto> Handle(GetExerciseByIdCommand request, CancellationToken cancellationToken)
        {
            var exercise = await excerciseRepository.GetExerciseById(request.Id, cancellationToken);
            if (exercise == null)
                throw new KeyNotFoundException("Nie znaleziono ćwiczenia");
            return new ExerciseDto
            {
                EquipmentRequired = exercise.EquipmentRequired,
                Id = exercise.Id,
                Name = exercise.Name,
                Description = exercise.Description,
                Instructions = exercise.Instructions,
                DifficultyLevel = exercise.DifficultyLevel,
            };



        }

    }
}
