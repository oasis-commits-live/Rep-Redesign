import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { signInWithGoogle, signOutUser } from '../data/firebase';
import { supabase, serverUrl, setAccessToken } from '../data/supabase';
import { publicAnonKey, projectId } from '/utils/supabase/info';
import { savePreferencesStatic } from '../data/store';
import {
  getPasswordStrength,
  mapGoogleAuthError,
  sanitizeUsernameInput,
  validateEmail,
  validateUsername,
  type AuthProviderKind,
  type MappedAuthError,
} from '../data/authUtils';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RepLogo } from './RepLogo';

interface AuthScreenProps {
  onAuthenticated?: (provider: AuthProviderKind) => void;
}

type AuthMode = 'signup-email' | 'signup-otp' | 'signup-profile' | 'login';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1676655079738-af54dfd6318e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHdvbWFuJTIwd2VpZ2h0bGlmdGluZyUyMGd5bSUyMGRhcmt8ZW58MXx8fHwxNzcyMTkwNTEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

const AUTH_REQUEST_TIMEOUT_MS = 18000;

async function fetchJsonWithTimeout<T>(
  url: string,
  options: RequestInit,
  timeoutMs = AUTH_REQUEST_TIMEOUT_MS,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

async function signInWithSupabasePassword(email: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const tokenUrl = `https://${projectId}.supabase.co/auth/v1/token?grant_type=password`;
  const { ok, data } = await fetchJsonWithTimeout<{
    access_token?: string;
    refresh_token?: string;
    error_description?: string;
    msg?: string;
    error?: string;
  }>(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: publicAnonKey,
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!ok || !data?.access_token || !data?.refresh_token) {
    const rawMsg = data?.error_description || data?.msg || data?.error || '';
    if (/invalid login credentials/i.test(rawMsg)) {
      throw new Error('Incorrect password. Please try again.');
    }
    throw new Error(rawMsg || 'Could not sign in. Please check your credentials and try again.');
  }

  setAccessToken(data.access_token);
  await supabase.auth
    .setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    })
    .catch(() => {});

  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('signup-email');
  const [bgLoaded, setBgLoaded] = useState(false);

  // Email/OTP/Password state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpEmailSent, setOtpEmailSent] = useState(true);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Profile setup state (signup step 3)
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameHint, setUsernameHint] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Action & feedback states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestSignIn, setSuggestSignIn] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleFeedback, setGoogleFeedback] = useState<MappedAuthError | null>(null);

  const mountedRef = useRef(true);
  const checkSeqRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    const img = new Image();
    img.onload = () => {
      if (mountedRef.current) setBgLoaded(true);
    };
    img.src = BG_IMAGE;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Resend OTP cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Debounced live username availability check for signup step 3
  useEffect(() => {
    if (mode !== 'signup-profile') return;
    if (!username) {
      setUsernameStatus('idle');
      setUsernameHint('');
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      setUsernameStatus('invalid');
      setUsernameHint(validation.error || 'Invalid username');
      return;
    }

    const seq = ++checkSeqRef.current;
    setUsernameStatus('checking');
    setUsernameHint('Checking availability...');

    const timer = setTimeout(async () => {
      try {
        const { ok, data } = await fetchJsonWithTimeout<{ available?: boolean }>(
          `${serverUrl}/auth/check-username/${encodeURIComponent(validation.cleaned)}`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` } },
          8000,
        );
        if (!mountedRef.current || seq !== checkSeqRef.current) return;
        if (ok && data?.available) {
          setUsernameStatus('available');
          setUsernameHint('Available');
        } else if (ok && data?.available === false) {
          setUsernameStatus('taken');
          setUsernameHint('Already taken');
        } else {
          setUsernameStatus('idle');
          setUsernameHint('');
        }
      } catch {
        if (!mountedRef.current || seq !== checkSeqRef.current) return;
        setUsernameStatus('idle');
        setUsernameHint('');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, mode]);

  const switchTopTab = (next: 'signup-email' | 'login') => {
    if (submitting || googleLoading) return;
    setFormError(null);
    setSuggestSignIn(false);
    setGoogleFeedback(null);
    setMode(next);
  };

  // ── Step 1: Send 6-digit OTP to email ──
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submitting || googleLoading) return;
    setFormError(null);
    setSuggestSignIn(false);
    setGoogleFeedback(null);

    const check = validateEmail(email);
    if (!check.valid) {
      setFormError(check.error || 'Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const { ok, status, data } = await fetchJsonWithTimeout<{
        ok?: boolean;
        emailSent?: boolean;
        _dev_otp?: string;
        error?: string;
        code?: string;
      }>(`${serverUrl}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email: check.cleaned }),
      });

      if (!mountedRef.current) return;

      if (!ok) {
        if (status === 409 || data?.code === 'ACCOUNT_EXISTS') {
          setSuggestSignIn(true);
          setFormError(data?.error || 'An account with this email already exists. Please sign in instead.');
        } else {
          setFormError(data?.error || 'Could not send verification code. Please try again.');
        }
        return;
      }

      setEmail(check.cleaned);
      setOtp('');
      setOtpEmailSent(data?.emailSent !== false);
      setDevOtp(data?._dev_otp || null);
      setResendCooldown(60);
      setMode('signup-otp');
    } catch (err: any) {
      if (!mountedRef.current) return;
      if (err?.name === 'AbortError') {
        setFormError('The server took too long to respond. Please check your connection and try again.');
      } else {
        setFormError('Could not reach the server. Check your internet connection and try again.');
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const { ok, data } = await fetchJsonWithTimeout<{
        ok?: boolean;
        emailSent?: boolean;
        _dev_otp?: string;
        error?: string;
      }>(`${serverUrl}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!mountedRef.current) return;

      if (!ok) {
        setFormError(data?.error || 'Could not resend code. Please try again.');
        return;
      }

      setOtpEmailSent(data?.emailSent !== false);
      setDevOtp(data?._dev_otp || null);
      setResendCooldown(60);
    } catch {
      if (mountedRef.current) {
        setFormError('Could not resend code. Check your internet connection.');
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // ── Step 2: Verify 6-digit OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const cleanedOtp = otp.replace(/\D/g, '');
    if (cleanedOtp.length !== 6) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    try {
      const { ok, data } = await fetchJsonWithTimeout<{
        ok?: boolean;
        verified?: boolean;
        error?: string;
      }>(`${serverUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, otp: cleanedOtp }),
      });

      if (!mountedRef.current) return;

      if (!ok || !data?.verified) {
        setFormError(data?.error || 'Invalid or expired verification code. Please try again.');
        return;
      }

      setMode('signup-profile');
    } catch (err: any) {
      if (!mountedRef.current) return;
      if (err?.name === 'AbortError') {
        setFormError('Verification timed out. Please try again.');
      } else {
        setFormError('Could not verify code. Check your connection and try again.');
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // ── Step 3: Complete account creation (username + password) ──
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);

    const usernameCheck = validateUsername(username);
    if (!usernameCheck.valid) {
      setFormError(usernameCheck.error || 'Please choose a valid username.');
      return;
    }
    if (usernameStatus === 'taken') {
      setFormError('This username is already taken. Please choose another.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure no stale Firebase session collides with new Supabase account
      await signOutUser().catch(() => {});

      const { ok, data } = await fetchJsonWithTimeout<{
        ok?: boolean;
        user?: { id: string; email: string; username: string };
        error?: string;
      }>(`${serverUrl}/auth/complete-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          username: usernameCheck.cleaned,
          password,
        }),
      });

      if (!mountedRef.current) return;

      if (!ok) {
        setFormError(data?.error || 'Could not create your account. Please try again.');
        return;
      }

      await signInWithSupabasePassword(email, password);

      savePreferencesStatic({
        onboardingComplete: false,
        preferredStyle: null,
        displayName: usernameCheck.cleaned,
      });

      if (mountedRef.current) {
        onAuthenticated?.('supabase');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setFormError(
        err?.name === 'AbortError'
          ? 'Account setup timed out. Please try again.'
          : err?.message || 'Could not complete signup. Please try again.',
      );
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // ── Existing user Sign In (username or email + password) ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || googleLoading) return;
    setFormError(null);
    setSuggestSignIn(false);
    setGoogleFeedback(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setFormError('Please enter your username or email.');
      return;
    }
    if (!loginPassword) {
      setFormError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure no stale Firebase session collides with Supabase login
      await signOutUser().catch(() => {});

      let resolvedEmail = identifier.toLowerCase();

      if (!identifier.includes('@')) {
        const { ok, data } = await fetchJsonWithTimeout<{
          email?: string;
          username?: string;
          error?: string;
          code?: string;
        }>(`${serverUrl}/auth/resolve-username`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ identifier }),
        });

        if (!mountedRef.current) return;

        if (!ok || !data?.email) {
          setFormError(data?.error || 'No account found with this username.');
          return;
        }
        resolvedEmail = data.email;
      }

      const { accessToken } = await signInWithSupabasePassword(resolvedEmail, loginPassword);

      // Hydrate returning user's onboarding state from Supabase so they enter Rep directly
      try {
        const prefsRes = await fetchJsonWithTimeout<{
          preferences?: {
            onboardingComplete?: boolean;
            preferredStyle?: any;
            displayName?: string;
            workoutFrequency?: string;
            heightCm?: number;
            weightKg?: number;
            goal?: string;
          };
        }>(
          `${serverUrl}/preferences`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'X-User-Token': accessToken,
            },
          },
          6000,
        );
        if (prefsRes.ok && prefsRes.data?.preferences) {
          savePreferencesStatic({
            onboardingComplete: prefsRes.data.preferences.onboardingComplete === true,
            preferredStyle: prefsRes.data.preferences.preferredStyle ?? null,
            displayName: prefsRes.data.preferences.displayName || identifier.split('@')[0] || 'Athlete',
            workoutFrequency: prefsRes.data.preferences.workoutFrequency,
            heightCm: prefsRes.data.preferences.heightCm,
            weightKg: prefsRes.data.preferences.weightKg,
            goal: prefsRes.data.preferences.goal,
          });
        }
      } catch {
        // Non-fatal: App.tsx will sync preferences in background
      }

      if (mountedRef.current) {
        onAuthenticated?.('supabase');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setFormError(
        err?.name === 'AbortError'
          ? 'Sign in timed out. Check your connection and try again.'
          : err?.message || 'Could not sign in. Please try again.',
      );
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // ── Improved Google Sign-In via Firebase Auth ──
  const handleGoogleSignIn = async () => {
    if (googleLoading || submitting) return;
    setFormError(null);
    setSuggestSignIn(false);
    setGoogleFeedback(null);
    setGoogleLoading(true);
    try {
      // Clear any stale Supabase session before switching to Firebase Google auth
      await supabase.auth.signOut().catch(() => {});
      setAccessToken(null);

      await signInWithGoogle();
      if (mountedRef.current) {
        onAuthenticated?.('firebase');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setGoogleFeedback(mapGoogleAuthError(err));
      setGoogleLoading(false);
    }
  };

  const handleCancelGoogleWait = () => {
    setGoogleLoading(false);
    setGoogleFeedback({
      code: 'auth/user-cancelled-wait',
      title: 'Sign-in paused',
      message: 'If the Google popup closed or opened behind another window, tap Continue with Google to try again.',
      recoverable: true,
      isPopupBlocked: false,
      isCancelled: true,
    });
  };

  const showTopTabs = mode === 'signup-email' || mode === 'login';
  const passwordStrength = getPasswordStrength(password);

  return (
    <main className="h-full min-h-screen min-h-[100dvh] flex flex-col relative overflow-x-hidden overflow-y-auto bg-[#0a0a0b] text-white">
      {/* Background photography with controlled scrim for crisp contrast */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: bgLoaded ? 0.72 : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={BG_IMAGE}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,11,0.18) 0%, rgba(10,10,11,0.68) 46%, rgba(10,10,11,0.96) 100%)',
          }}
        />
      </div>

      {/* Foreground container */}
      <div className="flex-1 flex flex-col justify-between relative z-10 px-6 pt-10 pb-8 max-w-md w-full mx-auto">
        <div className="flex-1 min-h-[56px] md:min-h-[40px]" />

        <section aria-label="Rep authentication" className="w-full">
          {/* Brand lockup */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-[18px] mb-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
              <RepLogo size={56} radius={18} />
            </div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.025em] text-white leading-[1.1] mb-1 whitespace-nowrap">
              Rep
            </h1>
            <p className="text-[14px] text-white/75 leading-snug">
              Make your effort visible.
            </p>
          </div>

          {/* Segmented Create Account / Sign In tab toggle */}
          {showTopTabs && (
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 p-1 rounded-[14px] bg-white/10 border border-white/12 mb-5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup-email'}
                onClick={() => switchTopTab('signup-email')}
                className={`h-[40px] rounded-[10px] text-[13.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  mode === 'signup-email'
                    ? 'bg-white text-[#111317] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => switchTopTab('login')}
                className={`h-[40px] rounded-[10px] text-[13.5px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#111317] shadow-[0_2px_8px_rgba(0,0,0,0.2)]'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          {/* ── MODE 1: CREATE ACCOUNT — STEP 1 (EMAIL) ── */}
          {mode === 'signup-email' && (
            <form onSubmit={handleSendOtp} noValidate className="space-y-3">
              <div>
                <label htmlFor="signup-email-input" className="sr-only">
                  Email address
                </label>
                <input
                  id="signup-email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (formError) {
                      setFormError(null);
                      setSuggestSignIn(false);
                    }
                  }}
                  placeholder="Email address"
                  disabled={submitting || googleLoading}
                  className="w-full h-[50px] px-4 rounded-[14px] bg-white/12 border border-white/16 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#34C759] focus:bg-white/15 transition-colors"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-[12px] bg-[#FF3B30]/14 border border-[#FF3B30]/35 px-3.5 py-2.5 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#FF453A] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1 min-w-0 text-[13px] text-white/90 leading-snug">
                    <p>{formError}</p>
                    {suggestSignIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(email.trim());
                          switchTopTab('login');
                        }}
                        className="mt-1.5 text-[13px] font-semibold text-[#34C759] hover:underline cursor-pointer"
                      >
                        Go to Sign In
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || googleLoading}
                className="w-full h-[50px] rounded-[12px] bg-[#8BE649] hover:bg-[#9AF05B] active:scale-[0.985] text-[#0B0E13] text-[15px] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_18px_rgba(139,230,73,0.22)] transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              <Divider />

              <GoogleAuthBlock
                loading={googleLoading}
                disabled={submitting}
                feedback={googleFeedback}
                onSignIn={handleGoogleSignIn}
                onCancelWait={handleCancelGoogleWait}
                onDismissFeedback={() => setGoogleFeedback(null)}
              />
            </form>
          )}

          {/* ── MODE 2: CREATE ACCOUNT — STEP 2 (EMAIL OTP VERIFICATION) ── */}
          {mode === 'signup-otp' && (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setMode('signup-email');
                }}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Change email
              </button>

              <div>
                <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-white leading-[1.15] mb-1">
                  Check your email
                </h2>
                <p className="text-[14px] text-white/70 leading-snug">
                  Enter the 6-digit verification code sent to{' '}
                  <span className="text-white font-medium">{email}</span>.
                </p>
              </div>

              {!otpEmailSent && devOtp && (
                <div
                  role="status"
                  className="rounded-[12px] bg-[#34C759]/14 border border-[#34C759]/35 px-3.5 py-2.5 text-[13px] text-white/90"
                >
                  Verification code:{' '}
                  <span className="font-mono font-bold tracking-[0.18em] text-[#34C759]">
                    {devOtp}
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="signup-otp-input" className="sr-only">
                  6-digit verification code
                </label>
                <input
                  id="signup-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={e => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (formError) setFormError(null);
                  }}
                  placeholder="000000"
                  disabled={submitting}
                  autoFocus
                  className="w-full h-[54px] px-4 rounded-[14px] bg-white/12 border border-white/16 text-center font-mono text-[24px] tracking-[0.4em] text-white placeholder:text-white/25 focus:outline-none focus:border-[#34C759] focus:bg-white/15 transition-colors"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-[12px] bg-[#FF3B30]/14 border border-[#FF3B30]/35 px-3.5 py-2.5 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#FF453A] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[13px] text-white/90 leading-snug">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full h-[50px] rounded-[12px] bg-[#8BE649] hover:bg-[#9AF05B] active:scale-[0.985] text-[#0B0E13] text-[15px] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_18px_rgba(139,230,73,0.22)] transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || submitting}
                  className="text-[13px] font-medium text-white/70 hover:text-white disabled:text-white/40 transition-colors cursor-pointer disabled:cursor-default"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}

          {/* ── MODE 3: CREATE ACCOUNT — STEP 3 (USERNAME + PASSWORD) ── */}
          {mode === 'signup-profile' && (
            <form onSubmit={handleCompleteSignup} noValidate className="space-y-3.5">
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setMode('signup-otp');
                }}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back
              </button>

              <div>
                <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-white leading-[1.15] mb-1">
                  Finish setting up
                </h2>
                <p className="text-[13px] text-white/70">
                  Verified <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="signup-username-input" className="block text-[12px] font-medium text-white/70 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-white/45 pointer-events-none"
                    aria-hidden="true"
                  >
                    @
                  </span>
                  <input
                    id="signup-username-input"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={e => {
                      setUsername(sanitizeUsernameInput(e.target.value));
                      if (formError) setFormError(null);
                    }}
                    placeholder="yourhandle"
                    disabled={submitting}
                    autoFocus
                    className="w-full h-[50px] pl-9 pr-11 rounded-[14px] bg-white/12 border border-white/16 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#34C759] focus:bg-white/15 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 text-white/55 animate-spin" aria-hidden="true" />
                    )}
                    {usernameStatus === 'available' && (
                      <Check className="w-4 h-4 text-[#34C759]" aria-hidden="true" />
                    )}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                      <X className="w-4 h-4 text-[#FF453A]" aria-hidden="true" />
                    )}
                  </div>
                </div>
                {usernameHint && (
                  <p
                    className={`mt-1 text-[12px] ${
                      usernameStatus === 'available'
                        ? 'text-[#34C759]'
                        : usernameStatus === 'checking'
                          ? 'text-white/55'
                          : 'text-[#FF453A]'
                    }`}
                  >
                    {usernameHint}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password-input" className="block text-[12px] font-medium text-white/70 mb-1.5">
                  Password (8+ characters)
                </label>
                <div className="relative">
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Create a password"
                    disabled={submitting}
                    className="w-full h-[50px] pl-4 pr-11 rounded-[14px] bg-white/12 border border-white/16 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#34C759] focus:bg-white/15 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/55 hover:text-white/85 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map(bar => (
                        <div
                          key={bar}
                          className={`h-1 rounded-full transition-colors ${
                            passwordStrength.level >= bar
                              ? passwordStrength.level === 1
                                ? 'bg-[#FF453A]'
                                : passwordStrength.level === 2
                                  ? 'bg-[#FF9500]'
                                  : 'bg-[#34C759]'
                              : 'bg-white/15'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-white/70 min-w-[44px] text-right">
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-[12px] bg-[#FF3B30]/14 border border-[#FF3B30]/35 px-3.5 py-2.5 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#FF453A] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[13px] text-white/90 leading-snug">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  usernameStatus === 'taken' ||
                  usernameStatus === 'invalid' ||
                  usernameStatus === 'checking'
                }
                className="w-full h-[50px] rounded-[12px] bg-[#8BE649] hover:bg-[#9AF05B] active:scale-[0.985] text-[#0B0E13] text-[15px] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_18px_rgba(139,230,73,0.22)] transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* ── MODE 4: SIGN IN (USERNAME / EMAIL + PASSWORD + GOOGLE) ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} noValidate className="space-y-3">
              <div>
                <label htmlFor="login-identifier-input" className="sr-only">
                  Username or email
                </label>
                <input
                  id="login-identifier-input"
                  type="text"
                  autoComplete="username"
                  value={loginIdentifier}
                  onChange={e => {
                    setLoginIdentifier(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Username or email"
                  disabled={submitting || googleLoading}
                  className="w-full h-[50px] px-4 rounded-[14px] bg-white/12 border border-white/16 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#34C759] focus:bg-white/15 transition-colors"
                />
              </div>

              <div className="relative">
                <label htmlFor="login-password-input" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={e => {
                    setLoginPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Password"
                  disabled={submitting || googleLoading}
                  className="w-full h-[50px] pl-4 pr-11 rounded-[14px] bg-white/12 border border-white/16 text-[15px] text-white placeholder:text-white/45 focus:outline-none focus:border-[#34C759] focus:bg-white/15 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(v => !v)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/55 hover:text-white/85 cursor-pointer p-1"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-[12px] bg-[#FF3B30]/14 border border-[#FF3B30]/35 px-3.5 py-2.5 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-[#FF453A] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[13px] text-white/90 leading-snug">{formError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || googleLoading}
                className="w-full h-[50px] rounded-[12px] bg-[#8BE649] hover:bg-[#9AF05B] active:scale-[0.985] text-[#0B0E13] text-[15px] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_18px_rgba(139,230,73,0.22)] transition-all disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <Divider />

              <GoogleAuthBlock
                loading={googleLoading}
                disabled={submitting}
                feedback={googleFeedback}
                onSignIn={handleGoogleSignIn}
                onCancelWait={handleCancelGoogleWait}
                onDismissFeedback={() => setGoogleFeedback(null)}
              />
            </form>
          )}
        </section>

        <div className="hidden md:block flex-[0.35]" />

        <footer className="pt-6 text-center">
          <p className="text-[12px] text-white/45">
            Track workouts, routines, and progress across devices.
          </p>
        </footer>
      </div>
    </main>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden="true">
      <div className="flex-1 h-px bg-white/14" />
      <span className="text-[12px] text-white/45 uppercase tracking-wider">or</span>
      <div className="flex-1 h-px bg-white/14" />
    </div>
  );
}

function GoogleAuthBlock({
  loading,
  disabled,
  feedback,
  onSignIn,
  onCancelWait,
  onDismissFeedback,
}: {
  loading: boolean;
  disabled: boolean;
  feedback: MappedAuthError | null;
  onSignIn: () => void;
  onCancelWait: () => void;
  onDismissFeedback: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={onSignIn}
        disabled={loading || disabled}
        aria-busy={loading}
        className="w-full h-[50px] px-5 rounded-[14px] bg-white hover:bg-[#f2f2f7] active:scale-[0.985] text-[#1c1c1e] text-[15px] font-semibold flex items-center justify-center gap-3 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] disabled:opacity-75 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34C759]"
      >
        {loading ? (
          <>
            <span
              className="w-4 h-4 border-2 border-[#1c1c1e]/25 border-t-[#1c1c1e] rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>Signing in with Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            aria-live="polite"
          >
            <div className="rounded-[12px] bg-white/8 border border-white/12 px-3.5 py-2.5 flex items-center justify-between gap-3">
              <p className="text-[12px] text-white/75 leading-snug">
                Choose your Google account in the popup window.
              </p>
              <button
                type="button"
                onClick={onCancelWait}
                className="text-[12px] font-semibold text-white/90 hover:text-white underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role={feedback.isCancelled ? 'status' : 'alert'}
            aria-live={feedback.isCancelled ? 'polite' : 'assertive'}
            className={`rounded-[12px] px-3.5 py-2.5 border ${
              feedback.isCancelled
                ? 'bg-white/8 border-white/15 text-white/85'
                : feedback.isPopupBlocked
                  ? 'bg-[#FF9500]/12 border-[#FF9500]/35 text-white'
                  : 'bg-[#FF3B30]/14 border-[#FF3B30]/35 text-white'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.isPopupBlocked ? (
                <ExternalLink className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <AlertCircle
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    feedback.isCancelled ? 'text-white/60' : 'text-[#FF453A]'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-tight mb-0.5">
                  {feedback.title}
                </p>
                <p className="text-[12px] text-white/75 leading-relaxed">
                  {feedback.message}
                </p>
                {feedback.isPopupBlocked && (
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#FF9500] hover:text-[#FFAC33] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    Try Again
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onDismissFeedback}
                aria-label="Dismiss Google sign-in message"
                className="p-1 rounded-md text-white/45 hover:text-white/80 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}