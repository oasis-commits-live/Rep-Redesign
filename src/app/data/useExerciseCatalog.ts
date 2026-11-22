import { useState, useEffect, useCallback, useRef } from 'react';
import type { Exercise } from './exercises';
import { ENRICHED_EXERCISES, CATALOG_VERSION } from './webExerciseCatalog';
import {
  fetchExerciseCatalog,
  seedExerciseCatalog,
  saveExerciseToCatalog,
  deleteExerciseFromCatalog,
} from './api';

const CATALOG_CACHE_KEY = 'forma_exercise_catalog_v2';

function getCachedCatalog(): Exercise[] | null {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed?.version >= CATALOG_VERSION &&
      Array.isArray(parsed.exercises) &&
      parsed.exercises.length >= ENRICHED_EXERCISES.length
    ) {
      return parsed.exercises as Exercise[];
    }
    return null;
  } catch {
    return null;
  }
}

function setCachedCatalog(catalog: Exercise[]): void {
  try {
    localStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({ version: CATALOG_VERSION, exercises: catalog }),
    );
  } catch {
    // Ignore storage quota errors
  }
}

let _catalog: Exercise[] | null = null;
let _loadPromise: Promise<void> | null = null;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach(fn => fn());
}

function mergeWithEnriched(remote: Exercise[]): Exercise[] {
  const byId = new Map<string, Exercise>();
  for (const base of ENRICHED_EXERCISES) {
    byId.set(base.id, base);
  }
  for (const item of remote) {
    const base = byId.get(item.id);
    if (base) {
      byId.set(item.id, {
        ...base,
        ...item,
        demoFrames: item.demoFrames?.length ? item.demoFrames : base.demoFrames,
        instructions: item.instructions?.length ? item.instructions : base.instructions,
        equipment: item.equipment || base.equipment,
        difficulty: item.difficulty || base.difficulty,
        mechanic: item.mechanic || base.mechanic,
      });
    } else {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

async function loadCatalog(): Promise<void> {
  try {
    const { exercises: serverExercises } = await fetchExerciseCatalog();
    if (serverExercises.length < ENRICHED_EXERCISES.length) {
      await seedExerciseCatalog(ENRICHED_EXERCISES);
      _catalog = mergeWithEnriched(serverExercises);
    } else {
      _catalog = mergeWithEnriched(serverExercises);
    }
    setCachedCatalog(_catalog);
  } catch {
    _catalog = getCachedCatalog() || [...ENRICHED_EXERCISES];
  }
  notify();
}

export function useExerciseCatalog() {
  const [, forceUpdate] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const listener = () => {
      if (mountedRef.current) forceUpdate(n => n + 1);
    };
    _listeners.add(listener);

    if (!_loadPromise) {
      _loadPromise = loadCatalog();
    }

    return () => {
      mountedRef.current = false;
      _listeners.delete(listener);
    };
  }, []);

  const loading = _catalog === null;
  const catalogExercises: Exercise[] = _catalog || getCachedCatalog() || ENRICHED_EXERCISES;

  const addExercise = useCallback(async (exercise: Exercise) => {
    await saveExerciseToCatalog(exercise);
    const current = [...(_catalog || ENRICHED_EXERCISES)];
    const idx = current.findIndex(e => e.id === exercise.id);
    if (idx >= 0) current[idx] = exercise;
    else current.push(exercise);
    _catalog = current;
    setCachedCatalog(_catalog);
    notify();
  }, []);

  const removeExercise = useCallback(async (id: string) => {
    await deleteExerciseFromCatalog(id);
    _catalog = (_catalog || ENRICHED_EXERCISES).filter(e => e.id !== id);
    setCachedCatalog(_catalog);
    notify();
  }, []);

  const reseed = useCallback(async () => {
    await seedExerciseCatalog(ENRICHED_EXERCISES);
    _loadPromise = loadCatalog();
    await _loadPromise;
  }, []);

  return { catalogExercises, loading, addExercise, removeExercise, reseed };
}