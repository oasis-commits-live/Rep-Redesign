import { useState, useEffect, useCallback } from 'react';
import type { Category } from './exercises';
import type { Exercise } from './exercises';
import { enqueueSync } from './sync';

// ── Types ──

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  targetReps: number;
  weight?: number;
  restSeconds: number;
  isTimeBased?: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: Category;
  exercises: WorkoutExercise[];
  createdAt: string;
}

export interface SetRecord {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
  duration?: number;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SetRecord[];
  isTimeBased?: boolean;
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  category: Category;
  startedAt: string;
  completedAt?: string;
  exercises: SessionExercise[];
}

export interface UserPreferences {
  onboardingComplete: boolean;
  preferredStyle: Category | null;
  displayName: string;
  // Onboarding profile data
  workoutFrequency?: string;   // e.g. '1-2', '3-4', '5-6', '7'
  heightCm?: number;
  weightKg?: number;
  goal?: string;               // e.g. 'strength', 'muscle', 'endurance', 'flexibility', 'wellness'
}

// ── Storage helpers ──

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Keys ──
const TEMPLATES_KEY = 'forma_templates';
const SESSIONS_KEY = 'forma_sessions';
const PREFS_KEY = 'forma_prefs';
const ACTIVE_SESSION_KEY = 'forma_active_session';
const CUSTOM_EXERCISES_KEY = 'forma_custom_exercises';
const TEMPLATE_USAGE_KEY = 'forma_template_usage';
const SAVED_TEMPLATES_KEY = 'forma_saved_templates';

// ── UUID ──
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Hooks ──

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<Exercise[]>(() =>
    loadJSON<Exercise[]>(CUSTOM_EXERCISES_KEY, [])
  );

  const saveCustomExercise = useCallback((exercise: Exercise) => {
    setCustomExercises(prev => {
      const exists = prev.findIndex(e => e.id === exercise.id);
      let next: Exercise[];
      if (exists >= 0) {
        next = [...prev];
        next[exists] = exercise;
      } else {
        next = [...prev, exercise];
      }
      saveJSON(CUSTOM_EXERCISES_KEY, next);
      enqueueSync({ id: exercise.id, type: 'custom_exercise', action: 'save', data: exercise });
      return next;
    });
  }, []);

  const deleteCustomExercise = useCallback((id: string) => {
    setCustomExercises(prev => {
      const next = prev.filter(e => e.id !== id);
      saveJSON(CUSTOM_EXERCISES_KEY, next);
      enqueueSync({ id, type: 'custom_exercise', action: 'delete', data: null });
      return next;
    });
  }, []);

  return { customExercises, saveCustomExercise, deleteCustomExercise };
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    loadJSON<UserPreferences>(PREFS_KEY, {
      onboardingComplete: false,
      preferredStyle: null,
      displayName: 'Athlete',
    })
  );

  const updatePrefs = useCallback((updates: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...updates };
      saveJSON(PREFS_KEY, next);
      // Background sync to server
      enqueueSync({ id: 'prefs', type: 'preferences', action: 'save', data: next });
      return next;
    });
  }, []);

  return { prefs, updatePrefs };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() =>
    loadJSON<WorkoutTemplate[]>(TEMPLATES_KEY, [])
  );

  const saveTemplate = useCallback((template: WorkoutTemplate) => {
    setTemplates(prev => {
      const exists = prev.findIndex(t => t.id === template.id);
      let next: WorkoutTemplate[];
      if (exists >= 0) {
        next = [...prev];
        next[exists] = template;
      } else {
        next = [...prev, template];
      }
      saveJSON(TEMPLATES_KEY, next);
      // Background sync to server
      enqueueSync({ id: template.id, type: 'template', action: 'save', data: template });
      return next;
    });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const next = prev.filter(t => t.id !== id);
      saveJSON(TEMPLATES_KEY, next);
      // Background sync to server
      enqueueSync({ id, type: 'template', action: 'delete', data: null });
      return next;
    });
  }, []);

  return { templates, saveTemplate, deleteTemplate };
}

export function useSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    loadJSON<WorkoutSession[]>(SESSIONS_KEY, [])
  );

  const saveSession = useCallback((session: WorkoutSession) => {
    setSessions(prev => {
      const exists = prev.findIndex(s => s.id === session.id);
      let next: WorkoutSession[];
      if (exists >= 0) {
        next = [...prev];
        next[exists] = session;
      } else {
        next = [...prev, session];
      }
      saveJSON(SESSIONS_KEY, next);
      // Background sync to server
      enqueueSync({ id: session.id, type: 'session', action: 'save', data: session });
      return next;
    });
  }, []);

  return { sessions, saveSession };
}

export function useActiveSession() {
  const [session, setSession] = useState<WorkoutSession | null>(() =>
    loadJSON<WorkoutSession | null>(ACTIVE_SESSION_KEY, null)
  );

  const updateSession = useCallback((s: WorkoutSession | null) => {
    setSession(s);
    if (s) {
      saveJSON(ACTIVE_SESSION_KEY, s);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, []);

  return { session, updateSession };
}

// ── Static getters (still read from localStorage for speed) ──

export function getTemplates(): WorkoutTemplate[] {
  return loadJSON<WorkoutTemplate[]>(TEMPLATES_KEY, []);
}

export function getSessions(): WorkoutSession[] {
  return loadJSON<WorkoutSession[]>(SESSIONS_KEY, []);
}

export function getPreferences(): UserPreferences {
  return loadJSON<UserPreferences>(PREFS_KEY, {
    onboardingComplete: false,
    preferredStyle: null,
    displayName: 'Athlete',
  });
}

export function getCustomExercises(): Exercise[] {
  return loadJSON<Exercise[]>(CUSTOM_EXERCISES_KEY, []);
}

// ── Static setters (used by components that don't use hooks) ──

export function saveSessionStatic(session: WorkoutSession): void {
  const sessions = getSessions();
  const exists = sessions.findIndex(s => s.id === session.id);
  if (exists >= 0) {
    sessions[exists] = session;
  } else {
    sessions.push(session);
  }
  saveJSON(SESSIONS_KEY, sessions);
  // Background sync to server
  enqueueSync({ id: session.id, type: 'session', action: 'save', data: session });
}

export function savePreferencesStatic(prefs: UserPreferences): void {
  saveJSON(PREFS_KEY, prefs);
  // Background sync to server
  enqueueSync({ id: 'prefs', type: 'preferences', action: 'save', data: prefs });
}

export function saveTemplateStatic(template: WorkoutTemplate): void {
  const templates = getTemplates();
  const exists = templates.findIndex(t => t.id === template.id);
  if (exists >= 0) {
    templates[exists] = template;
  } else {
    templates.push(template);
  }
  saveJSON(TEMPLATES_KEY, templates);
  // Background sync to server
  enqueueSync({ id: template.id, type: 'template', action: 'save', data: template });
}

export function deleteTemplateStatic(id: string): void {
  const templates = getTemplates().filter(t => t.id !== id);
  saveJSON(TEMPLATES_KEY, templates);
  enqueueSync({ id, type: 'template', action: 'delete', data: null });
}

export function saveCustomExerciseStatic(exercise: Exercise): void {
  const list = getCustomExercises();
  const exists = list.findIndex(e => e.id === exercise.id);
  if (exists >= 0) {
    list[exists] = exercise;
  } else {
    list.push(exercise);
  }
  saveJSON(CUSTOM_EXERCISES_KEY, list);
  enqueueSync({ id: exercise.id, type: 'custom_exercise', action: 'save', data: exercise });
}

export function deleteCustomExerciseStatic(id: string): void {
  const list = getCustomExercises().filter(e => e.id !== id);
  saveJSON(CUSTOM_EXERCISES_KEY, list);
  enqueueSync({ id, type: 'custom_exercise', action: 'delete', data: null });
}

export function clearActiveSession(): void {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
}

/**
 * Clear ALL user-specific localStorage keys.
 * Called on sign-out so the next user starts with a clean slate
 * and doesn't inherit the previous user's data during fullSync.
 */
export function clearUserData(): void {
  localStorage.removeItem(TEMPLATES_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(PREFS_KEY);
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  localStorage.removeItem(CUSTOM_EXERCISES_KEY);
  localStorage.removeItem('forma_sync_queue');
  localStorage.removeItem('forma_last_sync');
  localStorage.removeItem('forma_avatar_url');
  localStorage.removeItem('forma_appearance');
  localStorage.removeItem(TEMPLATE_USAGE_KEY);
  localStorage.removeItem(SAVED_TEMPLATES_KEY);
  console.log('[store] Cleared all user-specific localStorage keys');
}

export function getSessionsForExercise(
  exerciseId: string
): { date: string; maxReps: number; maxWeight: number; totalVolume: number; totalReps: number }[] {
  const sessions = getSessions().filter(s => s.completedAt);
  const results: {
    date: string;
    maxReps: number;
    maxWeight: number;
    totalVolume: number;
    totalReps: number;
  }[] = [];

  sessions.forEach(s => {
    s.exercises.forEach(ex => {
      if (ex.exerciseId === exerciseId) {
        let maxReps = 0;
        let maxWeight = 0;
        let totalVolume = 0;
        let totalReps = 0;
        ex.sets
          .filter(set => set.completed)
          .forEach(set => {
            maxReps = Math.max(maxReps, set.reps);
            maxWeight = Math.max(maxWeight, set.weight || 0);
            totalVolume += set.reps * (set.weight || 0);
            totalReps += set.reps;
          });
        results.push({
          date: s.completedAt!,
          maxReps,
          maxWeight,
          totalVolume,
          totalReps,
        });
      }
    });
  });

  return results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ── Template Usage Tracking ──

export interface TemplateUsageRecord {
  templateId: string;
  usageCount: number;
  lastUsedAt: string;
}

export function getTemplateUsage(): Record<string, TemplateUsageRecord> {
  return loadJSON<Record<string, TemplateUsageRecord>>(TEMPLATE_USAGE_KEY, {});
}

export function incrementTemplateUsage(templateId: string): void {
  const usage = getTemplateUsage();
  const existing = usage[templateId];
  usage[templateId] = {
    templateId,
    usageCount: (existing?.usageCount || 0) + 1,
    lastUsedAt: new Date().toISOString(),
  };
  saveJSON(TEMPLATE_USAGE_KEY, usage);
}

export function getTopTemplates(n = 3): { template: WorkoutTemplate; usageCount: number }[] {
  const usage = getTemplateUsage();
  const templates = getTemplates();

  return Object.values(usage)
    .filter(u => u.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, n)
    .map(u => {
      const template = templates.find(t => t.id === u.templateId);
      return template ? { template, usageCount: u.usageCount } : null;
    })
    .filter(Boolean) as { template: WorkoutTemplate; usageCount: number }[];
}