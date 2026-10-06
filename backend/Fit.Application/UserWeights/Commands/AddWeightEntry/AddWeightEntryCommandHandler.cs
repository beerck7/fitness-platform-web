using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Application.UserWeights.Commands.AddWeightEntry
{
    public class AddWeightEntryCommandHandler(IUserWeightRepository userWeightRepository) : IRequestHandler<AddWeightEntryCommand, bool>
    {
        public async Task<bool> Handle(AddWeightEntryCommand request, CancellationToken cancellationToken)
        {
            var entry = new UserWeightHistory
            {
                Id = System.Guid.NewGuid(),
                UserId = request.UserId,
                WeightKg = request.WeightKg,
                DateRecorded = request.DateRecorded
            };

            await userWeightRepository.AddWeightEntryAsync(entry, cancellationToken);
            await userWeightRepository.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
