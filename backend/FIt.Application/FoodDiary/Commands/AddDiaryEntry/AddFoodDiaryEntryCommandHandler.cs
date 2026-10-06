using Fit.Application.Interfaces;
using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.FoodDiary.Commands.AddDiaryEntry;

public class AddFoodDiaryEntryCommandHandler : IRequestHandler<AddFoodDiaryEntryCommand, Guid>
{
    private readonly IFitDbContext _dbContext;
    private readonly IUserContext _userContext;
    private readonly INutritionCalculationService _nutritionService;

    public AddFoodDiaryEntryCommandHandler(
        IFitDbContext dbContext,
        IUserContext userContext,
        INutritionCalculationService nutritionService)
    {
        _dbContext = dbContext;
        _userContext = userContext;
        _nutritionService = nutritionService;
    }

    public async Task<Guid> Handle(AddFoodDiaryEntryCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _userContext.GetCurrentUser();
        if (currentUser == null)
            throw new UnauthorizedAccessException("Zaloguj się, aby wykonać tę operację.");

        decimal kcal = 0, protein = 0, fat = 0, carbs = 0;

        // OPCJA 1: Dodaj produkt
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
        }
        // OPCJA 2: Dodaj danie
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

            // Oblicz wartości odżywcze całego dania
            foreach (var ingredient in meal.Ingredients)
            {
                var nutrition = _nutritionService.CalculateForBaseAmount(ingredient.Product, ingredient.Amount);
                kcal += nutrition.Kcal;
                protein += nutrition.Protein;
                fat += nutrition.Fat;
                carbs += nutrition.Carbs;
            }

            // Przelicz na liczbę porcji
            var servingMultiplier = request.MealServings.Value / meal.ServingsCount;
            kcal *= servingMultiplier;
            protein *= servingMultiplier;
            fat *= servingMultiplier;
            carbs *= servingMultiplier;
        }
        else
        {
            throw new ArgumentException("Podaj produkt i jego ilość albo posiłek i liczbę porcji.");
        }

        var entry = new FoodDiaryEntry
        {
            Id = Guid.NewGuid(),
            UserId = currentUser.Id,
            Date = request.Date,
            MealType = request.MealType,
            ProductId = request.ProductId,
            ProductAmount = request.ProductAmount,
            MealId = request.MealId,
            MealServings = request.MealServings,
            Kcal = kcal,
            Protein = protein,
            Fat = fat,
            Carbs = carbs,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.FoodDiaryEntries.AddAsync(entry, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return entry.Id;
    }
}
