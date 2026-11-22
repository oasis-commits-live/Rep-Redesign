/**
 * Appearance / theme system.
 * Stores the user's preference in localStorage (device-local, not synced)
 * and applies the `.dark` class on `<html>` accordingly.
 */

import { syncNativeStatusBar } from './nativeAndroid';

export type AppearanceMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'forma_appearance';

/** Read the stored appearance mode (defaults to 'light'). */
export function getAppearance(): AppearanceMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'light';
}

/** Persist and apply a new appearance mode. */
export function setAppearance(mode: AppearanceMode): void {
  localStorage.setItem(THEME_KEY, mode);
  applyAppearance(mode);
}

/** Apply the current mode to the DOM (adds/removes `.dark` on <html>) and syncs Android status bar theme-color. */
export function applyAppearance(mode?: AppearanceMode): void {
  const m = mode ?? getAppearance();
  const html = document.documentElement;

  let isDark = false;
  if (m === 'dark') {
    isDark = true;
  } else if (m === 'light') {
    isDark = false;
  } else {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  // Sync Android Chrome / PWA & native Capacitor status bar color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#0B0E13' : '#F6F7F9');
  }
  void syncNativeStatusBar(isDark);
}

/** Start listening for system theme changes (call once on app boot). */
let _listening = false;
export function listenForSystemThemeChanges(): void {
  if (_listening) return;
  _listening = true;

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (getAppearance() === 'system') {
      applyAppearance('system');
    }
  });
}