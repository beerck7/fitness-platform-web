using Fit.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.FoodDiary.Commands.DeleteDiaryEntry;

public class DeleteFoodDiaryEntryCommandHandler : IRequestHandler<DeleteFoodDiaryEntryCommand>
{
    private readonly IFitDbContext _dbContext;
    private readonly IUserContext _userContext;

    public DeleteFoodDiaryEntryCommandHandler(IFitDbContext dbContext, IUserContext userContext)
    {
        _dbContext = dbContext;
        _userContext = userContext;
    }

    public async Task Handle(DeleteFoodDiaryEntryCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _userContext.GetCurrentUser();
        if (currentUser == null)
            throw new UnauthorizedAccessException("Zaloguj się, aby wykonać tę operację.");

        var entry = await _dbContext.FoodDiaryEntries
            .FirstOrDefaultAsync(e => e.Id == request.EntryId, cancellationToken);

        if (entry == null)
            throw new KeyNotFoundException("Nie znaleziono wpisu w dzienniku.");

        if (entry.UserId != currentUser.Id)
            throw new UnauthorizedAccessException("Możesz usuwać tylko własne wpisy w dzienniku.");

        _dbContext.FoodDiaryEntries.Remove(entry);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
