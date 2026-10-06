using FIt.Application.UserGoals.Commands.DeleteUserGoals;
using FIt.Application.UserGoals.DTOs;
using FIt.Application.UserGoals.Queries.GetUserGoals;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fit.Api.Controllers
{
    [ApiController]
    [Route("api/me/goal")]
    [Authorize]
    public sealed class UserGoalController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UserGoalController(IMediator mediator) => _mediator = mediator;

        [HttpGet]
        public async Task<ActionResult<UserGoalDTO>> Get(CancellationToken ct)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

            var result = await _mediator.Send(new GetUserGoalQuery(userIdString), ct);

            return result is null ? NotFound() : Ok(result);
        }

        [HttpPut]
        [Authorize]

        public async Task<ActionResult<UserGoalDTO>> Put([FromBody] UpsertUserGoalRequest req, CancellationToken ct)
        {
            if (req.TargetCalories is < 500 or > 10000 || req.TrainingsPerWeekTarget is < 1 or > 14 || req.HeightCm is < 80 or > 250 || req.CurrentWeightKg is < 20 or > 400 || req.ProteinGrams is < 1 or > 1000 || req.FatGrams is < 1 or > 1000 || req.CarbsGrams is < 1 or > 1000)
                return BadRequest(new { message = "Sprawdź zakresy dziennych celów." });
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            var cmd = new UpsertUserGoalCommand
            {
                UserId = userIdString,

                CurrentWeightKg = req.CurrentWeightKg,
                HeightCm = req.HeightCm,

                GoalType = req.GoalType,
                TargetWeightKg = req.TargetWeightKg,
                TargetDate = req.TargetDate,

                TrainingsPerWeekTarget = req.TrainingsPerWeekTarget,
                CardioSessionsPerWeekTarget = req.CardioSessionsPerWeekTarget,

                TargetCalories = req.TargetCalories,
                ProteinGrams = req.ProteinGrams,
                FatGrams = req.FatGrams,
                CarbsGrams = req.CarbsGrams,

                ActivityLevel = req.ActivityLevel,
                StepsPerDayTarget = req.StepsPerDayTarget,
                Notes = req.Notes
            };

            var result = await _mediator.Send(cmd, ct);
            return Ok(result);
        }


        [HttpDelete]
        [Authorize]

        public async Task<IActionResult> Delete(CancellationToken ct)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
            var deleted = await _mediator.Send(new DeleteUserGoalCommand(userIdString), ct);

            return deleted ? NoContent() : NotFound();
        }

    
    }
}
