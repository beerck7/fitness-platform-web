namespace Fit.Domain.Entities;

public enum FriendshipStatus { Pending, Accepted }

public class Friendship
{
    public int Id { get; set; }
    public Guid RequesterId { get; set; }
    public User Requester { get; set; } = default!;
    public Guid AddresseeId { get; set; }
    public User Addressee { get; set; } = default!;
    public FriendshipStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
}
