using Fit.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Interfaces
{
    public interface IMuscleGroupRepository
    {
        Task CreateAsync(MuscleGroup muscleGroup);
    }
}
