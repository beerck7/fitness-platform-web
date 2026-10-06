using Fit.Application.Users.Queries.GetUserProfile;
using Fit.Application.Users.Commands.UpdateUser;
using Fit.Infrastructure.Persistance;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Fit.Api.Controllers;

[ApiController, Authorize, Route("api/User")]
public class UserController(ISender sender, FitDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string term = "", CancellationToken cancellationToken = default)
    {
        term = term.Trim();
        if (term.Length is < 2 or > 100) return Ok(Array.Empty<object>());
        var lowered = term.ToLowerInvariant();
        return Ok(await db.Users.AsNoTracking()
            .Where(user => user.Id != UserId && user.Visibility &&
                (user.Name.ToLower().Contains(lowered) || user.Email.ToLower() == lowered))
            .OrderBy(user => user.Name).Take(20)
            .Select(user => new { userId = user.Id, user.Name }).ToListAsync(cancellationToken));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await sender.Send(new GetUserProfileQuery(UserId));
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(UpdateUserCommand command)
    {
        command.UserId = UserId;
        if (string.IsNullOrWhiteSpace(command.Name) || command.Name.Trim().Length < 2 || command.Name.Length > 100 || command.Gender is < 0 or > 1 || command.DateOfBirth == default || command.DateOfBirth >= DateOnly.FromDateTime(DateTime.UtcNow)) return BadRequest(new { message = "Sprawdź dane profilu." });
        command.Name = command.Name.Trim();
        return await sender.Send(command) ? NoContent() : NotFound();
    }
}
