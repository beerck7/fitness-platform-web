using System.ComponentModel.DataAnnotations;
using FIt.Application.Account.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.Account.Commands.LoginUser
{
    public class LoginUserCommand : IRequest<AuthResponse>
    {
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        [Required, MaxLength(128)]
        public string Password { get; set; } = default!;
    }
}
