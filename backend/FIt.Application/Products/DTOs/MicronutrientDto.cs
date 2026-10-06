using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FIt.Application.Products.DTOs
{
    public class MicronutrientDto
    {
        public string Name { get; set; } = default!;
        public string Unit { get; set; } = default!;
        public decimal Amount { get; set; }
    }
}
