using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.Exercises.Commands.CreateExercise
{
    internal class CreateExerciseCommandHandler(IExcerciseRepository exerciseRepository) : IRequestHandler<CreateExerciseCommand>
    {
        public async Task Handle(CreateExerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = new Exercise {
                Name = request.Name,
                Description = request.Description,
                DifficultyLevel = request.DifficultyLevel,
                Instructions = request.Instructions,
                EquipmentRequired = request.EquipmentRequired,
                MuscleGroupId = request.MuscleGroupId 
            };
            await exerciseRepository.CreateAsync(exercise);
        }
    }
}
