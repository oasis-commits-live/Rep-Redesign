/**
 * Dual-backend API router for Rep.
 *
 * - Google Sign-In users authenticate with Firebase Auth and persist to Cloud Firestore.
 * - Existing & new Email/OTP/Password users authenticate with Supabase Auth and persist
 *   to the existing Supabase backend so zero existing users or workouts are lost.
 */

import { auth, signOutUser } from './firebase';
import { supabase, getAccessToken, setAccessToken } from './supabase';
import { resolveAuthProvider, type AuthProviderKind } from './authUtils';
import * as firestoreApi from './firestoreApi';
import * as supabaseApi from './supabaseApi';
import type { WorkoutTemplate, WorkoutSession, UserPreferences } from './store';
import type { Exercise } from './exercises';

// Re-export shared domain types
export type {
  UserAccountRecord,
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
} from './firestoreApi';

// Re-export Firebase Google profile setup helpers
export {
  fetchCurrentUserAccount,
  checkUsernameAvailable,
  findAvailableUsername,
  completeGoogleProfile,
} from './firestoreApi';

// ── Active provider detection & unified sign-out ──

export function getActiveAuthProvider(): AuthProviderKind | null {
  return resolveAuthProvider(Boolean(auth.currentUser), Boolean(getAccessToken()));
}

function isFirebaseSession(): boolean {
  return Boolean(auth.currentUser);
}

/**
 * Cleanly sign out of both auth providers so sessions never collide across logins.
 */
export async function signOutAll(): Promise<void> {
  await Promise.allSettled([
    signOutUser(),
    supabase.auth.signOut().catch(() => {}),
  ]);
  setAccessToken(null);
}

// ── Supabase-only legacy/email helpers ──

export async function signUp(email: string, password: string, displayName: string) {
  return supabaseApi.signUp(email, password, displayName);
}

export async function changeEmail(email: string): Promise<{ ok: boolean }> {
  return supabaseApi.changeEmail(email);
}

// ── Preferences ──

export async function fetchPreferences(): Promise<{ preferences: UserPreferences }> {
  return isFirebaseSession() ? firestoreApi.fetchPreferences() : supabaseApi.fetchPreferences();
}

export async function updatePreferences(preferences: UserPreferences): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.updatePreferences(preferences)
    : supabaseApi.updatePreferences(preferences);
}

// ── Templates ──

export async function fetchTemplates(): Promise<{ templates: WorkoutTemplate[] }> {
  return isFirebaseSession() ? firestoreApi.fetchTemplates() : supabaseApi.fetchTemplates();
}

export async function saveTemplateRemote(template: WorkoutTemplate): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.saveTemplateRemote(template)
    : supabaseApi.saveTemplateRemote(template);
}

export async function deleteTemplateRemote(id: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.deleteTemplateRemote(id)
    : supabaseApi.deleteTemplateRemote(id);
}

// ── Sessions ──

export async function fetchSessions(): Promise<{ sessions: WorkoutSession[] }> {
  return isFirebaseSession() ? firestoreApi.fetchSessions() : supabaseApi.fetchSessions();
}

export async function saveSessionRemote(session: WorkoutSession): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.saveSessionRemote(session)
    : supabaseApi.saveSessionRemote(session);
}

// ── Custom Exercises ──

export async function saveCustomExerciseRemote(exercise: Exercise): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.saveCustomExerciseRemote(exercise)
    : supabaseApi.saveCustomExerciseRemote(exercise);
}

export async function deleteCustomExerciseRemote(id: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.deleteCustomExerciseRemote(id)
    : supabaseApi.deleteCustomExerciseRemote(id);
}

// ── Bulk Sync ──

export async function bulkSync(payload: firestoreApi.SyncPayload): Promise<firestoreApi.SyncResult> {
  return isFirebaseSession() ? firestoreApi.bulkSync(payload) : supabaseApi.bulkSync(payload);
}

// ── Profile Avatar ──

export async function uploadAvatar(base64DataUrl: string): Promise<{ ok: boolean; url: string }> {
  return isFirebaseSession()
    ? firestoreApi.uploadAvatar(base64DataUrl)
    : supabaseApi.uploadAvatar(base64DataUrl);
}

export async function fetchAvatarUrl(): Promise<{ url: string | null }> {
  return isFirebaseSession() ? firestoreApi.fetchAvatarUrl() : supabaseApi.fetchAvatarUrl();
}

export async function deleteAvatar(): Promise<{ ok: boolean }> {
  return isFirebaseSession() ? firestoreApi.deleteAvatar() : supabaseApi.deleteAvatar();
}

// ── Exercise Catalog & Exercise Demos (Firebase Firestore catalog packs + GIF enhancement) ──

export async function fetchExerciseCatalog(): Promise<{ exercises: Exercise[] }> {
  return firestoreApi.fetchExerciseCatalog();
}

export async function seedExerciseCatalog(exercises: Exercise[]): Promise<{ ok: boolean; count: number }> {
  return firestoreApi.seedExerciseCatalog(exercises);
}

export async function saveExerciseToCatalog(exercise: Exercise): Promise<{ ok: boolean }> {
  return firestoreApi.saveExerciseToCatalog(exercise);
}

export async function deleteExerciseFromCatalog(id: string): Promise<{ ok: boolean }> {
  return firestoreApi.deleteExerciseFromCatalog(id);
}

export async function fetchExerciseGif(
  name: string,
  refresh = false,
): Promise<firestoreApi.ExerciseGifResult> {
  const localMatch = await firestoreApi.fetchExerciseGif(name, refresh);
  if (refresh) {
    try {
      const remote = await supabaseApi.fetchExerciseGif(name, true);
      if (remote.found && remote.gifUrl) {
        return { ...localMatch, ...remote, demoFrames: localMatch.demoFrames };
      }
    } catch {}
  }
  if (localMatch.found) return localMatch;
  try {
    return await supabaseApi.fetchExerciseGif(name, refresh);
  } catch {
    return localMatch;
  }
}

// ── Account Management ──

export async function resetAccountData(): Promise<{ ok: boolean }> {
  return isFirebaseSession() ? firestoreApi.resetAccountData() : supabaseApi.resetAccountData();
}

export async function deleteAccount(): Promise<{ ok: boolean }> {
  return isFirebaseSession() ? firestoreApi.deleteAccount() : supabaseApi.deleteAccount();
}

// ── Community / Social API ──

export async function fetchMyProfile(): Promise<{ profile: firestoreApi.CommunityProfile }> {
  return isFirebaseSession() ? firestoreApi.fetchMyProfile() : supabaseApi.fetchMyProfile();
}

export async function fetchUserProfile(
  userId: string,
): Promise<{ profile: firestoreApi.CommunityProfile }> {
  return isFirebaseSession()
    ? firestoreApi.fetchUserProfile(userId)
    : supabaseApi.fetchUserProfile(userId);
}

export async function updateCommunityProfile(
  updates: Partial<firestoreApi.CommunityProfile>,
): Promise<{ ok: boolean; profile: firestoreApi.CommunityProfile }> {
  return isFirebaseSession()
    ? firestoreApi.updateCommunityProfile(updates)
    : supabaseApi.updateCommunityProfile(updates);
}

export async function followUser(targetId: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.followUser(targetId)
    : supabaseApi.followUser(targetId);
}

export async function unfollowUser(targetId: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.unfollowUser(targetId)
    : supabaseApi.unfollowUser(targetId);
}

export async function fetchFollowers(
  userId: string,
): Promise<{ followers: firestoreApi.CommunityProfile[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchFollowers(userId)
    : supabaseApi.fetchFollowers(userId);
}

export async function fetchFollowing(
  userId: string,
): Promise<{ following: firestoreApi.CommunityProfile[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchFollowing(userId)
    : supabaseApi.fetchFollowing(userId);
}

export async function postActivity(
  activity: Omit<firestoreApi.ActivityPost, 'userId' | 'displayName' | 'avatarUrl' | 'postedAt'>,
): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.postActivity(activity)
    : supabaseApi.postActivity(activity);
}

export async function fetchCommunityFeed(): Promise<{ activities: firestoreApi.ActivityPost[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchCommunityFeed()
    : supabaseApi.fetchCommunityFeed();
}

export async function fetchActivityDetail(
  activityId: string,
): Promise<{ activity: firestoreApi.ActivityPostDetail }> {
  return isFirebaseSession()
    ? firestoreApi.fetchActivityDetail(activityId)
    : supabaseApi.fetchActivityDetail(activityId);
}

export async function fetchUserActivities(
  userId: string,
): Promise<{ activities: firestoreApi.ActivityPost[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchUserActivities(userId)
    : supabaseApi.fetchUserActivities(userId);
}

export async function searchUsers(
  queryStr: string,
): Promise<{ users: firestoreApi.CommunityProfile[] }> {
  return isFirebaseSession()
    ? firestoreApi.searchUsers(queryStr)
    : supabaseApi.searchUsers(queryStr);
}

export async function discoverUsers(): Promise<{ users: firestoreApi.CommunityProfile[] }> {
  return isFirebaseSession() ? firestoreApi.discoverUsers() : supabaseApi.discoverUsers();
}

export async function likeActivity(activityId: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.likeActivity(activityId)
    : supabaseApi.likeActivity(activityId);
}

export async function unlikeActivity(activityId: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.unlikeActivity(activityId)
    : supabaseApi.unlikeActivity(activityId);
}

export async function addComment(
  activityId: string,
  text: string,
): Promise<{ ok: boolean; comment: firestoreApi.Comment }> {
  return isFirebaseSession()
    ? firestoreApi.addComment(activityId, text)
    : supabaseApi.addComment(activityId, text);
}

export async function fetchComments(
  activityId: string,
): Promise<{ comments: firestoreApi.Comment[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchComments(activityId)
    : supabaseApi.fetchComments(activityId);
}

export async function deleteComment(
  activityId: string,
  commentId: string,
): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.deleteComment(activityId, commentId)
    : supabaseApi.deleteComment(activityId, commentId);
}

// ── Notifications ──

export async function fetchNotifications(): Promise<{
  notifications: firestoreApi.AppNotification[];
  unreadCount: number;
}> {
  return isFirebaseSession()
    ? firestoreApi.fetchNotifications()
    : supabaseApi.fetchNotifications();
}

export async function markNotificationsRead(): Promise<{ ok: boolean; markedRead: number }> {
  return isFirebaseSession()
    ? firestoreApi.markNotificationsRead()
    : supabaseApi.markNotificationsRead();
}

// ── Templates Sharing ──

export async function fetchTopTemplates(
  userId: string,
): Promise<{ templates: firestoreApi.TopTemplate[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchTopTemplates(userId)
    : supabaseApi.fetchTopTemplates(userId);
}

export async function fetchUserTemplates(
  userId: string,
): Promise<{ templates: firestoreApi.TopTemplate[] }> {
  return isFirebaseSession()
    ? firestoreApi.fetchUserTemplates(userId)
    : supabaseApi.fetchUserTemplates(userId);
}

export async function saveUserTemplate(
  templateId: string,
  ownerId: string,
): Promise<{ ok: boolean; savedId: string }> {
  return isFirebaseSession()
    ? firestoreApi.saveUserTemplate(templateId, ownerId)
    : supabaseApi.saveUserTemplate(templateId, ownerId);
}

export async function fetchSavedTemplates(): Promise<{
  savedTemplates: firestoreApi.SavedTemplate[];
}> {
  return isFirebaseSession()
    ? firestoreApi.fetchSavedTemplates()
    : supabaseApi.fetchSavedTemplates();
}

export async function deleteSavedTemplate(id: string): Promise<{ ok: boolean }> {
  return isFirebaseSession()
    ? firestoreApi.deleteSavedTemplate(id)
    : supabaseApi.deleteSavedTemplate(id);
}

// ── Workout Media ──

export async function uploadWorkoutMedia(
  sessionId: string,
  base64DataUrl: string,
): Promise<{ ok: boolean; url: string }> {
  return isFirebaseSession()
    ? firestoreApi.uploadWorkoutMedia(sessionId, base64DataUrl)
    : supabaseApi.uploadWorkoutMedia(sessionId, base64DataUrl);
}

export async function fetchWorkoutMedia(sessionId: string): Promise<{ url: string | null }> {
  return isFirebaseSession()
    ? firestoreApi.fetchWorkoutMedia(sessionId)
    : supabaseApi.fetchWorkoutMedia(sessionId);
}
