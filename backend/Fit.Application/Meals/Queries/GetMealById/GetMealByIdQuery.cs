using Fit.Application.Meals.DTOs;
using MediatR;

namespace Fit.Application.Meals.Queries.GetMealById;

public class GetMealByIdQuery : IRequest<MealDto>
{
    public Guid MealId { get; set; }
}
