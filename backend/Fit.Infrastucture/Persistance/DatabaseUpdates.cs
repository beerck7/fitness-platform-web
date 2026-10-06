using Microsoft.EntityFrameworkCore;

namespace Fit.Infrastructure.Persistance;

public static class DatabaseUpdates
{
    // EnsureCreated nie dodaje tabel do istniejącej bazy SQLite.
    // Dodajemy tabelę bez usuwania zapisanych kont i treningów.
    public static async Task AddFriendshipsAsync(FitDbContext db)
    {
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "Friendships" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_Friendships" PRIMARY KEY AUTOINCREMENT,
                "RequesterId" TEXT NOT NULL REFERENCES "Users" ("Id") ON DELETE RESTRICT,
                "AddresseeId" TEXT NOT NULL REFERENCES "Users" ("Id") ON DELETE RESTRICT,
                "Status" INTEGER NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "AcceptedAt" TEXT NULL,
                CHECK ("RequesterId" <> "AddresseeId")
            );
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Friendships_Pair" ON "Friendships"
                (min("RequesterId", "AddresseeId"), max("RequesterId", "AddresseeId"));
            """);
    }
}
