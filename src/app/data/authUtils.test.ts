import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeUsernameInput,
  validateUsername,
  suggestUsernameFromGoogle,
  buildUsernameCandidate,
  sanitizeDisplayName,
  isSafeHttpUrl,
  mapGoogleAuthError,
  mergeCollectionsById,
  resolveAuthProvider,
  validateEmail,
  getPasswordStrength,
} from './authUtils';

test('sanitizeUsernameInput lowercases, strips invalid chars, and clamps length', () => {
  assert.equal(sanitizeUsernameInput('Alex_Rivera!@# 99'), 'alex_rivera99');
  assert.equal(sanitizeUsernameInput('a'.repeat(30)).length, 20);
});

test('validateUsername accepts valid handles and rejects invalid formats', () => {
  assert.equal(validateUsername('alex.rivera_9').valid, true);
  assert.equal(validateUsername('ab').valid, false);
  assert.equal(validateUsername('a'.repeat(21)).valid, false);
  assert.equal(validateUsername('.alex').valid, false);
  assert.equal(validateUsername('alex.').valid, false);
  assert.equal(validateUsername('alex..rivera').valid, false);
  assert.equal(validateUsername('alex-rivera').valid, false);
});

test('suggestUsernameFromGoogle derives clean handles from names, accented text, and emails', () => {
  assert.equal(suggestUsernameFromGoogle('Alex Rivera', 'alex@gmail.com'), 'alex.rivera');
  assert.equal(suggestUsernameFromGoogle('Renée O’Connor', 'renee@gmail.com'), 'renee.oconnor');
  assert.equal(suggestUsernameFromGoogle('', 'lift.pro@gmail.com'), 'lift.pro');
  assert.equal(suggestUsernameFromGoogle('A', 'b@gmail.com'), 'a_athlete');
  const longSuggestion = suggestUsernameFromGoogle('Christopher Alexander Montgomery', 'c@gmail.com');
  assert.ok(longSuggestion.length <= 20);
  assert.equal(validateUsername(longSuggestion).valid, true);
});

test('buildUsernameCandidate appends suffix while staying within 20 characters', () => {
  assert.equal(buildUsernameCandidate('alex.rivera', 42), 'alex.rivera42');
  const capped = buildUsernameCandidate('abcdefghijklmnopqrst', 123);
  assert.equal(capped.length, 20);
  assert.equal(capped, 'abcdefghijklmnopq123');
});

test('sanitizeDisplayName trims whitespace and falls back cleanly', () => {
  assert.equal(sanitizeDisplayName('  Maya   Lin  '), 'Maya Lin');
  assert.equal(sanitizeDisplayName('   ', 'Runner'), 'Runner');
  assert.equal(sanitizeDisplayName('x'.repeat(80)).length, 60);
});

test('isSafeHttpUrl allows http/https URLs and blocks javascript/data/oversized URLs', () => {
  assert.equal(
    isSafeHttpUrl('https://lh3.googleusercontent.com/a/photo123'),
    'https://lh3.googleusercontent.com/a/photo123',
  );
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), null);
  assert.equal(isSafeHttpUrl('data:image/png;base64,abc'), null);
  assert.equal(isSafeHttpUrl(`https://example.com/${'a'.repeat(2100)}`), null);
});

test('mapGoogleAuthError translates Firebase Auth error codes into structured UX states', () => {
  const closed = mapGoogleAuthError({ code: 'auth/popup-closed-by-user' });
  assert.equal(closed.isCancelled, true);
  assert.equal(closed.isPopupBlocked, false);
  assert.equal(closed.recoverable, true);

  const blocked = mapGoogleAuthError({ code: 'auth/popup-blocked' });
  assert.equal(blocked.isPopupBlocked, true);
  assert.match(blocked.message, /popups/i);

  const network = mapGoogleAuthError({ code: 'auth/network-request-failed' });
  assert.match(network.message, /internet connection/i);

  const unauthDomain = mapGoogleAuthError({ code: 'auth/unauthorized-domain' });
  assert.equal(unauthDomain.recoverable, false);
});

test('mergeCollectionsById preserves unique local and remote records and upgrades completion state', () => {
  const local = [
    { id: 's1', name: 'Push Local', completedAt: '2026-11-20T10:00:00Z' },
    { id: 's2', name: 'Local Only' },
  ];
  const remote = [
    { id: 's1', name: 'Push Remote' },
    { id: 's3', name: 'Remote Only' },
  ];
  const merged = mergeCollectionsById(local, remote);
  assert.equal(merged.length, 3);
  assert.equal(merged.find(x => x.id === 's1')?.completedAt, '2026-11-20T10:00:00Z');
  assert.ok(merged.find(x => x.id === 's2'));
  assert.ok(merged.find(x => x.id === 's3'));
});

test('resolveAuthProvider routes Firebase Google and Supabase email sessions cleanly', () => {
  assert.equal(resolveAuthProvider(true, false), 'firebase');
  assert.equal(resolveAuthProvider(false, true), 'supabase');
  assert.equal(resolveAuthProvider(true, true), 'firebase');
  assert.equal(resolveAuthProvider(false, false), null);
});

test('validateEmail accepts valid addresses and rejects malformed or blank input', () => {
  assert.equal(validateEmail(' Athlete@Example.com ').valid, true);
  assert.equal(validateEmail(' Athlete@Example.com ').cleaned, 'athlete@example.com');
  assert.equal(validateEmail('').valid, false);
  assert.equal(validateEmail('not-an-email').valid, false);
  assert.equal(validateEmail('a@b').valid, false);
});

test('getPasswordStrength enforces 8-char minimum and reports strength tiers', () => {
  assert.equal(getPasswordStrength('').valid, false);
  assert.equal(getPasswordStrength('short').level, 1);
  assert.equal(getPasswordStrength('short').valid, false);
  assert.equal(getPasswordStrength('seven77').level, 2);
  assert.equal(getPasswordStrength('seven77').valid, false);
  assert.equal(getPasswordStrength('abcdefgh').valid, true);
  assert.equal(getPasswordStrength('StrongPass1').level, 3);
  assert.equal(getPasswordStrength('StrongPass1').valid, true);
});
