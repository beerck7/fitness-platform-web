// Only unchanged, built-in English demo text is migrated; user edits and IDs are preserved.
const legacy = {
  exercises: [
    {
      id: 1,
      name: 'Goblet squat',
      description: 'Build a strong foundation with a controlled squat.',
      equipmentRequired: 'Dumbbell',
      instructions: 'Keep your chest tall. Lower slowly and stand up with control.',
    },
    {
      id: 2,
      name: 'Dumbbell row',
      description: 'A single-arm pull for your upper back.',
      equipmentRequired: 'Dumbbell',
      instructions: 'Support your torso and pull your elbow toward your hip.',
    },
    {
      id: 3,
      name: 'Push-up',
      description: 'A bodyweight staple for the chest and arms.',
      equipmentRequired: 'Bodyweight',
      instructions: 'Keep your body in a straight line and lower slowly.',
    },
    {
      id: 4,
      name: 'Romanian deadlift',
      description: 'Practice your hip hinge and posterior strength.',
      equipmentRequired: 'Dumbbell',
      instructions: 'Keep a soft knee bend and hinge at the hips.',
    },
    {
      id: 5,
      name: 'Shoulder press',
      description: 'An overhead movement for shoulder strength.',
      equipmentRequired: 'Dumbbell',
      instructions: 'Brace your torso. Press without arching your back.',
    },
    {
      id: 6,
      name: 'Plank',
      description: 'A simple way to practice core stability.',
      equipmentRequired: 'Bodyweight',
      instructions: 'Keep your hips level and breathe steadily.',
    },
  ],
  products: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Greek yogurt',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Rolled oats',
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Chicken breast',
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Cooked brown rice',
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      name: 'Banana',
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      name: 'Avocado',
    },
  ],
  workouts: [
    {
      id: 1,
      name: 'Full body foundation',
    },
    {
      id: 2,
      name: 'Upper body strength',
    },
    {
      id: 3,
      name: 'Lower body & core',
    },
    {
      id: 4,
      name: 'Full body flow',
    },
    {
      id: 5,
      name: 'Upper body strength',
    },
    {
      id: 6,
      name: 'Lower body & core',
    },
  ],
};

export function migrateDemoLanguage(data, fresh) {
  for (const item of data.exercises ?? []) {
    const previous = legacy.exercises.find((entry) => entry.id === item.id);
    const current = fresh.exercises.find((entry) => entry.id === item.id);
    if (!previous || !current) continue;
    for (const field of ['name', 'description', 'equipmentRequired', 'instructions'])
      if (item[field] === previous[field]) item[field] = current[field];
  }
  for (const item of data.workouts) {
    const previous = legacy.workouts.find((entry) => entry.id === item.id);
    const current = fresh.workouts.find((entry) => entry.id === item.id);
    if (previous && current && item.name === previous.name) item.name = current.name;
    for (const exercise of item.exercises ?? []) {
      const before = legacy.exercises.find((entry) => entry.id === exercise.exerciseId);
      const after = data.exercises?.find((entry) => entry.id === exercise.exerciseId);
      if (before && after && exercise.exerciseName === before.name)
        exercise.exerciseName = after.name;
    }
  }
  for (const item of data.products ?? []) {
    const before = legacy.products.find((entry) => entry.id === item.id);
    const after = fresh.products.find((entry) => entry.id === item.id);
    if (before && after && item.name === before.name) item.name = after.name;
  }
  for (const item of data.entries ?? []) {
    const before = legacy.products.find((entry) => entry.id === item.productId);
    const after = data.products?.find((entry) => entry.id === item.productId);
    if (before && after && item.productName === before.name) item.productName = after.name;
  }
  return data;
}
