using Fit.Application.Workouts.DTOs;
using MediatR;
using System;
using System.Collections.Generic;

namespace Fit.Application.Workouts.Queries.GetWorkouts
{
    public class GetWorkoutsQuery : IRequest<IEnumerable<WorkoutDto>>
    {
        public Guid UserId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsCompleted { get; set; }
        public bool? IsSharedPending { get; set; }
    }
}