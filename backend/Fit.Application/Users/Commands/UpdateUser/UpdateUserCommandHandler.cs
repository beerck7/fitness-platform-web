using Fit.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Application.Users.Commands.UpdateUser
{
    public class UpdateUserCommandHandler(IUserRepository userRepository) : IRequestHandler<UpdateUserCommand, bool>
    {
        public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByIdAsync(request.UserId, cancellationToken);
            if (user == null) return false;

            user.Name = request.Name;
            user.Visibility = request.Visibility;
            user.Gender = (Fit.Domain.Enums.Gender)request.Gender;
            user.DateOfBirth = request.DateOfBirth;
            
            await userRepository.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
