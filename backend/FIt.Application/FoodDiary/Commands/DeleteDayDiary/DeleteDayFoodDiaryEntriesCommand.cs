using MediatR;

namespace Fit.Application.FoodDiary.Commands.DeleteDayDiary;

public class DeleteDayFoodDiaryEntriesCommand : IRequest
{
    public DateOnly Date { get; set; }
    public Guid UserId { get; set; }
}
