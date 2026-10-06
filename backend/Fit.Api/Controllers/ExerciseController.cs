using Fit.Application.Exercises.Commands.CreateExercise;
using Fit.Application.Exercises.Commands.GetExerciseByIdCommand;
using Fit.Application.Exercises.DTOs;
using Fit.Application.Exercises.Queries.GetAllExercises; // Upewnij się, że masz ten using
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Fit.Application.Common;

namespace Fit.Api.Controllers
{
    [ApiController]
    [Route("api/Exercises")]
    public class ExerciseController(ISender sender) : ControllerBase
    {
        [HttpPost]
        [Authorize]
        public async Task<ActionResult> Create(CreateExerciseCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.Name) || command.Name.Length > 100 || command.Description.Length > 300 || command.Instructions.Length > 1000 || command.MuscleGroupId is < 1 or > 8 || (int)command.DifficultyLevel is < 0 or > 2)
                return BadRequest(new { message = "Sprawdź dane ćwiczenia." });
            await sender.Send(command);
            return Created();
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<PagedResult<ExerciseDto>>> GetAll([FromQuery] GetAllExercisesQuery getAllExercisesQuery)
        {
            if (getAllExercisesQuery.page < 1 || getAllExercisesQuery.pageSize is < 1 or > 100)
                return BadRequest(new { message = "Numer strony musi być dodatni, a liczba wyników wynosić od 1 do 100." });
            var result = await sender.Send(getAllExercisesQuery);
            return Ok(result);
        }


        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ExerciseDto>> GetExerciseById([FromRoute] int id)
        {
            var command = new GetExerciseByIdCommand { Id = id };
            var dto = await sender.Send(command);

            if (dto is null)
                return NotFound();

            return Ok(dto);
        }
    }
}
