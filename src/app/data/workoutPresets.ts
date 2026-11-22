import type { Category } from './exercises';
import type { WorkoutExercise, WorkoutSession, WorkoutTemplate } from './store';

export interface StarterPreset {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  exercises: WorkoutExercise[];
}

export type WorkoutPreset = StarterPreset;

export const STARTER_PRESETS: StarterPreset[] = [
  {
    id: 'preset-push',
    name: 'Upper Push Power',
    subtitle: 'Chest, shoulders & triceps',
    category: 'gym',
    exercises: [
      { exerciseId: 'gym-1', exerciseName: 'Barbell Bench Press', sets: 4, targetReps: 8, weight: 135, restSeconds: 90 },
      { exerciseId: 'gym-2', exerciseName: 'Incline Dumbbell Press', sets: 3, targetReps: 10, weight: 50, restSeconds: 75 },
      { exerciseId: 'gym-21', exerciseName: 'Overhead Press', sets: 3, targetReps: 8, weight: 85, restSeconds: 90 },
      { exerciseId: 'gym-22', exerciseName: 'Lateral Raise', sets: 3, targetReps: 15, weight: 20, restSeconds: 45 },
      { exerciseId: 'gym-32', exerciseName: 'Tricep Pushdown', sets: 3, targetReps: 12, weight: 45, restSeconds: 60 },
    ],
  },
  {
    id: 'preset-pull',
    name: 'Back & Biceps Pull',
    subtitle: 'Lats, rear delts & arms',
    category: 'gym',
    exercises: [
      { exerciseId: 'gym-11', exerciseName: 'Barbell Row', sets: 4, targetReps: 8, weight: 135, restSeconds: 90 },
      { exerciseId: 'gym-12', exerciseName: 'Lat Pulldown', sets: 3, targetReps: 10, weight: 110, restSeconds: 75 },
      { exerciseId: 'gym-13', exerciseName: 'Seated Cable Row', sets: 3, targetReps: 12, weight: 100, restSeconds: 60 },
      { exerciseId: 'gym-23', exerciseName: 'Face Pull', sets: 3, targetReps: 15, weight: 35, restSeconds: 45 },
      { exerciseId: 'gym-31', exerciseName: 'Dumbbell Curl', sets: 3, targetReps: 12, weight: 30, restSeconds: 60 },
    ],
  },
  {
    id: 'preset-legs',
    name: 'Lower Body Strength',
    subtitle: 'Quads, glutes & hamstrings',
    category: 'gym',
    exercises: [
      { exerciseId: 'gym-41', exerciseName: 'Barbell Squat', sets: 4, targetReps: 6, weight: 185, restSeconds: 120 },
      { exerciseId: 'gym-43', exerciseName: 'Romanian Deadlift', sets: 3, targetReps: 10, weight: 155, restSeconds: 90 },
      { exerciseId: 'gym-46', exerciseName: 'Bulgarian Split Squat', sets: 3, targetReps: 10, weight: 40, restSeconds: 75 },
      { exerciseId: 'gym-47', exerciseName: 'Leg Extension', sets: 3, targetReps: 12, weight: 90, restSeconds: 60 },
      { exerciseId: 'gym-44', exerciseName: 'Calf Raise', sets: 4, targetReps: 15, weight: 45, restSeconds: 45 },
    ],
  },
  {
    id: 'preset-cali',
    name: 'Bodyweight Core & Control',
    subtitle: 'No equipment needed',
    category: 'calisthenics',
    exercises: [
      { exerciseId: 'cali-1', exerciseName: 'Pull-Up', sets: 4, targetReps: 8, restSeconds: 90 },
      { exerciseId: 'cali-2', exerciseName: 'Push-Up', sets: 4, targetReps: 15, restSeconds: 60 },
      { exerciseId: 'cali-3', exerciseName: 'Dip', sets: 3, targetReps: 10, restSeconds: 75 },
      { exerciseId: 'cali-8', exerciseName: 'Plank Hold', sets: 3, targetReps: 45, restSeconds: 45, isTimeBased: true },
    ],
  },
];

export function estimateRoutineMinutes(exercises: WorkoutExercise[]): number {
  if (!exercises.length) return 0;
  const raw = exercises.reduce((total, ex) => {
    const setWorkMins = ex.isTimeBased
      ? (ex.sets * Math.max(15, ex.targetReps)) / 60
      : ex.sets * 1.1;
    const restMins = ((ex.restSeconds || 60) * Math.max(0, ex.sets - 1)) / 60;
    return total + setWorkMins + restMins + 0.75;
  }, 0);
  return Math.max(5, Math.round(raw));
}

export function moveListItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(index, 1);
  copy.splice(target, 0, moved);
  return copy;
}

export function buildTemplateFromPreset(presetId: string): WorkoutTemplate | null {
  const preset = STARTER_PRESETS.find(p => p.id === presetId);
  if (!preset) return null;
  const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id: uid,
    name: preset.name,
    category: preset.category,
    exercises: preset.exercises.map(ex => ({ ...ex })),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Computes current active training streak in days (today or yesterday counts as live).
 */
export function calculateTrainingStreak(sessions: WorkoutSession[], nowDate = new Date()): number {
  const dayKeys = new Set<string>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const d = new Date(s.completedAt);
    if (Number.isNaN(d.getTime())) continue;
    dayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  if (dayKeys.size === 0) return 0;

  const cursor = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!dayKeys.has(yesterdayKey)) return 0;
  }

  let streak = 0;
  while (dayKeys.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
