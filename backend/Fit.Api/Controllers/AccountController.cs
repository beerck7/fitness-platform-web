using MediatR;
using FIt.Application.Account.DTOs;
using FIt.Application.Account.Commands.LoginUser;
using FIt.Application.Account.Commands.RegisterUser;
using Fit.Application.Account.Commands.ChangePassword;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Fit.Api.Controllers;

[ApiController, Route("api/Account")]
public class AccountController(ISender sender) : ControllerBase
{
    [HttpPost("register"), EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterUserCommand command)
    {
        command.Email = command.Email.Trim().ToLowerInvariant();
        command.Name = command.Name.Trim();
        if (command.Name.Length < 2 || command.DateOfBirth == default || command.DateOfBirth >= DateOnly.FromDateTime(DateTime.UtcNow)) return BadRequest(new { message = "Podaj imię i nazwisko oraz datę urodzenia z przeszłości." });
        return Ok(await sender.Send(command));
    }

    [HttpPost("login"), EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Login(LoginUserCommand command)
    {
        command.Email = command.Email.Trim().ToLowerInvariant();
        return Ok(await sender.Send(command));
    }

    [HttpPut("change-password"), Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized();
        var result = await sender.Send(new ChangePasswordCommand(id, request.NewPassword, request.OldPassword));
        return result ? NoContent() : BadRequest(new { message = "Aktualne hasło jest nieprawidłowe." });
    }
}

public record ChangePasswordRequest([Required, MaxLength(128)] string OldPassword, [Required, MinLength(12), MaxLength(128)] string NewPassword);
