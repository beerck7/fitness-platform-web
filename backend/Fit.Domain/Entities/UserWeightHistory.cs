using System;
using System.ComponentModel.DataAnnotations;

namespace Fit.Domain.Entities
{
    public class UserWeightHistory
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public double WeightKg { get; set; }
        public DateTime DateRecorded { get; set; }
    }
}
