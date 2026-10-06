using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.UserGoals.Commands.DeleteUserGoals
{
    public class DeleteUserGoalCommand(string userId): IRequest<bool>
    {
        public string UserId { get; set; } = userId;
    }
}
