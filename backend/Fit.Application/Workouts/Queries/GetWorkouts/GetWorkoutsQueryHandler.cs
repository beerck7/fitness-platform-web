using Fit.Application.Workouts.DTOs;
using Fit.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Application.Workouts.Queries.GetWorkouts
{
    public class GetWorkoutsQueryHandler(IWorkoutRepository workoutRepository)
        : IRequestHandler<GetWorkoutsQuery, IEnumerable<WorkoutDto>>
    {
        public async Task<IEnumerable<WorkoutDto>> Handle(GetWorkoutsQuery request, CancellationToken cancellationToken)
        {
            var isSharedPending = request.IsSharedPending ?? false;
            var workouts = await workoutRepository.GetByUserIdAsync(request.UserId, request.StartDate, request.EndDate, request.IsCompleted, isSharedPending, cancellationToken);

            if (workouts == null) return new List<WorkoutDto>();

            return workouts.Select(w => new WorkoutDto
            {
                Id = w.Id,
                DurationMinutes = w.DurationMinutes,
                IsCompleted = w.IsCompleted,
                Name = w.Name ?? "Bez nazwy",
                Date = w.WorkoutDate,
                BackgroundImageUrl = w.BackgroundImageUrl,
                IsFavorite = w.IsFavorite,
                ExercisesCount = w.WorkoutExercises?.Count ?? 0,
                Exercises = w.WorkoutExercises?.OrderBy(e => e.Order).Select(e => new WorkoutExerciseDto
                {
                    Id = e.Id,
                    ExerciseId = e.ExerciseId,
                    ExerciseName = e.Exercise != null ? e.Exercise.Name : "Ćwiczenie",
                    Sets = e.ExerciseSets != null ? e.ExerciseSets.Count : 0,
                    Reps = (e.ExerciseSets != null && e.ExerciseSets.Any()) ? (int)e.ExerciseSets.Average(s => s.Reps) : 0,
                    Weight = (e.ExerciseSets != null && e.ExerciseSets.Any()) ? e.ExerciseSets.Average(s => s.Weight) : 0,
                    TargetWeight = (e.ExerciseSets != null && e.ExerciseSets.Any()) ? (e.ExerciseSets.Average(s => s.TargetWeight) ?? 0) : 0,
                    RestSeconds = (e.ExerciseSets != null && e.ExerciseSets.Any()) ? (int)e.ExerciseSets.Average(s => s.RestSeconds) : 60
                }).ToList() ?? new List<WorkoutExerciseDto>()
            });
        }
    }
}
