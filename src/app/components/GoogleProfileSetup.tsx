import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AtSign, AlertCircle, Check, Loader2, ArrowRight, User, LogOut } from 'lucide-react';
import { auth, signOutUser } from '../data/firebase';
import {
  checkUsernameAvailable,
  findAvailableUsername,
  completeGoogleProfile,
} from '../data/api';
import {
  sanitizeUsernameInput,
  validateUsername,
  suggestUsernameFromGoogle,
  sanitizeDisplayName,
} from '../data/authUtils';
import { savePreferencesStatic, clearUserData } from '../data/store';
import { RepLogo } from './RepLogo';

interface GoogleProfileSetupProps {
  onComplete: () => void;
  onSwitchAccount?: () => void;
}

export function GoogleProfileSetup({ onComplete, onSwitchAccount }: GoogleProfileSetupProps) {
  const currentUser = auth.currentUser;
  const googleEmail = currentUser?.email || '';
  const googlePhoto = currentUser?.photoURL || null;

  const [displayName, setDisplayName] = useState(() =>
    sanitizeDisplayName(currentUser?.displayName, ''),
  );
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [suggesting, setSuggesting] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  const usernameCheckTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasEditedUsername = useRef(false);

  // Auto-suggest an available username derived from the user's Google profile
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const base = suggestUsernameFromGoogle(currentUser?.displayName, currentUser?.email);
        const available = await findAvailableUsername(base);
        if (active && !hasEditedUsername.current) {
          setUsername(available);
          setUsernameAvailable(true);
        }
      } catch {
        if (active && !hasEditedUsername.current) {
          const fallback = suggestUsernameFromGoogle(currentUser?.displayName, currentUser?.email);
          setUsername(fallback);
        }
      } finally {
        if (active) setSuggesting(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [currentUser?.displayName, currentUser?.email]);

  // Debounced live username availability check
  useEffect(() => {
    if (suggesting) return;
    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);

    const validation = validateUsername(username);
    if (!validation.valid) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    usernameCheckTimer.current = setTimeout(async () => {
      try {
        const avail = await checkUsernameAvailable(validation.cleaned);
        setUsernameAvailable(avail);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 350);

    return () => {
      if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);
    };
  }, [username, suggesting]);

  const usernameValidation = validateUsername(username);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Choose a valid username.');
      return;
    }
    if (usernameAvailable === false) {
      setError('That username is already taken. Try another.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cleanName = sanitizeDisplayName(displayName, usernameValidation.cleaned);
      const result = await completeGoogleProfile({
        displayName: cleanName,
        username: usernameValidation.cleaned,
        avatarUrl: googlePhoto,
      });

      savePreferencesStatic({
        onboardingComplete: false,
        preferredStyle: null,
        displayName: result.displayName,
      });

      onComplete();
    } catch (err: any) {
      setError(err?.message || 'Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setSwitching(true);
    try {
      clearUserData();
      await signOutUser();
      onSwitchAccount?.();
    } catch {
      setSwitching(false);
    }
  };

  const initial = (displayName || googleEmail || 'A').charAt(0).toUpperCase();

  const inputCls =
    'w-full h-[52px] rounded-[14px] bg-white/8 border border-white/14 pl-12 pr-4 text-[16px] text-white placeholder-white/40 outline-none focus:border-[#34C759] focus:ring-1 focus:ring-[#34C759]/40 transition-all';
  const inputWithRightCls =
    'w-full h-[52px] rounded-[14px] bg-white/8 border border-white/14 pl-12 pr-12 text-[16px] text-white placeholder-white/40 outline-none focus:border-[#34C759] focus:ring-1 focus:ring-[#34C759]/40 transition-all';

  return (
    <main className="h-full min-h-screen min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#0a0a0b] text-white">
      <div className="flex-1 flex flex-col justify-between relative z-10 px-6 py-10 max-w-md w-full mx-auto">
        <div className="flex-1 min-h-[40px]" />

        <div>
          {/* Logo & heading */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-[18px] mb-4">
              <RepLogo size={56} radius={18} />
            </div>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] leading-[1.14] text-white mb-1 text-balance">
              Finish setting up Rep
            </h1>
            <p className="text-[14px] text-white/60 max-w-[290px]">
              Confirm your display name and handle so athletes can find you.
            </p>
          </div>

          {/* Connected Google account card */}
          <div className="rounded-[16px] bg-white/6 border border-white/10 p-3.5 mb-6 flex items-center gap-3">
            {googlePhoto && !avatarError ? (
              <img
                src={googlePhoto}
                alt={displayName || 'Google profile'}
                onError={() => setAvatarError(true)}
                className="w-11 h-11 rounded-full object-cover shrink-0 border border-white/15"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#34C759]/20 border border-[#34C759]/30 flex items-center justify-center text-[16px] font-semibold text-[#34C759] shrink-0">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/50">Signed in with Google</p>
              <p className="text-[14px] font-medium text-white truncate">{googleEmail || 'Google Account'}</p>
            </div>
            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={switching || loading}
              aria-label="Switch Google account"
              className="px-3 py-1.5 rounded-[10px] bg-white/8 hover:bg-white/14 text-[12px] font-medium text-white/80 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{switching ? 'Switching...' : 'Switch'}</span>
            </button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="setup-display-name" className="block text-[12px] font-medium text-white/65 mb-1.5 px-1">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/45" aria-hidden="true" />
                <input
                  id="setup-display-name"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  maxLength={60}
                  autoComplete="name"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="setup-username" className="block text-[12px] font-medium text-white/65 mb-1.5 px-1">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/45" aria-hidden="true" />
                <input
                  id="setup-username"
                  type="text"
                  placeholder={suggesting ? 'Finding an available handle...' : 'username'}
                  value={username}
                  onChange={e => {
                    hasEditedUsername.current = true;
                    setUsername(sanitizeUsernameInput(e.target.value));
                  }}
                  maxLength={20}
                  autoComplete="username"
                  aria-invalid={usernameAvailable === false || (username.length > 0 && !usernameValidation.valid)}
                  className={`${inputWithRightCls} ${
                    usernameAvailable === true && usernameValidation.valid
                      ? '!border-[#34C759]'
                      : usernameAvailable === false
                        ? '!border-[#ff453a]'
                        : ''
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden="true">
                  {suggesting || checkingUsername ? (
                    <Loader2 className="w-4 h-4 text-white/45 animate-spin" />
                  ) : usernameAvailable === true && usernameValidation.valid ? (
                    <Check className="w-[18px] h-[18px] text-[#34C759]" />
                  ) : usernameAvailable === false ? (
                    <AlertCircle className="w-[18px] h-[18px] text-[#ff453a]" />
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between mt-1.5 px-1 min-h-[18px]" aria-live="polite">
                <p className="text-[11px] text-white/50">
                  {username.length > 0 && !usernameValidation.valid
                    ? usernameValidation.error
                    : '3-20 chars: lowercase letters, numbers, dots, underscores.'}
                </p>
                {usernameAvailable === true && usernameValidation.valid && !checkingUsername && (
                  <span className="text-[11px] font-medium text-[#34C759] shrink-0 ml-2">Available</span>
                )}
                {usernameAvailable === false && !checkingUsername && (
                  <span className="text-[11px] font-medium text-[#ff453a] shrink-0 ml-2">Taken</span>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="flex items-start gap-2 px-1 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 text-[#ff453a] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[13px] text-[#ff453a] leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || suggesting || checkingUsername || !usernameValidation.valid || usernameAvailable === false}
              className="w-full h-[50px] rounded-[12px] bg-[#8BE649] hover:bg-[#9AF05B] active:scale-[0.985] text-[#0B0E13] text-[15px] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_18px_rgba(139,230,73,0.22)] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="flex-1 min-h-[24px]" />

        <footer className="pt-4 text-center">
          <p className="text-[11px] text-white/35">Your Google photo and name can be updated anytime in Profile.</p>
        </footer>
      </div>
    </main>
  );
}
