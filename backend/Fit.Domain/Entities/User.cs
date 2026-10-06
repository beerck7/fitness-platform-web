using Fit.Domain.Enums;

namespace Fit.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpires { get; set; }
        public Gender Gender { get; set; }
        public bool IsEmailConfirmed { get; set; }
        public bool Visibility { get; set; }
        public string? AvatarUrl { get; set; }

        public DateOnly DateOfBirth { get; set; }
        public DateTime CreatedAt { get; set; }

        public DateTime LastLogin { get; set; }

    }
}
