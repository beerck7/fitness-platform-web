using Fit.Application.FoodDiary.DTOs;
using Fit.Application.Interfaces;
using Fit.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.FoodDiary.Queries.GetDailyDiary;

public class GetDailyDiaryQueryHandler : IRequestHandler<GetDailyDiaryQuery, DailySummaryDto>
{
    private readonly IFitDbContext _dbContext;
    private readonly IUserContext _userContext;

    public GetDailyDiaryQueryHandler(IFitDbContext dbContext, IUserContext userContext)
    {
        _dbContext = dbContext;
        _userContext = userContext;
    }

    public async Task<DailySummaryDto> Handle(GetDailyDiaryQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _userContext.GetCurrentUser();
        if (currentUser == null)
            throw new UnauthorizedAccessException("Zaloguj się, aby wykonać tę operację.");

        var entries = await _dbContext.FoodDiaryEntries
            .Include(e => e.Product)
            .Include(e => e.Meal)
            .Where(e => e.UserId == currentUser.Id && e.Date == request.Date)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync(cancellationToken);

        var entryDtos = entries.Select(e => new FoodDiaryEntryDto
        {
            Id = e.Id,
            Date = e.Date,
            MealType = e.MealType,
            MealTypeName = e.MealType.ToString(),
            ProductId = e.ProductId,
            ProductName = e.Product?.Name,
            ProductAmount = e.ProductAmount,
            MealId = e.MealId,
            MealName = e.Meal?.Name,
            MealServings = e.MealServings,
            Kcal = e.Kcal,
            Protein = e.Protein,
            Fat = e.Fat,
            Carbs = e.Carbs,
            Notes = e.Notes,
            CreatedAt = e.CreatedAt
        }).ToList();

        var summary = new DailySummaryDto
        {
            Date = request.Date,
            TotalKcal = entryDtos.Sum(e => e.Kcal),
            TotalProtein = entryDtos.Sum(e => e.Protein),
            TotalFat = entryDtos.Sum(e => e.Fat),
            TotalCarbs = entryDtos.Sum(e => e.Carbs),
            Breakfast = entryDtos.Where(e => e.MealType == MealType.Breakfast).ToList(),
            Lunch = entryDtos.Where(e => e.MealType == MealType.Lunch).ToList(),
            Dinner = entryDtos.Where(e => e.MealType == MealType.Dinner).ToList(),
            Snacks = entryDtos.Where(e => e.MealType == MealType.Snack).ToList(),
            Other = entryDtos.Where(e => e.MealType == MealType.Other).ToList()
        };

        return summary;
    }
}
