import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Download, Check, Copy, X, WifiOff } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../data/usePWAInstall';
import { isNativeAndroid } from '../data/nativeAndroid';

/**
 * In-app Android / Mobile installation card with native one-tap install
 * (via beforeinstallprompt on Android Chrome) and clean guided steps fallback.
 */
export function PWAInstallCard({ compact = false }: { compact?: boolean }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isInstalled || isNativeAndroid()) {
    return null;
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleAction = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = appUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleAction}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left border-b border-black/[0.06] dark:border-white/[0.08]"
        >
          <div className="w-8 h-8 rounded-[10px] bg-[#16A34A]/12 dark:bg-[#8BE649]/15 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[15px] text-[#111317] dark:text-white block font-medium">
              {isInstallable ? 'Install Rep App' : 'Install on Android'}
            </span>
            <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] block truncate">
              Full-screen app with offline workout tracking
            </span>
          </div>
          <span className="px-3 py-1.5 rounded-[10px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[12px] font-semibold whitespace-nowrap shrink-0">
            Install
          </span>
        </button>
      ) : (
        <div className="rounded-[20px] bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[12px] bg-[#16A34A]/12 dark:bg-[#8BE649]/15 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-[#16A34A] dark:text-[#8BE649]" />
            </div>
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold text-[#111317] dark:text-white leading-tight">
                Install Rep app
              </p>
              <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5 leading-snug">
                Full-screen Android app & offline tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAction}
            className="rep-cta-primary rep-cta-sm"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Install</span>
          </button>
        </div>
      )}

      {/* Guided Android / iOS Device Install Modal */}
      <AnimatePresence>
        {showGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-[1101] rounded-[24px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display text-[19px] font-bold text-[#111317] dark:text-white">
                  {isIOS ? 'Install Rep on iPhone' : 'Install Rep on Android'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close install guide"
                  className="w-8 h-8 rounded-[10px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>

              {isIOS ? (
                <ol className="space-y-2.5 text-[13.5px] text-[#3A3D45] dark:text-[#D0D5DD] leading-snug mb-4">
                  <li>1. Open this link in <strong>Safari</strong> on your iPhone.</li>
                  <li>2. Tap the <strong>Share</strong> icon in the bottom toolbar.</li>
                  <li>3. Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                </ol>
              ) : (
                <ol className="space-y-2.5 text-[13.5px] text-[#3A3D45] dark:text-[#D0D5DD] leading-snug mb-4">
                  <li>1. Open Rep in <strong>Chrome</strong> on your Android device.</li>
                  <li>2. Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner.</li>
                  <li>3. Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>) to run Rep full-screen like a native Android app.</li>
                </ol>
              )}

              <div className="flex items-center gap-2 rounded-[12px] bg-[#F4F5F7] dark:bg-[#0D1016] border border-black/[0.06] dark:border-white/[0.08] px-3 py-2.5 mb-4">
                <span className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] truncate flex-1 font-numeric">
                  {appUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-[12.5px] font-semibold text-[#16A34A] dark:text-[#8BE649] flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full h-11 rounded-[13px] bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[14px] font-semibold whitespace-nowrap"
              >
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Subtle offline banner shown only when the device loses internet connection.
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[1050] px-3.5 py-1.5 rounded-[12px] bg-[#111317] text-white text-[12px] font-medium shadow-lg flex items-center gap-2 whitespace-nowrap border border-white/10"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#F59E0B]" />
      Offline mode · Workouts saved locally
    </div>
  );
}
