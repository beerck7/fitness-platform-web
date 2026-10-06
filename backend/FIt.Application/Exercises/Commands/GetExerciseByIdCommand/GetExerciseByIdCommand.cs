using Fit.Application.Exercises.DTOs;
using MediatR;

namespace Fit.Application.Exercises.Commands.GetExerciseByIdCommand
{
    public class GetExerciseByIdCommand : IRequest<ExerciseDto>
    {
        public int Id { get; set; }
    }
}
