using Fit.Domain.Entities;
using Fit.Domain.Enums.Constant;
using Fit.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;

public static class SeedData
{
    public static async Task InitializeAsync(FitDbContext db)
    {
        var exercises = new[]
        {
            (OldName: "Goblet squat", OldDescription: "A controlled squat with a dumbbell held at chest level.", OldEquipment: "Dumbbell", OldInstructions: "Keep your chest tall. Lower slowly, then stand up.", Value: Exercise("Przysiad z hantlem", "Kontrolowany przysiad z hantlem trzymanym przy klatce piersiowej.", "Hantel", 3, "Trzymaj klatkę piersiową wysoko. Powoli opuść się, a następnie wstań.")),
            (OldName: "Dumbbell row", OldDescription: "A single-arm pull for the upper back.", OldEquipment: "Dumbbell", OldInstructions: "Support your torso and pull your elbow toward your hip.", Value: Exercise("Wiosłowanie hantlem", "Ćwiczenie górnej części pleców wykonywane jedną ręką.", "Hantel", 2, "Podeprzyj tułów i przyciągnij łokieć w stronę biodra.")),
            (OldName: "Push-up", OldDescription: "A bodyweight press for chest and arms.", OldEquipment: "Bodyweight", OldInstructions: "Keep your body in a straight line and lower with control.", Value: Exercise("Pompki", "Ćwiczenie klatki piersiowej i ramion z masą własnego ciała.", "Masa własnego ciała", 1, "Utrzymuj ciało w jednej linii i opuszczaj się z kontrolą.")),
            (OldName: "Romanian deadlift", OldDescription: "A hip-hinge movement for the posterior chain.", OldEquipment: "Dumbbell", OldInstructions: "Keep a soft bend in your knees and hinge at the hips.", Value: Exercise("Rumuński martwy ciąg", "Ćwiczenie tylnej części ciała z ruchem w biodrach.", "Hantel", 3, "Lekko ugnij kolana i pochyl tułów, zginając się w biodrach.")),
            (OldName: "Shoulder press", OldDescription: "An overhead press with dumbbells.", OldEquipment: "Dumbbell", OldInstructions: "Brace your torso and press without arching your back.", Value: Exercise("Wyciskanie nad głowę", "Wyciskanie hantli nad głowę.", "Hantel", 4, "Napnij tułów i wyciskaj bez wyginania pleców.")),
            (OldName: "Plank", OldDescription: "A static core stability movement.", OldEquipment: "Bodyweight", OldInstructions: "Keep your hips level and breathe steadily.", Value: Exercise("Deska", "Statyczne ćwiczenie stabilizacji mięśni tułowia.", "Masa własnego ciała", 7, "Utrzymuj biodra na jednej wysokości i oddychaj spokojnie."))
        };
        var products = new[]
        {
            (OldName: "Greek yogurt", Value: Product("Jogurt grecki", "Nabiał", 73, 10, 3.9m, 2)),
            (OldName: "Rolled oats", Value: Product("Płatki owsiane", "Produkty zbożowe", 389, 16.9m, 66.3m, 6.9m)),
            (OldName: "Chicken breast", Value: Product("Pierś z kurczaka", "Białko", 165, 31, 0, 3.6m)),
            (OldName: "Cooked brown rice", Value: Product("Ryż brązowy gotowany", "Produkty zbożowe", 123, 2.7m, 25.6m, 1)),
            (OldName: "Banana", Value: Product("Banan", "Owoce", 89, 1.1m, 22.8m, 0.3m)),
            (OldName: "Avocado", Value: Product("Awokado", "Owoce", 160, 2, 8.5m, 14.7m))
        };
        if (!await db.Exercises.AnyAsync()) db.Exercises.AddRange(exercises.Select(item => item.Value));
        else
        {
            var names = exercises.Select(item => item.OldName).ToArray();
            foreach (var existing in await db.Exercises.Where(item => names.Contains(item.Name)).ToListAsync())
            {
                var sample = exercises.FirstOrDefault(item => item.OldName == existing.Name
                    && item.OldDescription == existing.Description && item.OldEquipment == existing.EquipmentRequired
                    && item.OldInstructions == existing.Instructions);
                if (sample.Value is null) continue;
                existing.Name = sample.Value.Name;
                existing.Description = sample.Value.Description;
                existing.EquipmentRequired = sample.Value.EquipmentRequired;
                existing.Instructions = sample.Value.Instructions;
            }
        }
        if (!await db.Products.AnyAsync()) db.Products.AddRange(products.Select(item => item.Value));
        else
        {
            var names = products.Select(item => item.OldName).ToArray();
            foreach (var existing in await db.Products.Where(item => names.Contains(item.Name)).ToListAsync())
            {
                var sample = products.FirstOrDefault(item => item.OldName == existing.Name && item.Value.Kcal == existing.Kcal);
                if (sample.Value is null) continue;
                existing.Name = sample.Value.Name;
                existing.Category = sample.Value.Category;
            }
        }
        // Existing IDs and all workout/diary references remain intact.
        await db.SaveChangesAsync();
    }

    private static Exercise Exercise(string name, string description, string equipment, int muscle, string instructions) => new()
    { Name = name, Description = description, EquipmentRequired = equipment, MuscleGroupId = muscle, Instructions = instructions, DifficultyLevel = (DifficultyLevel)0 };

    private static Product Product(string name, string category, decimal kcal, decimal protein, decimal carbs, decimal fat) => new()
    { Id = Guid.NewGuid(), Name = name, Category = category, IsPublic = true, BaseAmount = 100, Kcal = kcal, Protein = protein, Carbs = carbs, Fat = fat };
}
