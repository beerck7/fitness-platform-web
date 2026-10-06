using Fit.Application.Interfaces;
using Fit.Application.Products.DTOs;
using Fit.Domain.Entities;

namespace Fit.Application.Services;

public class NutritionCalculationService : INutritionCalculationService
{
    public NutritionCalculationDto CalculateForBaseAmount(Product product, decimal amount)
    {
        if (product == null)
            throw new ArgumentNullException(nameof(product));
        
        if (amount <= 0)
            throw new ArgumentException("Ilość musi być większa od zera.", nameof(amount));

        // Przelicznik: amount / BaseAmount (np. 50g / 100g = 0.5)
        var multiplier = amount / product.BaseAmount;

        var result = new NutritionCalculationDto
        {
            Amount = amount,
            Unit = product.BaseUnit.ToString().ToLower(),
            Kcal = product.Kcal * multiplier,
            Protein = product.Protein * multiplier,
            Fat = product.Fat * multiplier,
            Carbs = product.Carbs * multiplier,
            Fiber = product.Fiber.HasValue ? product.Fiber.Value * multiplier : null,
            Sugar = product.Sugar.HasValue ? product.Sugar.Value * multiplier : null,
            SaturatedFat = product.SaturatedFat.HasValue ? product.SaturatedFat.Value * multiplier : null,
            Salt = product.Salt.HasValue ? product.Salt.Value * multiplier : null
        };

        // Przelicz mikroskładniki
        foreach (var micro in product.Micronutrients)
        {
            var microAmount = micro.Amount * multiplier;
            result.Micronutrients[micro.MicronutrientDefinition.Name] = microAmount;
        }

        return result;
    }

    public NutritionCalculationDto CalculateForServing(Product product, Guid servingId, decimal servingCount = 1)
    {
        if (product == null)
            throw new ArgumentNullException(nameof(product));

        var serving = product.Servings.FirstOrDefault(s => s.Id == servingId);
        if (serving == null)
            throw new Exception("Nie znaleziono porcji produktu.");

        // Oblicz ile gram/ml to jest (np. 2 porcje * 30g = 60g)
        var totalAmount = serving.AmountInBaseUnits * servingCount;

        var result = CalculateForBaseAmount(product, totalAmount);
        result.Unit = $"{servingCount} x {serving.Name}";

        return result;
    }
}
