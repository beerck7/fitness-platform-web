using Fit.Domain.Interfaces;
using MediatR;

namespace Fit.Application.Workouts.Commands.DeleteWorkout
{
    public class DeleteWorkoutCommandHandler(IWorkoutRepository workoutRepository) : IRequestHandler<DeleteWorkoutCommand, bool>
    {
        public async Task<bool> Handle(DeleteWorkoutCommand request, CancellationToken cancellationToken)
        {
            var workout = await workoutRepository.GetByIdAsync(request.WorkoutId, cancellationToken);

            if (workout == null || workout.UserId != request.UserId)
            {
                return false;
            }

            await workoutRepository.DeleteAsync(workout.Id, cancellationToken);
            return true;
        }
    }
}
