using MediatR;
using System;
using System.Collections.Generic;
using Fit.Domain.Entities;

namespace Fit.Application.UserWeights.Queries.GetWeightHistory
{
    public class GetWeightHistoryQuery : IRequest<List<UserWeightHistory>>
    {
        public Guid UserId { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }

        public GetWeightHistoryQuery(Guid userId, DateTime? from = null, DateTime? to = null)
        {
            UserId = userId;
            From = from;
            To = to;
        }
    }
}
