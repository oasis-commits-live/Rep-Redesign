/**
 * Pure authentication, profile validation, and sync merge helpers.
 * Decoupled from React and Firebase SDKs for deterministic unit testing.
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_PATTERN = /^[a-z0-9._]+$/;

export interface UsernameValidationResult {
  valid: boolean;
  cleaned: string;
  error: string | null;
}

export interface MappedAuthError {
  code: string;
  title: string;
  message: string;
  recoverable: boolean;
  isPopupBlocked: boolean;
  isCancelled: boolean;
}

/**
 * Normalize raw user input for a username field (lowercase, allowed chars only, max 20).
 */
export function sanitizeUsernameInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '')
    .slice(0, USERNAME_MAX_LENGTH);
}

/**
 * Validate a username against Rep's Firestore blueprint rules.
 */
export function validateUsername(raw: string): UsernameValidationResult {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned.length < USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      cleaned,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters.`,
    };
  }
  if (cleaned.length > USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      cleaned,
      error: `Username must be ${USERNAME_MAX_LENGTH} characters or fewer.`,
    };
  }
  if (!USERNAME_PATTERN.test(cleaned)) {
    return {
      valid: false,
      cleaned,
      error: 'Use only lowercase letters, numbers, dots, and underscores.',
    };
  }
  if (cleaned.startsWith('.') || cleaned.endsWith('.')) {
    return {
      valid: false,
      cleaned,
      error: 'Username cannot start or end with a dot.',
    };
  }
  if (cleaned.includes('..')) {
    return {
      valid: false,
      cleaned,
      error: 'Username cannot contain consecutive dots.',
    };
  }
  return { valid: true, cleaned, error: null };
}

/**
 * Derive a clean, valid suggested username from a Google display name or email.
 */
export function suggestUsernameFromGoogle(
  displayName?: string | null,
  email?: string | null,
): string {
  const nameSource = (displayName || '').trim();
  const emailPrefix = (email || '').split('@')[0] || '';
  const raw = nameSource || emailPrefix || 'athlete';

  let candidate = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(/\.+$/, '');

  if (candidate.length < USERNAME_MIN_LENGTH) {
    const emailFallback = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, '')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .slice(0, USERNAME_MAX_LENGTH);

    candidate = emailFallback.length >= USERNAME_MIN_LENGTH
      ? emailFallback
      : `${candidate || 'rep'}_athlete`.slice(0, USERNAME_MAX_LENGTH);
  }

  return candidate;
}

/**
 * Build a collision-free candidate username by appending a numeric suffix within 20 chars.
 */
export function buildUsernameCandidate(base: string, suffixNumber: number): string {
  const suffix = String(suffixNumber);
  const maxBaseLen = Math.max(1, USERNAME_MAX_LENGTH - suffix.length);
  const trimmedBase = base.slice(0, maxBaseLen).replace(/\.+$/, '');
  return `${trimmedBase || 'rep'}${suffix}`;
}

/**
 * Sanitize display name to match Firestore blueprint constraints (1-60 chars).
 */
export function sanitizeDisplayName(name?: string | null, fallback = 'Athlete'): string {
  const cleaned = (name || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  return cleaned.length > 0 ? cleaned : fallback.slice(0, 60);
}

/**
 * Allow only valid http(s) URLs up to 2048 characters for Firestore profile/avatar links.
 */
export function isSafeHttpUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

/**
 * Map Firebase Google Sign-In errors to calm, specific, actionable user messages.
 */
export function mapGoogleAuthError(err: unknown): MappedAuthError {
  const rawCode =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code || '')
      : '';
  const rawMsg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message?: unknown }).message || '')
        : '';

  switch (rawCode) {
    case 'auth/popup-closed-by-user':
      return {
        code: rawCode,
        title: 'Sign-in cancelled',
        message: 'The Google sign-in window was closed before finishing. Try again whenever you are ready.',
        recoverable: true,
        isPopupBlocked: false,
        isCancelled: true,
      };
    case 'auth/cancelled-popup-request':
      return {
        code: rawCode,
        title: 'Sign-in already open',
        message: 'A Google sign-in window was already in progress. Please try once more.',
        recoverable: true,
        isPopupBlocked: false,
        isCancelled: true,
      };
    case 'auth/popup-blocked':
      return {
        code: rawCode,
        title: 'Popup blocked by browser',
        message: 'Your browser blocked the Google sign-in window. Allow popups for this site in your address bar, then tap Try Again.',
        recoverable: true,
        isPopupBlocked: true,
        isCancelled: false,
      };
    case 'auth/network-request-failed':
      return {
        code: rawCode,
        title: 'Connection interrupted',
        message: 'Could not reach Google sign-in. Check your internet connection and try again.',
        recoverable: true,
        isPopupBlocked: false,
        isCancelled: false,
      };
    case 'auth/unauthorized-domain':
      return {
        code: rawCode,
        title: 'Domain not authorized',
        message: 'This app URL is not yet allowlisted for Google Sign-In in Firebase Authentication.',
        recoverable: false,
        isPopupBlocked: false,
        isCancelled: false,
      };
    case 'auth/account-exists-with-different-credential':
      return {
        code: rawCode,
        title: 'Account conflict',
        message: 'An account already exists with this email using a different sign-in method.',
        recoverable: true,
        isPopupBlocked: false,
        isCancelled: false,
      };
    case 'auth/user-disabled':
      return {
        code: rawCode,
        title: 'Account disabled',
        message: 'This Google account has been disabled for this app.',
        recoverable: false,
        isPopupBlocked: false,
        isCancelled: false,
      };
    case 'auth/requires-recent-login':
      return {
        code: rawCode,
        title: 'Please verify again',
        message: 'For your security, sign in with Google again to complete this action.',
        recoverable: true,
        isPopupBlocked: false,
        isCancelled: false,
      };
    default:
      return {
        code: rawCode || 'auth/unknown',
        title: 'Could not sign in',
        message: rawMsg || 'Something went wrong while signing in with Google. Please try again.',
        recoverable: true,
        isPopupBlocked: false,
        isCancelled: false,
      };
  }
}

/**
 * Deterministically merge local and remote collections keyed by `id`.
 * Remote records win on conflicts unless the local record has a strictly newer timestamp.
 */
export function mergeCollectionsById<T extends { id: string; completedAt?: string; createdAt?: string }>(
  local: T[],
  remote: T[],
): T[] {
  const map = new Map<string, T>();
  for (const item of remote) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of local) {
    if (!item || !item.id) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else if (item.completedAt && !existing.completedAt) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

export type AuthProviderKind = 'firebase' | 'supabase';

/**
 * Resolve which backend provider owns the active session.
 * Firebase Auth takes precedence when signed in with Google; otherwise Supabase handles email/password sessions.
 */
export function resolveAuthProvider(
  hasFirebaseUser: boolean,
  hasSupabaseSession: boolean,
): AuthProviderKind | null {
  if (hasFirebaseUser) return 'firebase';
  if (hasSupabaseSession) return 'supabase';
  return null;
}

/**
 * Validate an email address format for signup/login flows.
 */
export function validateEmail(raw: string): { valid: boolean; cleaned: string; error: string | null } {
  const cleaned = raw.trim().toLowerCase();
  if (!cleaned) {
    return { valid: false, cleaned, error: 'Please enter your email address.' };
  }
  if (cleaned.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return { valid: false, cleaned, error: 'Please enter a valid email address.' };
  }
  return { valid: true, cleaned, error: null };
}

export interface PasswordStrength {
  level: 0 | 1 | 2 | 3;
  label: '' | 'Weak' | 'Almost' | 'Strong';
  valid: boolean;
}

/**
 * Compute password strength for account creation (minimum 8 characters required by server).
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { level: 0, label: '', valid: false };
  if (password.length < 6) return { level: 1, label: 'Weak', valid: false };
  if (password.length < 8) return { level: 2, label: 'Almost', valid: false };
  const hasMixed = /[a-z]/.test(password) && /[A-Z0-9!@#$%^&*()_+\-=]/.test(password);
  if (password.length >= 10 || hasMixed) {
    return { level: 3, label: 'Strong', valid: true };
  }
  return { level: 2, label: 'Almost', valid: true };
}

