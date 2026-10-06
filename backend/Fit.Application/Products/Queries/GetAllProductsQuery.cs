using Fit.Application.Products.DTOs;
using MediatR;

namespace Fit.Application.Products.Queries;

public record GetAllProductsQuery() : IRequest<List<ProductDto>>;
