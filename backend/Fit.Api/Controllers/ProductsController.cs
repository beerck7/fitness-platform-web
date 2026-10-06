using Fit.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fit.Api.Controllers;

[ApiController, Authorize, Route("api/Products")]
public class ProductsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await sender.Send(new GetAllProductsQuery()));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await sender.Send(new GetProductByIdQuery(id));
        return product is null ? NotFound() : Ok(product);
    }
}
