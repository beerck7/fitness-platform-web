using Fit.Domain.Enums;

namespace Fit.Domain.Entities
{
    /// <summary>
    /// Wpis w dzienniku spożycia - co użytkownik zjadł danego dnia
    /// Może być produktem lub daniem
    /// </summary>
    public class FoodDiaryEntry
    {
        public Guid Id { get; set; }
        
        // Użytkownik
        public Guid UserId { get; set; }
        public User User { get; set; } = default!;
        
        // Data i typ posiłku
        public DateOnly Date { get; set; }
        public MealType MealType { get; set; }
        
        // OPCJA 1: Pojedynczy produkt
        public Guid? ProductId { get; set; }
        public Product? Product { get; set; }
        public decimal? ProductAmount { get; set; } // w jednostkach bazowych (gram/ml)
        
        // OPCJA 2: Danie
        public Guid? MealId { get; set; }
        public Meal? Meal { get; set; }
        public decimal? MealServings { get; set; } // ile porcji dania (np. 0.5, 1, 2)
        
        // Przeliczone wartości odżywcze (snapshot w momencie dodania)
        public decimal Kcal { get; set; }
        public decimal Protein { get; set; }
        public decimal Fat { get; set; }
        public decimal Carbs { get; set; }
        
        // Opcjonalne notatki
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
