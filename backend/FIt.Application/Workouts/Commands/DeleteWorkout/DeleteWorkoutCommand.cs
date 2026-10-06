using MediatR;

namespace Fit.Application.Workouts.Commands.DeleteWorkout
{
    public class DeleteWorkoutCommand : IRequest<bool>
    {
        public int WorkoutId { get; set; }
        public Guid UserId { get; set; }

        public DeleteWorkoutCommand(int workoutId, Guid userId)
        {
            WorkoutId = workoutId;
            UserId = userId;
        }
    }
}
