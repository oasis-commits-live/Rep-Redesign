import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSessionAnalytics, formatKineticTickerLabel, mapMuscleToZones } from './WorkoutAnalyticsEngine';
import type { WorkoutSession } from '../../data/store';
import type { Exercise } from '../../data/exercises';

const SAMPLE_CATALOG: Exercise[] = [
  {
    id: 'g1',
    name: 'Barbell Bench Press',
    category: 'gym',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    effort: 4,
  },
  {
    id: 'g5',
    name: 'Barbell Back Squat',
    category: 'gym',
    muscleGroups: ['Quads', 'Glutes', 'Hamstrings'],
    effort: 5,
  },
  {
    id: 'c1',
    name: 'Pull-Ups',
    category: 'calisthenics',
    muscleGroups: ['Back', 'Biceps'],
    effort: 4,
  },
];

const SAMPLE_SESSION: WorkoutSession = {
  id: 'sess-1',
  name: 'Upper Power',
  category: 'gym',
  startedAt: '2026-05-01T10:00:00.000Z',
  completedAt: '2026-05-01T10:45:00.000Z',
  exercises: [
    {
      exerciseId: 'g1',
      exerciseName: 'Barbell Bench Press',
      sets: [
        { setNumber: 1, reps: 8, weight: 185, completed: true },
        { setNumber: 2, reps: 8, weight: 185, completed: true },
        { setNumber: 3, reps: 6, weight: 205, completed: true },
        { setNumber: 4, reps: 6, weight: 205, completed: false },
      ],
    },
    {
      exerciseId: 'c1',
      exerciseName: 'Pull-Ups',
      sets: [
        { setNumber: 1, reps: 10, weight: 0, completed: true },
        { setNumber: 2, reps: 10, weight: 0, completed: true },
      ],
    },
  ],
};

test('mapMuscleToZones resolves primary anatomy groups cleanly', () => {
  assert.deepEqual(mapMuscleToZones('Chest'), ['chest']);
  assert.deepEqual(mapMuscleToZones('Quads'), ['quads']);
  assert.deepEqual(mapMuscleToZones('Lats'), ['back']);
  assert.deepEqual(mapMuscleToZones('Abdominals'), ['core']);
  assert.ok(mapMuscleToZones('Legs').includes('quads'));
});

test('computeSessionAnalytics calculates accurate duration, volume, completion, strain, and muscle heat', () => {
  const result = computeSessionAnalytics(SAMPLE_SESSION, SAMPLE_CATALOG);
  assert.equal(result.durationMinutes, 45);
  assert.equal(result.completedSets, 5);
  assert.equal(result.totalPlannedSets, 6);
  assert.equal(result.completionPct, 83);
  assert.equal(result.totalVolume, 8 * 185 * 2 + 6 * 205);
  assert.ok(result.strainScore > 5 && result.strainScore <= 21);
  assert.equal(result.peakExercise?.name, 'Barbell Bench Press');
  assert.equal(result.peakExercise?.bestSetLabel, '185lb × 8');
  assert.ok(result.zoneIntensity.chest === 1, 'Chest should be top-heated zone');
  assert.ok(result.zoneIntensity.back > 0, 'Back should be heated from Pull-Ups');
  assert.equal(result.zoneIntensity.calves, 0, 'Unworked calves should remain 0');
});

test('computeSessionAnalytics handles zero completed sets safely', () => {
  const emptySession: WorkoutSession = {
    ...SAMPLE_SESSION,
    exercises: [
      {
        exerciseId: 'g1',
        exerciseName: 'Barbell Bench Press',
        sets: [{ setNumber: 1, reps: 8, weight: 135, completed: false }],
      },
    ],
  };
  const result = computeSessionAnalytics(emptySession, SAMPLE_CATALOG);
  assert.equal(result.completedSets, 0);
  assert.equal(result.strainScore, 0);
  assert.equal(result.completionPct, 0);
  assert.equal(result.peakExercise, null);
});

test('formatKineticTickerLabel maps equipment prefixes and common movements to crisp athletic labels', () => {
  assert.equal(formatKineticTickerLabel('Barbell Bench Press'), 'BENCH');
  assert.equal(formatKineticTickerLabel('Barbell Bent Over Row'), 'ROW');
  assert.equal(formatKineticTickerLabel('Dumbbell Overhead Press'), 'OHP');
  assert.equal(formatKineticTickerLabel('Lateral Raise'), 'DELT');
  assert.equal(formatKineticTickerLabel('Pull-Ups'), 'PULL');
});

