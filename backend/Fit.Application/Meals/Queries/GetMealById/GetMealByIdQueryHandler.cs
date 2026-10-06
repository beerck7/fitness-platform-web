using Fit.Application.Interfaces;
using Fit.Application.Meals.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.Meals.Queries.GetMealById;

public class GetMealByIdQueryHandler : IRequestHandler<GetMealByIdQuery, MealDto>
{
    private readonly IFitDbContext _dbContext;
    private readonly INutritionCalculationService _nutritionService;

    public GetMealByIdQueryHandler(IFitDbContext dbContext, INutritionCalculationService nutritionService)
    {
        _dbContext = dbContext;
        _nutritionService = nutritionService;
    }

    public async Task<MealDto> Handle(GetMealByIdQuery request, CancellationToken cancellationToken)
    {
        var meal = await _dbContext.Meals
            .Include(m => m.Ingredients)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Micronutrients)
                        .ThenInclude(m => m.MicronutrientDefinition)
            .FirstOrDefaultAsync(m => m.Id == request.MealId, cancellationToken);

        if (meal == null)
            throw new Exception("Nie znaleziono posiłku.");

        decimal totalKcal = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
        var ingredientDtos = new List<MealIngredientDetailDto>();

        foreach (var ingredient in meal.Ingredients.OrderBy(i => i.Order))
        {
            var nutrition = _nutritionService.CalculateForBaseAmount(ingredient.Product, ingredient.Amount);
            
            totalKcal += nutrition.Kcal;
            totalProtein += nutrition.Protein;
            totalFat += nutrition.Fat;
            totalCarbs += nutrition.Carbs;

            ingredientDtos.Add(new MealIngredientDetailDto
            {
                Id = ingredient.Id,
                ProductId = ingredient.ProductId,
                ProductName = ingredient.Product.Name,
                Amount = ingredient.Amount,
                Notes = ingredient.Notes,
                Order = ingredient.Order,
                Kcal = nutrition.Kcal,
                Protein = nutrition.Protein,
                Fat = nutrition.Fat,
                Carbs = nutrition.Carbs
            });
        }

        return new MealDto
        {
            Id = meal.Id,
            Name = meal.Name,
            Description = meal.Description,
            ServingsCount = meal.ServingsCount,
            IsPublic = meal.IsPublic,
            TotalKcal = totalKcal,
            TotalProtein = totalProtein,
            TotalFat = totalFat,
            TotalCarbs = totalCarbs,
            KcalPerServing = totalKcal / meal.ServingsCount,
            ProteinPerServing = totalProtein / meal.ServingsCount,
            FatPerServing = totalFat / meal.ServingsCount,
            CarbsPerServing = totalCarbs / meal.ServingsCount,
            Ingredients = ingredientDtos,
            CreatedAt = meal.CreatedAt
        };
    }
}
