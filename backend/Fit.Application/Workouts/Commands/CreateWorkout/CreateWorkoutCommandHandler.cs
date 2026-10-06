using Fit.Application.Interfaces;
using Fit.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.Workouts.Commands.CreateWorkout
{
    public class CreateWorkoutCommandHandler(IFitDbContext context) : IRequestHandler<CreateWorkoutCommand>
    {
        public async Task Handle(CreateWorkoutCommand request, CancellationToken cancellationToken)
        {
            if (!request.IsCompleted)
            {
                // Nazwy planów użytkownika muszą być unikalne.
                var exists = await context.Workouts.AnyAsync(w => 
                    w.UserId == request.UserId && 
                    w.Name == request.Name && 
                    w.IsCompleted == false, 
                    cancellationToken);
                
                if (exists) throw new InvalidOperationException($"Plan o nazwie '{request.Name}' już istnieje.");
            }

            var workout = new Workout
            {
                Name = request.Name,
                Notes = request.Notes,
                DurationMinutes = request.DurationMinutes,
                WorkoutDate = request.WorkoutDate,
                UserId = request.UserId,
                IsCompleted = request.IsCompleted,
                BackgroundImageUrl = request.BackgroundImageUrl,
                WorkoutExercises = new List<WorkoutExercise>()
            };

            foreach (var exDto in request.Exercises)
            {
                var workoutExercise = new WorkoutExercise
                {
                    ExerciseId = exDto.ExerciseId,
                    Order = request.Exercises.IndexOf(exDto) + 1,
                    ExerciseSets = new List<ExerciseSet>()
                };

                for (int i = 1; i <= exDto.Sets; i++)
                {
                    workoutExercise.ExerciseSets.Add(new ExerciseSet
                    {
                        SetNumber = i,
                        Reps = exDto.Reps,
                        TargetWeight = exDto.TargetWeight,
                        RestSeconds = exDto.RestSeconds,
                        Notes = exDto.Notes ?? "",
                        Weight = 0 // Default actual weight to 0 until logged
                    });
                }

                workout.WorkoutExercises.Add(workoutExercise);
            }

            context.Workouts.Add(workout);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
