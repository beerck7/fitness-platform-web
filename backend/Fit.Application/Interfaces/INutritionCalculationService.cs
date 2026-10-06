using Fit.Application.Products.DTOs;
using Fit.Domain.Entities;

namespace Fit.Application.Interfaces;

/// <summary>
/// Serwis do przeliczania wartości odżywczych produktów na różne porcje
/// </summary>
public interface INutritionCalculationService
{
    /// <summary>
    /// Przelicza wartości odżywcze produktu na podaną ilość w jednostkach bazowych (gram/ml)
    /// </summary>
    NutritionCalculationDto CalculateForBaseAmount(Product product, decimal amount);
    
    /// <summary>
    /// Przelicza wartości odżywcze produktu na podaną liczbę porcji (serving)
    /// </summary>
    NutritionCalculationDto CalculateForServing(Product product, Guid servingId, decimal servingCount = 1);
}
