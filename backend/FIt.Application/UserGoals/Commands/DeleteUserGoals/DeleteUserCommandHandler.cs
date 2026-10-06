using Fit.Domain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.UserGoals.Commands.DeleteUserGoals
{
    public class DeleteUserGoalCommandHandler : IRequestHandler<DeleteUserGoalCommand, bool>
    {
        private readonly IUserGoalRepository _repo;

        public DeleteUserGoalCommandHandler(IUserGoalRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> Handle(DeleteUserGoalCommand request, CancellationToken ct)
        {
            var existing = await _repo.GetByUserIdAsync(Guid.Parse(request.UserId), ct);
            if (existing is null) return false;

            _repo.Remove(existing);
            await _repo.SaveChangesAsync(ct);
            return true;
        }
    }
}
