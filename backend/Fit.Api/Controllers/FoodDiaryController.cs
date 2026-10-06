using Fit.Application.FoodDiary.Commands.AddDiaryEntry;
using Fit.Application.FoodDiary.Commands.DeleteDayDiary;
using Fit.Application.FoodDiary.Commands.DeleteDiaryEntry;
using Fit.Application.FoodDiary.Commands.UpdateDiaryEntry;
using Fit.Application.FoodDiary.DTOs;
using Fit.Application.FoodDiary.Queries.GetDailyDiary;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FoodDiaryController : ControllerBase
{
    private readonly IMediator _mediator;

    public FoodDiaryController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Dodaje wpis do dziennika spożycia (produkt lub danie)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Guid>> AddEntry([FromBody] AddFoodDiaryEntryCommand command)
    {
        if ((int)command.MealType is < 0 or > 4 || command.ProductAmount is <= 0 or > 5000 || command.MealServings is <= 0 or > 100)
            return BadRequest(new { message = "Sprawdź ilość produktu i rodzaj posiłku." });
        var entryId = await _mediator.Send(command);
        return Ok(entryId);
    }

    /// <summary>
    /// Pobiera dziennik spożycia dla konkretnego dnia
    /// </summary>
    [HttpGet("{date}")]
    public async Task<ActionResult<DailySummaryDto>> GetDailyDiary(DateOnly date)
    {
        var query = new GetDailyDiaryQuery { Date = date };
        var summary = await _mediator.Send(query);
        return Ok(summary);
    }

    /// <summary>
    /// Aktualizuje wpis w dzienniku
    /// </summary>
    [HttpPut("{entryId}")]
    public async Task<ActionResult> UpdateEntry(Guid entryId, [FromBody] UpdateFoodDiaryEntryCommand command)
    {
        if ((int)command.MealType is < 0 or > 4 || command.ProductAmount is <= 0 or > 5000 || command.MealServings is <= 0 or > 100)
            return BadRequest(new { message = "Sprawdź ilość produktu i rodzaj posiłku." });
        command.EntryId = entryId;
        await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Usuwa wpis z dziennika
    /// </summary>
    [HttpDelete("{entryId}")]
    public async Task<ActionResult> DeleteEntry(Guid entryId)
    {
        var command = new DeleteFoodDiaryEntryCommand { EntryId = entryId };
        await _mediator.Send(command);
        return NoContent();
    }

    /// <summary>
    /// Czyści cały dzień w dzienniku
    /// </summary>
    [HttpDelete("day/{date}")]
    public async Task<ActionResult> ClearDay(DateOnly date)
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
             return Unauthorized();
        }

        var command = new DeleteDayFoodDiaryEntriesCommand 
        { 
            Date = date,
            UserId = userId
        };
        await _mediator.Send(command);
        return NoContent();
    }
}
