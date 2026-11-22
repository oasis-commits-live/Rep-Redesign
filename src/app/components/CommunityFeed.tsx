import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Search, X, UserPlus, Clock, Dumbbell, Flame,
  Users, ChevronRight, Loader2, Heart, MessageCircle,
  Send, Play, ArrowUpRight, Check, Plus, Sun, Moon, Compass,
} from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/exercises';
import type { CommunityProfile, ActivityPost, Comment } from '../data/api';
import {
  fetchCommunityFeed, searchUsers, discoverUsers,
  followUser, unfollowUser,
  likeActivity, unlikeActivity,
  addComment, fetchComments,
  fetchNotifications,
  getActiveAuthProvider,
} from '../data/api';
import { formatDistanceToNow, isThisWeek, startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { getPreferences, getSessions, getTemplates } from '../data/store';
import { estimateRoutineMinutes, calculateTrainingStreak } from '../data/workoutPresets';
import { setAppearance } from '../data/theme';
import { NotificationCenter, NotificationBell } from './NotificationCenter';
import { RadialTelemetryRing } from './visuals/RadialTelemetryRing';
import { getCategory3DAsset } from './visuals/brandAssets';

const CATEGORY_COLOR_MAP: Record<string, string> = {
  gym: CATEGORY_COLORS.gym,
  calisthenics: CATEGORY_COLORS.calisthenics,
  animalflow: CATEGORY_COLORS.animalflow,
};

function parseWeeklyTarget(freq?: string): number {
  if (!freq) return 4;
  if (freq === '1-2') return 2;
  if (freq === '3-4') return 4;
  if (freq === '5-6') return 5;
  if (freq === '7') return 7;
  const n = parseInt(freq, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(7, n) : 4;
}

export function CommunityFeed() {
  const navigate = useNavigate();
  const prefs = getPreferences();
  const allSessions = getSessions()
    .filter(s => s.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  const templates = getTemplates();

  const [feed, setFeed] = useState<ActivityPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CommunityProfile[]>([]);
  const [suggestions, setSuggestions] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const PULL_THRESHOLD = 80;

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Comment sheet state
  const [commentSheetPost, setCommentSheetPost] = useState<ActivityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSending, setCommentSending] = useState(false);

  useEffect(() => {
    const syncTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setAppearance(next);
    setIsDark(next === 'dark');
  };

  // Weekly stats & interactive 7-day strip
  const weeklyTarget = parseWeeklyTarget(prefs.workoutFrequency);
  const thisWeekSessions = allSessions.filter(s => isThisWeek(new Date(s.completedAt!), { weekStartsOn: 1 }));
  const weeklyVolume = thisWeekSessions.reduce((total, s) => {
    return (
      total +
      s.exercises.reduce(
        (et, ex) =>
          et +
          ex.sets
            .filter(set => set.completed)
            .reduce((st, set) => st + set.reps * (set.weight || 0), 0),
        0,
      )
    );
  }, 0);
  const weeklyWorkouts = thisWeekSessions.length;
  const weeklyMinutes = thisWeekSessions.reduce((total, s) => {
    if (s.completedAt) {
      return total + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 1000 / 60;
    }
    return total;
  }, 0);
  const streakDays = useMemo(() => calculateTrainingStreak(allSessions), [allSessions.length]);

  const weekDays = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(monday, i);
      const daySession = allSessions.find(s => s.completedAt && isSameDay(new Date(s.completedAt), day)) || null;
      return {
        key: i,
        dow: format(day, 'EEE').slice(0, 1),
        fullLabel: format(day, 'EEE, MMM d'),
        num: format(day, 'd'),
        isToday: isSameDay(day, today),
        trained: Boolean(daySession),
        session: daySession,
      };
    });
  }, [allSessions.length]);

  const activeDay = selectedDayIdx !== null ? weekDays[selectedDayIdx] : null;
  const latestSession = allSessions[0] || null;
  const quickRoutine = templates[0] || null;

  const latestSessionMetrics = useMemo(() => {
    if (!latestSession) return null;
    const mins = latestSession.completedAt
      ? Math.max(1, Math.round((new Date(latestSession.completedAt).getTime() - new Date(latestSession.startedAt).getTime()) / 60000))
      : 0;
    const completedSets = latestSession.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
      0,
    );
    const volume = latestSession.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).reduce((acc, s) => acc + s.reps * (s.weight || 0), 0),
      0,
    );
    return { mins, completedSets, volume };
  }, [latestSession]);

  useEffect(() => {
    if (!getActiveAuthProvider()) {
      setLoading(false);
      return;
    }
    loadFeed();
    loadSuggestions();
    loadUnreadCount();
    const pollInterval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const loadFeed = async () => {
    if (!getActiveAuthProvider()) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { activities } = await fetchCommunityFeed();
      setFeed(activities);
    } catch (err) {
      console.log('[Community] Feed load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!getActiveAuthProvider()) return;
    try {
      const { users } = await discoverUsers();
      setSuggestions(users);
    } catch (err) {
      console.log('[Community] Discover error:', err);
    }
  };

  const loadUnreadCount = async () => {
    if (!getActiveAuthProvider()) return;
    try {
      const { unreadCount: uc } = await fetchNotifications();
      setUnreadCount(uc);
    } catch (err) {
      console.log('[Community] Notification count error (non-fatal):', (err as Error).message ?? err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeed(), loadSuggestions(), loadUnreadCount()]);
    setRefreshing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollEl = scrollRef.current?.closest('.overflow-y-auto');
    if (scrollEl && scrollEl.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0 && !refreshing) {
      setPullDistance(Math.min(deltaY * 0.5, 120));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);
    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setPullDistance(50);
      await handleRefresh();
    }
    setPullDistance(0);
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { users } = await searchUsers(q);
      setSearchResults(users);
    } catch (err) {
      console.log('[Community] Search error:', err);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleFollow = async (userId: string) => {
    setFollowLoading(prev => new Set(prev).add(userId));
    try {
      await followUser(userId);
      setSuggestions(prev => prev.filter(u => u.userId !== userId));
      setSearchResults(prev =>
        prev.map(u => (u.userId === userId ? { ...u, isFollowing: true } : u)),
      );
      loadFeed();
    } catch (err) {
      console.log('[Community] Follow error:', err);
    } finally {
      setFollowLoading(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleUnfollow = async (userId: string) => {
    setFollowLoading(prev => new Set(prev).add(userId));
    try {
      await unfollowUser(userId);
      setSearchResults(prev =>
        prev.map(u => (u.userId === userId ? { ...u, isFollowing: false } : u)),
      );
    } catch (err) {
      console.log('[Community] Unfollow error:', err);
    } finally {
      setFollowLoading(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleLike = async (post: ActivityPost) => {
    setFeed(prev =>
      prev.map(p =>
        p.id === post.id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: (p.likesCount || 0) + (p.isLiked ? -1 : 1),
            }
          : p,
      ),
    );
    try {
      if (post.isLiked) await unlikeActivity(post.id);
      else await likeActivity(post.id);
    } catch (err) {
      setFeed(prev =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, isLiked: post.isLiked, likesCount: post.likesCount }
            : p,
        ),
      );
      console.log('[Community] Like error:', err);
    }
  };

  const openComments = async (post: ActivityPost) => {
    setCommentSheetPost(post);
    setCommentsLoading(true);
    try {
      const { comments: c } = await fetchComments(post.id);
      setComments(c);
    } catch (err) {
      console.log('[Community] Comments load error:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentSheetPost || !commentText.trim()) return;
    setCommentSending(true);
    try {
      const { comment } = await addComment(commentSheetPost.id, commentText.trim());
      setComments(prev => [...prev, comment]);
      setCommentText('');
      setFeed(prev =>
        prev.map(p =>
          p.id === commentSheetPost.id
            ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
            : p,
        ),
      );
    } catch (err) {
      console.log('[Community] Send comment error:', err);
    } finally {
      setCommentSending(false);
    }
  };

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return `${h}h ${m}m`;
    }
    return `${Math.round(mins)}m`;
  };

  const timeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const firstName = (prefs.displayName || 'Athlete').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const remainingWeekly = Math.max(0, weeklyTarget - weeklyWorkouts);

  return (
    <div
      ref={scrollRef}
      className="pb-10 max-w-5xl mx-auto px-4 sm:px-8 pt-5 md:pt-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: pullDistance > 0 ? pullDistance : 46, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <Loader2
              className={`w-5 h-5 ${refreshing ? 'animate-spin text-[#16A34A] dark:text-[#8BE649]' : 'text-[#8E95A2]'}`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Greeting Header with Clear Theme + Notifications + Athlete Search Controls */}
      <div className="rep-page-header">
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0] leading-snug truncate">
            {greeting} · {format(new Date(), 'EEE, MMM d')}
          </p>
          <h1 className="rep-page-title mt-0.5">
            Hey, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 rounded-[13px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            {isDark ? (
              <Sun className="w-[18px] h-[18px] text-[#8BE649]" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-[#5C616B]" />
            )}
          </motion.button>
          <NotificationBell unreadCount={unreadCount} onClick={() => setNotifOpen(true)} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={searchOpen ? 'Close athlete search' : 'Find athletes'}
            className={`h-10 px-3 rounded-[13px] border flex items-center gap-1.5 text-[13px] font-semibold transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.03)] whitespace-nowrap ${
              searchOpen
                ? 'bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#080A0E] border-transparent'
                : 'bg-white dark:bg-[#141820] text-[#111317] dark:text-white border-black/[0.08] dark:border-white/[0.08]'
            }`}
          >
            {searchOpen ? <X className="w-4 h-4" /> : <Users className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />}
            <span className="hidden sm:inline">{searchOpen ? 'Close' : 'Athletes'}</span>
          </motion.button>
        </div>
      </div>

      {/* Expandable Athlete Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search athletes by name or @username..."
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] rounded-[15px] text-[14px] text-[#111317] dark:text-white placeholder:text-[#8E95A2] outline-none focus:border-[#16A34A] dark:focus:border-[#8BE649]"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A2] animate-spin" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2.5 bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[18px] overflow-hidden divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {searchResults.map(user => (
                  <div key={user.userId} className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/athlete/${user.userId}`)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#111317] dark:bg-[#8BE649] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white dark:text-[#0B0E13] text-[14px] font-bold">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-[14px] font-semibold text-[#111317] dark:text-white truncate">
                          {user.displayName}
                        </p>
                        <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                          {user.workoutCount || 0} workouts
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => (user.isFollowing ? handleUnfollow(user.userId) : handleFollow(user.userId))}
                      disabled={followLoading.has(user.userId)}
                      className={`px-3.5 py-1.5 rounded-[10px] text-[12.5px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        user.isFollowing
                          ? 'bg-[#F0F2F5] dark:bg-white/[0.08] text-[#111317] dark:text-white'
                          : 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13]'
                      }`}
                    >
                      {followLoading.has(user.userId) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : user.isFollowing ? (
                        'Following'
                      ) : (
                        'Follow'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length > 0 && !searching && searchResults.length === 0 && (
              <p className="text-center text-[13px] text-[#5C616B] dark:text-[#8E95A2] py-5">No athletes found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOCAL ANCHOR #1: ARCHITECTURAL OBSIDIAN MOMENTUM HERO */}
      {!searchOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 rounded-[26px] bg-[#101318] dark:bg-[#121720] text-white border border-black/15 dark:border-white/[0.09] p-5 sm:p-6 flex flex-col justify-between gap-5 relative overflow-hidden shadow-[0_14px_34px_rgba(16,19,24,0.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Subtle kinetic corner illumination */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 w-56 h-56 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, #8BE649 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-[#8BE649]">
                  Weekly goal{streakDays > 0 ? ` · ${streakDays}d streak` : ''}
                </p>
                <h2 className="font-display text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] leading-[1.12] text-white mt-1">
                  {remainingWeekly === 0
                    ? 'Target hit this week'
                    : `${remainingWeekly} workout${remainingWeekly === 1 ? '' : 's'} to go`}
                </h2>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.08]">
                  <div>
                    <p className="font-numeric text-[19px] font-semibold text-white leading-none">
                      {Math.round(weeklyMinutes)}m
                    </p>
                    <span className="text-[11.5px] text-[#9BA3B0] mt-1 block whitespace-nowrap">Active</span>
                  </div>
                  <div>
                    <p className="font-numeric text-[19px] font-semibold text-white leading-none">
                      {weeklyVolume >= 1000
                        ? `${(weeklyVolume / 1000).toFixed(1)}k`
                        : weeklyVolume > 0
                        ? weeklyVolume.toLocaleString()
                        : '0'}
                    </p>
                    <span className="text-[11.5px] text-[#9BA3B0] mt-1 block whitespace-nowrap">Volume lb</span>
                  </div>
                  <div>
                    <p className="font-numeric text-[19px] font-semibold text-[#8BE649] leading-none">
                      {allSessions.length}
                    </p>
                    <span className="text-[11.5px] text-[#9BA3B0] mt-1 block whitespace-nowrap">Total logs</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <RadialTelemetryRing
                  value={weeklyWorkouts}
                  max={weeklyTarget}
                  displayValue={`${weeklyWorkouts}/${weeklyTarget}`}
                  label="days"
                  accentColor="#8BE649"
                  darkAccentColor="#8BE649"
                  size={104}
                  segments={22}
                  forceDarkSurface
                />
              </div>
            </div>

            {/* Interactive 7-Day Strip with Clear Instruction */}
            <div className="relative z-10 rounded-[18px] bg-white/[0.06] border border-white/[0.08] p-2.5">
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(d => {
                  const isSelected = selectedDayIdx === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setSelectedDayIdx(isSelected ? null : d.key)}
                      aria-label={`Inspect ${d.fullLabel}`}
                      className={`flex flex-col items-center py-2 rounded-[12px] transition-colors ${
                        isSelected
                          ? 'bg-[#8BE649] text-[#080A0E]'
                          : d.isToday
                          ? 'bg-white text-[#101318]'
                          : d.trained
                          ? 'bg-[#8BE649]/18 text-[#8BE649]'
                          : 'text-[#A2AAB8] hover:bg-white/[0.07]'
                      }`}
                    >
                      <span className="text-[10.5px] font-semibold leading-none">{d.dow}</span>
                      <span className="font-numeric text-[13px] font-semibold mt-1 leading-none">
                        {d.num}
                      </span>
                      <span className="mt-1 h-1 flex items-center justify-center">
                        {d.trained && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected || d.isToday ? 'bg-current' : 'bg-[#8BE649]'
                            }`}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence initial={false}>
                {activeDay ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {activeDay.trained ? (
                          <Check className="w-3.5 h-3.5 text-[#8BE649] shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#9BA3B0] shrink-0" />
                        )}
                        <p className="text-[12.5px] text-white truncate">
                          <span className="font-semibold">{activeDay.fullLabel}:</span>{' '}
                          <span className="text-[#C7CCD6]">
                            {activeDay.session ? activeDay.session.name : 'Rest day'}
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          activeDay.session
                            ? navigate(`/workout/${activeDay.session.id}/summary`)
                            : quickRoutine
                            ? navigate(`/workouts/${quickRoutine.id}/live`)
                            : navigate('/builder/new')
                        }
                        className="text-[12px] font-semibold text-[#8BE649] whitespace-nowrap shrink-0"
                      >
                        {activeDay.session ? 'Open recap' : 'Start workout'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-[11px] text-[#8E95A2] text-center pt-2">
                    Tap any day to inspect logged workouts
                  </p>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Right Column: Latest Session Analytics + Library Shortcut (Zero Duplicate Titles!) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {latestSession && latestSessionMetrics ? (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/workout/${latestSession.id}/summary`)}
                className="flex-1 rounded-[24px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-[#8BE649]/40 p-5 flex flex-col justify-between text-left transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.03)] group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[12px] font-semibold text-[#D9592E] dark:text-[#F08865]">
                      Latest recap · {format(new Date(latestSession.completedAt!), 'MMM d')}
                    </span>
                    <h3 className="font-display text-[19px] font-bold text-[#111317] dark:text-white mt-0.5 leading-snug">
                      {latestSession.name}
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-[11px] bg-[#FFF1EB] dark:bg-[#E97852]/15 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <ArrowUpRight className="w-4 h-4 text-[#D9592E] dark:text-[#F08865]" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <div className="flex items-center gap-4 text-[12.5px] font-numeric text-[#5C616B] dark:text-[#9BA3B0]">
                    <span>{latestSessionMetrics.mins}m</span>
                    <span>{latestSessionMetrics.completedSets} sets</span>
                    {latestSessionMetrics.volume > 0 && (
                      <span>{latestSessionMetrics.volume.toLocaleString()} lb</span>
                    )}
                  </div>
                  <span className="text-[12.5px] font-semibold text-[#111317] dark:text-[#8BE649] whitespace-nowrap">
                    Analytics
                  </span>
                </div>
              </motion.button>
            ) : null}

            {/* 500+ Exercise Library Discovery Card */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/library')}
              className="rounded-[24px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-[#8BE649]/40 p-5 flex items-center justify-between gap-4 text-left transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.03)] group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-[14px] bg-[#EEF2FF] dark:bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[16.5px] font-bold text-[#111317] dark:text-white leading-snug">
                    500+ Exercise Library
                  </p>
                  <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5 truncate">
                    Form demos, muscle maps & cues
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E95A2] group-hover:text-[#111317] dark:group-hover:text-white shrink-0" />
            </motion.button>
          </div>
        </div>
      )}

      {/* FOCAL ANCHOR #2: READY TO TRAIN — YOUR ROUTINES (Full Titles + Exercise Preview + 1-Tap Start) */}
      {!searchOpen && (
        <section className="mb-7">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="rep-section-title">Ready to train</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/builder')}
              className="text-[13px] font-semibold text-[#15803D] dark:text-[#8BE649] inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>All routines</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {templates.length > 0 ? (
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {templates.slice(0, 5).map(t => {
                const mins = estimateRoutineMinutes(t.exercises);
                const catColor = CATEGORY_COLORS[t.category] || '#16A34A';
                return (
                  <div
                    key={t.id}
                    className="flex-shrink-0 w-[290px] sm:w-[320px] rounded-[22px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] p-4 flex flex-col justify-between gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2.5 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-[12px] overflow-hidden bg-[#111317] shrink-0">
                            <img src={getCategory3DAsset(t.category)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11.5px] font-semibold block leading-none" style={{ color: catColor }}>
                              {CATEGORY_LABELS[t.category]} · ~{mins}m
                            </span>
                            <h3 className="font-display text-[17px] font-bold text-[#111317] dark:text-white leading-snug mt-1 truncate">
                              {t.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Visible preview of what's inside this routine */}
                      <div className="space-y-1 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
                        {t.exercises.slice(0, 3).map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-[12.5px]">
                            <span className="text-[#4B505B] dark:text-[#C7CCD6] truncate pr-2">
                              {ex.exerciseName}
                            </span>
                            <span className="font-numeric text-[11.5px] text-[#717784] dark:text-[#8E95A2] shrink-0">
                              {ex.sets}×{ex.targetReps}{ex.isTimeBased ? 's' : ''}
                            </span>
                          </div>
                        ))}
                        {t.exercises.length > 3 && (
                          <p className="text-[11.5px] text-[#717784] dark:text-[#8E95A2]">
                            +{t.exercises.length - 3} more exercise{t.exercises.length - 3 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/workouts/${t.id}/live`)}
                        className="flex-1 rep-cta-action rep-cta-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                        <span>Start Workout</span>
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => navigate(`/builder/${t.id}/edit`)}
                        className="rep-cta-secondary rep-cta-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Quick Create Card at End of Deck */}
              <button
                type="button"
                onClick={() => navigate('/builder/new')}
                className="flex-shrink-0 w-[180px] rounded-[22px] border border-dashed border-black/15 dark:border-white/15 bg-white/60 dark:bg-[#131820]/60 hover:bg-white dark:hover:bg-[#131820] p-4 flex flex-col items-center justify-center text-center gap-2 transition-colors"
              >
                <div className="w-10 h-10 rounded-[12px] bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#080A0E] flex items-center justify-center">
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <p className="font-display text-[14.5px] font-bold text-[#111317] dark:text-white">
                  New Routine
                </p>
                <p className="text-[11.5px] text-[#5C616B] dark:text-[#9BA3B0]">
                  Custom or starter split
                </p>
              </button>
            </div>
          ) : (
            <div className="rounded-[22px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
                  Create your first training split
                </p>
                <p className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5">
                  Start with a Push/Pull/Legs template or assemble exercises from our 500+ library.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/builder/new')}
                className="rep-cta-action rep-cta-md"
              >
                <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>Create Routine</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Discover Athletes Strip */}
      {suggestions.length > 0 && !searchOpen && (
        <section className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="rep-section-title">Athletes to follow</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {suggestions.slice(0, 8).map(user => (
              <div
                key={user.userId}
                className="flex-shrink-0 w-[148px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] p-3.5 flex flex-col items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/athlete/${user.userId}`)}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-12 h-12 rounded-full bg-[#111317] dark:bg-[#8BE649] flex items-center justify-center overflow-hidden mb-2">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white dark:text-[#0B0E13] text-[16px] font-bold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[13.5px] font-semibold text-[#111317] dark:text-white truncate w-full text-center">
                    {user.displayName}
                  </p>
                  <p className="text-[11.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5 font-numeric">
                    {user.workoutCount || 0} workouts
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleFollow(user.userId)}
                  disabled={followLoading.has(user.userId)}
                  className="mt-3 w-full py-1.5 rounded-[10px] bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[12.5px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  {followLoading.has(user.userId) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      Follow
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community Activity Feed (Compact & Tasteful when empty) */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="rep-section-title">Community</h2>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="text-[13px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#111317] dark:hover:text-white whitespace-nowrap"
          >
            Find athletes
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-6 h-6 text-[#16A34A] dark:text-[#8BE649] animate-spin mb-2" />
            <p className="text-[13px] text-[#5C616B] dark:text-[#8E95A2]">Loading community activity...</p>
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-[13px] bg-[#F3F4F6] dark:bg-white/[0.07] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#111317] dark:text-[#8BE649]" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[15.5px] font-bold text-[#111317] dark:text-white leading-snug">
                  Follow training partners
                </p>
                <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] truncate">
                  Share completed workouts or follow athletes to populate your feed.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rep-cta-secondary rep-cta-sm shrink-0"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Find</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feed.map(post => {
              const categoryColor = CATEGORY_COLOR_MAP[post.category] || '#16A34A';
              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] rounded-[22px] overflow-hidden flex flex-col justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate(`/athlete/${post.userId}`)}
                      className="w-full flex items-center gap-3 px-4 pt-4 pb-2.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#111317] dark:bg-[#8BE649] flex items-center justify-center shrink-0 overflow-hidden">
                        {post.avatarUrl ? (
                          <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white dark:text-[#0B0E13] text-[14px] font-bold">
                            {(post.displayName || 'A').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[14.5px] font-semibold text-[#111317] dark:text-white truncate">
                          {post.displayName}
                        </p>
                        <p className="text-[12px] text-[#5C616B] dark:text-[#8E95A2]">
                          {timeAgo(post.postedAt || post.completedAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
                    </button>

                    {(post.title || post.description) && (
                      <div className="px-4 pb-2">
                        {post.title && post.title !== post.sessionName && (
                          <p className="text-[15px] font-semibold text-[#111317] dark:text-white">
                            {post.title}
                          </p>
                        )}
                        {post.description && (
                          <p className="text-[13.5px] text-[#48484A] dark:text-[#C7CCD6] mt-0.5">
                            {post.description}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="mx-4 mb-3 rounded-[16px] p-3.5 w-[calc(100%-32px)] text-left bg-[#F5F6F8] dark:bg-[#0D1016] border border-black/[0.05] dark:border-white/[0.06] hover:border-black/15 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-display text-[15px] font-bold text-[#111317] dark:text-white truncate">
                          {post.sessionName}
                        </span>
                        <span
                          className="text-[11.5px] font-semibold shrink-0 whitespace-nowrap"
                          style={{ color: categoryColor }}
                        >
                          {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS] || post.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[12px] text-[#5C616B] dark:text-[#9BA3B0] font-numeric">
                        {post.durationMinutes > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" style={{ color: categoryColor }} />
                            {formatDuration(post.durationMinutes)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-3.5 h-3.5" style={{ color: categoryColor }} />
                          {post.exerciseCount} ex
                        </span>
                        {post.totalVolume > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5" style={{ color: categoryColor }} />
                            {post.totalVolume.toLocaleString()} lb
                          </span>
                        )}
                      </div>

                      {post.exercises && post.exercises.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1">
                          {post.exercises.slice(0, 3).map((ex, j) => (
                            <div key={j} className="flex items-center justify-between text-[12.5px]">
                              <span className="text-[#3A3D45] dark:text-[#D0D5DD] truncate">{ex.name}</span>
                              <span className="font-numeric text-[11.5px] text-[#5C616B] dark:text-[#8E95A2] ml-2 shrink-0">
                                {ex.sets}s {ex.bestSet && `· ${ex.bestSet}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>

                    {post.mediaUrl && (
                      <div className="mx-4 mb-3 rounded-[16px] overflow-hidden">
                        <img src={post.mediaUrl} alt="Workout" className="w-full h-48 object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Like & Comment Footer */}
                  <div className="flex items-center gap-1 px-4 pb-3.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleLike(post)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-[10px] transition-colors"
                      style={{ backgroundColor: post.isLiked ? 'rgba(255,59,48,0.1)' : 'transparent' }}
                    >
                      <Heart
                        className="w-[17px] h-[17px]"
                        style={{
                          color: post.isLiked ? '#FF3B30' : '#8E95A2',
                          fill: post.isLiked ? '#FF3B30' : 'none',
                        }}
                      />
                      {(post.likesCount || 0) > 0 && (
                        <span
                          className="text-[12.5px] font-numeric font-semibold"
                          style={{ color: post.isLiked ? '#FF3B30' : '#8E95A2' }}
                        >
                          {post.likesCount}
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => openComments(post)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-[10px]"
                    >
                      <MessageCircle className="w-[17px] h-[17px] text-[#8E95A2]" />
                      {(post.commentsCount || 0) > 0 && (
                        <span className="text-[12.5px] font-numeric font-semibold text-[#8E95A2]">
                          {post.commentsCount}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Comments Bottom Sheet */}
      <AnimatePresence>
        {commentSheetPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCommentSheetPost(null);
                setComments([]);
                setCommentText('');
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[201] bg-white dark:bg-[#141820] rounded-t-[24px] max-h-[75vh] flex flex-col border-t border-black/10 dark:border-white/10"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
                <h2 className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
                  Comments
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setCommentSheetPost(null);
                    setComments([]);
                    setCommentText('');
                  }}
                  className="w-8 h-8 rounded-[10px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#16A34A] dark:text-[#8BE649] animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-[13.5px] text-[#5C616B] dark:text-[#8E95A2] py-8">
                    No comments yet. Be the first to cheer them on!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#111317] dark:bg-[#8BE649] flex items-center justify-center shrink-0 overflow-hidden">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white dark:text-[#0B0E13] text-[12px] font-bold">
                              {(c.displayName || 'A').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[13.5px] font-semibold text-[#111317] dark:text-white">
                              {c.displayName}
                            </span>
                            <span className="text-[11px] text-[#8E95A2]">
                              {timeAgo(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-[13.5px] text-[#3A3D45] dark:text-[#D0D5DD] mt-0.5 leading-snug">
                            {c.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex items-center gap-2 px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.08]"
                style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2.5 rounded-[12px] bg-[#F5F6F8] dark:bg-white/[0.07] text-[14px] text-[#111317] dark:text-white placeholder:text-[#8E95A2] outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || commentSending}
                  className="w-10 h-10 rounded-[12px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] flex items-center justify-center disabled:opacity-40 shrink-0"
                >
                  {commentSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Center Drawer */}
      <NotificationCenter
        open={notifOpen}
        onClose={() => {
          setNotifOpen(false);
          loadUnreadCount();
        }}
      />
    </div>
  );
}