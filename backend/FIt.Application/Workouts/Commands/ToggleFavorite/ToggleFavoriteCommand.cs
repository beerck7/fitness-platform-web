using MediatR;

namespace Fit.Application.Workouts.Commands.ToggleFavorite
{
    public class ToggleFavoriteCommand : IRequest<bool>
    {
        public int WorkoutId { get; set; }
        public Guid UserId { get; set; }
    }
}
