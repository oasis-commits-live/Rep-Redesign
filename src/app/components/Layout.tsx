import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, Compass, Flame, User, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useIsWatch } from '../data/useWatchMode';
import { RepLogo } from './RepLogo';
import { OfflineIndicator } from './PWAInstallPrompt';
import { QuickActionSheet } from './QuickActionSheet';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/library', label: 'Library', icon: Compass },
  { path: '/builder', label: 'Train', icon: Flame },
  { path: '/profile', label: 'Profile', icon: User },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isWatch = useIsWatch();
  const [quickSheetOpen, setQuickSheetOpen] = useState(false);

  const hideNav =
    location.pathname.includes('/live') ||
    location.pathname.includes('/summary') ||
    location.pathname.includes('/builder/new') ||
    location.pathname.includes('/edit') ||
    location.pathname.startsWith('/post/') ||
    location.pathname.startsWith('/athlete/');

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full min-h-screen min-h-[100dvh] bg-[#F3F4F6] dark:bg-[#080A0E] text-[#111317] dark:text-[#F5F7FA] relative overflow-hidden">
      <OfflineIndicator />

      {/* Desktop Top Navigation Bar (md+) — strict 3-zone single-line contract */}
      {!hideNav && !isWatch && (
        <header className="hidden md:block sticky top-0 z-30 bg-white/88 dark:bg-[#0B0E14]/88 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.07]">
          <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Brand wordmark */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus:outline-none"
            >
              <RepLogo size={30} />
              <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-[#111317] dark:text-white leading-none">
                Rep
              </span>
            </button>

            {/* Zone 2: Clean single-line navigation links */}
            <nav className="flex items-center gap-1" aria-label="Primary navigation">
              {navItems.map(item => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`relative px-4 h-10 rounded-[10px] text-[14px] whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'text-[#111317] dark:text-white font-semibold bg-black/[0.055] dark:bg-white/[0.09]'
                        : 'text-[#5C616B] dark:text-[#9BA3B0] font-medium hover:text-[#111317] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Single primary action opens Quick Start sheet */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setQuickSheetOpen(true)}
              className="rep-cta-primary rep-cta-sm"
            >
              <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>Start Training</span>
            </motion.button>
          </div>
        </header>
      )}

      {/* Main Scrollable Content */}
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar ${
          hideNav ? '' : isWatch ? 'pb-11' : 'pb-24 md:pb-10'
        }`}
      >
        <Outlet />
      </main>

      {/* Mobile Native Bottom Tab Bar (< md) — Tactile Obsidian/Light Dock, <= 10% viewport height */}
      {!hideNav && (
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 z-30 ${
            isWatch
              ? 'px-1.5 pb-1.5 pointer-events-none'
              : 'bg-white/94 dark:bg-[#0D1017]/94 backdrop-blur-xl border-t border-black/[0.07] dark:border-white/[0.08]'
          }`}
          style={{
            paddingBottom: isWatch ? '6px' : 'max(8px, env(safe-area-inset-bottom))',
          }}
        >
          <nav
            aria-label="Mobile navigation"
            className={`mx-auto max-w-md flex items-center justify-around ${
              isWatch
                ? 'pointer-events-auto h-9 rounded-[14px] px-1 bg-[#141619]/95 border border-white/10'
                : 'h-[60px] px-2'
            }`}
          >
            {navItems.slice(0, 2).map(item => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                    active
                      ? 'text-[#111317] dark:text-[#8BE649]'
                      : 'text-[#717784] dark:text-[#7E8694]'
                  }`}
                >
                  <Icon className={isWatch ? 'w-3.5 h-3.5' : 'w-[20px] h-[20px]'} strokeWidth={active ? 2.4 : 1.8} />
                  {!isWatch && (
                    <span className={`text-[11px] mt-1 leading-none whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Center Quick-Action Trigger (Opens Start Training Sheet) */}
            {!isWatch && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.91 }}
                onClick={() => setQuickSheetOpen(true)}
                aria-label="Start training or create routine"
                className="w-12 h-11 rounded-[15px] bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#080A0E] flex items-center justify-center shadow-[0_6px_18px_rgba(17,19,23,0.26)] dark:shadow-[0_6px_20px_rgba(139,230,73,0.28)] shrink-0 mx-1"
              >
                <Plus className="w-5 h-5" strokeWidth={2.7} />
              </motion.button>
            )}

            {navItems.slice(2).map(item => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors ${
                    active
                      ? 'text-[#111317] dark:text-[#8BE649]'
                      : 'text-[#717784] dark:text-[#7E8694]'
                  }`}
                >
                  <Icon className={isWatch ? 'w-3.5 h-3.5' : 'w-[20px] h-[20px]'} strokeWidth={active ? 2.4 : 1.8} />
                  {!isWatch && (
                    <span className={`text-[11px] mt-1 leading-none whitespace-nowrap ${active ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Quick Action Sheet — Surfaces Start Workout, Create Routine, Explore Library, Custom Move */}
      <QuickActionSheet open={quickSheetOpen} onClose={() => setQuickSheetOpen(false)} />
    </div>
  );
}