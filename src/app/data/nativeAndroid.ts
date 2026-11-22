import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

let initialized = false;

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function syncNativeStatusBar(isDark: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({
      color: isDark ? '#0B0E13' : '#F6F7F9',
    });
    // Style.Dark renders light icons (for dark backgrounds); Style.Light renders dark icons (for light backgrounds)
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
  } catch {
    // Gracefully ignore when running on web or unsupported environments
  }
}

export function initNativeAndroid(): void {
  if (initialized || !Capacitor.isNativePlatform()) return;
  initialized = true;

  const isDark = document.documentElement.classList.contains('dark');
  void syncNativeStatusBar(isDark);

  if (Capacitor.getPlatform() === 'android') {
    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && window.location.pathname !== '/') {
        window.history.back();
      } else {
        void CapacitorApp.exitApp();
      }
    });
  }
}
