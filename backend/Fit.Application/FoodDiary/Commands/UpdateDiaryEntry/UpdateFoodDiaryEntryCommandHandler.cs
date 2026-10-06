using Fit.Application.Interfaces;
using Fit.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.FoodDiary.Commands.UpdateDiaryEntry;

public class UpdateFoodDiaryEntryCommandHandler : IRequestHandler<UpdateFoodDiaryEntryCommand>
{
    private readonly IFitDbContext _dbContext;
    private readonly IUserContext _userContext;
    private readonly INutritionCalculationService _nutritionService;

    public UpdateFoodDiaryEntryCommandHandler(
        IFitDbContext dbContext,
        IUserContext userContext,
        INutritionCalculationService nutritionService)
    {
        _dbContext = dbContext;
        _userContext = userContext;
        _nutritionService = nutritionService;
    }

    public async Task Handle(UpdateFoodDiaryEntryCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _userContext.GetCurrentUser();
        if (currentUser == null)
            throw new UnauthorizedAccessException("Zaloguj się, aby wykonać tę operację.");

        var entry = await _dbContext.FoodDiaryEntries
            .FirstOrDefaultAsync(e => e.Id == request.EntryId && e.UserId == currentUser.Id, cancellationToken);

        if (entry == null)
            throw new KeyNotFoundException("Nie znaleziono wpisu w dzienniku.");

        decimal kcal = 0, protein = 0, fat = 0, carbs = 0;

        // Przelicz wartości odżywcze (podobnie jak w AddDiaryEntry)
        if (request.ProductId.HasValue && request.ProductAmount.HasValue)
        {
            var product = await _dbContext.Products
                .Include(p => p.Micronutrients)
                    .ThenInclude(m => m.MicronutrientDefinition)
                .FirstOrDefaultAsync(p => p.Id == request.ProductId.Value, cancellationToken);

            if (product == null)
                throw new KeyNotFoundException("Nie znaleziono produktu.");

            var nutrition = _nutritionService.CalculateForBaseAmount(product, request.ProductAmount.Value);
            kcal = nutrition.Kcal;
            protein = nutrition.Protein;
            fat = nutrition.Fat;
            carbs = nutrition.Carbs;

            entry.ProductId = request.ProductId;
            entry.ProductAmount = request.ProductAmount;
            entry.MealId = null;
            entry.MealServings = null;
        }
        else if (request.MealId.HasValue && request.MealServings.HasValue)
        {
            var meal = await _dbContext.Meals
                .Include(m => m.Ingredients)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Micronutrients)
                            .ThenInclude(m => m.MicronutrientDefinition)
                .FirstOrDefaultAsync(m => m.Id == request.MealId.Value && m.UserId == currentUser.Id, cancellationToken);

            if (meal == null)
                throw new KeyNotFoundException("Nie znaleziono posiłku.");

            foreach (var ingredient in meal.Ingredients)
            {
                var nutrition = _nutritionService.CalculateForBaseAmount(ingredient.Product, ingredient.Amount);
                kcal += nutrition.Kcal;
                protein += nutrition.Protein;
                fat += nutrition.Fat;
                carbs += nutrition.Carbs;
            }

            var servingMultiplier = request.MealServings.Value / meal.ServingsCount;
            kcal *= servingMultiplier;
            protein *= servingMultiplier;
            fat *= servingMultiplier;
            carbs *= servingMultiplier;

            entry.MealId = request.MealId;
            entry.MealServings = request.MealServings;
            entry.ProductId = null;
            entry.ProductAmount = null;
        }
        else
        {
            throw new ArgumentException("Podaj produkt i jego ilość albo posiłek i liczbę porcji.");
        }

        entry.MealType = request.MealType;
        entry.Kcal = kcal;
        entry.Protein = protein;
        entry.Fat = fat;
        entry.Carbs = carbs;
        entry.Notes = request.Notes;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
