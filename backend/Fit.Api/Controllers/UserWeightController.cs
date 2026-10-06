using Fit.Application.UserWeights.Commands.AddWeightEntry;
using Fit.Application.UserWeights.Queries.GetWeightHistory;
using Fit.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Fit.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/weight")]
    public class UserWeightController(ISender sender) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult> AddEntry([FromBody] AddWeightEntryCommand command)
        {
            if (!double.IsFinite(command.WeightKg) || command.WeightKg is < 20 or > 400)
                return BadRequest(new { message = "Waga musi wynosić od 20 do 400 kg." });
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            command.UserId = userId;
            // Bez podanej daty zapisujemy pomiar na dziś.
            if (command.DateRecorded == default) command.DateRecorded = DateTime.UtcNow;

            await sender.Send(command);
            return Ok();
        }

        [HttpGet("history")]
        public async Task<ActionResult<List<UserWeightHistory>>> GetHistory([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

            var query = new GetWeightHistoryQuery(userId, from, to);
            var result = await sender.Send(query);
            return Ok(result);
        }
    }
}
