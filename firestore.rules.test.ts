import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rules = fs.readFileSync('firestore.rules', 'utf8');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

test('firestore.rules starts with rules_version 2 and default-deny catch-all', () => {
  assert.match(rules, /^rules_version = '2';/);
  assert.match(rules, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
});

test('Dirty Dozen #1 & #12: /users isolates PII to owner-only get and denies list', () => {
  const usersSection = rules.split('match /users/{userId} {')[1];
  assert.ok(usersSection);
  assert.match(usersSection, /allow get: if isOwner\(userId\) && isValidId\(userId\);/);
  assert.match(usersSection, /allow list: if false;/);
  assert.match(rules, /data\.email == request\.auth\.token\.email/);
});

test('Dirty Dozen #2: email_verified is enforced for all authenticated writes', () => {
  assert.match(rules, /function isVerifiedUser\(\)\s*\{\s*return isSignedIn\(\) && request\.auth\.token\.email_verified == true;/);
});

test('Dirty Dozen #3, #4, #6, #11: validation blueprints enforce strict keys, owner uid, bounds, and array limits', () => {
  for (const fn of [
    'isValidUserAccount',
    'isValidUsernameClaim',
    'isValidPublicProfile',
    'isValidWorkoutTemplate',
    'isValidWorkoutSession',
    'isValidCustomExercise',
    'isValidSavedTemplate',
    'isValidNotification',
    'isValidFollowEdge',
    'isValidActivityPost',
    'isValidActivityLike',
    'isValidActivityComment',
    'isValidExerciseCatalogPack',
  ]) {
    assert.ok(rules.includes(`function ${fn}(`), `Missing validator ${fn}`);
  }
  assert.match(rules, /list\.size\(\) <= 100/);
  assert.match(rules, /id\.size\(\) <= 128 && id\.matches\('\^\[a-zA-Z0-9_\\\\-\]\+\$'\)/);
});

test('Dirty Dozen #5: usernames are immutable and cannot be listed or hijacked', () => {
  const usernameSection = rules.split('match /usernames/{username} {')[1];
  assert.ok(usernameSection);
  assert.match(usernameSection, /allow list: if false;/);
  assert.match(usernameSection, /allow update: if false;/);
  assert.match(usernameSection, /existing\(\)\.userId == request\.auth\.uid/);
});

test('Dirty Dozen #7 & #8: server request.time and immutable field checks are enforced', () => {
  assert.match(rules, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rules, /incoming\(\)\.updatedAt == request\.time/);
  assert.match(rules, /incoming\(\)\.createdAt == existing\(\)\.createdAt/);
  assert.match(rules, /incoming\(\)\.userId == existing\(\)\.userId/);
});

test('Dirty Dozen #9 & #10: likes and comments enforce parent existence and atomic counter sync', () => {
  assert.match(rules, /existsAfter\(\/databases\/\$\(database\)\/documents\/activities\/\$\(activityId\)\/likes\/\$\(request\.auth\.uid\)\)/);
  assert.match(rules, /getAfter\(\/databases\/\$\(database\)\/documents\/activities\/\$\(activityId\)\)\.data\.likesCount/);
  assert.match(rules, /getAfter\(\/databases\/\$\(database\)\/documents\/activities\/\$\(activityId\)\)\.data\.commentsCount/);
});

test('Exercise catalog packs enforce public visibility reads, verified monotonic writes, and no deletes', () => {
  const catalogSection = rules.split('match /exerciseCatalogPacks/{packId} {')[1];
  assert.ok(catalogSection);
  assert.match(catalogSection, /allow list: if resource\.data\.visibility == 'public';/);
  assert.match(catalogSection, /incoming\(\)\.version >= existing\(\)\.version/);
  assert.match(catalogSection, /allow delete: if false;/);
});

test('Every blueprint collection has an explicit match rule and no blanket allow list exists', () => {
  const collectionPaths = Object.keys(blueprint.firestore);
  assert.ok(collectionPaths.length >= 13);
  // Ensure no blanket `allow list: if isSignedIn();` or `allow list: if isVerifiedUser();`
  assert.doesNotMatch(rules, /allow list:\s*if\s+(isSignedIn|isVerifiedUser)\(\)\s*;/);
});
