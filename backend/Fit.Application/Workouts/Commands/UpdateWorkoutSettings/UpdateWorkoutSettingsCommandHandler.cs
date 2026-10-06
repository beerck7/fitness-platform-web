using Fit.Domain.Interfaces;
using MediatR;

namespace Fit.Application.Workouts.Commands.UpdateWorkoutSettings
{
    public class UpdateWorkoutSettingsCommandHandler(IWorkoutRepository workoutRepository) : IRequestHandler<UpdateWorkoutSettingsCommand, bool>
    {
        public async Task<bool> Handle(UpdateWorkoutSettingsCommand request, CancellationToken cancellationToken)
        {
            var workout = await workoutRepository.GetByIdAsync(request.WorkoutId, cancellationToken);

            if (workout == null || workout.UserId != request.UserId)
            {
                return false;
            }

            workout.Name = request.Name;
            if (request.BackgroundImageUrl != null)
            {
                workout.BackgroundImageUrl = request.BackgroundImageUrl;
            }

            await workoutRepository.UpdateAsync(workout, cancellationToken);
            return true;
        }
    }
}
