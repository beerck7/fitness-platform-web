
using Fit.Application.Interfaces;
using Fit.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.FoodDiary.Commands.DeleteDayDiary;

public class DeleteDayFoodDiaryEntriesCommandHandler : IRequestHandler<DeleteDayFoodDiaryEntriesCommand>
{
    private readonly IFitDbContext _context;
    // Assuming we might need UserContext or similar to get current user, but command has UserId.
    // In a real app we'd validate the user or get it from context.
    
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
