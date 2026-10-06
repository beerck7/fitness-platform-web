using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using FIt.Application.Account.DTOs;
namespace FIt.Application.Account.Commands.RegisterUser
{
    public class RegisterUserCommand : IRequest<AuthResponse>
    {
      
        [Required, MinLength(2), MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required, EmailAddress, MaxLength(254)]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(5), MaxLength(30)]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required, MinLength(12), MaxLength(128)]
        public string Password { get; set; } = string.Empty;
        [Range(0, 1)]
        public int Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }

    }
}
