import { useState, useEffect, useCallback } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { router } from './routes';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { GoogleProfileSetup } from './components/GoogleProfileSetup';
import { ErrorBoundary } from './components/ErrorBoundary';
import { attachSyncListeners, fullSync } from './data/sync';
import {
  savePreferencesStatic,
  getPreferences,
  getSessions,
  saveSessionStatic,
  getTemplates,
  saveTemplateStatic,
} from './data/store';
import type { UserPreferences } from './data/store';
import { auth } from './data/firebase';
import { supabase, setAccessToken, serverUrl } from './data/supabase';
import { publicAnonKey, projectId } from '/utils/supabase/info';
import { fetchCurrentUserAccount } from './data/api';
import type { AuthProviderKind } from './data/authUtils';
import { applyAppearance, listenForSystemThemeChanges } from './data/theme';

// Apply theme immediately to prevent flash
applyAppearance();
listenForSystemThemeChanges();

// Passively warm DNS/TLS for Supabase host so existing email/OTP auth requests are fast
fetch(`https://${projectId}.supabase.co/auth/v1/settings`, {
  headers: { apikey: publicAnonKey },
}).catch(() => {});

// Global unhandledrejection listener
window.addEventListener('unhandledrejection', (event) => {
  console.log('[App] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

type AppState = 'loading' | 'auth' | 'google-profile' | 'onboarding' | 'syncing' | 'ready';

function getOnboardingState(): boolean {
  try {
    const raw = localStorage.getItem('forma_prefs');
    if (raw) {
      const prefs = JSON.parse(raw);
      return prefs.onboardingComplete === true;
    }
  } catch {}
  return false;
}

function getPreviewMode(): 'onboarding' | 'app' | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('preview');
    if (mode === 'onboarding' || mode === 'app') return mode;
  } catch {}
  return null;
}

function seedPreviewWorkoutDataIfEmpty() {
  if (getTemplates().length === 0) {
    saveTemplateStatic({
      id: 'preview-upper',
      name: 'Upper Power Hypertrophy',
      category: 'gym',
      createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
      exercises: [
        { exerciseId: 'g1', exerciseName: 'Barbell Bench Press', sets: 4, targetReps: 8, weight: 185, restSeconds: 90 },
        { exerciseId: 'g9', exerciseName: 'Barbell Bent Over Row', sets: 4, targetReps: 8, weight: 165, restSeconds: 90 },
        { exerciseId: 'g10', exerciseName: 'Overhead Press', sets: 3, targetReps: 10, weight: 115, restSeconds: 75 },
        { exerciseId: 'g13', exerciseName: 'Barbell Bicep Curl', sets: 3, targetReps: 12, weight: 75, restSeconds: 60 },
      ],
    });
    saveTemplateStatic({
      id: 'preview-cali',
      name: 'Rings & Core Control',
      category: 'calisthenics',
      createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
      exercises: [
        { exerciseId: 'c1', exerciseName: 'Pull-Ups', sets: 4, targetReps: 10, restSeconds: 75 },
        { exerciseId: 'c11', exerciseName: 'Bodyweight Dips', sets: 4, targetReps: 12, restSeconds: 75 },
        { exerciseId: 'c7', exerciseName: 'L-Sit Hold', sets: 3, targetReps: 30, restSeconds: 60, isTimeBased: true },
      ],
    });
  }
  if (getSessions().length === 0) {
    const end = new Date();
    const start = new Date(end.getTime() - 48 * 60_000);
    saveSessionStatic({
      id: 'preview-session-1',
      templateId: 'preview-upper',
      name: 'Upper Power Hypertrophy',
      category: 'gym',
      startedAt: start.toISOString(),
      completedAt: end.toISOString(),
      exercises: [
        {
          exerciseId: 'g1',
          exerciseName: 'Barbell Bench Press',
          sets: [
            { setNumber: 1, reps: 8, weight: 185, completed: true },
            { setNumber: 2, reps: 8, weight: 195, completed: true },
            { setNumber: 3, reps: 6, weight: 205, completed: true },
            { setNumber: 4, reps: 6, weight: 205, completed: true },
          ],
        },
        {
          exerciseId: 'g9',
          exerciseName: 'Barbell Bent Over Row',
          sets: [
            { setNumber: 1, reps: 10, weight: 155, completed: true },
            { setNumber: 2, reps: 8, weight: 165, completed: true },
            { setNumber: 3, reps: 8, weight: 175, completed: true },
            { setNumber: 4, reps: 8, weight: 175, completed: true },
          ],
        },
        {
          exerciseId: 'g10',
          exerciseName: 'Overhead Press',
          sets: [
            { setNumber: 1, reps: 10, weight: 115, completed: true },
            { setNumber: 2, reps: 9, weight: 115, completed: true },
            { setNumber: 3, reps: 8, weight: 120, completed: true },
          ],
        },
        {
          exerciseId: 'g11',
          exerciseName: 'Dumbbell Lateral Raise',
          sets: [
            { setNumber: 1, reps: 15, weight: 25, completed: true },
            { setNumber: 2, reps: 14, weight: 25, completed: true },
            { setNumber: 3, reps: 12, weight: 30, completed: true },
          ],
        },
        {
          exerciseId: 'g14',
          exerciseName: 'Tricep Rope Pushdown',
          sets: [
            { setNumber: 1, reps: 12, weight: 65, completed: true },
            { setNumber: 2, reps: 12, weight: 70, completed: true },
            { setNumber: 3, reps: 10, weight: 75, completed: true },
          ],
        },
      ],
    });
  }
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [syncSkipped, setSyncSkipped] = useState(false);

  const syncInBackground = useCallback(async () => {
    try {
      await Promise.race([
        fullSync(),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 12000)),
      ]);
    } catch (e) {
      console.log('[App] Background sync failed (non-fatal):', e);
    }
  }, []);

  const hydrateFirebaseSession = useCallback(
    async (user: User) => {
      try {
        const account = await fetchCurrentUserAccount();

        if (!account || !account.username) {
          setAppState('google-profile');
          return;
        }

        const existing = getPreferences();
        savePreferencesStatic({
          ...existing,
          displayName: account.displayName || user.displayName || existing.displayName || 'Athlete',
          onboardingComplete: account.onboardingComplete === true,
          preferredStyle: account.preferredStyle ?? existing.preferredStyle ?? null,
          workoutFrequency: account.workoutFrequency ?? existing.workoutFrequency,
          heightCm: account.heightCm ?? existing.heightCm,
          weightKg: account.weightKg ?? existing.weightKg,
          goal: account.goal ?? existing.goal,
        });

        const avatar = account.avatarUrl || user.photoURL;
        if (avatar) {
          try {
            if (!localStorage.getItem('forma_avatar_url')) {
              localStorage.setItem('forma_avatar_url', avatar);
            }
          } catch {}
        }

        if (account.onboardingComplete) {
          setAppState('ready');
          syncInBackground();
        } else {
          setAppState('onboarding');
        }
      } catch (e) {
        console.log('[App] Failed to hydrate Firebase user account:', e);
        const localPrefs = getPreferences();
        if (localPrefs.onboardingComplete) {
          setAppState('ready');
          syncInBackground();
        } else {
          setAppState('google-profile');
        }
      }
    },
    [syncInBackground],
  );

  const hydrateSupabaseSession = useCallback(
    async (accessToken: string) => {
      setAccessToken(accessToken);

      if (getOnboardingState()) {
        setAppState('ready');
        syncInBackground();
        return;
      }

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
          const res = await fetch(`${serverUrl}/preferences`, {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'X-User-Token': accessToken,
            },
            signal: controller.signal,
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.preferences?.onboardingComplete === true) {
              const existing = getPreferences();
              savePreferencesStatic({
                ...existing,
                ...data.preferences,
                onboardingComplete: true,
              });
              setAppState('ready');
              syncInBackground();
              return;
            }
          }
        } finally {
          clearTimeout(timer);
        }
      } catch (e) {
        console.log('[App] Remote Supabase preferences check skipped:', e);
      }

      setAppState('onboarding');
    },
    [syncInBackground],
  );

  useEffect(() => {
    attachSyncListeners();
    const previewMode = getPreviewMode();
    if (previewMode === 'onboarding') {
      setAppState('onboarding');
      return;
    }
    if (previewMode === 'app') {
      seedPreviewWorkoutDataIfEmpty();
      const existing = getPreferences();
      if (!existing.onboardingComplete) {
        savePreferencesStatic({
          ...existing,
          displayName: existing.displayName || 'Alex Mercer',
          preferredStyle: existing.preferredStyle || 'gym',
          workoutFrequency: existing.workoutFrequency || '3-4',
          goal: existing.goal || 'strength',
          onboardingComplete: true,
        });
      }
      setAppState('ready');
      return;
    }

    let cancelled = false;

    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;

      if (firebaseUser) {
        setAppState('loading');
        await hydrateFirebaseSession(firebaseUser);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session?.access_token) {
          await hydrateSupabaseSession(data.session.access_token);
          return;
        }
      } catch (e) {
        console.log('[App] Supabase session check error:', e);
      }

      if (!cancelled) {
        setAppState('auth');
      }
    });

    const { data: supabaseSub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !auth.currentUser) {
        setAccessToken(null);
        setAppState('auth');
      }
    });

    return () => {
      cancelled = true;
      unsubscribeFirebase();
      supabaseSub.subscription.unsubscribe();
    };
  }, [hydrateFirebaseSession, hydrateSupabaseSession]);

  const handleAuthenticated = async (provider: AuthProviderKind) => {
    if (provider === 'firebase') {
      return;
    }

    setAppState('loading');
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      await hydrateSupabaseSession(data.session.access_token);
    } else if (getOnboardingState()) {
      setAppState('ready');
      syncInBackground();
    } else {
      setAppState('onboarding');
    }
  };

  const handleGoogleProfileComplete = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (onboardingPrefs: Partial<UserPreferences>) => {
    const existing = getPreferences();
    const displayName =
      existing.displayName && existing.displayName.trim().length > 0
        ? existing.displayName
        : auth.currentUser?.displayName || 'Athlete';

    const prefs: UserPreferences = {
      ...existing,
      ...onboardingPrefs,
      onboardingComplete: true,
      displayName,
    };
    savePreferencesStatic(prefs);
    try {
      localStorage.setItem('rep_walkthrough_seen', 'true');
    } catch {}
    syncInBackground();
    setAppState('ready');
  };

  let screen: React.ReactNode;

  if (appState === 'loading') {
    screen = (
      <div
        className="h-full min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-[#F5F6F8] dark:bg-[#0B0E13]"
        role="status"
        aria-label="Loading Rep"
      >
        <div className="w-16 h-16 rounded-[20px] bg-[#141619] dark:bg-[#9FE855] flex items-center justify-center shadow-lg">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#9FE855] dark:text-[#0B0E13]"
            aria-hidden="true"
          >
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
        </div>
      </div>
    );
  } else if (appState === 'auth') {
    screen = <AuthScreen onAuthenticated={handleAuthenticated} />;
  } else if (appState === 'google-profile') {
    screen = (
      <GoogleProfileSetup
        onComplete={handleGoogleProfileComplete}
        onSwitchAccount={() => setAppState('auth')}
      />
    );
  } else if (appState === 'onboarding') {
    screen = <Onboarding onComplete={handleOnboardingComplete} />;
  } else if (appState === 'syncing') {
    screen = (
      <div className="h-full min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-[#F5F6F8] dark:bg-[#0B0E13]">
        <p className="text-[15px] text-[#63666F] dark:text-[#9BA3B0] mb-4">Syncing your workouts...</p>
        {!syncSkipped && (
          <button
            type="button"
            onClick={() => {
              setSyncSkipped(true);
              setAppState('ready');
            }}
            className="text-[13px] font-semibold text-[#34C759]"
          >
            Skip & Continue
          </button>
        )}
      </div>
    );
  } else {
    screen = (
      <>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#141619',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 500,
              padding: '12px 16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.22)',
            },
          }}
        />
        <RouterProvider router={router} />
      </>
    );
  }

  return <ErrorBoundary>{screen}</ErrorBoundary>;
}