using MediatR;

namespace Fit.Application.FoodDiary.Commands.DeleteDiaryEntry;

public class DeleteFoodDiaryEntryCommand : IRequest
{
    public Guid EntryId { get; set; }
}
