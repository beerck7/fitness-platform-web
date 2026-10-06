using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.Account.Commands.ChangePassword
{
   public class ChangePasswordCommand(Guid userId,string newPassword, string oldPassword) : IRequest<bool> 
    {
        public Guid UserId { get; set; } = userId;
        public string NewPassword { get; set; } = newPassword;
        public string OldPassword { get; set; } = oldPassword;
    }
}
