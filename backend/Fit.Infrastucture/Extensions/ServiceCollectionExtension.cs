using Fit.Application.Interfaces;
using Fit.Domain.Interfaces;
using Fit.Infrastructure.Persistance;
using Fit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Fit.Infrastructure.Extensions;

public static class ServiceCollectionExtension
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var databasePath = configuration["Database:Path"] ?? Path.Combine(AppContext.BaseDirectory, "data", "fitness.db");
        Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(databasePath))!);
        var connection = new Microsoft.Data.Sqlite.SqliteConnectionStringBuilder { DataSource = databasePath }.ToString();
        services.AddDbContext<FitDbContext>(options => options.UseSqlite(connection));
        services.AddScoped<IFitDbContext, FitDbContext>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IWorkoutRepository, WorkoutRepository>();
        services.AddScoped<IExcerciseRepository, ExcerciseRepository>();
        services.AddScoped<IExerciseSetRepository, ExerciseSetRepository>();
        services.AddScoped<IMuscleGroupRepository, MuscleGroupRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IMicronutrientDefinitionRepository, MicronutrientDefinitionRepository>();
        services.AddScoped<IUserGoalRepository, UserGoalRepository>();
        services.AddScoped<IUserWeightRepository, UserWeightRepository>();
        return services;
    }
}
