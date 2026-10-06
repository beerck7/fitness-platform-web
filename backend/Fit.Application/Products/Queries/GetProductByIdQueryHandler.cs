using Fit.Domain.Entities;
using Fit.Domain.Enums;
using Fit.Domain.Interfaces;
using Fit.Application.Products.DTOs;
using Fit.Application.Products.Queries;
using MediatR;

namespace Fit.Application.Products.Queries.GetProductById;

public class GetProductByIdQueryHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
  

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetProductByIdAsync(request.Id, cancellationToken);

        if (product is null)
            return null;
      
        return new ProductDto
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
        };
    }
}
