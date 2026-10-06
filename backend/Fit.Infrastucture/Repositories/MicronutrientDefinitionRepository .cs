using Fit.Application.Interfaces;
using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fit.Infrastructure.Repositories
{
    public class MicronutrientDefinitionRepository : IMicronutrientDefinitionRepository
    {
        private readonly IFitDbContext _fitDbContext;

        public MicronutrientDefinitionRepository(IFitDbContext fitDbContext)
        {
            _fitDbContext = fitDbContext;
        }

        public async Task<List<MicronutrientDefinition>> GetAllAsync(CancellationToken ct = default)
        {
            return await _fitDbContext
                .MicronutrientDefinitions
                .ToListAsync(ct);
        }

        public void Add(MicronutrientDefinition definition)
        {
            _fitDbContext.MicronutrientDefinitions.Add(definition);
        }
    }
}
