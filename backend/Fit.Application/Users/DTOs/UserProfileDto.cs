using System;

namespace Fit.Application.Users.DTOs
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Visibility { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
