using Fit.Domain.Enums;
using MediatR;

namespace Fit.Application.FoodDiary.Commands.UpdateDiaryEntry;

public class UpdateFoodDiaryEntryCommand : IRequest
{
    public Guid EntryId { get; set; }
    public MealType MealType { get; set; }
    
    // OPCJA 1: Produkt
    public Guid? ProductId { get; set; }
    public decimal? ProductAmount { get; set; }
    
    // OPCJA 2: Danie
    public Guid? MealId { get; set; }
    public decimal? MealServings { get; set; }
    
    public string? Notes { get; set; }
}
