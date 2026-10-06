namespace Fit.Application.Users.DTOs
{
    public class UserSearchResultDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string? AvatarUrl { get; set; }
    }
}
