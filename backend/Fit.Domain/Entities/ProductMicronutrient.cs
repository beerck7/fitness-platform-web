using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Entities
{
    public class ProductMicronutrient
    {
        public Guid Id { get; set; }

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = default!;

        public int MicronutrientDefinitionId { get; set; }
        public MicronutrientDefinition MicronutrientDefinition { get; set; } = default!;

        // Ilość na BaseAmount (np. mg / 100 g)
        public decimal Amount { get; set; }
    }

}
