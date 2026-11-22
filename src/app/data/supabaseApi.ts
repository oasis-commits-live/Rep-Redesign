import { serverUrl, getAuthHeaders, supabase, setAccessToken } from './supabase';
import { publicAnonKey } from '/utils/supabase/info';
import type { WorkoutTemplate, WorkoutSession, UserPreferences } from './store';
import type { Exercise } from './exercises';
import type {
  SyncPayload,
  SyncResult,
  ExerciseGifResult,
  CommunityProfile,
  ActivityPost,
  ActivityPostDetail,
  Comment,
  AppNotification,
  TopTemplate,
  SavedTemplate,
} from './api';

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 600;
const FETCH_TIMEOUT_MS = 8000;
const GIF_FETCH_TIMEOUT_MS = 15000;

function isNetworkError(err: unknown): boolean {
  if (
    err instanceof TypeError &&
    /failed to fetch|networkerror|network request failed|load failed/i.test((err as TypeError).message)
  ) {
    return true;
  }
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = getAuthHeaders();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      let res = await safeFetch(`${serverUrl}${path}`, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      if (res.status === 401) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshed?.session?.access_token) {
          const body = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(body.error || body.message || `Auth failed: ${res.status}`);
        }
        setAccessToken(refreshed.session.access_token);
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
          'X-User-Token': refreshed.session.access_token,
        };
        res = await safeFetch(`${serverUrl}${path}`, { ...options, headers: retryHeaders });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || body.message || `API request failed: ${res.status}`);
      }

      return res.json();
    } catch (err) {
      lastError = err;
      if (isNetworkError(err) && attempt < MAX_RETRIES) {
        const delayMs = RETRY_BASE_MS * Math.pow(3, attempt);
        await sleep(delayMs);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function signUp(email: string, password: string, displayName: string) {
  return apiFetch<{ user: { id: string; email: string } }>('/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function fetchPreferences() {
  return apiFetch<{ preferences: UserPreferences }>('/preferences');
}

export async function updatePreferences(preferences: UserPreferences) {
  return apiFetch<{ ok: boolean }>('/preferences', {
    method: 'PUT',
    body: JSON.stringify({ preferences }),
  });
}

export async function fetchTemplates() {
  return apiFetch<{ templates: WorkoutTemplate[] }>('/templates');
}

export async function saveTemplateRemote(template: WorkoutTemplate) {
  return apiFetch<{ ok: boolean }>('/templates', {
    method: 'POST',
    body: JSON.stringify({ template }),
  });
}

export async function deleteTemplateRemote(id: string) {
  return apiFetch<{ ok: boolean }>(`/templates/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchSessions() {
  return apiFetch<{ sessions: WorkoutSession[] }>('/sessions');
}

export async function saveSessionRemote(session: WorkoutSession) {
  return apiFetch<{ ok: boolean }>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ session }),
  });
}

export async function saveCustomExerciseRemote(exercise: Exercise) {
  return apiFetch<{ ok: boolean }>('/custom-exercises', {
    method: 'POST',
    body: JSON.stringify({ exercise }),
  });
}

export async function deleteCustomExerciseRemote(id: string) {
  return apiFetch<{ ok: boolean }>(`/custom-exercises/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkSync(payload: SyncPayload): Promise<SyncResult> {
  return apiFetch<SyncResult>('/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(base64DataUrl: string): Promise<{ ok: boolean; url: string }> {
  return apiFetch<{ ok: boolean; url: string }>('/avatar', {
    method: 'POST',
    body: JSON.stringify({ image: base64DataUrl }),
  });
}

export async function fetchAvatarUrl(): Promise<{ url: string | null }> {
  return apiFetch<{ url: string | null }>('/avatar');
}

export async function deleteAvatar(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/avatar', { method: 'DELETE' });
}

export async function fetchExerciseCatalog(): Promise<{ exercises: Exercise[] }> {
  const res = await safeFetch(`${serverUrl}/exercises`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Server error: ${res.status}`);
  return body as { exercises: Exercise[] };
}

export async function seedExerciseCatalog(exercises: Exercise[]): Promise<{ ok: boolean; count: number }> {
  const res = await safeFetch(`${serverUrl}/exercises/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ exercises }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Server error: ${res.status}`);
  return body as { ok: boolean; count: number };
}

export async function saveExerciseToCatalog(exercise: Exercise): Promise<{ ok: boolean }> {
  const res = await safeFetch(`${serverUrl}/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ exercise }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Server error: ${res.status}`);
  return body as { ok: boolean };
}

export async function deleteExerciseFromCatalog(id: string): Promise<{ ok: boolean }> {
  const res = await safeFetch(`${serverUrl}/exercises/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Server error: ${res.status}`);
  return body as { ok: boolean };
}

export async function fetchExerciseGif(name: string, refresh = false): Promise<ExerciseGifResult> {
  const url = `${serverUrl}/exercise-gif?name=${encodeURIComponent(name)}${refresh ? '&refresh=1' : ''}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GIF_FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Server error: ${res.status}`);
  if (!body) throw new Error('Empty response from exercise-gif endpoint');
  return body as ExerciseGifResult;
}

export async function resetAccountData(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/account/reset-data', { method: 'POST' });
}

export async function deleteAccount(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/account', { method: 'DELETE' });
}

export async function changeEmail(email: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/account/email', {
    method: 'PUT',
    body: JSON.stringify({ email }),
  });
}

export async function fetchMyProfile(): Promise<{ profile: CommunityProfile }> {
  return apiFetch<{ profile: CommunityProfile }>('/community/profile/me');
}

export async function fetchUserProfile(userId: string): Promise<{ profile: CommunityProfile }> {
  return apiFetch<{ profile: CommunityProfile }>(`/community/profile/${userId}`);
}

export async function updateCommunityProfile(
  updates: Partial<CommunityProfile>,
): Promise<{ ok: boolean; profile: CommunityProfile }> {
  return apiFetch<{ ok: boolean; profile: CommunityProfile }>('/community/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function followUser(targetId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/community/follow/${targetId}`, { method: 'POST' });
}

export async function unfollowUser(targetId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/community/follow/${targetId}`, { method: 'DELETE' });
}

export async function fetchFollowers(userId: string): Promise<{ followers: CommunityProfile[] }> {
  return apiFetch<{ followers: CommunityProfile[] }>(`/community/followers/${userId}`);
}

export async function fetchFollowing(userId: string): Promise<{ following: CommunityProfile[] }> {
  return apiFetch<{ following: CommunityProfile[] }>(`/community/following/${userId}`);
}

export async function postActivity(
  activity: Omit<ActivityPost, 'userId' | 'displayName' | 'avatarUrl' | 'postedAt'>,
): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/community/activity', {
    method: 'POST',
    body: JSON.stringify({ activity }),
  });
}

export async function fetchCommunityFeed(): Promise<{ activities: ActivityPost[] }> {
  return apiFetch<{ activities: ActivityPost[] }>('/community/feed');
}

export async function fetchActivityDetail(activityId: string): Promise<{ activity: ActivityPostDetail }> {
  return apiFetch<{ activity: ActivityPostDetail }>(`/community/activity/${activityId}`);
}

export async function fetchUserActivities(userId: string): Promise<{ activities: ActivityPost[] }> {
  return apiFetch<{ activities: ActivityPost[] }>(`/community/activities/${userId}`);
}

export async function searchUsers(queryStr: string): Promise<{ users: CommunityProfile[] }> {
  return apiFetch<{ users: CommunityProfile[] }>(`/community/search?q=${encodeURIComponent(queryStr)}`);
}

export async function discoverUsers(): Promise<{ users: CommunityProfile[] }> {
  return apiFetch<{ users: CommunityProfile[] }>('/community/discover');
}

export async function likeActivity(activityId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/community/activity/${activityId}/like`, { method: 'POST' });
}

export async function unlikeActivity(activityId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/community/activity/${activityId}/like`, { method: 'DELETE' });
}

export async function addComment(activityId: string, text: string): Promise<{ ok: boolean; comment: Comment }> {
  return apiFetch<{ ok: boolean; comment: Comment }>(`/community/activity/${activityId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function fetchComments(activityId: string): Promise<{ comments: Comment[] }> {
  return apiFetch<{ comments: Comment[] }>(`/community/activity/${activityId}/comments`);
}

export async function deleteComment(activityId: string, commentId: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/community/activity/${activityId}/comment/${commentId}`, {
    method: 'DELETE',
  });
}

export async function fetchNotifications(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  return apiFetch<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
}

export async function markNotificationsRead(): Promise<{ ok: boolean; markedRead: number }> {
  return apiFetch<{ ok: boolean; markedRead: number }>('/notifications/read', { method: 'PUT' });
}

export async function fetchTopTemplates(userId: string): Promise<{ templates: TopTemplate[] }> {
  return apiFetch<{ templates: TopTemplate[] }>(`/community/profile/${userId}/top-templates`);
}

export async function fetchUserTemplates(userId: string): Promise<{ templates: TopTemplate[] }> {
  return apiFetch<{ templates: TopTemplate[] }>(`/community/profile/${userId}/templates`);
}

export async function saveUserTemplate(templateId: string, ownerId: string): Promise<{ ok: boolean; savedId: string }> {
  return apiFetch<{ ok: boolean; savedId: string }>('/community/templates/save', {
    method: 'POST',
    body: JSON.stringify({ templateId, ownerId }),
  });
}

export async function fetchSavedTemplates(): Promise<{ savedTemplates: SavedTemplate[] }> {
  return apiFetch<{ savedTemplates: SavedTemplate[] }>('/community/saved-templates');
}

export async function deleteSavedTemplate(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/community/saved-templates/${id}`, { method: 'DELETE' });
}

export async function uploadWorkoutMedia(sessionId: string, base64DataUrl: string): Promise<{ ok: boolean; url: string }> {
  return apiFetch<{ ok: boolean; url: string }>('/workout-media', {
    method: 'POST',
    body: JSON.stringify({ sessionId, image: base64DataUrl }),
  });
}

export async function fetchWorkoutMedia(sessionId: string): Promise<{ url: string | null }> {
  return apiFetch<{ url: string | null }>(`/workout-media/${sessionId}`);
}
