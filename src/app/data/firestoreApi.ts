import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  reauthenticateWithGoogle,
} from './firebase';
import {
  validateUsername,
  buildUsernameCandidate,
  sanitizeDisplayName,
  isSafeHttpUrl,
  mergeCollectionsById,
} from './authUtils';
import { BUILT_IN_EXERCISES, type Category, type Exercise } from './exercises';
import { ENRICHED_EXERCISES, CATALOG_VERSION } from './webExerciseCatalog';
import type { WorkoutTemplate, WorkoutSession, UserPreferences } from './store';

const VALID_CATEGORIES = new Set<Category>(['gym', 'calisthenics', 'animalflow']);
const AVATAR_CACHE_KEY = 'forma_avatar_url';
const WORKOUT_MEDIA_PREFIX = 'forma_workout_media_';
const CATALOG_CACHE_KEY = 'forma_exercise_catalog_v2';

function requireUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in with Google to continue.');
  }
  return user;
}

function normalizeId(raw: string): string {
  const cleaned = (raw || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCategory(cat: unknown): Category {
  if (typeof cat === 'string' && VALID_CATEGORIES.has(cat as Category)) {
    return cat as Category;
  }
  return 'gym';
}

function normalizeOptionalCategory(cat: unknown): Category | null {
  if (typeof cat === 'string' && VALID_CATEGORIES.has(cat as Category)) {
    return cat as Category;
  }
  return null;
}

function sanitizeOptionalNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

// ══════════════════════════════════════════════════════════
// ── User Account & Username Setup (Firebase Auth + Firestore) ──
// ══════════════════════════════════════════════════════════

export interface UserAccountRecord {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  onboardingComplete: boolean;
  preferredStyle: Category | null;
  workoutFrequency?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goal?: string | null;
}

export async function fetchCurrentUserAccount(): Promise<UserAccountRecord | null> {
  const user = requireUser();
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      userId: data.userId || user.uid,
      email: data.email || user.email || '',
      username: data.username || '',
      displayName: data.displayName || user.displayName || 'Athlete',
      avatarUrl: data.avatarUrl ?? user.photoURL ?? null,
      onboardingComplete: data.onboardingComplete === true,
      preferredStyle: normalizeOptionalCategory(data.preferredStyle),
      workoutFrequency: data.workoutFrequency ?? undefined,
      heightCm: typeof data.heightCm === 'number' ? data.heightCm : undefined,
      weightKg: typeof data.weightKg === 'number' ? data.weightKg : undefined,
      goal: data.goal ?? undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const validation = validateUsername(username);
  if (!validation.valid) return false;
  const path = `usernames/${validation.cleaned}`;
  try {
    const snap = await getDoc(doc(db, 'usernames', validation.cleaned));
    return !snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function findAvailableUsername(baseSuggestion: string): Promise<string> {
  const baseValidation = validateUsername(baseSuggestion);
  const base = baseValidation.valid ? baseValidation.cleaned : 'athlete';
  if (await checkUsernameAvailable(base)) return base;

  for (let i = 2; i <= 8; i++) {
    const candidate = buildUsernameCandidate(base, i);
    if (await checkUsernameAvailable(candidate)) return candidate;
  }
  const randomSuffix = Math.floor(100 + Math.random() * 899);
  return buildUsernameCandidate(base, randomSuffix);
}

export async function completeGoogleProfile(params: {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
}): Promise<{ ok: boolean; username: string; displayName: string; avatarUrl: string | null }> {
  const user = requireUser();
  const validation = validateUsername(params.username);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid username');
  }

  const cleanUsername = validation.cleaned;
  const cleanName = sanitizeDisplayName(params.displayName, cleanUsername);
  const safeAvatar = isSafeHttpUrl(params.avatarUrl ?? user.photoURL ?? null);
  const email = (user.email || '').trim().toLowerCase();
  if (!email) {
    throw new Error('Your Google account did not provide an email address.');
  }

  // Verify username is still available before writing
  const available = await checkUsernameAvailable(cleanUsername);
  if (!available) {
    throw new Error('This username is already taken. Please choose another.');
  }

  const nowIso = new Date().toISOString();
  const batch = writeBatch(db);

  batch.set(doc(db, 'usernames', cleanUsername), {
    username: cleanUsername,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });

  batch.set(doc(db, 'users', user.uid), {
    userId: user.uid,
    email,
    username: cleanUsername,
    displayName: cleanName,
    avatarUrl: safeAvatar,
    onboardingComplete: false,
    preferredStyle: null,
    workoutFrequency: null,
    heightCm: null,
    weightKg: null,
    goal: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(db, 'profiles', user.uid), {
    userId: user.uid,
    username: cleanUsername,
    displayName: cleanName,
    avatarUrl: safeAvatar,
    preferredStyle: null,
    bio: '',
    visibility: 'public',
    workoutCount: 0,
    totalVolume: 0,
    totalDuration: 0,
    totalSets: 0,
    totalReps: 0,
    joinedAt: nowIso,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }

  if (safeAvatar) {
    try {
      localStorage.setItem(AVATAR_CACHE_KEY, safeAvatar);
    } catch {}
  }

  return { ok: true, username: cleanUsername, displayName: cleanName, avatarUrl: safeAvatar };
}

// ── Preferences ──
export async function fetchPreferences(): Promise<{ preferences: UserPreferences }> {
  const account = await fetchCurrentUserAccount();
  return {
    preferences: {
      onboardingComplete: account?.onboardingComplete === true,
      preferredStyle: account?.preferredStyle ?? null,
      displayName: account?.displayName || auth.currentUser?.displayName || 'Athlete',
      workoutFrequency: account?.workoutFrequency || undefined,
      heightCm: account?.heightCm ?? undefined,
      weightKg: account?.weightKg ?? undefined,
      goal: account?.goal || undefined,
    },
  };
}

export async function updatePreferences(preferences: UserPreferences): Promise<{ ok: boolean }> {
  const user = requireUser();
  const userPath = `users/${user.uid}`;
  const cleanName = sanitizeDisplayName(preferences.displayName, 'Athlete');
  const style = normalizeOptionalCategory(preferences.preferredStyle);

  const userUpdate = {
    displayName: cleanName,
    onboardingComplete: Boolean(preferences.onboardingComplete),
    preferredStyle: style,
    workoutFrequency: preferences.workoutFrequency ? String(preferences.workoutFrequency).slice(0, 20) : null,
    heightCm: sanitizeOptionalNumber(preferences.heightCm, 50, 300),
    weightKg: sanitizeOptionalNumber(preferences.weightKg, 20, 400),
    goal: preferences.goal ? String(preferences.goal).slice(0, 40) : null,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, 'users', user.uid), userUpdate);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }

  // Keep public profile display name and preferred style synchronized
  try {
    await updateDoc(doc(db, 'profiles', user.uid), {
      displayName: cleanName,
      preferredStyle: style,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-fatal if profile is not yet created
  }

  return { ok: true };
}

// ── Templates ──
export async function fetchTemplates(): Promise<{ templates: WorkoutTemplate[] }> {
  const user = requireUser();
  const path = `users/${user.uid}/templates`;
  try {
    const q = query(collection(db, 'users', user.uid, 'templates'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const templates: WorkoutTemplate[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        name: data.name || 'Workout',
        category: normalizeCategory(data.category),
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
        createdAt: data.createdAt || new Date().toISOString(),
      };
    });
    return { templates };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveTemplateRemote(template: WorkoutTemplate): Promise<{ ok: boolean }> {
  const user = requireUser();
  const id = normalizeId(template.id);
  const path = `users/${user.uid}/templates/${id}`;
  const docRef = doc(db, 'users', user.uid, 'templates', id);

  try {
    const existing = await getDoc(docRef);
    const createdAt =
      existing.exists() && typeof existing.data().createdAt === 'string'
        ? existing.data().createdAt
        : (template.createdAt || new Date().toISOString()).slice(0, 64);

    await setDoc(docRef, {
      id,
      userId: user.uid,
      name: sanitizeDisplayName(template.name, 'Workout').slice(0, 100),
      category: normalizeCategory(template.category),
      exercises: (template.exercises || []).slice(0, 100),
      createdAt,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTemplateRemote(id: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanId = normalizeId(id);
  const path = `users/${user.uid}/templates/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'templates', cleanId));
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ── Sessions ──
export async function fetchSessions(): Promise<{ sessions: WorkoutSession[] }> {
  const user = requireUser();
  const path = `users/${user.uid}/sessions`;
  try {
    const q = query(collection(db, 'users', user.uid, 'sessions'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const sessions: WorkoutSession[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        templateId: data.templateId || undefined,
        name: data.name || 'Workout Session',
        category: normalizeCategory(data.category),
        startedAt: data.startedAt || new Date().toISOString(),
        completedAt: data.completedAt || undefined,
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
      };
    });
    return { sessions };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveSessionRemote(session: WorkoutSession): Promise<{ ok: boolean }> {
  const user = requireUser();
  const id = normalizeId(session.id);
  const path = `users/${user.uid}/sessions/${id}`;
  const docRef = doc(db, 'users', user.uid, 'sessions', id);

  try {
    const existing = await getDoc(docRef);
    const startedAt =
      existing.exists() && typeof existing.data().startedAt === 'string'
        ? existing.data().startedAt
        : (session.startedAt || new Date().toISOString()).slice(0, 64);

    await setDoc(docRef, {
      id,
      userId: user.uid,
      templateId: session.templateId ? normalizeId(session.templateId) : null,
      name: sanitizeDisplayName(session.name, 'Workout Session').slice(0, 100),
      category: normalizeCategory(session.category),
      startedAt,
      completedAt: session.completedAt ? String(session.completedAt).slice(0, 64) : null,
      exercises: (session.exercises || []).slice(0, 100),
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ── Custom Exercises ──
export async function fetchCustomExercises(): Promise<{ customExercises: Exercise[] }> {
  const user = requireUser();
  const path = `users/${user.uid}/customExercises`;
  try {
    const q = query(collection(db, 'users', user.uid, 'customExercises'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const customExercises: Exercise[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        name: data.name || 'Exercise',
        category: normalizeCategory(data.category),
        muscleGroup: data.muscleGroup || 'Full Body',
        equipment: data.equipment || 'Bodyweight',
        isTimeBased: Boolean(data.isTimeBased),
        instructions: data.instructions || undefined,
      } as Exercise;
    });
    return { customExercises };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveCustomExerciseRemote(exercise: Exercise): Promise<{ ok: boolean }> {
  const user = requireUser();
  const id = normalizeId(exercise.id);
  const path = `users/${user.uid}/customExercises/${id}`;
  try {
    await setDoc(doc(db, 'users', user.uid, 'customExercises', id), {
      id,
      userId: user.uid,
      name: sanitizeDisplayName(exercise.name, 'Exercise').slice(0, 100),
      category: normalizeCategory(exercise.category),
      muscleGroup: String(exercise.muscleGroup || 'Full Body').slice(0, 60),
      equipment: exercise.equipment ? String(exercise.equipment).slice(0, 60) : null,
      isTimeBased: Boolean((exercise as any).isTimeBased),
      instructions: (exercise as any).instructions ? String((exercise as any).instructions).slice(0, 1000) : null,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomExerciseRemote(id: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanId = normalizeId(id);
  const path = `users/${user.uid}/customExercises/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'customExercises', cleanId));
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ── Bulk Sync ──
export interface SyncPayload {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  preferences: UserPreferences;
  customExercises: Exercise[];
}

export interface SyncResult {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  preferences: UserPreferences;
  customExercises: Exercise[];
}

export async function bulkSync(payload: SyncPayload): Promise<SyncResult> {
  const user = requireUser();

  const [remoteAccount, remoteTemplatesRes, remoteSessionsRes, remoteCustomRes] = await Promise.all([
    fetchCurrentUserAccount(),
    fetchTemplates(),
    fetchSessions(),
    fetchCustomExercises(),
  ]);

  const mergedTemplates = mergeCollectionsById(payload.templates || [], remoteTemplatesRes.templates);
  const mergedSessions = mergeCollectionsById(payload.sessions || [], remoteSessionsRes.sessions);
  const mergedCustomExercises = mergeCollectionsById(
    payload.customExercises || [],
    remoteCustomRes.customExercises,
  );

  const remoteTemplateIds = new Set(remoteTemplatesRes.templates.map(t => t.id));
  const remoteSessionIds = new Set(remoteSessionsRes.sessions.map(s => s.id));
  const remoteCustomIds = new Set(remoteCustomRes.customExercises.map(e => e.id));

  // Push any local-only records up to Firestore
  await Promise.all([
    ...mergedTemplates
      .filter(t => !remoteTemplateIds.has(t.id))
      .map(t => saveTemplateRemote(t).catch(() => {})),
    ...mergedSessions
      .filter(s => !remoteSessionIds.has(s.id))
      .map(s => saveSessionRemote(s).catch(() => {})),
    ...mergedCustomExercises
      .filter(e => !remoteCustomIds.has(e.id))
      .map(e => saveCustomExerciseRemote(e).catch(() => {})),
  ]);

  const mergedPrefs: UserPreferences = {
    onboardingComplete:
      remoteAccount?.onboardingComplete === true || payload.preferences?.onboardingComplete === true,
    preferredStyle: remoteAccount?.preferredStyle ?? payload.preferences?.preferredStyle ?? null,
    displayName:
      remoteAccount?.displayName ||
      payload.preferences?.displayName ||
      user.displayName ||
      'Athlete',
    workoutFrequency: remoteAccount?.workoutFrequency || payload.preferences?.workoutFrequency,
    heightCm: remoteAccount?.heightCm ?? payload.preferences?.heightCm,
    weightKg: remoteAccount?.weightKg ?? payload.preferences?.weightKg,
    goal: remoteAccount?.goal || payload.preferences?.goal,
  };

  if (remoteAccount) {
    await updatePreferences(mergedPrefs).catch(() => {});
    // Sync aggregate community stats
    const completed = mergedSessions.filter(s => s.completedAt);
    let totalVolume = 0;
    let totalDuration = 0;
    let totalSets = 0;
    let totalReps = 0;
    for (const s of completed) {
      if (s.completedAt && s.startedAt) {
        totalDuration += Math.max(0, (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);
      }
      for (const ex of s.exercises || []) {
        for (const set of ex.sets || []) {
          if (set.completed) {
            totalSets += 1;
            totalReps += set.reps || 0;
            totalVolume += (set.reps || 0) * (set.weight || 0);
          }
        }
      }
    }
    await updateDoc(doc(db, 'profiles', user.uid), {
      workoutCount: completed.length,
      totalVolume: Math.round(totalVolume),
      totalDuration: Math.round(totalDuration),
      totalSets,
      totalReps,
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }

  return {
    templates: mergedTemplates,
    sessions: mergedSessions,
    preferences: mergedPrefs,
    customExercises: mergedCustomExercises,
  };
}

// ── Profile Avatar ──
export async function uploadAvatar(base64DataUrl: string): Promise<{ ok: boolean; url: string }> {
  const user = requireUser();
  const safeRemoteUrl = isSafeHttpUrl(base64DataUrl);

  try {
    localStorage.setItem(AVATAR_CACHE_KEY, base64DataUrl);
  } catch {}

  if (safeRemoteUrl) {
    try {
      await Promise.all([
        updateDoc(doc(db, 'users', user.uid), { avatarUrl: safeRemoteUrl, updatedAt: serverTimestamp() }),
        updateDoc(doc(db, 'profiles', user.uid), { avatarUrl: safeRemoteUrl, updatedAt: serverTimestamp() }),
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }

  return { ok: true, url: base64DataUrl };
}

export async function fetchAvatarUrl(): Promise<{ url: string | null }> {
  try {
    const cached = localStorage.getItem(AVATAR_CACHE_KEY);
    if (cached) return { url: cached };
  } catch {}

  const user = auth.currentUser;
  if (!user) return { url: null };

  const account = await fetchCurrentUserAccount().catch(() => null);
  return { url: account?.avatarUrl || user.photoURL || null };
}

export async function deleteAvatar(): Promise<{ ok: boolean }> {
  const user = requireUser();
  try {
    localStorage.removeItem(AVATAR_CACHE_KEY);
  } catch {}

  try {
    await Promise.all([
      updateDoc(doc(db, 'users', user.uid), { avatarUrl: null, updatedAt: serverTimestamp() }),
      updateDoc(doc(db, 'profiles', user.uid), { avatarUrl: null, updatedAt: serverTimestamp() }),
    ]);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
  }
  return { ok: true };
}

// ── Exercise Catalog (Firebase Firestore /exerciseCatalogPacks + Local Cache) ──

function buildCatalogPacks(exercises: Exercise[]): { packId: string; category: Category; exercises: Exercise[] }[] {
  const byCategory: Record<Category, Exercise[]> = {
    gym: [],
    calisthenics: [],
    animalflow: [],
  };
  for (const ex of exercises) {
    const cat = normalizeCategory(ex.category);
    byCategory[cat].push(ex);
  }
  const packs: { packId: string; category: Category; exercises: Exercise[] }[] = [];
  const limits: Record<Category, number> = { gym: 3, calisthenics: 2, animalflow: 2 };
  (['gym', 'calisthenics', 'animalflow'] as Category[]).forEach(cat => {
    const list = byCategory[cat];
    const maxPacks = limits[cat];
    for (let i = 0; i < maxPacks; i++) {
      const slice = list.slice(i * 100, (i + 1) * 100);
      if (slice.length > 0) {
        packs.push({
          packId: `${cat}_${i + 1}`,
          category: cat,
          exercises: slice,
        });
      }
    }
  });
  return packs;
}

export async function seedExerciseCatalog(exercises: Exercise[]): Promise<{ ok: boolean; count: number }> {
  const source = exercises.length >= ENRICHED_EXERCISES.length ? exercises : ENRICHED_EXERCISES;
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ version: CATALOG_VERSION, exercises: source }));
  } catch {}

  const user = auth.currentUser;
  if (user && user.emailVerified) {
    try {
      const packs = buildCatalogPacks(source);
      const batch = writeBatch(db);
      for (const pack of packs) {
        batch.set(doc(db, 'exerciseCatalogPacks', pack.packId), {
          packId: pack.packId,
          category: pack.category,
          version: CATALOG_VERSION,
          visibility: 'public',
          exercises: pack.exercises,
          updatedBy: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      console.warn('[Firestore] Catalog pack seed skipped:', (error as Error).message);
    }
  }
  return { ok: true, count: source.length };
}

export async function fetchExerciseCatalog(): Promise<{ exercises: Exercise[] }> {
  try {
    const q = query(collection(db, 'exerciseCatalogPacks'), where('visibility', '==', 'public'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      let maxVersion = 0;
      const remoteList: Exercise[] = [];
      snap.docs.forEach(d => {
        const data = d.data();
        if (typeof data.version === 'number') maxVersion = Math.max(maxVersion, data.version);
        if (Array.isArray(data.exercises)) {
          remoteList.push(...(data.exercises as Exercise[]));
        }
      });

      if (maxVersion >= CATALOG_VERSION && remoteList.length >= ENRICHED_EXERCISES.length) {
        try {
          localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ version: maxVersion, exercises: remoteList }));
        } catch {}
        return { exercises: remoteList };
      }
    }

    // Firestore is empty or outdated: seed the full 500-exercise web library when verified user is active
    if (auth.currentUser?.emailVerified) {
      await seedExerciseCatalog(ENRICHED_EXERCISES);
    }
  } catch (err) {
    console.warn('[Firestore] Catalog pack fetch fallback:', (err as Error).message);
  }

  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version >= CATALOG_VERSION && Array.isArray(parsed.exercises) && parsed.exercises.length >= ENRICHED_EXERCISES.length) {
        return { exercises: parsed.exercises };
      }
    }
  } catch {}

  const fallback = ENRICHED_EXERCISES.length > 0 ? [...ENRICHED_EXERCISES] : [...BUILT_IN_EXERCISES];
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ version: CATALOG_VERSION, exercises: fallback }));
  } catch {}
  return { exercises: fallback };
}

export async function saveExerciseToCatalog(exercise: Exercise): Promise<{ ok: boolean }> {
  const { exercises } = await fetchExerciseCatalog();
  const idx = exercises.findIndex(e => e.id === exercise.id);
  if (idx >= 0) exercises[idx] = exercise;
  else exercises.push(exercise);
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ version: CATALOG_VERSION, exercises }));
  } catch {}
  return { ok: true };
}

export async function deleteExerciseFromCatalog(id: string): Promise<{ ok: boolean }> {
  const { exercises } = await fetchExerciseCatalog();
  const filtered = exercises.filter(e => e.id !== id);
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ version: CATALOG_VERSION, exercises: filtered }));
  } catch {}
  return { ok: true };
}

// ── Exercise GIF / Visual Demo lookup ──
export interface ExerciseGifResult {
  found: boolean;
  gifUrl: string | null;
  demoFrames?: string[];
  exerciseName: string;
  target?: string | null;
  equipment?: string | null;
  bodyPart?: string | null;
  secondaryMuscles?: string[];
  instructions?: string[];
  error?: string;
}

export async function fetchExerciseGif(name: string, _refresh = false): Promise<ExerciseGifResult> {
  const needle = name.trim().toLowerCase();
  const match = ENRICHED_EXERCISES.find(e => e.name.toLowerCase() === needle)
    || ENRICHED_EXERCISES.find(e => e.name.toLowerCase().includes(needle));
  if (match && ((match.demoFrames && match.demoFrames.length > 0) || match.gifUrl)) {
    return {
      found: true,
      gifUrl: match.gifUrl || match.demoFrames?.[0] || null,
      demoFrames: match.demoFrames,
      exerciseName: match.name,
      target: match.muscleGroups[0] || null,
      equipment: match.equipment || null,
      bodyPart: match.category,
      secondaryMuscles: match.muscleGroups.slice(1),
      instructions: match.instructions || [],
    };
  }
  return {
    found: false,
    gifUrl: null,
    exerciseName: name,
  };
}

// ── Account Management ──
async function deleteUserSubcollection(uid: string, subName: string, filterField: 'userId' | 'recipientId' = 'userId') {
  const path = `users/${uid}/${subName}`;
  try {
    const q = query(collection(db, 'users', uid, subName), where(filterField, '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function resetAccountData(): Promise<{ ok: boolean }> {
  const user = requireUser();
  await Promise.all([
    deleteUserSubcollection(user.uid, 'templates'),
    deleteUserSubcollection(user.uid, 'sessions'),
    deleteUserSubcollection(user.uid, 'customExercises'),
    deleteUserSubcollection(user.uid, 'savedTemplates'),
  ]);

  try {
    await updateDoc(doc(db, 'profiles', user.uid), {
      workoutCount: 0,
      totalVolume: 0,
      totalDuration: 0,
      totalSets: 0,
      totalReps: 0,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-fatal
  }

  return { ok: true };
}

export async function deleteAccount(): Promise<{ ok: boolean }> {
  const user = requireUser();
  const account = await fetchCurrentUserAccount().catch(() => null);

  // Delete subcollections first while parent /users/{uid} exists (Master Gate invariant)
  await Promise.all([
    deleteUserSubcollection(user.uid, 'templates'),
    deleteUserSubcollection(user.uid, 'sessions'),
    deleteUserSubcollection(user.uid, 'customExercises'),
    deleteUserSubcollection(user.uid, 'savedTemplates'),
    deleteUserSubcollection(user.uid, 'notifications', 'recipientId'),
  ]);

  // Delete user's own follow edges
  try {
    const fSnap = await getDocs(
      query(
        collection(db, 'follows'),
        where('visibility', '==', 'public'),
        where('followerId', '==', user.uid),
      ),
    );
    if (!fSnap.empty) {
      const fBatch = writeBatch(db);
      fSnap.docs.forEach(d => fBatch.delete(d.ref));
      await fBatch.commit();
    }
  } catch {
    // Non-fatal
  }

  // Delete user root doc, public profile, and username claim
  const batch = writeBatch(db);
  batch.delete(doc(db, 'users', user.uid));
  batch.delete(doc(db, 'profiles', user.uid));
  if (account?.username) {
    batch.delete(doc(db, 'usernames', account.username));
  }
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}`);
  }

  // Delete Firebase Auth account (re-authenticates via Google popup if session is stale)
  try {
    await deleteUser(user);
  } catch (err: any) {
    if (err?.code === 'auth/requires-recent-login') {
      await reauthenticateWithGoogle(user);
      await deleteUser(user);
    } else {
      throw err;
    }
  }

  return { ok: true };
}

// ══════════════════════════════════════════════════════════
// ── Community / Social API (Firestore) ──
// ══════════════════════════════════════════════════════════

export interface CommunityProfile {
  userId: string;
  username?: string;
  displayName: string;
  avatarUrl: string | null;
  preferredStyle: string | null;
  bio: string;
  joinedAt: string;
  workoutCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  totalVolume?: number;
  totalDuration?: number;
  totalSets?: number;
  totalReps?: number;
  isMe?: boolean;
}

export interface ActivityPost {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  sessionName: string;
  title?: string;
  description?: string;
  category: string;
  completedAt: string;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number;
  exercises: { name: string; sets: number; bestSet: string }[];
  postedAt: string;
  mediaUrl?: string | null;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface Comment {
  commentId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  createdAt: string;
}

async function getFollowStats(targetUserId: string, viewerUid: string) {
  const path = 'follows';
  try {
    const [followersSnap, followingSnap] = await Promise.all([
      getDocs(query(collection(db, 'follows'), where('visibility', '==', 'public'), where('followingId', '==', targetUserId))),
      getDocs(query(collection(db, 'follows'), where('visibility', '==', 'public'), where('followerId', '==', targetUserId))),
    ]);
    const isFollowing = followersSnap.docs.some(d => d.data().followerId === viewerUid);
    return {
      followersCount: followersSnap.size,
      followingCount: followingSnap.size,
      isFollowing,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchMyProfile(): Promise<{ profile: CommunityProfile }> {
  const user = requireUser();
  return fetchUserProfile(user.uid);
}

export async function fetchUserProfile(userId: string): Promise<{ profile: CommunityProfile }> {
  const viewer = requireUser();
  const cleanId = normalizeId(userId);
  const path = `profiles/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'profiles', cleanId));
    const stats = await getFollowStats(cleanId, viewer.uid);
    if (!snap.exists()) {
      return {
        profile: {
          userId: cleanId,
          displayName: cleanId === viewer.uid ? (viewer.displayName || 'Athlete') : 'Athlete',
          avatarUrl: cleanId === viewer.uid ? (viewer.photoURL || null) : null,
          preferredStyle: null,
          bio: '',
          joinedAt: new Date().toISOString(),
          workoutCount: 0,
          ...stats,
          isMe: cleanId === viewer.uid,
        },
      };
    }
    const data = snap.data();
    return {
      profile: {
        userId: data.userId || cleanId,
        username: data.username,
        displayName: data.displayName || 'Athlete',
        avatarUrl: data.avatarUrl ?? null,
        preferredStyle: data.preferredStyle ?? null,
        bio: data.bio || '',
        joinedAt: data.joinedAt || new Date().toISOString(),
        workoutCount: data.workoutCount || 0,
        totalVolume: data.totalVolume || 0,
        totalDuration: data.totalDuration || 0,
        totalSets: data.totalSets || 0,
        totalReps: data.totalReps || 0,
        ...stats,
        isMe: cleanId === viewer.uid,
      },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateCommunityProfile(
  updates: Partial<CommunityProfile>,
): Promise<{ ok: boolean; profile: CommunityProfile }> {
  const user = requireUser();
  const path = `profiles/${user.uid}`;
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };

  if (typeof updates.displayName === 'string') {
    patch.displayName = sanitizeDisplayName(updates.displayName, 'Athlete');
  }
  if (typeof updates.bio === 'string') {
    patch.bio = updates.bio.trim().slice(0, 240);
  }
  if (updates.preferredStyle !== undefined) {
    patch.preferredStyle = normalizeOptionalCategory(updates.preferredStyle);
  }
  if (updates.avatarUrl !== undefined) {
    patch.avatarUrl = isSafeHttpUrl(updates.avatarUrl);
  }

  try {
    await updateDoc(doc(db, 'profiles', user.uid), patch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  const { profile } = await fetchMyProfile();
  return { ok: true, profile };
}

// ── Follow / Unfollow ──
export async function followUser(targetId: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanTarget = normalizeId(targetId);
  if (cleanTarget === user.uid) return { ok: true };

  const followId = `${user.uid}_${cleanTarget}`;
  const path = `follows/${followId}`;
  try {
    await setDoc(doc(db, 'follows', followId), {
      followerId: user.uid,
      followingId: cleanTarget,
      visibility: 'public',
      createdAt: serverTimestamp(),
    });

    // Notify target user (best-effort)
    const notifId = normalizeId(`follow_${user.uid}_${Date.now().toString(36)}`);
    await setDoc(doc(db, 'users', cleanTarget, 'notifications', notifId), {
      id: notifId,
      recipientId: cleanTarget,
      type: 'follow_back',
      fromUserId: user.uid,
      fromDisplayName: sanitizeDisplayName(user.displayName, 'Athlete'),
      fromAvatarUrl: isSafeHttpUrl(user.photoURL),
      read: false,
      createdAt: serverTimestamp(),
    }).catch(() => {});

    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function unfollowUser(targetId: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanTarget = normalizeId(targetId);
  const followId = `${user.uid}_${cleanTarget}`;
  const path = `follows/${followId}`;
  try {
    await deleteDoc(doc(db, 'follows', followId));
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchFollowers(userId: string): Promise<{ followers: CommunityProfile[] }> {
  const viewer = requireUser();
  const cleanId = normalizeId(userId);
  try {
    const snap = await getDocs(
      query(collection(db, 'follows'), where('visibility', '==', 'public'), where('followingId', '==', cleanId)),
    );
    const ids = snap.docs.map(d => d.data().followerId as string);
    const profiles = await Promise.all(ids.map(id => fetchUserProfile(id).then(r => r.profile).catch(() => null)));
    return {
      followers: profiles.filter((p): p is CommunityProfile => Boolean(p)).map(p => ({ ...p, isMe: p.userId === viewer.uid })),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'follows');
  }
}

export async function fetchFollowing(userId: string): Promise<{ following: CommunityProfile[] }> {
  const viewer = requireUser();
  const cleanId = normalizeId(userId);
  try {
    const snap = await getDocs(
      query(collection(db, 'follows'), where('visibility', '==', 'public'), where('followerId', '==', cleanId)),
    );
    const ids = snap.docs.map(d => d.data().followingId as string);
    const profiles = await Promise.all(ids.map(id => fetchUserProfile(id).then(r => r.profile).catch(() => null)));
    return {
      following: profiles.filter((p): p is CommunityProfile => Boolean(p)).map(p => ({ ...p, isMe: p.userId === viewer.uid })),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'follows');
  }
}

// ── Activities ──
export async function postActivity(
  activity: Omit<ActivityPost, 'userId' | 'displayName' | 'avatarUrl' | 'postedAt'>,
): Promise<{ ok: boolean }> {
  const user = requireUser();
  const id = normalizeId(activity.id);
  const path = `activities/${id}`;
  const profileSnap = await getDoc(doc(db, 'profiles', user.uid)).catch(() => null);
  const profileData = profileSnap?.exists() ? profileSnap.data() : null;

  try {
    await setDoc(doc(db, 'activities', id), {
      id,
      userId: user.uid,
      displayName: sanitizeDisplayName(profileData?.displayName || user.displayName, 'Athlete'),
      avatarUrl: isSafeHttpUrl(profileData?.avatarUrl ?? user.photoURL),
      sessionName: sanitizeDisplayName(activity.sessionName, 'Workout').slice(0, 100),
      title: activity.title ? String(activity.title).slice(0, 120) : null,
      description: activity.description ? String(activity.description).slice(0, 500) : null,
      category: normalizeCategory(activity.category),
      completedAt: (activity.completedAt || new Date().toISOString()).slice(0, 64),
      exerciseCount: Math.max(0, Math.min(100, Number(activity.exerciseCount) || 0)),
      totalSets: Math.max(0, Math.min(1000, Number(activity.totalSets) || 0)),
      totalVolume: Math.max(0, Number(activity.totalVolume) || 0),
      durationMinutes: Math.max(0, Math.min(1440, Number(activity.durationMinutes) || 0)),
      exercises: (activity.exercises || []).slice(0, 100),
      postedAt: new Date().toISOString(),
      mediaUrl: isSafeHttpUrl(activity.mediaUrl),
      visibility: 'public',
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

function mapActivityDoc(id: string, data: any, isLiked = false): ActivityPost {
  return {
    id: data.id || id,
    userId: data.userId,
    displayName: data.displayName || 'Athlete',
    avatarUrl: data.avatarUrl ?? null,
    sessionName: data.sessionName || 'Workout',
    title: data.title || undefined,
    description: data.description || undefined,
    category: data.category || 'gym',
    completedAt: data.completedAt || data.postedAt || new Date().toISOString(),
    exerciseCount: data.exerciseCount || 0,
    totalSets: data.totalSets || 0,
    totalVolume: data.totalVolume || 0,
    durationMinutes: data.durationMinutes || 0,
    exercises: Array.isArray(data.exercises) ? data.exercises : [],
    postedAt: data.postedAt || new Date().toISOString(),
    mediaUrl: data.mediaUrl ?? null,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    isLiked,
  };
}

export async function fetchCommunityFeed(): Promise<{ activities: ActivityPost[] }> {
  const user = requireUser();
  const path = 'activities';
  try {
    const snap = await getDocs(query(collection(db, 'activities'), where('visibility', '==', 'public')));
    const posts = await Promise.all(
      snap.docs.map(async d => {
        const likeSnap = await getDoc(doc(db, 'activities', d.id, 'likes', user.uid)).catch(() => null);
        return mapActivityDoc(d.id, d.data(), Boolean(likeSnap?.exists()));
      }),
    );
    posts.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    return { activities: posts };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export interface ActivityPostDetail extends ActivityPost {
  comments: Comment[];
  likers: { userId: string; displayName: string; avatarUrl: string | null }[];
}

export async function fetchActivityDetail(activityId: string): Promise<{ activity: ActivityPostDetail }> {
  const user = requireUser();
  const cleanId = normalizeId(activityId);
  const path = `activities/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'activities', cleanId));
    if (!snap.exists()) throw new Error('Activity not found');

    const [likesSnap, commentsRes] = await Promise.all([
      getDocs(query(collection(db, 'activities', cleanId, 'likes'), where('visibility', '==', 'public'))),
      fetchComments(cleanId),
    ]);

    const likers = likesSnap.docs.map(d => {
      const l = d.data();
      return {
        userId: l.userId || d.id,
        displayName: l.displayName || 'Athlete',
        avatarUrl: l.avatarUrl ?? null,
      };
    });
    const isLiked = likers.some(l => l.userId === user.uid);
    const base = mapActivityDoc(snap.id, snap.data(), isLiked);

    return {
      activity: {
        ...base,
        comments: commentsRes.comments,
        likers,
      },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchUserActivities(userId: string): Promise<{ activities: ActivityPost[] }> {
  const viewer = requireUser();
  const cleanId = normalizeId(userId);
  try {
    const snap = await getDocs(
      query(collection(db, 'activities'), where('visibility', '==', 'public'), where('userId', '==', cleanId)),
    );
    const posts = await Promise.all(
      snap.docs.map(async d => {
        const likeSnap = await getDoc(doc(db, 'activities', d.id, 'likes', viewer.uid)).catch(() => null);
        return mapActivityDoc(d.id, d.data(), Boolean(likeSnap?.exists()));
      }),
    );
    posts.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    return { activities: posts };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'activities');
  }
}

// ── Search & Discover ──
export async function discoverUsers(): Promise<{ users: CommunityProfile[] }> {
  const user = requireUser();
  const path = 'profiles';
  try {
    const [profilesSnap, myFollowsSnap] = await Promise.all([
      getDocs(query(collection(db, 'profiles'), where('visibility', '==', 'public'))),
      getDocs(query(collection(db, 'follows'), where('visibility', '==', 'public'), where('followerId', '==', user.uid))),
    ]);
    const followingSet = new Set(myFollowsSnap.docs.map(d => d.data().followingId as string));
    const users: CommunityProfile[] = profilesSnap.docs
      .filter(d => d.id !== user.uid)
      .map(d => {
        const data = d.data();
        return {
          userId: data.userId || d.id,
          username: data.username,
          displayName: data.displayName || 'Athlete',
          avatarUrl: data.avatarUrl ?? null,
          preferredStyle: data.preferredStyle ?? null,
          bio: data.bio || '',
          joinedAt: data.joinedAt || new Date().toISOString(),
          workoutCount: data.workoutCount || 0,
          isFollowing: followingSet.has(d.id),
          isMe: false,
        };
      });
    return { users };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function searchUsers(queryStr: string): Promise<{ users: CommunityProfile[] }> {
  const { users } = await discoverUsers();
  const needle = queryStr.trim().toLowerCase();
  if (!needle) return { users };
  return {
    users: users.filter(
      u =>
        u.displayName.toLowerCase().includes(needle) ||
        (u.username && u.username.toLowerCase().includes(needle)),
    ),
  };
}

// ── Likes (Atomic batch synced with likesCount) ──
export async function likeActivity(activityId: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanId = normalizeId(activityId);
  const path = `activities/${cleanId}/likes/${user.uid}`;
  try {
    const actSnap = await getDoc(doc(db, 'activities', cleanId));
    if (!actSnap.exists()) throw new Error('Activity not found');
    const likeRef = doc(db, 'activities', cleanId, 'likes', user.uid);
    const existingLike = await getDoc(likeRef);
    if (existingLike.exists()) return { ok: true };

    const batch = writeBatch(db);
    batch.set(likeRef, {
      userId: user.uid,
      displayName: sanitizeDisplayName(user.displayName, 'Athlete'),
      avatarUrl: isSafeHttpUrl(user.photoURL),
      visibility: 'public',
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'activities', cleanId), {
      likesCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();

    const ownerId = actSnap.data().userId;
    if (ownerId && ownerId !== user.uid) {
      const notifId = normalizeId(`like_${user.uid}_${cleanId}`);
      await setDoc(doc(db, 'users', ownerId, 'notifications', notifId), {
        id: notifId,
        recipientId: ownerId,
        type: 'like',
        fromUserId: user.uid,
        fromDisplayName: sanitizeDisplayName(user.displayName, 'Athlete'),
        fromAvatarUrl: isSafeHttpUrl(user.photoURL),
        activityId: cleanId,
        activityName: String(actSnap.data().sessionName || 'Workout').slice(0, 100),
        read: false,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }

    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function unlikeActivity(activityId: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanId = normalizeId(activityId);
  const path = `activities/${cleanId}/likes/${user.uid}`;
  try {
    const likeRef = doc(db, 'activities', cleanId, 'likes', user.uid);
    const existingLike = await getDoc(likeRef);
    if (!existingLike.exists()) return { ok: true };

    const batch = writeBatch(db);
    batch.delete(likeRef);
    batch.update(doc(db, 'activities', cleanId), {
      likesCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ── Comments (Atomic batch synced with commentsCount) ──
export async function addComment(activityId: string, text: string): Promise<{ ok: boolean; comment: Comment }> {
  const user = requireUser();
  const cleanId = normalizeId(activityId);
  const trimmed = text.trim().slice(0, 500);
  if (!trimmed) throw new Error('Comment cannot be empty');

  const commentId = normalizeId(`c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`);
  const path = `activities/${cleanId}/comments/${commentId}`;
  const displayName = sanitizeDisplayName(user.displayName, 'Athlete');
  const avatarUrl = isSafeHttpUrl(user.photoURL);

  try {
    const actSnap = await getDoc(doc(db, 'activities', cleanId));
    if (!actSnap.exists()) throw new Error('Activity not found');

    const batch = writeBatch(db);
    batch.set(doc(db, 'activities', cleanId, 'comments', commentId), {
      commentId,
      userId: user.uid,
      displayName,
      avatarUrl,
      text: trimmed,
      visibility: 'public',
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'activities', cleanId), {
      commentsCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();

    const ownerId = actSnap.data().userId;
    if (ownerId && ownerId !== user.uid) {
      const notifId = normalizeId(`comment_${commentId}`);
      await setDoc(doc(db, 'users', ownerId, 'notifications', notifId), {
        id: notifId,
        recipientId: ownerId,
        type: 'comment',
        fromUserId: user.uid,
        fromDisplayName: displayName,
        fromAvatarUrl: avatarUrl,
        activityId: cleanId,
        activityName: String(actSnap.data().sessionName || 'Workout').slice(0, 100),
        commentText: trimmed.slice(0, 200),
        read: false,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }

    return {
      ok: true,
      comment: {
        commentId,
        userId: user.uid,
        displayName,
        avatarUrl,
        text: trimmed,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchComments(activityId: string): Promise<{ comments: Comment[] }> {
  requireUser();
  const cleanId = normalizeId(activityId);
  const path = `activities/${cleanId}/comments`;
  try {
    const snap = await getDocs(
      query(collection(db, 'activities', cleanId, 'comments'), where('visibility', '==', 'public')),
    );
    const comments: Comment[] = snap.docs.map(d => {
      const data = d.data();
      const createdAt =
        data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString();
      return {
        commentId: data.commentId || d.id,
        userId: data.userId,
        displayName: data.displayName || 'Athlete',
        avatarUrl: data.avatarUrl ?? null,
        text: data.text || '',
        createdAt,
      };
    });
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { comments };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteComment(activityId: string, commentId: string): Promise<{ ok: boolean }> {
  requireUser();
  const cleanAct = normalizeId(activityId);
  const cleanComment = normalizeId(commentId);
  const path = `activities/${cleanAct}/comments/${cleanComment}`;
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'activities', cleanAct, 'comments', cleanComment));
    batch.update(doc(db, 'activities', cleanAct), {
      commentsCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ══════════════════════════════════════════════════════════
// ── Notifications API ──
// ══════════════════════════════════════════════════════════

export interface AppNotification {
  id: string;
  type: 'follow_back' | 'like' | 'comment' | 'app_update';
  fromUserId?: string;
  fromDisplayName?: string;
  fromAvatarUrl?: string | null;
  activityId?: string;
  activityName?: string;
  commentText?: string;
  title?: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

export async function fetchNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const user = requireUser();
  const path = `users/${user.uid}/notifications`;
  try {
    const snap = await getDocs(
      query(collection(db, 'users', user.uid, 'notifications'), where('recipientId', '==', user.uid)),
    );
    const notifications: AppNotification[] = snap.docs.map(d => {
      const data = d.data();
      const createdAt =
        data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString();
      return {
        id: data.id || d.id,
        type: data.type || 'app_update',
        fromUserId: data.fromUserId,
        fromDisplayName: data.fromDisplayName,
        fromAvatarUrl: data.fromAvatarUrl ?? null,
        activityId: data.activityId,
        activityName: data.activityName,
        commentText: data.commentText,
        title: data.title,
        message: data.message,
        createdAt,
        read: Boolean(data.read),
      };
    });
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unreadCount = notifications.filter(n => !n.read).length;
    return { notifications, unreadCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function markNotificationsRead(): Promise<{ ok: boolean; markedRead: number }> {
  const user = requireUser();
  const path = `users/${user.uid}/notifications`;
  try {
    const snap = await getDocs(
      query(collection(db, 'users', user.uid, 'notifications'), where('recipientId', '==', user.uid)),
    );
    const unread = snap.docs.filter(d => !d.data().read);
    if (unread.length === 0) return { ok: true, markedRead: 0 };
    const batch = writeBatch(db);
    unread.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
    return { ok: true, markedRead: unread.length };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ══════════════════════════════════════════════════════════
// ── Template Usage / Sharing API ──
// ══════════════════════════════════════════════════════════

export interface TopTemplate {
  templateId: string;
  templateName: string;
  category: string;
  exercises: any[];
  exerciseCount: number;
  usageCount: number;
  lastUsedAt: string;
  estimatedMinutes: number;
}

export interface SavedTemplate {
  id: string;
  originalTemplateId: string;
  originalOwnerId: string;
  originalOwnerName: string;
  originalOwnerAvatar: string | null;
  templateName: string;
  category: string;
  exercises: any[];
  exerciseCount: number;
  savedAt: string;
}

export async function fetchTopTemplates(userId: string): Promise<{ templates: TopTemplate[] }> {
  const user = requireUser();
  if (userId !== user.uid) return { templates: [] };
  const { templates } = await fetchTemplates();
  return {
    templates: templates.slice(0, 3).map(t => ({
      templateId: t.id,
      templateName: t.name,
      category: t.category,
      exercises: t.exercises,
      exerciseCount: t.exercises.length,
      usageCount: 1,
      lastUsedAt: t.createdAt,
      estimatedMinutes: Math.max(15, t.exercises.length * 8),
    })),
  };
}

export async function fetchUserTemplates(userId: string): Promise<{ templates: TopTemplate[] }> {
  return fetchTopTemplates(userId);
}

export async function saveUserTemplate(
  templateId: string,
  ownerId: string,
): Promise<{ ok: boolean; savedId: string }> {
  const user = requireUser();
  const savedId = normalizeId(`saved_${ownerId}_${templateId}`);
  const path = `users/${user.uid}/savedTemplates/${savedId}`;
  try {
    await setDoc(doc(db, 'users', user.uid, 'savedTemplates', savedId), {
      id: savedId,
      userId: user.uid,
      originalTemplateId: normalizeId(templateId),
      originalOwnerId: normalizeId(ownerId),
      originalOwnerName: 'Athlete',
      originalOwnerAvatar: null,
      templateName: 'Saved Workout',
      category: 'gym',
      exercises: [],
      exerciseCount: 0,
      savedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
    return { ok: true, savedId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchSavedTemplates(): Promise<{ savedTemplates: SavedTemplate[] }> {
  const user = requireUser();
  const path = `users/${user.uid}/savedTemplates`;
  try {
    const snap = await getDocs(
      query(collection(db, 'users', user.uid, 'savedTemplates'), where('userId', '==', user.uid)),
    );
    const savedTemplates: SavedTemplate[] = snap.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        originalTemplateId: data.originalTemplateId || '',
        originalOwnerId: data.originalOwnerId || '',
        originalOwnerName: data.originalOwnerName || 'Athlete',
        originalOwnerAvatar: data.originalOwnerAvatar ?? null,
        templateName: data.templateName || 'Saved Workout',
        category: data.category || 'gym',
        exercises: Array.isArray(data.exercises) ? data.exercises : [],
        exerciseCount: data.exerciseCount || 0,
        savedAt: data.savedAt || new Date().toISOString(),
      };
    });
    return { savedTemplates };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteSavedTemplate(id: string): Promise<{ ok: boolean }> {
  const user = requireUser();
  const cleanId = normalizeId(id);
  const path = `users/${user.uid}/savedTemplates/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'savedTemplates', cleanId));
    return { ok: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ══════════════════════════════════════════════════════════
// ── Workout Media API (Local Cache) ──
// ══════════════════════════════════════════════════════════

export async function uploadWorkoutMedia(
  sessionId: string,
  base64DataUrl: string,
): Promise<{ ok: boolean; url: string }> {
  try {
    localStorage.setItem(`${WORKOUT_MEDIA_PREFIX}${sessionId}`, base64DataUrl);
  } catch {}
  return { ok: true, url: base64DataUrl };
}

export async function fetchWorkoutMedia(sessionId: string): Promise<{ url: string | null }> {
  try {
    return { url: localStorage.getItem(`${WORKOUT_MEDIA_PREFIX}${sessionId}`) };
  } catch {
    return { url: null };
  }
}