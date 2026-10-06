using Fit.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fit.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; set; }

        // Info podstawowe
        public string Name { get; set; } = default!;
        public string? Brand { get; set; }
        public string? Category { get; set; }   // np. „Nabiał”, „Pieczywo”

        // Właściciel produktu.
        public Guid? OwnerUserId { get; set; }  // null = produkt globalny
        public bool IsPublic { get; set; }      // widoczny dla wszystkich

        // Jednostka bazowa – na nią liczymy makro/mikro (najczęściej 100 g)
        public decimal BaseAmount { get; set; } = 100m;        // np. 100
        public ProductBaseUnit BaseUnit { get; set; } = ProductBaseUnit.Gram;

        // Makro na BaseAmount (np. na 100 g)
        public decimal Kcal { get; set; }
        public decimal Protein { get; set; }
        public decimal Fat { get; set; }
        public decimal Carbs { get; set; }

        // Dodatkowe pola makro (opcjonalne, ale przydatne)
        public decimal? Fiber { get; set; }
        public decimal? Sugar { get; set; }
        public decimal? SaturatedFat { get; set; }
        public decimal? Salt { get; set; }

        // Barcode + źródło (OpenFoodFacts itp.)
        public string? Barcode { get; set; }            // EAN-13 itd.
        public ProductSource Source { get; set; } = ProductSource.Manual;

        public string? ExternalId { get; set; }         // np. OFF używa barcode jako id
        public DateTimeOffset? ExternalSyncedAtUtc { get; set; }

        // Dane źródłowe OpenFoodFacts.
        public string? ExternalRawJson { get; set; }

        // Nawigacje
        public ICollection<ProductServing> Servings { get; set; }
            = new List<ProductServing>();

        public ICollection<ProductMicronutrient> Micronutrients { get; set; }
            = new List<ProductMicronutrient>();
    }
}
