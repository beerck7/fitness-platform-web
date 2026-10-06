using MediatR;

namespace Fit.Application.Workouts.Commands.UpdateWorkoutSettings
{
    public class UpdateWorkoutSettingsCommand : IRequest<bool>
    {
        public int WorkoutId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = default!;
        public string? BackgroundImageUrl { get; set; }
    }
}
