
using Fit.Application.Interfaces;
using Fit.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.FoodDiary.Commands.DeleteDayDiary;

public class DeleteDayFoodDiaryEntriesCommandHandler : IRequestHandler<DeleteDayFoodDiaryEntriesCommand>
{
    private readonly IFitDbContext _context;
    
    public DeleteDayFoodDiaryEntriesCommandHandler(IFitDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteDayFoodDiaryEntriesCommand request, CancellationToken cancellationToken)
    {
        var entries = await _context.FoodDiaryEntries
            .Where(e => e.UserId == request.UserId && e.Date == request.Date)
            .ToListAsync(cancellationToken);

        if (entries.Any())
        {
            _context.FoodDiaryEntries.RemoveRange(entries);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
