using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Fit.Application.UserWeights.Queries.GetWeightHistory
{
    public class GetWeightHistoryQueryHandler(IUserWeightRepository userWeightRepository) : IRequestHandler<GetWeightHistoryQuery, List<UserWeightHistory>>
    {
        public async Task<List<UserWeightHistory>> Handle(GetWeightHistoryQuery request, CancellationToken cancellationToken)
        {
            return await userWeightRepository.GetHistoryAsync(request.UserId, request.From, request.To, cancellationToken);
        }
    }
}
