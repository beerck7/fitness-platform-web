namespace Fit.Application.Products.DTOs;

/// <summary>
/// Reprezentuje wartości odżywcze przeliczone na konkretną ilość produktu
/// </summary>
public class NutritionCalculationDto
{
    public decimal Amount { get; set; }
    public string Unit { get; set; } = default!; // "gram", "ml", "porcja"
    
    // Makroskładniki
    public decimal Kcal { get; set; }
    public decimal Protein { get; set; }
    public decimal Fat { get; set; }
    public decimal Carbs { get; set; }
    
    // Opcjonalne
    public decimal? Fiber { get; set; }
    public decimal? Sugar { get; set; }
    public decimal? SaturatedFat { get; set; }
    public decimal? Salt { get; set; }
    
    // Mikroskładniki (jeśli potrzebne)
    public Dictionary<string, decimal> Micronutrients { get; set; } = new();
}
