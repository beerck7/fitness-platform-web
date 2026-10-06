using Fit.Application.Interfaces;
using Fit.Domain.Entities;
using Fit.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fit.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly IFitDbContext _fitDbContext;

        public ProductRepository(IFitDbContext fitDbContext)
        {
            _fitDbContext = fitDbContext;
        }

        public async Task<Product?> FindProductByBarCodeAsync(string barCode, CancellationToken ct = default)
        {
            return await _fitDbContext.Products
                .Include(p => p.Micronutrients)
                    .ThenInclude(m => m.MicronutrientDefinition)
                .Include(p=>p.Servings)
                .FirstOrDefaultAsync(p => p.Barcode == barCode, ct);
        }
        public async Task<Product?> GetProductByIdAsync(Guid Id, CancellationToken ct = default)
        {
            return await _fitDbContext.Products
                .Include(p => p.Micronutrients)
                    .ThenInclude(m => m.MicronutrientDefinition)
                 .Include(p => p.Servings)
                .FirstOrDefaultAsync(p => p.Id == Id, ct);
        }
        public async Task AddAsync(Product product, CancellationToken ct = default)
        {
            await _fitDbContext.Products.AddAsync(product, ct);
        }

        public Task SaveChangesAsync(CancellationToken ct = default)
        {
            return _fitDbContext.SaveChangesAsync(ct);
        }

        public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await GetProductByIdAsync(id, ct);
        }

        public async Task<List<Product>> GetAllAsync(CancellationToken ct = default)
        {
            return await _fitDbContext.Products
                .Include(p => p.Micronutrients)
                    .ThenInclude(m => m.MicronutrientDefinition)
                .Include(p => p.Servings)
                .ToListAsync(ct);
        }
    }
}
