import { dateISO, weekStart } from './date.js';

export function workoutSummary(workouts) {
  const completed = workouts.filter((item) => item.isCompleted);
  const weekly = completed.filter(
    (item) => item.date.slice(0, 10) >= weekStart() && item.date.slice(0, 10) <= dateISO(),
  );
  return {
    total: completed.length,
    weekly: weekly.length,
    minutes: weekly.reduce((sum, item) => sum + item.durationMinutes, 0),
    exerciseSets: weekly.reduce(
      (sum, item) => sum + item.exercises.reduce((total, exercise) => total + exercise.sets, 0),
      0,
    ),
  };
}

export function flattenDiary(diary) {
  return ['breakfast', 'lunch', 'dinner', 'snacks', 'other'].flatMap((key) => diary?.[key] ?? []);
}
export function percentage(value, target) {
  return target > 0 ? Math.max(0, Math.min(100, (value / target) * 100)) : 0;
}
