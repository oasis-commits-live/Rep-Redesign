import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_PRESETS,
  estimateRoutineMinutes,
  moveListItem,
  buildTemplateFromPreset,
  calculateTrainingStreak,
} from './workoutPresets';
import type { WorkoutSession } from './store';

test('estimateRoutineMinutes computes realistic workout duration', () => {
  assert.equal(estimateRoutineMinutes([]), 0);
  const mins = estimateRoutineMinutes(STARTER_PRESETS[0].exercises);
  assert.ok(mins >= 20 && mins <= 60, `Expected 20-60 mins, got ${mins}`);
});

test('moveListItem reorders elements safely and ignores out-of-bounds moves', () => {
  const arr = ['A', 'B', 'C'];
  assert.deepEqual(moveListItem(arr, 1, -1), ['B', 'A', 'C']);
  assert.deepEqual(moveListItem(arr, 1, 1), ['A', 'C', 'B']);
  assert.deepEqual(moveListItem(arr, 0, -1), ['A', 'B', 'C']);
  assert.deepEqual(moveListItem(arr, 2, 1), ['A', 'B', 'C']);
});

test('buildTemplateFromPreset clones preset cleanly with a unique id', () => {
  const tpl = buildTemplateFromPreset('preset-push');
  assert.ok(tpl);
  assert.equal(tpl.name, 'Upper Push Power');
  assert.equal(tpl.exercises.length, 5);
  assert.equal(buildTemplateFromPreset('does-not-exist'), null);
});

test('calculateTrainingStreak counts consecutive days including yesterday grace window', () => {
  const now = new Date(2026, 10, 22, 12, 0, 0);
  const mkSession = (dayOffset: number): WorkoutSession => {
    const d = new Date(2026, 10, 22 - dayOffset, 9, 0, 0).toISOString();
    return {
      id: `s-${dayOffset}`,
      name: 'Test',
      category: 'gym',
      startedAt: d,
      completedAt: d,
      exercises: [],
    };
  };

  assert.equal(calculateTrainingStreak([], now), 0);
  assert.equal(calculateTrainingStreak([mkSession(0), mkSession(1), mkSession(2)], now), 3);
  assert.equal(calculateTrainingStreak([mkSession(1), mkSession(2)], now), 2);
  assert.equal(calculateTrainingStreak([mkSession(3)], now), 0);
});
