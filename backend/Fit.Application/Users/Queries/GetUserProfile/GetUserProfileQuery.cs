using Fit.Application.Users.DTOs;
using MediatR;
using System;

namespace Fit.Application.Users.Queries.GetUserProfile
{
    public class GetUserProfileQuery : IRequest<UserProfileDto?>
    {
        public Guid UserId { get; set; }
        public GetUserProfileQuery(Guid userId)
        {
            UserId = userId;
        }
    }
}
