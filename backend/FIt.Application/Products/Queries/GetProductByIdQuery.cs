using FIt.Application.Products.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.Products.Queries
{
    public class GetProductByIdQuery(Guid id) : IRequest<ProductDto?>
    {
        public Guid Id { get; set; } = id;
    }
}
