using Fit.Application.UserGoals.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.UserGoals.Queries.GetUserGoals
{
    public class GetUserGoalQuery(string userId) : IRequest<UserGoalDTO?>
    {
        public string UserId { get; set; } = userId;
    }
}
