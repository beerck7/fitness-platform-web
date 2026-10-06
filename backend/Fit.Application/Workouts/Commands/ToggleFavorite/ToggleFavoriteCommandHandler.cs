using Fit.Domain.Interfaces;
using MediatR;

namespace Fit.Application.Workouts.Commands.ToggleFavorite
{
    public class ToggleFavoriteCommandHandler : IRequestHandler<ToggleFavoriteCommand, bool>
    {
        private readonly IWorkoutRepository _workoutRepository;

        public ToggleFavoriteCommandHandler(IWorkoutRepository workoutRepository)
        {
            _workoutRepository = workoutRepository;
        }

        public async Task<bool> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
        {
            var workout = await _workoutRepository.GetByIdAsync(request.WorkoutId, cancellationToken);
            if (workout == null || workout.UserId != request.UserId)
            {
                return false;
            }

            workout.IsFavorite = !workout.IsFavorite;
            await _workoutRepository.UpdateAsync(workout, cancellationToken);

            return true;
        }
    }
}
