using MediatR;
using System;

namespace Fit.Application.UserWeights.Commands.AddWeightEntry
{
    public class AddWeightEntryCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public double WeightKg { get; set; }
        public DateTime DateRecorded { get; set; }
    }
}
