using Fit.Domain.Entities;

namespace Fit.Domain.Interfaces;

public interface IMicronutrientDefinitionRepository
{
    Task<List<MicronutrientDefinition>> GetAllAsync(CancellationToken ct = default);
    void Add(MicronutrientDefinition definition);
}
