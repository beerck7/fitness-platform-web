namespace Fit.Application.Products.DTOs;

public class ProductServingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public decimal AmountInBaseUnits { get; set; }
    public bool IsDefault { get; set; }
}
