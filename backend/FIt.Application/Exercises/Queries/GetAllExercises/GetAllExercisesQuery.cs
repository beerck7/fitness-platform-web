using Fit.Application.Exercises.DTOs;
using MediatR;
using Fit.Application.Common;

namespace Fit.Application.Exercises.Queries.GetAllExercises
{
    public class GetAllExercisesQuery : IRequest<PagedResult<ExerciseDto>>
    {
        public string search { get; set; } = "";

        public int? muscleGroupId { get; set; }

        public int page { get; set; } = 1;

        public int pageSize { get; set; } = 12;

    }
}
