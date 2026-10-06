using Fit.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fit.Application.Interfaces
{
    public interface IFitDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Exercise> Exercises { get; }
        DbSet<MuscleGroup> MuscleGroups { get; }
        DbSet<ExerciseSet> ExerciseSets { get; }
        DbSet<Workout> Workouts { get; }
        DbSet<WorkoutExercise> WorkoutExercises { get; }
        DbSet<Product> Products { get; }
        DbSet<ProductServing> ProductServings { get; }
        DbSet<MicronutrientDefinition> MicronutrientDefinitions { get; }
        DbSet<ProductMicronutrient> ProductMicronutrients { get; }

        DbSet<FoodDiaryEntry> FoodDiaryEntries { get; }
        DbSet<Meal> Meals   { get; }
        DbSet<MealIngredient> MealIngredients { get; }
        DbSet<UserGoal> UserGoals { get; }
        DbSet<UserWeightHistory> UserWeightHistories { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    }
}
