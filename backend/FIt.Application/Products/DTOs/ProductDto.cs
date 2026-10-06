using Fit.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.Products.DTOs
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Brand { get; set; }
        public string? Barcode { get; set; }

        public decimal Kcal { get; set; }
        public decimal Protein { get; set; }
        public decimal Fat { get; set; }
        public decimal Carbs { get; set; }

        public List<ProductServing> Servings { get; set; } = new List<ProductServing>();
        public IReadOnlyCollection<MicronutrientDto> Micronutrients { get; set; }
            = Array.Empty<MicronutrientDto>();
    }
}
