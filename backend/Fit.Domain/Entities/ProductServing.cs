using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Entities
{
    public class ProductServing
    {
        public Guid Id { get; set; }

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = default!;

        // np. "sztuka", "plaster", "łyżka"
        public string Name { get; set; } = default!;

        // Ile gramów/ml odpowiada 1 takiej porcji
        public decimal AmountInBaseUnits { get; set; }

        // Czy ta porcja jest domyślna w UI (np. „1 sztuka”)
        public bool IsDefault { get; set; } = false;
    }

}
