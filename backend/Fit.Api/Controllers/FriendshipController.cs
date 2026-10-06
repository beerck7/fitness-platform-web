using Fit.Domain.Entities;
using Fit.Infrastructure.Persistance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using System.Security.Claims;

namespace Fit.Api.Controllers;

[ApiController, Authorize, Route("api/Friendship")]
public class FriendshipController(FitDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("friends")]
    public async Task<IActionResult> Friends(CancellationToken cancellationToken)
    {
        var friendships = await db.Friendships.AsNoTracking().Include(item => item.Requester)
            .Include(item => item.Addressee)
            .Where(item => item.Status == FriendshipStatus.Accepted &&
                (item.RequesterId == UserId || item.AddresseeId == UserId))
            .ToListAsync(cancellationToken);
        return Ok(friendships.Select(item =>
        {
            var friend = item.RequesterId == UserId ? item.Addressee : item.Requester;
            return new { userId = friend.Id, friend.Name, friendsSince = item.AcceptedAt ?? item.CreatedAt };
        }).OrderBy(item => item.Name));
    }

    [HttpGet("pending")]
    public async Task<IActionResult> Pending(CancellationToken cancellationToken)
    {
        var pending = await db.Friendships.AsNoTracking().Include(item => item.Requester)
            .Include(item => item.Addressee)
            .Where(item => item.Status == FriendshipStatus.Pending &&
                (item.RequesterId == UserId || item.AddresseeId == UserId))
            .ToListAsync(cancellationToken);
        return Ok(pending.Select(item =>
        {
            var person = item.RequesterId == UserId ? item.Addressee : item.Requester;
            return new { friendshipId = item.Id, userId = person.Id, person.Name,
                requestDate = item.CreatedAt, isIncoming = item.AddresseeId == UserId };
        }));
    }

    [HttpPost("send")]
    public async Task<IActionResult> Send(SendRequest request, CancellationToken cancellationToken)
    {
        if (request.AddresseeId == Guid.Empty || request.AddresseeId == UserId)
            return BadRequest(new { message = "Wybierz innego użytkownika." });
        if (!await db.Users.AnyAsync(user => user.Id == request.AddresseeId && user.Visibility, cancellationToken))
            return NotFound(new { message = "Nie znaleziono publicznego profilu." });
        if (await db.Friendships.AnyAsync(item =>
            (item.RequesterId == UserId && item.AddresseeId == request.AddresseeId) ||
            (item.AddresseeId == UserId && item.RequesterId == request.AddresseeId), cancellationToken))
            return Conflict(new { message = "Zaproszenie już istnieje lub jesteście znajomymi." });
        var friendship = new Friendship { RequesterId = UserId, AddresseeId = request.AddresseeId,
            Status = FriendshipStatus.Pending, CreatedAt = DateTime.UtcNow };
        db.Friendships.Add(friendship);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException error) when (error.InnerException is SqliteException { SqliteExtendedErrorCode: 2067 })
        { return Conflict(new { message = "Zaproszenie już istnieje. Odśwież listę." }); }
        return Ok(new { friendshipId = friendship.Id });
    }

    [HttpPost("accept/{id:int}")]
    public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
    {
        var friendship = await db.Friendships.SingleOrDefaultAsync(item => item.Id == id &&
            item.AddresseeId == UserId && item.Status == FriendshipStatus.Pending, cancellationToken);
        if (friendship is null) return NotFound();
        friendship.Status = FriendshipStatus.Accepted;
        friendship.AcceptedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("reject/{id:int}")]
    public async Task<IActionResult> Reject(int id, CancellationToken cancellationToken)
    {
        var friendship = await db.Friendships.SingleOrDefaultAsync(item => item.Id == id &&
            item.Status == FriendshipStatus.Pending &&
            (item.AddresseeId == UserId || item.RequesterId == UserId), cancellationToken);
        if (friendship is null) return NotFound();
        db.Friendships.Remove(friendship);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public record SendRequest(Guid AddresseeId);
}
