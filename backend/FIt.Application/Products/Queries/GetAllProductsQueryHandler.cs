using Fit.Domain.Interfaces;
using FIt.Application.Products.DTOs;
using MediatR;

namespace FIt.Application.Products.Queries;

public class GetAllProductsQueryHandler(IProductRepository productRepository)
    : IRequestHandler<GetAllProductsQuery, List<ProductDto>>
{
    public async Task<List<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await productRepository.GetAllAsync(cancellationToken);

        return products.Select(product => new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Brand = product.Brand,
            Barcode = product.Barcode,
            Kcal = product.Kcal,
            Protein = product.Protein,
            Fat = product.Fat,
            Carbs = product.Carbs,
            Servings = product.Servings.ToList(),
            Micronutrients = product.Micronutrients
                .Select(m => new MicronutrientDto
                {
                    Name = m.MicronutrientDefinition.Name,
                    Unit = m.MicronutrientDefinition.Unit,
                    Amount = m.Amount
                })
                .ToList()
        }).ToList();
    }
}
