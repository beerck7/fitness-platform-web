using Fit.Domain.Enums;

namespace Fit.Application.FoodDiary.DTOs;

public class FoodDiaryEntryDto
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public MealType MealType { get; set; }
    public string MealTypeName { get; set; } = default!;
    
    // Jeśli to produkt
    public Guid? ProductId { get; set; }
    public string? ProductName { get; set; }
    public decimal? ProductAmount { get; set; }
    
    // Jeśli to danie
    public Guid? MealId { get; set; }
    public string? MealName { get; set; }
    public decimal? MealServings { get; set; }
    
    // Wartości odżywcze
    public decimal Kcal { get; set; }
    public decimal Protein { get; set; }
    public decimal Fat { get; set; }
    public decimal Carbs { get; set; }
    
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DailySummaryDto
{
    public DateOnly Date { get; set; }
    
    // Podsumowanie makroskładników
    public decimal TotalKcal { get; set; }
    public decimal TotalProtein { get; set; }
    public decimal TotalFat { get; set; }
    public decimal TotalCarbs { get; set; }
    
    // Wpisy pogrupowane po typie posiłku
    public List<FoodDiaryEntryDto> Breakfast { get; set; } = new();
    public List<FoodDiaryEntryDto> Lunch { get; set; } = new();
    public List<FoodDiaryEntryDto> Dinner { get; set; } = new();
    public List<FoodDiaryEntryDto> Snacks { get; set; } = new();
    public List<FoodDiaryEntryDto> Other { get; set; } = new();
}
