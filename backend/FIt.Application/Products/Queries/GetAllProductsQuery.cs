using FIt.Application.Products.DTOs;
using MediatR;

namespace FIt.Application.Products.Queries;

public record GetAllProductsQuery() : IRequest<List<ProductDto>>;
