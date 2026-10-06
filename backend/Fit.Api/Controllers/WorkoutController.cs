using Fit.Application.Workouts.Commands.CreateWorkout;
using Fit.Application.Workouts.Commands.UpdateWorkoutSettings;
using Fit.Application.Workouts.Commands.DeleteWorkout;
using Fit.Application.Workouts.Commands.ToggleFavorite;
using Fit.Application.Workouts.Queries.GetWorkouts;
using Fit.Infrastructure.Persistance;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Fit.Api.Controllers;

[ApiController, Authorize, Route("api/Workouts")]
public class WorkoutController(ISender sender, FitDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetWorkoutsQuery query)
    {
        query.UserId = UserId;
        return Ok(await sender.Send(query));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkoutCommand command)
    {
        command.UserId = UserId;
        if (command.Exercises.Count == 0 || command.Exercises.Count > 30 || command.Exercises.Any(ex => ex.Sets is < 1 or > 20 || ex.Reps is < 1 or > 200)) return BadRequest(new { message = "Wybierz od 1 do 30 ćwiczeń z poprawną liczbą serii i powtórzeń." });
        var ids = command.Exercises.Select(ex => ex.ExerciseId).Distinct().ToArray();
        if (await db.Exercises.CountAsync(ex => ids.Contains(ex.Id)) != ids.Length) return BadRequest(new { message = "Jedno z wybranych ćwiczeń już nie istnieje." });
        await sender.Send(command);
        return StatusCode(201);
    }

    [HttpPut("{id:int}/settings")]
    public async Task<IActionResult> Rename(int id, RenameWorkoutRequest request)
    {
        var updated = await sender.Send(new UpdateWorkoutSettingsCommand { WorkoutId = id, UserId = UserId, Name = request.Name.Trim() });
        return updated ? NoContent() : NotFound();
    }

    [HttpPatch("{id:int}/completion")]
    public async Task<IActionResult> Complete(int id, CompletionRequest request)
    {
        var workout = await db.Workouts.SingleOrDefaultAsync(item => item.Id == id && item.UserId == UserId);
        if (workout is null) return NotFound();
        workout.IsCompleted = request.IsCompleted;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/toggle-favorite")]
    public async Task<IActionResult> Favorite(int id) => await sender.Send(new ToggleFavoriteCommand { WorkoutId = id, UserId = UserId }) ? NoContent() : NotFound();

    [HttpPatch("{id:int}/schedule")]
    public async Task<IActionResult> Schedule(int id, ScheduleWorkoutRequest request)
    {
        if (request.WorkoutDate.Year is < 2000 or > 2100)
            return BadRequest(new { message = "Wybierz datę od 2000 do 2100 roku." });
        var workout = await db.Workouts.SingleOrDefaultAsync(item => item.Id == id && item.UserId == UserId);
        if (workout is null) return NotFound();
        workout.WorkoutDate = request.WorkoutDate;
        workout.DurationMinutes = request.DurationMinutes;
        workout.Name = request.Name.Trim();
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await sender.Send(new DeleteWorkoutCommand(id, UserId)) ? NoContent() : NotFound();
}

public record RenameWorkoutRequest([Required, MinLength(2), MaxLength(100)] string Name);
public record CompletionRequest(bool IsCompleted);
public record ScheduleWorkoutRequest(DateTime WorkoutDate, [Range(1, 300)] int DurationMinutes, [Required, MinLength(2), MaxLength(100)] string Name);
