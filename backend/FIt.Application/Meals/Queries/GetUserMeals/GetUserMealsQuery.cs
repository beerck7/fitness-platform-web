using Fit.Application.Meals.DTOs;
using MediatR;

namespace Fit.Application.Meals.Queries.GetUserMeals;

public class GetUserMealsQuery : IRequest<List<MealDto>>
{
    public bool IncludePublic { get; set; } = false;
}
