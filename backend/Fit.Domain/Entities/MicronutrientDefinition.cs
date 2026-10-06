using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Entities
{
    public class MicronutrientDefinition
    {
        public int Id { get; set; }

        // np. „Vitamin C”
        public string Name { get; set; } = default!;

        // np. „vitamin-c” – Twój wewnętrzny klucz
        public string Key { get; set; } = default!;

        // np. „mg”, „µg”, „IU”
        public string Unit { get; set; } = default!;

        // np. „vitamin-c_100g” – klucz z OpenFoodFacts (nutriments)
        public string? ExternalKey { get; set; }
    }

}
