using Fit.Application.FoodDiary.DTOs;
using Fit.Domain.Enums;
using MediatR;

namespace Fit.Application.FoodDiary.Queries.GetDailyDiary;

public class GetDailyDiaryQuery : IRequest<DailySummaryDto>
{
    public DateOnly Date { get; set; }
}
