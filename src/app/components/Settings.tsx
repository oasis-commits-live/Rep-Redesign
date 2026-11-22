import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';
import {
  RotateCcw,
  Trash2,
  Share2,
  Mail,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  Check,
  Copy,
  X,
  MessageCircle,
  Smartphone,
  Link,
  ChevronRight,
} from 'lucide-react';
import { auth, signInWithGoogle } from '../data/firebase';
import { supabase } from '../data/supabase';
import { resetAccountData, deleteAccount, changeEmail, signOutAll } from '../data/api';
import { mapGoogleAuthError, validateEmail } from '../data/authUtils';
import { getPreferences, clearUserData } from '../data/store';
import { getAppearance, setAppearance, type AppearanceMode } from '../data/theme';
import { PWAInstallCard } from './PWAInstallPrompt';

// ── Confirmation Modal ──
function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmColor,
  icon: Icon,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  icon: typeof AlertTriangle;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1001] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="bg-white dark:bg-[#171B24] border border-black/10 dark:border-white/10 rounded-[22px] p-6 max-w-[330px] w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${confirmColor}16` }}
              >
                <Icon className="w-6 h-6" style={{ color: confirmColor }} />
              </div>
            </div>
            <h3 className="font-display text-center text-[18px] font-bold text-[#111317] dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-center text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mb-6 leading-[1.5]">
              {message}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="w-full py-3 rounded-[13px] text-white text-[14.5px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: confirmColor, opacity: loading ? 0.7 : 1 }}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{confirmLabel}</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full py-3 rounded-[13px] text-[#5C616B] dark:text-[#9BA3B0] text-[14.5px] font-semibold bg-[#F2F4F7] dark:bg-white/[0.08] whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Share Sheet ──
function ShareSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.origin;
  const shareText = `Check out Rep — the workout tracker I use. ${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rep — Workout Tracker',
          text: 'Check out Rep — the workout tracker I use!',
          url: shareUrl,
        });
      } catch {}
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1002] flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            className="bg-white dark:bg-[#141820] border-t border-black/10 dark:border-white/10 rounded-t-[24px] w-full max-w-lg pb-8 pt-3 px-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-9 h-1 rounded-full bg-black/15 dark:bg-white/20" />
            </div>

            <h3 className="font-display text-[18px] font-bold text-[#111317] dark:text-white mb-1">
              Share Rep
            </h3>
            <p className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0] mb-5">
              Invite friends to train and track together
            </p>

            <div className="flex items-center gap-3 bg-[#F6F7F9] dark:bg-[#0E1116] border border-black/[0.06] dark:border-white/[0.08] rounded-[13px] px-4 py-3 mb-5">
              <Link className="w-4 h-4 text-[#8E95A2] shrink-0" />
              <span className="text-[13.5px] text-[#111317] dark:text-white flex-1 truncate">{shareUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#16A34A] dark:text-[#8BE649] whitespace-nowrap shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex justify-center gap-6 mb-4">
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-13 h-13 rounded-[16px] bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0]">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => window.open(`sms:?body=${encodeURIComponent(shareText)}`, '_blank')}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-13 h-13 rounded-[16px] bg-[#16A34A] flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0]">SMS</span>
              </button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-13 h-13 rounded-[16px] bg-[#007AFF] flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0]">More</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Email Change Modal ──
function EmailChangeModal({
  open,
  currentEmail,
  onClose,
  onSuccess,
}: {
  open: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNewEmail('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateEmail(newEmail);
    if (!check.valid) {
      setError(check.error || 'Please enter a valid email address.');
      return;
    }
    if (check.cleaned === currentEmail.toLowerCase()) {
      setError('New email must be different from your current email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await changeEmail(check.cleaned);
      onSuccess(check.cleaned);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1002] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="bg-white dark:bg-[#171B24] border border-black/10 dark:border-white/10 rounded-[22px] p-6 max-w-[340px] w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-[18px] font-bold text-[#111317] dark:text-white mb-1">
              Change email
            </h3>
            <p className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0] mb-4">
              Current: <span className="text-[#111317] dark:text-white font-medium">{currentEmail || 'Not set'}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="New email address"
                aria-label="New email address"
                disabled={loading}
                className="w-full h-[46px] px-3.5 rounded-[12px] bg-[#F6F7F9] dark:bg-[#0E1116] border border-black/[0.08] dark:border-white/[0.08] text-[14.5px] text-[#111317] dark:text-white placeholder:text-[#8E95A2] focus:outline-none focus:border-[#16A34A] dark:focus:border-[#8BE649]"
              />
              {error && (
                <p role="alert" className="text-[12px] text-[#ff3b30]">
                  {error}
                </p>
              )}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-[13px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[14.5px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  )}
                  <span>Update Email</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-3 rounded-[13px] text-[#5C616B] dark:text-[#9BA3B0] text-[14.5px] font-semibold bg-[#F2F4F7] dark:bg-white/[0.08] whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Settings Drawer Component ──
export function SettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [appearance, setAppearanceState] = useState<AppearanceMode>(getAppearance);
  const [userEmail, setUserEmail] = useState('');
  const [isGoogleAccount, setIsGoogleAccount] = useState(Boolean(auth.currentUser));
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [loading, setLoading] = useState<'reset' | 'delete' | null>(null);

  const dragY = useMotionValue(0);
  const backdropOpacity = useTransform(dragY, [0, 400], [1, 0]);
  const controls = useAnimation();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setAppearanceState(getAppearance());
      const hasFirebase = Boolean(auth.currentUser);
      setIsGoogleAccount(hasFirebase);
      if (hasFirebase) {
        setUserEmail(auth.currentUser?.email || '');
      } else {
        supabase.auth.getUser().then(({ data }) => {
          setUserEmail(data.user?.email || '');
        }).catch(() => {});
      }
      controls.start({ y: 0 });
      dragY.set(0);
    }
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 300) {
      controls.start({ y: '100%', transition: { type: 'spring', stiffness: 400, damping: 35 } });
      setTimeout(onClose, 200);
    } else {
      controls.start({ y: 0, transition: { type: 'spring', stiffness: 400, damping: 35 } });
    }
  }, [controls, onClose]);

  const showToastMsg = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAppearanceChange = (mode: AppearanceMode) => {
    setAppearanceState(mode);
    setAppearance(mode);
  };

  const handleResetData = async () => {
    setLoading('reset');
    try {
      await resetAccountData();
      localStorage.removeItem('forma_templates');
      localStorage.removeItem('forma_sessions');
      localStorage.removeItem('forma_custom_exercises');
      localStorage.removeItem('forma_active_session');
      localStorage.removeItem('forma_avatar_url');
      const prefs = getPreferences();
      localStorage.setItem('forma_prefs', JSON.stringify({
        onboardingComplete: true,
        preferredStyle: prefs.preferredStyle,
        displayName: prefs.displayName,
      }));
      setShowResetConfirm(false);
      showToastMsg('All workout data has been reset', 'success');
    } catch (err: any) {
      showToastMsg(err.message || 'Failed to reset data', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleSwitchGoogleAccount = async () => {
    if (switchingAccount) return;
    setSwitchingAccount(true);
    try {
      clearUserData();
      await signInWithGoogle();
      setUserEmail(auth.currentUser?.email || '');
      showToastMsg('Switched Google account', 'success');
      window.location.reload();
    } catch (err) {
      const mapped = mapGoogleAuthError(err);
      if (!mapped.isCancelled) showToastMsg(mapped.message, 'error');
      setSwitchingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading('delete');
    try {
      await deleteAccount();
      Object.keys(localStorage).filter(k => k.startsWith('forma_')).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('forma_appearance');
      await signOutAll();
      window.location.reload();
    } catch (err: any) {
      showToastMsg(err.message || 'Failed to delete account', 'error');
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      clearUserData();
      await signOutAll();
      window.location.reload();
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  const appearanceModes: { key: AppearanceMode; icon: typeof Sun; label: string }[] = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ opacity: backdropOpacity }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
          />

          <motion.div
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={controls}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y: dragY }}
            className="fixed bottom-0 left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[999] bg-[#F6F7F9] dark:bg-[#0B0E13] rounded-t-[26px] max-h-[90vh] flex flex-col shadow-2xl border-t border-black/10 dark:border-white/10"
          >
            {/* Drag handle + header */}
            <div className="shrink-0 pt-2.5 pb-1 px-6">
              <div className="flex justify-center mb-3">
                <div className="w-9 h-1 rounded-full bg-black/15 dark:bg-white/20" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-[22px] font-bold text-[#111317] dark:text-white">
                  Settings
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close settings"
                  className="w-9 h-9 rounded-[11px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-6 pb-12"
              onPointerDownCapture={e => {
                if (e.currentTarget.scrollTop > 0) e.stopPropagation();
              }}
            >
              {/* Appearance */}
              <div className="mb-5">
                <p className="text-[12.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2.5 px-0.5">
                  Appearance
                </p>
                <div className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[16px] p-1.5 flex gap-1">
                  {appearanceModes.map(mode => {
                    const isActive = appearance === mode.key;
                    const ModeIcon = mode.icon;
                    return (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => handleAppearanceChange(mode.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] transition-all text-[13.5px] whitespace-nowrap ${
                          isActive
                            ? 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] font-semibold'
                            : 'text-[#5C616B] dark:text-[#9BA3B0] font-medium'
                        }`}
                      >
                        <ModeIcon className="w-4 h-4 shrink-0" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Install Android / PWA App */}
              <div className="mb-5">
                <p className="text-[12.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2.5 px-0.5">
                  Install on device
                </p>
                <PWAInstallCard compact />
              </div>

              {/* Account */}
              <div className="mb-5">
                <p className="text-[12.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2.5 px-0.5">
                  Account
                </p>
                <div className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[18px] overflow-hidden">
                  {isGoogleAccount ? (
                    <button
                      type="button"
                      onClick={handleSwitchGoogleAccount}
                      disabled={switchingAccount}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left border-b border-black/[0.06] dark:border-white/[0.08] disabled:opacity-60"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-[#4285F4]/12 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[#4285F4]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14.5px] font-semibold text-[#111317] dark:text-white block">
                          {switchingAccount ? 'Switching Google Account...' : 'Google Account'}
                        </span>
                        <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] truncate block">
                          {userEmail || 'Connected via Google Sign-In'}
                        </span>
                      </div>
                      <span className="text-[12.5px] font-semibold text-[#16A34A] dark:text-[#8BE649] whitespace-nowrap shrink-0">
                        Switch
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left border-b border-black/[0.06] dark:border-white/[0.08]"
                    >
                      <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[#007AFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14.5px] font-semibold text-[#111317] dark:text-white block">
                          Change Email
                        </span>
                        <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] truncate block">
                          {userEmail || 'Update your account email'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8E95A2] shrink-0" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowShareSheet(true)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-[#16A34A]/12 flex items-center justify-center shrink-0">
                      <Share2 className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649]" />
                    </div>
                    <span className="flex-1 text-[14.5px] font-semibold text-[#111317] dark:text-white">
                      Share Rep
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#8E95A2] shrink-0" />
                  </button>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="mb-5">
                <p className="text-[12.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2.5 px-0.5">
                  Data & privacy
                </p>
                <div className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[18px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left border-b border-black/[0.06] dark:border-white/[0.08]"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-[#FF9500]/12 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-4 h-4 text-[#FF9500]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[14.5px] font-semibold text-[#111317] dark:text-white block">
                        Reset All Data
                      </span>
                      <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                        Clear workouts, routines & progress
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-[#FF3B30]/12 flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4 text-[#FF3B30]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[14.5px] font-semibold text-[#FF3B30] block">
                        Delete Account
                      </span>
                      <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                        Permanently remove account & all data
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Sign Out */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[16px] flex items-center justify-center py-3.5 text-[#FF3B30] text-[14.5px] font-semibold whitespace-nowrap"
                >
                  Sign Out
                </button>
              </div>

              <div className="text-center pb-4">
                <p className="text-[12px] text-[#8E95A2]">Rep v1.0 · Make your effort visible.</p>
              </div>
            </div>
          </motion.div>

          <ConfirmModal
            open={showResetConfirm}
            title="Reset all data?"
            message="This will permanently erase all your workouts, routines, and progress. Your account and settings stay intact."
            confirmLabel="Reset Everything"
            confirmColor="#FF9500"
            icon={RotateCcw}
            loading={loading === 'reset'}
            onConfirm={handleResetData}
            onCancel={() => setShowResetConfirm(false)}
          />

          <ConfirmModal
            open={showDeleteConfirm}
            title="Delete account forever?"
            message="This cannot be undone. Your account, workouts, routines, and personal data will be permanently deleted."
            confirmLabel="Delete My Account"
            confirmColor="#FF3B30"
            icon={Trash2}
            loading={loading === 'delete'}
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteConfirm(false)}
          />

          <ShareSheet open={showShareSheet} onClose={() => setShowShareSheet(false)} />

          <EmailChangeModal
            open={showEmailModal}
            currentEmail={userEmail}
            onClose={() => setShowEmailModal(false)}
            onSuccess={updated => {
              setUserEmail(updated);
              showToastMsg('Email updated successfully', 'success');
            }}
          />

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className={`fixed top-14 left-1/2 -translate-x-1/2 z-[1003] px-5 py-2.5 rounded-[12px] shadow-lg ${
                  toast.type === 'success' ? 'bg-[#16A34A] text-white' : 'bg-[#FF3B30] text-white'
                }`}
              >
                <span className="text-[13.5px] font-semibold whitespace-nowrap">{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

export { SettingsDrawer as Settings };