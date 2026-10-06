using Fit.Domain.Enums;
using MediatR;

namespace Fit.Application.FoodDiary.Commands.AddDiaryEntry;

public class AddFoodDiaryEntryCommand : IRequest<Guid>
{
    public DateOnly Date { get; set; }
    public MealType MealType { get; set; }
    
    // OPCJA 1: Dodaj produkt
    public Guid? ProductId { get; set; }
    public decimal? ProductAmount { get; set; }
    
    // OPCJA 2: Dodaj danie
    public Guid? MealId { get; set; }
    public decimal? MealServings { get; set; }
    
    public string? Notes { get; set; }
}
