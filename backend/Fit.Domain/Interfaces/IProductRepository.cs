using Fit.Domain.Entities;

namespace Fit.Domain.Interfaces;

public interface IProductRepository
{
    /// <summary>
    /// Szuka produktu po kodzie kreskowym (z załadowanymi mikroskładnikami).
    /// Zwraca null, jeśli nie ma takiego produktu.
    /// </summary>
    Task<Product?> FindProductByBarCodeAsync(string barCode, CancellationToken ct = default);

    /// <summary>
    /// Dodaje nowy produkt do kontekstu.
    /// (SaveChangesAsync wywołujesz osobno, np. w handlerze lub serwisie aplikacyjnym).
    /// </summary>
    Task AddAsync(Product product, CancellationToken ct = default);

    /// <summary>
    /// Zapisuje zmiany w kontekście dla operacji na produktach.
    /// </summary>
    Task SaveChangesAsync(CancellationToken ct = default);
    Task<Product?> GetProductByIdAsync(Guid Id, CancellationToken ct = default);
    
    /// <summary>
    /// Pobiera produkt po ID z załadowanymi servingami i mikroskładnikami
    /// </summary>
    Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Product>> GetAllAsync(CancellationToken ct = default);
}
