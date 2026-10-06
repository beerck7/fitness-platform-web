namespace Fit.Domain.Entities
{
    /// <summary>
    /// Danie/Przepis - złożone z wielu produktów
    /// Może być używane jak produkt w dzienniku spożycia
    /// </summary>
    public class Meal
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        
        // Właściciel dania
        public Guid UserId { get; set; }
        public User User { get; set; } = default!;
        
        // Czy danie jest publiczne (widoczne dla innych)
        public bool IsPublic { get; set; } = false;
        
        // Ile porcji robi ten przepis (np. 4 porcje)
        public int ServingsCount { get; set; } = 1;
        
        // Składniki dania
        public ICollection<MealIngredient> Ingredients { get; set; } = new List<MealIngredient>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
