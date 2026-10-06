using Fit.Application.Interfaces;
using Fit.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.Account.Commands.ChangePassword
{
    public class ChangePasswordCommandHandler(IPasswordHasher passwordHasher, IUserRepository userRepository) : IRequestHandler<ChangePasswordCommand, bool>
    {
        public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByIdAsync(request.UserId, cancellationToken);
            if (user is null) return false;
            if (passwordHasher.Verify(request.OldPassword,user.PasswordHash))
            {
                user.PasswordHash = passwordHasher.Hash(request.NewPassword);
                await userRepository.SaveChangesAsync(cancellationToken);
                return true;
            }
            return false;
        }
    }
}
