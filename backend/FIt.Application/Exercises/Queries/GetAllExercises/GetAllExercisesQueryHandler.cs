using Fit.Application.Exercises.DTOs;
using Fit.Domain.Interfaces;
using MediatR;
using Fit.Application.Common;

namespace Fit.Application.Exercises.Queries.GetAllExercises
{
    public class GetAllExercisesQueryHandler(IExcerciseRepository excerciseRepository)
        : IRequestHandler<GetAllExercisesQuery, PagedResult<ExerciseDto>>
    {
        public async Task<PagedResult<ExerciseDto>> Handle(GetAllExercisesQuery request, CancellationToken cancellationToken)
        {
            var (exercises, totalCount) = await excerciseRepository.GetAllAsync(request.search, request.muscleGroupId, request.page, request.pageSize, cancellationToken);


            if (exercises == null) return new PagedResult<ExerciseDto>(new List<ExerciseDto>(), 0, request.pageSize, request.page);

            var dtos = exercises.Select(e => new ExerciseDto
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description ?? "",
                DifficultyLevel = e.DifficultyLevel,

                MuscleGroupId = e.MuscleGroupId,
                EquipmentRequired = e.EquipmentRequired ?? "Standard"
            });

            return new PagedResult<ExerciseDto>(dtos, totalCount, request.pageSize, request.page);
        }
    }
}