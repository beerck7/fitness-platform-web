using Fit.Domain.Entities;
using Fit.Domain.Enums;
using System.Collections.Generic;

public class UserGoal
{
   
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }

        // Aktualne parametry
        public decimal CurrentWeightKg { get; set; }      // np. 73.40
        public int HeightCm { get; set; }                 // np. 178

        // Cel
        public GoalType GoalType { get; set; }
        public decimal? TargetWeightKg { get; set; }      // null jeśli Maintain
        public DateTime? TargetDate { get; set; }         // opcjonalnie

        // Trening
        public int TrainingsPerWeekTarget { get; set; }   // np. 4
        public int? CardioSessionsPerWeekTarget { get; set; } // opcjonalnie

        // Dieta (dzienne cele)
        public int TargetCalories { get; set; }           // kcal/dzień
        public int ProteinGrams { get; set; }             // g/dzień
        public int FatGrams { get; set; }                 // g/dzień
        public int CarbsGrams { get; set; }               // g/dzień

        // Dodatkowe sensowne cele
        public ActivityLevel ActivityLevel { get; set; }  // pomocne do TDEE
        public int StepsPerDayTarget { get; set; }        // np. 8000
        public string? Notes { get; set; }                // np. “bez laktozy”

        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
        public User User { get; set; } = null!;
 
}