using Fit.Infrastructure.Extensions;
using Fit.Infrastructure.Persistance;
using Fit.Application.Extensions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Cryptography;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
if (string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Key"]))
{
    if (!builder.Environment.IsDevelopment()) throw new InvalidOperationException("Set Jwt__Key to a random secret of at least 64 characters before production startup.");
    builder.Configuration["Jwt:Key"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
if (builder.Configuration["Jwt:Key"]!.Length < 64) throw new InvalidOperationException("Jwt__Key must contain at least 64 characters.");

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy => policy
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
    .AllowAnyMethod().AllowAnyHeader()));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

var app = builder.Build();
app.UseExceptionHandler(handler => handler.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    var status = exception switch
    {
        UnauthorizedAccessException => 401,
        KeyNotFoundException => 404,
        ArgumentException => 400,
        InvalidOperationException => 400,
        _ => 500
    };
    context.Response.StatusCode = status;
    await context.Response.WriteAsJsonAsync(new ProblemDetails
    {
        Status = status,
        Title = status == 500 ? "Wystąpił nieoczekiwany błąd serwera." : exception?.Message,
        Extensions = { ["traceId"] = context.TraceIdentifier }
    });
}));
if (!app.Environment.IsDevelopment()) { app.UseHsts(); app.UseHttpsRedirection(); }
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok", mode = "api" }));
app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FitDbContext>();
    await db.Database.EnsureCreatedAsync();
    await DatabaseUpdates.AddFriendshipsAsync(db);
    if (app.Environment.IsDevelopment()) await SeedData.InitializeAsync(db);
}
app.Run();
