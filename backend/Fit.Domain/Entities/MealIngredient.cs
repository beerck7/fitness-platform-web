namespace Fit.Domain.Entities
{
    /// <summary>
    /// Składnik dania - produkt z ilością
    /// </summary>
    public class MealIngredient
    {
        public Guid Id { get; set; }
        
        // Relacja do dania
        public Guid MealId { get; set; }
        public Meal Meal { get; set; } = default!;
        
        // Relacja do produktu
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = default!;
        
        // Ilość produktu w jednostkach bazowych (gram/ml)
        public decimal Amount { get; set; }
        
        // Opcjonalna notatka (np. "ugotowane", "surowe")
        public string? Notes { get; set; }
        
        // Kolejność wyświetlania
        public int Order { get; set; }
    }
}
