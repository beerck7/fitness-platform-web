using Fit.Domain.Entities;
using System.Collections.Generic;

public class TrainingPlan
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationWeeks { get; set; }
    public bool IsTemplate { get; set; } = false;
    public ICollection<Workout> Workouts { get; set; } = new List<Workout>(); //plan ma wiele treningow
}