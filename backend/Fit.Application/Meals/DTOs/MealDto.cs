namespace Fit.Application.Meals.DTOs;

public class MealDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int ServingsCount { get; set; }
    public bool IsPublic { get; set; }
    
    // Wartości odżywcze na całe danie
    public decimal TotalKcal { get; set; }
    public decimal TotalProtein { get; set; }
    public decimal TotalFat { get; set; }
    public decimal TotalCarbs { get; set; }
    
    // Wartości odżywcze na 1 porcję
    public decimal KcalPerServing { get; set; }
    public decimal ProteinPerServing { get; set; }
    public decimal FatPerServing { get; set; }
    public decimal CarbsPerServing { get; set; }
    
    public List<MealIngredientDetailDto> Ingredients { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class MealIngredientDetailDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
    public int Order { get; set; }
    
    // Wartości odżywcze tego składnika
    public decimal Kcal { get; set; }
    public decimal Protein { get; set; }
    public decimal Fat { get; set; }
    public decimal Carbs { get; set; }
}
