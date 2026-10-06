using Fit.Application.Interfaces;
using Fit.Application.Users.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Application.Users.Queries.GetUserProfile
{
    public class GetUserProfileQueryHandler(IFitDbContext context) : IRequestHandler<GetUserProfileQuery, UserProfileDto?>
    {
        public async Task<UserProfileDto?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
            
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Gender = user.Gender.ToString().ToLower(),
                DateOfBirth = user.DateOfBirth,
                CreatedAt = user.CreatedAt,
                Visibility = user.Visibility,
                AvatarUrl = user.AvatarUrl
            };
        }
    }
}
