/**
 * Sync Engine — Offline-first with background server sync.
 *
 * Reads are always from localStorage (sub-50ms).
 * Writes go to localStorage first, then queue a background server push.
 * On login / app start, a full bidirectional sync merges local + server state.
 */

import {
  bulkSync,
  saveTemplateRemote,
  saveSessionRemote,
  updatePreferences,
  deleteTemplateRemote,
  saveCustomExerciseRemote,
  deleteCustomExerciseRemote,
  getActiveAuthProvider,
} from './api';
import type { WorkoutTemplate, WorkoutSession, UserPreferences } from './store';
import type { Exercise } from './exercises';

const SYNC_QUEUE_KEY = 'forma_sync_queue';
const LAST_SYNC_KEY = 'forma_last_sync';

// ── Types ──
interface SyncOp {
  id: string;
  type: 'template' | 'session' | 'preferences' | 'custom_exercise';
  action: 'save' | 'delete';
  data: any;
  timestamp: number;
}

// ── Queue management ──
function getQueue(): SyncOp[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncOp[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueSync(op: Omit<SyncOp, 'timestamp'>) {
  const queue = getQueue();
  // Deduplicate: remove older ops for same id+type+action
  const filtered = queue.filter(
    q => !(q.id === op.id && q.type === op.type && q.action === op.action)
  );
  filtered.push({ ...op, timestamp: Date.now() });
  saveQueue(filtered);

  // Fire-and-forget background flush
  flushQueue().catch(e => console.log('Background sync failed (will retry):', e));
}

// ── Flush queue ──
export async function flushQueue(): Promise<void> {
  if (!getActiveAuthProvider()) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining: SyncOp[] = [];

  for (const op of queue) {
    try {
      if (op.type === 'template' && op.action === 'save') {
        await saveTemplateRemote(op.data);
      } else if (op.type === 'template' && op.action === 'delete') {
        await deleteTemplateRemote(op.id);
      } else if (op.type === 'session' && op.action === 'save') {
        await saveSessionRemote(op.data);
      } else if (op.type === 'preferences' && op.action === 'save') {
        await updatePreferences(op.data);
      } else if (op.type === 'custom_exercise' && op.action === 'save') {
        await saveCustomExerciseRemote(op.data);
      } else if (op.type === 'custom_exercise' && op.action === 'delete') {
        await deleteCustomExerciseRemote(op.id);
      }
    } catch (e) {
      console.log(`Sync op failed (${op.type}/${op.action}/${op.id}), will retry:`, e);
      remaining.push(op);
    }
  }

  saveQueue(remaining);
}

// ── Full bidirectional sync (on login / app start) ──
export async function fullSync(): Promise<{
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  preferences: UserPreferences;
  customExercises: Exercise[];
} | null> {
  try {
    // Read current local state
    const localTemplates: WorkoutTemplate[] = JSON.parse(
      localStorage.getItem('forma_templates') || '[]'
    );
    const localSessions: WorkoutSession[] = JSON.parse(
      localStorage.getItem('forma_sessions') || '[]'
    );
    const localPrefs: UserPreferences = JSON.parse(
      localStorage.getItem('forma_prefs') ||
        '{"onboardingComplete":false,"preferredStyle":null,"displayName":"Athlete"}'
    );
    const localCustomExercises: Exercise[] = JSON.parse(
      localStorage.getItem('forma_custom_exercises') || '[]'
    );

    // Send to server and get merged result
    const merged = await bulkSync({
      templates: localTemplates,
      sessions: localSessions,
      preferences: localPrefs,
      customExercises: localCustomExercises,
    });

    // Write merged state back to localStorage
    localStorage.setItem('forma_templates', JSON.stringify(merged.templates));
    localStorage.setItem('forma_sessions', JSON.stringify(merged.sessions));
    localStorage.setItem('forma_prefs', JSON.stringify(merged.preferences));
    localStorage.setItem('forma_custom_exercises', JSON.stringify(merged.customExercises || []));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    // Clear the queue since we just did a full sync
    saveQueue([]);

    console.log(
      `Full sync complete: ${merged.templates.length} templates, ${merged.sessions.length} sessions, ${(merged.customExercises || []).length} custom exercises, onboarding=${merged.preferences?.onboardingComplete}, style=${merged.preferences?.preferredStyle}`
    );

    return merged;
  } catch (e) {
    console.log('Full sync failed (offline or server error):', e);
    return null;
  }
}

// ── Online/offline listeners ──
let listenerAttached = false;

export function attachSyncListeners() {
  if (listenerAttached) return;
  listenerAttached = true;

  window.addEventListener('online', () => {
    console.log('Back online — flushing sync queue');
    flushQueue().catch(e => console.log('Online flush failed:', e));
  });
}

// ── Check last sync time ──
export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}