using Fit.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Application.Products.DTOs
{
    public class CreateProductRequest
    {
        public string Name { get; set; } = default!;
        public string? Brand { get; set; }
        public string? Barcode { get; set; }

        // domyślnie 100 g, możesz nadpisać z UI
        public decimal BaseAmount { get; set; } = 100m;
        public ProductBaseUnit BaseUnit { get; set; } = ProductBaseUnit.Gram;

        // makro na BaseAmount
        public decimal Kcal { get; set; }
        public decimal Protein { get; set; }
        public decimal Fat { get; set; }
        public decimal Carbs { get; set; }

        public decimal? Fiber { get; set; }
        public decimal? Sugar { get; set; }
        public decimal? SaturatedFat { get; set; }
        public decimal? Salt { get; set; }

        // Mikro – user wybiera z listy definicji (MicronutrientDefinition),
        // a tu podaje ilości na BaseAmount
        public List<CreateProductMicronutrientRequest> Micronutrients { get; set; } = new();
    }

    public class CreateProductMicronutrientRequest
    {
        public int MicronutrientDefinitionId { get; set; }
        public decimal Amount { get; set; } // na BaseAmount (np. mg / 100 g)
    }
}
