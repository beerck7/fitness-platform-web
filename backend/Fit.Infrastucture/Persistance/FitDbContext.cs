using Fit.Domain.Entities;
using Fit.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Fit.Infrastructure.Persistance;

public class FitDbContext : DbContext, IFitDbContext
{
    public FitDbContext(DbContextOptions<FitDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Exercise> Exercises => Set<Exercise>();

    public DbSet<MuscleGroup> MuscleGroups => Set<MuscleGroup>();
    public DbSet<ExerciseSet> ExerciseSets => Set<ExerciseSet>();
    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductServing> ProductServings => Set<ProductServing>();

    public DbSet<UserGoal> UserGoals => Set<UserGoal>();
    public DbSet<UserWeightHistory> UserWeightHistories => Set<UserWeightHistory>();


    public DbSet<MicronutrientDefinition> MicronutrientDefinitions => Set<MicronutrientDefinition>();
    public DbSet<ProductMicronutrient> ProductMicronutrients => Set<ProductMicronutrient>();

    // Dania i dziennik spożycia
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MealIngredient> MealIngredients => Set<MealIngredient>();
    public DbSet<FoodDiaryEntry> FoodDiaryEntries => Set<FoodDiaryEntry>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => base.SaveChangesAsync(cancellationToken);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();
        modelBuilder.Entity<Friendship>().HasOne(item => item.Requester).WithMany()
            .HasForeignKey(item => item.RequesterId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Friendship>().HasOne(item => item.Addressee).WithMany()
            .HasForeignKey(item => item.AddresseeId).OnDelete(DeleteBehavior.Restrict);

        // Początkowe grupy mięśniowe i definicje mikroskładników.
        modelBuilder.Entity<MuscleGroup>().HasData(
            new MuscleGroup { Id = 1, Name = "Klatka piersiowa", Description = "Chest" },
            new MuscleGroup { Id = 2, Name = "Plecy", Description = "Back" },
            new MuscleGroup { Id = 3, Name = "Nogi", Description = "Legs" },
            new MuscleGroup { Id = 4, Name = "Barki", Description = "Shoulders" },
            new MuscleGroup { Id = 5, Name = "Biceps", Description = "Arms" },
            new MuscleGroup { Id = 6, Name = "Triceps", Description = "Arms" },
            new MuscleGroup { Id = 7, Name = "Brzuch", Description = "Core" },
            new MuscleGroup { Id = 8, Name = "Cardio", Description = "Cardio" }
        );
        modelBuilder.Entity<MicronutrientDefinition>().HasData(
            new MicronutrientDefinition { Id = 2, Key = "vitamin_a", Name = "Vitamin A", Unit = "µg", ExternalKey = "vitamin-a_100g" },
            new MicronutrientDefinition { Id = 1, Key = "vitamin_c", Name = "Vitamin C", Unit = "mg", ExternalKey = "vitamin-c_100g" },
            new MicronutrientDefinition { Id = 3, Key = "vitamin_d", Name = "Vitamin D", Unit = "µg", ExternalKey = "vitamin-d_100g" },
            new MicronutrientDefinition { Id = 4, Key = "vitamin_e", Name = "Vitamin E", Unit = "mg", ExternalKey = "vitamin-e_100g" },
            new MicronutrientDefinition { Id = 5, Key = "vitamin_k", Name = "Vitamin K", Unit = "µg", ExternalKey = "vitamin-k_100g" },
            new MicronutrientDefinition { Id = 6, Key = "vitamin_b1", Name = "Vitamin B1 (Thiamin)", Unit = "mg", ExternalKey = "vitamin-b1_100g" },
            new MicronutrientDefinition { Id = 7, Key = "vitamin_b2", Name = "Vitamin B2 (Riboflavin)", Unit = "mg", ExternalKey = "vitamin-b2_100g" },
            new MicronutrientDefinition { Id = 8, Key = "vitamin_pp", Name = "Vitamin B3 (Niacin, PP)", Unit = "mg", ExternalKey = "vitamin-pp_100g" },
            new MicronutrientDefinition { Id = 9, Key = "vitamin_b5", Name = "Vitamin B5 (Pantothenic)", Unit = "mg", ExternalKey = "vitamin-b5_100g" },
            new MicronutrientDefinition { Id = 10, Key = "vitamin_b6", Name = "Vitamin B6", Unit = "mg", ExternalKey = "vitamin-b6_100g" },
            new MicronutrientDefinition { Id = 11, Key = "vitamin_b9", Name = "Vitamin B9 (Folate)", Unit = "µg", ExternalKey = "vitamin-b9_100g" },
            new MicronutrientDefinition { Id = 12, Key = "vitamin_b12", Name = "Vitamin B12", Unit = "µg", ExternalKey = "vitamin-b12_100g" },
            new MicronutrientDefinition { Id = 13, Key = "calcium", Name = "Calcium", Unit = "mg", ExternalKey = "calcium_100g" },
            new MicronutrientDefinition { Id = 14, Key = "iron", Name = "Iron", Unit = "mg", ExternalKey = "iron_100g" },
            new MicronutrientDefinition { Id = 15, Key = "magnesium", Name = "Magnesium", Unit = "mg", ExternalKey = "magnesium_100g" },
            new MicronutrientDefinition { Id = 16, Key = "phosphorus", Name = "Phosphorus", Unit = "mg", ExternalKey = "phosphorus_100g" },
            new MicronutrientDefinition { Id = 17, Key = "potassium", Name = "Potassium", Unit = "mg", ExternalKey = "potassium_100g" },
            new MicronutrientDefinition { Id = 18, Key = "sodium", Name = "Sodium", Unit = "mg", ExternalKey = "sodium_100g" },
            new MicronutrientDefinition { Id = 19, Key = "zinc", Name = "Zinc", Unit = "mg", ExternalKey = "zinc_100g" },
            new MicronutrientDefinition { Id = 20, Key = "copper", Name = "Copper", Unit = "mg", ExternalKey = "copper_100g" },
            new MicronutrientDefinition { Id = 21, Key = "manganese", Name = "Manganese", Unit = "mg", ExternalKey = "manganese_100g" },
            new MicronutrientDefinition { Id = 22, Key = "selenium", Name = "Selenium", Unit = "µg", ExternalKey = "selenium_100g" },
            new MicronutrientDefinition { Id = 23, Key = "iodine", Name = "Iodine", Unit = "µg", ExternalKey = "iodine_100g" },
            new MicronutrientDefinition { Id = 24, Key = "fluoride", Name = "Fluoride", Unit = "mg", ExternalKey = "fluoride_100g" },
            new MicronutrientDefinition { Id = 25, Key = "chromium", Name = "Chromium", Unit = "µg", ExternalKey = "chromium_100g" },
            new MicronutrientDefinition { Id = 26, Key = "molybdenum", Name = "Molybdenum", Unit = "µg", ExternalKey = "molybdenum_100g" }
);


        // Relacje dania.
        modelBuilder.Entity<Meal>()
            .HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Meal>()
            .HasMany(m => m.Ingredients)
            .WithOne(i => i.Meal)
            .HasForeignKey(i => i.MealId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relacje składnika dania.
        modelBuilder.Entity<MealIngredient>()
            .HasOne(i => i.Product)
            .WithMany()
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relacje wpisu w dzienniku.
        modelBuilder.Entity<FoodDiaryEntry>()
            .HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FoodDiaryEntry>()
            .HasOne(e => e.Product)
            .WithMany()
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FoodDiaryEntry>()
            .HasOne(e => e.Meal)
            .WithMany()
            .HasForeignKey(e => e.MealId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index dla szybkiego wyszukiwania wpisów użytkownika po dacie
        modelBuilder.Entity<FoodDiaryEntry>()
            .HasIndex(e => new { e.UserId, e.Date });
    }
}
