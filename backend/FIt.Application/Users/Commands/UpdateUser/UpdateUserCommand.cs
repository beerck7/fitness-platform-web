using MediatR;
using System;

namespace Fit.Application.Users.Commands.UpdateUser
{
    public class UpdateUserCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Visibility { get; set; }
        public int Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
    }
}
