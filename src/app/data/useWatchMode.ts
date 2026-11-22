import { useState, useEffect } from 'react';

/**
 * Watch mode detection disabled for Rep mobile app.
 * Always show the full 4-tab experience (Home, Library, Builder, Profile).
 * Re-enable if you need to support Apple Watch by setting a threshold.
 */
const WATCH_MAX_WIDTH = 0; // Disabled - always show full mobile app

export function useIsWatch(): boolean {
  const [isWatch, setIsWatch] = useState(() => window.innerWidth <= WATCH_MAX_WIDTH);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${WATCH_MAX_WIDTH}px)`);
    const handler = (e: MediaQueryListEvent) => setIsWatch(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isWatch;
}