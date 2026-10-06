using Fit.Domain.Entities;
namespace Fit.Domain.Entities
{
    public class MuscleGroup
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Chest, Back, Legs, etc.
        public string Description { get; set; } = string.Empty;

        // Relacje
        public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
    }
}