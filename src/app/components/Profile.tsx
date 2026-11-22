import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Edit3, Check, Activity, Dumbbell, Clock, TrendingUp, Settings, Users,
  Bookmark, Flame, Trash2, Loader2, Play, ChevronDown, ChevronUp, X,
  Sun, Moon, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  getPreferences, getSessions, savePreferencesStatic, saveTemplateStatic,
  getTopTemplates, generateId, getTemplates,
} from '../data/store';
import { calculateTrainingStreak } from '../data/workoutPresets';
import { CATEGORY_LABELS, CATEGORY_COLORS, type Category } from '../data/exercises';
import {
  fetchAvatarUrl, fetchMyProfile, updateCommunityProfile,
  fetchSavedTemplates, deleteSavedTemplate, fetchFollowers, fetchFollowing,
  followUser, unfollowUser, getActiveAuthProvider,
} from '../data/api';
import type { SavedTemplate, CommunityProfile } from '../data/api';
import { ProfilePictureCropper } from './ProfilePictureCropper';
import { SettingsDrawer } from './Settings';
import { RepLogo } from './RepLogo';
import { PWAInstallCard } from './PWAInstallPrompt';
import { getAppearance, setAppearance } from '../data/theme';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, subWeeks, isWithinInterval, getMonth,
  isToday as isDateToday, isYesterday,
} from 'date-fns';
import type { WorkoutSession } from '../data/store';

const AVATAR_CACHE_KEY = 'forma_avatar_url';
const FEATURE_SAVED_TEMPLATES_ENABLED = true;

export function Profile() {
  const navigate = useNavigate();
  const prefs = getPreferences();
  const sessions = getSessions().filter(s => s.completedAt) as WorkoutSession[];

  const [displayName, setDisplayName] = useState(prefs.displayName);
  const [editing, setEditing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profileTab, setProfileTab] = useState<'progress' | 'activities'>('progress');
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AVATAR_CACHE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Followers / Following drawer state
  const [listType, setListType] = useState<'followers' | 'following' | null>(null);
  const [listData, setListData] = useState<CommunityProfile[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const syncTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!getActiveAuthProvider()) return;

    (async () => {
      try {
        const { url } = await fetchAvatarUrl();
        setAvatarUrl(url);
        if (url) localStorage.setItem(AVATAR_CACHE_KEY, url);
        else localStorage.removeItem(AVATAR_CACHE_KEY);
      } catch (err) {
        console.log('[Profile] Could not load avatar URL:', err);
      }
    })();

    (async () => {
      try {
        const { profile } = await fetchMyProfile();
        setFollowersCount(profile.followersCount || 0);
        setFollowingCount(profile.followingCount || 0);
        if (profile.userId) setCurrentUserId(profile.userId);
      } catch (err) {
        console.log('[Profile] Could not load community profile:', err);
      }
    })();
  }, []);

  const toggleQuickTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setAppearance(next);
    setIsDark(next === 'dark');
  };

  const openFollowList = async (type: 'followers' | 'following') => {
    if (!currentUserId) return;
    setListType(type);
    setListLoading(true);
    try {
      if (type === 'followers') {
        const { followers } = await fetchFollowers(currentUserId);
        setListData(followers);
      } else {
        const { following } = await fetchFollowing(currentUserId);
        setListData(following);
      }
    } catch (err) {
      console.log(`[Profile] ${type} load error:`, err);
    } finally {
      setListLoading(false);
    }
  };

  const closeFollowList = () => {
    setListType(null);
    setListData([]);
  };

  const handleAvatarChange = (url: string | null) => {
    setAvatarUrl(url);
    if (url) localStorage.setItem(AVATAR_CACHE_KEY, url);
    else localStorage.removeItem(AVATAR_CACHE_KEY);
  };

  const saveName = () => {
    const name = displayName.trim() || 'Athlete';
    savePreferencesStatic({ ...prefs, displayName: name });
    setDisplayName(name);
    setEditing(false);
    if (getActiveAuthProvider()) {
      updateCommunityProfile({ displayName: name }).catch(err =>
        console.log('[Profile] Community profile update error:', err),
      );
    }
  };

  const totalWorkouts = sessions.length;
  const totalReps = sessions.reduce(
    (a, s) =>
      a + s.exercises.reduce(
        (b, ex) => b + ex.sets.filter(set => set.completed).reduce((c, set) => c + set.reps, 0), 0,
      ),
    0,
  );
  const totalSets = sessions.reduce(
    (a, s) => a + s.exercises.reduce((b, ex) => b + ex.sets.filter(set => set.completed).length, 0), 0,
  );
  const totalDuration = sessions.reduce((a, s) => {
    if (s.completedAt) {
      return a + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 1000 / 60;
    }
    return a;
  }, 0);
  const totalVolume = sessions.reduce(
    (a, s) =>
      a + s.exercises.reduce(
        (b, ex) =>
          b + ex.sets.filter(set => set.completed).reduce((c, set) => c + set.reps * (set.weight || 0), 0), 0,
      ),
    0,
  );
  const currentStreak = useMemo(() => calculateTrainingStreak(sessions), [sessions]);

  // Monthly activity tracker
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const activeDaysSet = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      if (s.completedAt) set.add(format(new Date(s.completedAt), 'yyyy-MM-dd'));
    });
    return set;
  }, [sessions]);

  const activeDaysThisMonth = daysInMonth.filter(d => activeDaysSet.has(format(d, 'yyyy-MM-dd'))).length;
  const gridPadding = (monthStart.getDay() + 6) % 7;

  // Weekly activity chart (last 12 weeks)
  const weeklyData = useMemo(() => {
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weeks: { month: string; monthNum: number; hours: number; minutes: number; start: Date; end: Date }[] = [];

    for (let i = 11; i >= 0; i--) {
      const wStart = subWeeks(currentWeekStart, i);
      const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
      weeks.push({
        month: format(wStart, 'MMM'),
        monthNum: getMonth(wStart),
        hours: 0,
        minutes: 0,
        start: wStart,
        end: wEnd,
      });
    }

    sessions.forEach(s => {
      if (!s.completedAt) return;
      const completedDate = new Date(s.completedAt);
      const mins = (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 1000 / 60;
      for (const w of weeks) {
        if (isWithinInterval(completedDate, { start: w.start, end: w.end })) {
          w.minutes += mins;
          w.hours += mins / 60;
          break;
        }
      }
    });

    let lastMonthNum = -1;
    return weeks.map((w, idx) => {
      const showLabel = w.monthNum !== lastMonthNum;
      lastMonthNum = w.monthNum;
      return {
        week: `w${idx}`,
        month: w.month,
        showMonthLabel: showLabel,
        hours: Math.round(w.hours * 100) / 100,
        minutes: Math.round(w.minutes),
      };
    });
  }, [sessions]);

  const currentWeekMinutes = weeklyData[weeklyData.length - 1]?.minutes || 0;
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 0.5);

  const yTicks = useMemo(() => {
    const ceil = Math.ceil(maxHours * 2) / 2;
    const top = Math.max(ceil, 2);
    const ticks: number[] = [];
    for (let v = 0; v <= top; v += 0.5) ticks.push(v);
    return ticks;
  }, [maxHours]);

  const yDomain = [0, yTicks[yTicks.length - 1]];
  const chartStroke = isDark ? '#8BE649' : '#16A34A';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-5 md:pt-8 pb-12">
      {/* Header */}
      <div className="rep-page-header">
        <h1 className="rep-page-title">
          Profile
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleQuickTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="h-10 px-3 rounded-[12px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#111317] dark:text-white whitespace-nowrap"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#8BE649]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#5C616B]" />
                <span>Dark</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
            className="w-10 h-10 rounded-[12px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-[#5C616B] dark:text-[#9BA3B0]" />
          </button>
        </div>
      </div>

      {/* Obsidian Athlete Identity Hero Card */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[26px] bg-[#0D1016] text-white border border-white/[0.08] p-5 sm:p-6 mb-5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center gap-4">
          <ProfilePictureCropper
            currentAvatarUrl={avatarUrl}
            displayName={displayName}
            onAvatarChange={handleAvatarChange}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8BE649]">
              {prefs.preferredStyle ? `${CATEGORY_LABELS[prefs.preferredStyle]} Athlete` : 'Rep Athlete'}
            </p>
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white/[0.09] rounded-[10px] border border-white/15 outline-none text-white text-[15px]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveName}
                  aria-label="Save name"
                  className="w-8 h-8 rounded-[10px] bg-[#8BE649] text-[#080A0E] flex items-center justify-center shrink-0"
                >
                  <Check className="w-4 h-4" strokeWidth={2.8} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-display text-[22px] sm:text-[24px] font-bold text-white truncate leading-tight">
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label="Edit display name"
                  className="w-7 h-7 rounded-[9px] bg-white/[0.09] hover:bg-white/[0.15] flex items-center justify-center shrink-0 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D0D5DD]" />
                </button>
              </div>
            )}
            <p className="text-[12.5px] text-[#9BA3B0] mt-1 truncate">
              <span className="font-numeric text-white font-semibold">{activeDaysThisMonth}</span> active{' '}
              {activeDaysThisMonth === 1 ? 'day' : 'days'}
              {totalVolume > 0 && (
                <>
                  {' · '}
                  <span className="font-numeric text-white font-semibold">{totalVolume.toLocaleString()}</span> lb lifted
                </>
              )}
            </p>
          </div>
        </div>

        {/* Unified 4-Column Metric Bar */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/[0.08]">
          <div className="text-center">
            <div className="font-numeric text-[20px] sm:text-[22px] font-semibold text-white leading-none">
              {totalWorkouts}
            </div>
            <div className="text-[11px] text-[#9BA3B0] mt-1">Workouts</div>
          </div>
          <div className="text-center border-l border-white/[0.08]">
            <div className="font-numeric text-[20px] sm:text-[22px] font-semibold text-[#8BE649] leading-none">
              {currentStreak}d
            </div>
            <div className="text-[11px] text-[#9BA3B0] mt-1">Streak</div>
          </div>
          <button
            type="button"
            onClick={() => openFollowList('followers')}
            className="text-center border-l border-white/[0.08]"
          >
            <div className="font-numeric text-[20px] sm:text-[22px] font-semibold text-white leading-none">
              {followersCount}
            </div>
            <div className="text-[11px] text-[#9BA3B0] mt-1">Followers</div>
          </button>
          <button
            type="button"
            onClick={() => openFollowList('following')}
            className="text-center border-l border-white/[0.08]"
          >
            <div className="font-numeric text-[20px] sm:text-[22px] font-semibold text-white leading-none">
              {followingCount}
            </div>
            <div className="text-[11px] text-[#9BA3B0] mt-1">Following</div>
          </button>
        </div>
      </motion.section>

      {/* Android / PWA Install Card */}
      <div className="mb-5">
        <PWAInstallCard />
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex p-1 rounded-[14px] bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] mb-5">
        {(['progress', 'activities'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setProfileTab(tab)}
            className={`px-5 py-2 rounded-[10px] text-[13.5px] font-semibold whitespace-nowrap transition-all ${
              profileTab === tab
                ? 'bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#0B0E13]'
                : 'text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#111317] dark:hover:text-white'
            }`}
          >
            {tab === 'progress' ? 'Progress' : 'Activities'}
          </button>
        ))}
      </div>

      {/* PROGRESS TAB */}
      {profileTab === 'progress' && (
        <div className="space-y-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Weekly Training Bar Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] rounded-[22px] px-5 pt-5 pb-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="text-[12.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0]">
                    Weekly training time (last 12 weeks)
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-numeric text-[32px] font-semibold text-[#0E1116] dark:text-white leading-none">
                      {currentWeekMinutes}
                    </span>
                    <span className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0]">min this week</span>
                  </div>
                </div>
                <span className="font-numeric text-[12px] font-semibold text-[#16A34A] dark:text-[#8BE649]">
                  {Math.round(totalDuration)}m total
                </span>
              </div>

              <div className="h-[184px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={weeklyData} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barCategoryGap="24%">
                    <XAxis
                      dataKey="week"
                      tick={({ x, y, payload }: any) => {
                        const item = weeklyData.find((d: any) => d.week === payload.value);
                        if (!item?.showMonthLabel) return <g key={payload.value} />;
                        return (
                          <text key={payload.value} x={x} y={y + 10} textAnchor="middle" fontSize={10.5} fill="#8E95A2">
                            {item.month}
                          </text>
                        );
                      }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tickMargin={6}
                    />
                    <YAxis
                      orientation="right"
                      tick={{ fontSize: 10, fill: '#8E95A2' }}
                      tickLine={false}
                      axisLine={false}
                      domain={yDomain}
                      ticks={yTicks}
                      tickFormatter={(v: number) => `${v}h`}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0D1016',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12,
                        padding: '8px 12px',
                      }}
                      labelStyle={{ color: '#9BA3B0', fontSize: 11, marginBottom: 2 }}
                      itemStyle={{ color: '#fff', fontSize: 13, fontWeight: 600, padding: 0 }}
                      labelFormatter={(value: string) => weeklyData.find(d => d.week === value)?.month || 'Week'}
                      formatter={(_value: number, _name: string, props: any) => [`${props.payload?.minutes ?? 0} min`, 'Trained']}
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', radius: 8 }}
                    />
                    <Bar
                      dataKey="hours"
                      radius={[8, 8, 4, 4]}
                      minPointSize={4}
                      background={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(14,17,22,0.04)', radius: 8 }}
                    >
                      {weeklyData.map((entry, idx) => {
                        const isLatest = idx === weeklyData.length - 1;
                        const fill =
                          entry.minutes === 0
                            ? isDark
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(14,17,22,0.08)'
                            : isLatest
                            ? chartStroke
                            : isDark
                            ? 'rgba(139,230,73,0.52)'
                            : 'rgba(22,163,74,0.55)';
                        return <Cell key={entry.week} fill={fill} />;
                      })}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Activity Calendar */}
            <div className="lg:col-span-5 bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[22px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-[16px] font-bold text-[#111317] dark:text-white">
                  {format(now, 'MMMM yyyy')}
                </h2>
                <span className="text-[12.5px] font-semibold text-[#16A34A] dark:text-[#8BE649]">
                  <span className="font-numeric">{activeDaysThisMonth}</span> active day{activeDaysThisMonth !== 1 ? 's' : ''}
                </span>
              </div>

              <div>
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[11px] font-medium text-[#5C616B] dark:text-[#8E95A2]">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: gridPadding }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {daysInMonth.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isActive = activeDaysSet.has(dateStr);
                    const isToday = isDateToday(day);
                    const isFuture = day > now;

                    return (
                      <div key={dateStr} className="flex items-center justify-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11.5px] font-numeric transition-colors ${
                            isActive
                              ? 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] font-semibold'
                              : isToday
                              ? 'bg-[#16A34A]/15 dark:bg-[#8BE649]/20 text-[#16A34A] dark:text-[#8BE649] font-semibold'
                              : isFuture
                              ? 'text-[#C7C7CC] dark:text-[#3A4150]'
                              : 'bg-black/[0.04] dark:bg-white/[0.05] text-[#5C616B] dark:text-[#9BA3B0]'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* All-Time Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Activity, label: 'Workouts', value: totalWorkouts.toLocaleString() },
              { icon: TrendingUp, label: 'Total reps', value: totalReps.toLocaleString() },
              { icon: Dumbbell, label: 'Total sets', value: totalSets.toLocaleString() },
              { icon: Clock, label: 'Minutes trained', value: Math.round(totalDuration).toLocaleString() },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <stat.icon className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649] mb-2" />
                <div className="font-numeric text-[24px] font-semibold text-[#111317] dark:text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {totalVolume > 0 && (
            <div className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div>
                <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0]">All-time volume lifted</p>
                <p className="font-numeric text-[24px] font-semibold text-[#111317] dark:text-white mt-0.5 leading-none">
                  {totalVolume.toLocaleString()} <span className="text-[14px] text-[#5C616B] dark:text-[#9BA3B0]">lb</span>
                </p>
              </div>
              <Flame className="w-5 h-5 text-[#D9592E] dark:text-[#F08865]" />
            </div>
          )}
        </div>
      )}

      {/* ACTIVITIES TAB */}
      {profileTab === 'activities' && <ActivitiesTab sessions={sessions} />}

      {/* Top Templates & Saved Templates */}
      <TopTemplatesSection />
      {FEATURE_SAVED_TEMPLATES_ENABLED && <SavedTemplatesSection />}

      {/* Settings Drawer */}
      <SettingsDrawer open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Followers / Following Bottom Drawer */}
      <AnimatePresence>
        {listType && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFollowList}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[201] bg-white dark:bg-[#141820] rounded-t-[24px] max-h-[70vh] flex flex-col border-t border-black/10 dark:border-white/10"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 rounded-full bg-[#d1d1d6] dark:bg-white/20" />
              </div>

              <div className="flex items-center justify-between px-6 pt-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                <h2 className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
                  {listType === 'followers' ? 'Followers' : 'Following'}
                </h2>
                <button
                  type="button"
                  onClick={closeFollowList}
                  className="w-8 h-8 rounded-[10px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-8">
                {listLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-[#16A34A] dark:text-[#8BE649] animate-spin" />
                  </div>
                ) : listData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-[#C7C7CC] dark:text-[#48484A] mx-auto mb-3" />
                    <p className="text-[15px] font-semibold text-[#5C616B] dark:text-[#9BA3B0]">
                      {listType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                    </p>
                    <p className="text-[13px] text-[#8E95A2] mt-1">
                      {listType === 'followers'
                        ? 'Share your workouts to get discovered'
                        : 'Find athletes on the Home feed'}
                    </p>
                  </div>
                ) : (
                  listData.map((user, i) => (
                    <div
                      key={user.userId}
                      className={`flex items-center gap-3 py-3.5 ${
                        i < listData.length - 1 ? 'border-b border-black/[0.06] dark:border-white/[0.06]' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          closeFollowList();
                          if (!user.isMe) navigate(`/athlete/${user.userId}`);
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        <div className="w-11 h-11 rounded-full bg-[#16A34A] dark:bg-[#8BE649] flex items-center justify-center overflow-hidden shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white dark:text-[#0B0E13] text-[15px] font-bold">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-[#111317] dark:text-white truncate">
                            {user.displayName}
                            {user.isMe && <span className="text-[#5C616B] dark:text-[#9BA3B0]"> (you)</span>}
                          </p>
                          {user.preferredStyle && (
                            <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] truncate">
                              {CATEGORY_LABELS[user.preferredStyle as keyof typeof CATEGORY_LABELS] || user.preferredStyle}
                            </p>
                          )}
                        </div>
                      </button>
                      {!user.isMe && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (user.isFollowing) {
                                await unfollowUser(user.userId);
                                setListData(prev => prev.map(u => (u.userId === user.userId ? { ...u, isFollowing: false } : u)));
                                setFollowingCount(c => Math.max(0, c - 1));
                              } else {
                                await followUser(user.userId);
                                setListData(prev => prev.map(u => (u.userId === user.userId ? { ...u, isFollowing: true } : u)));
                                setFollowingCount(c => c + 1);
                              }
                            } catch (err) {
                              console.log('[Profile] Follow/unfollow error:', err);
                            }
                          }}
                          className={`shrink-0 px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-colors ${
                            user.isFollowing
                              ? 'bg-[#F0F2F5] dark:bg-white/[0.08] text-[#111317] dark:text-white'
                              : 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13]'
                          }`}
                        >
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDurationMins(minutes: number): string {
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isDateToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMM d');
}

function ActivitiesTab({ sessions }: { sessions: WorkoutSession[] }) {
  const navigate = useNavigate();

  const sorted = useMemo(
    () =>
      [...sessions]
        .filter(s => s.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()),
    [sessions],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sorted.forEach(s => {
      const dateKey = format(new Date(s.completedAt!), 'yyyy-MM-dd');
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(s);
    });
    return Array.from(map.entries());
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[22px] flex flex-col items-center py-14 px-6 mb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF8E0] dark:bg-[#8BE649]/15 flex items-center justify-center mb-3.5">
          <RepLogo size={30} radius={8} />
        </div>
        <p className="font-display text-[17px] font-bold text-[#111317] dark:text-white mb-1">
          No workouts yet
        </p>
        <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] max-w-[260px]">
          Complete your first workout and your full history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-6">
      {grouped.map(([dateKey, daySessions]) => (
        <div key={dateKey}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[13px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] whitespace-nowrap">
              {getDateLabel(daySessions[0].completedAt!)}
            </span>
            <div className="flex-1 h-px bg-black/[0.07] dark:bg-white/[0.08]" />
            <span className="text-[12px] text-[#8E95A2] whitespace-nowrap">
              {format(new Date(daySessions[0].completedAt!), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {daySessions.map(session => {
              const categoryColor = CATEGORY_COLORS[session.category as keyof typeof CATEGORY_COLORS] || '#16A34A';
              const durationMin = session.completedAt
                ? (new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000 / 60
                : 0;
              const setsCount = session.exercises.reduce(
                (a, ex) => a + ex.sets.filter(set => set.completed).length, 0,
              );
              const volume = session.exercises.reduce(
                (a, ex) => a + ex.sets.filter(set => set.completed).reduce((b, set) => b + set.reps * (set.weight || 0), 0), 0,
              );
              const completedTime = format(new Date(session.completedAt!), 'h:mm a');

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => navigate(`/workout/${session.id}/summary`)}
                  className="group bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-[#8BE649]/50 rounded-[20px] p-4 text-left transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <span className="text-[11.5px] font-semibold" style={{ color: categoryColor }}>
                        {CATEGORY_LABELS[session.category as keyof typeof CATEGORY_LABELS] || session.category}
                      </span>
                      <p className="font-display text-[16px] font-bold text-[#111317] dark:text-white truncate">
                        {session.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[12px] text-[#5C616B] dark:text-[#8E95A2]">{completedTime}</span>
                      <ArrowUpRight className="w-4 h-4 text-[#8E95A2] group-hover:text-[#111317] dark:group-hover:text-white" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] font-numeric">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: categoryColor }} />
                      {formatDurationMins(durationMin)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5" style={{ color: categoryColor }} />
                      {setsCount} sets
                    </span>
                    {volume > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" style={{ color: categoryColor }} />
                        {volume.toLocaleString()} lb
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopTemplatesSection() {
  const navigate = useNavigate();
  const topTemplatesLocal = getTopTemplates();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section className="mb-6">
      <h2 className="font-display text-[17px] font-bold text-[#111317] dark:text-white mb-3">
        Top routines
      </h2>

      {topTemplatesLocal.length === 0 ? (
        <div className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] p-6 flex flex-col items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF1EB] dark:bg-[#E97852]/15 flex items-center justify-center mb-2.5">
            <Flame className="w-5 h-5 text-[#D9592E] dark:text-[#F08865]" />
          </div>
          <p className="font-display text-[15.5px] font-bold text-[#111317] dark:text-white mb-1">
            No top routines yet
          </p>
          <p className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0] max-w-[260px]">
            Complete workouts from your routines and your most-used ones will show here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topTemplatesLocal.map(({ template: t, usageCount }) => {
            const catColor = CATEGORY_COLORS[t.category] || '#16A34A';
            const catLabel = CATEGORY_LABELS[t.category] || t.category;
            const isExpanded = expandedId === t.id;
            const exercises = t.exercises || [];
            const estimatedMins = exercises.length > 0
              ? Math.round(exercises.reduce((a, e) => a + e.sets * 1.5 + (e.restSeconds * (e.sets - 1)) / 60, 0))
              : 0;
            return (
              <div
                key={t.id}
                className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11.5px] font-semibold" style={{ color: catColor }}>
                      {catLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-numeric font-semibold text-[#D9592E] dark:text-[#F08865]">
                      <Flame className="w-3.5 h-3.5" />
                      {usageCount}×
                    </span>
                  </div>
                  <h3 className="font-display text-[17px] font-bold text-[#111317] dark:text-white truncate">
                    {t.name}
                  </h3>
                  <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5 font-numeric">
                    {estimatedMins > 0 ? `${estimatedMins} min · ` : ''}
                    {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {exercises.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[12.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0]"
                    >
                      <span>{isExpanded ? 'Hide exercises' : 'View exercises'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-1.5">
                            {exercises.map((ex, j) => (
                              <div key={j} className="flex items-center justify-between text-[13px]">
                                <span className="text-[#3A3D45] dark:text-[#D0D5DD] truncate mr-3">
                                  {ex.exerciseName || 'Exercise'}
                                </span>
                                <span className="font-numeric text-[12px] text-[#5C616B] dark:text-[#8E95A2] whitespace-nowrap shrink-0">
                                  {ex.isTimeBased
                                    ? `${ex.sets}s · hold`
                                    : `${ex.sets}×${ex.targetReps}${ex.weight ? ` · ${ex.weight}lb` : ''}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <div className="px-4 pb-4 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/workouts/${t.id}/live`)}
                    className="w-full py-2.5 rounded-[12px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Workout</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SavedTemplatesSection() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!getActiveAuthProvider()) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { savedTemplates } = await fetchSavedTemplates();
        setSaved(savedTemplates || []);
      } catch (err) {
        console.log('[SavedTemplatesSection] Could not load saved templates:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedTemplate(id);
      setSaved(prev => prev.filter(s => s.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.log('[Profile] Delete saved template error:', err);
    }
  };

  const handleUseTemplate = (st: SavedTemplate) => {
    const existing = getTemplates();
    if (!existing.find(t => t.id === st.id)) {
      const exercises = (st.exercises || []).map((ex: any) => ({
        exerciseId: ex.exerciseId || generateId(),
        exerciseName: ex.exerciseName || ex.name || 'Exercise',
        sets: ex.sets || 3,
        targetReps: ex.targetReps || 10,
        weight: ex.weight,
        restSeconds: ex.restSeconds || 60,
        isTimeBased: ex.isTimeBased || false,
      }));
      saveTemplateStatic({
        id: st.id,
        name: st.templateName,
        category: (st.category as Category) || 'gym',
        exercises,
        createdAt: st.savedAt || new Date().toISOString(),
      });
    }
    navigate(`/workouts/${st.id}/live`);
  };

  if (loading || saved.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="font-display text-[17px] font-bold text-[#111317] dark:text-white mb-3">
        Saved from athletes
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {saved.map(st => {
          const catColor = CATEGORY_COLORS[st.category as keyof typeof CATEGORY_COLORS] || '#16A34A';
          const catLabel = CATEGORY_LABELS[st.category as keyof typeof CATEGORY_LABELS] || st.category;
          const isExpanded = expandedId === st.id;
          const exercises = (st.exercises || []) as {
            exerciseName?: string;
            name?: string;
            sets?: number;
            targetReps?: number;
            weight?: number;
            isTimeBased?: boolean;
          }[];
          return (
            <div
              key={st.id}
              className="bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11.5px] font-semibold" style={{ color: catColor }}>
                      {catLabel}
                    </span>
                    <h3 className="font-display text-[17px] font-bold text-[#111317] dark:text-white truncate">
                      {st.templateName}
                    </h3>
                    <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0]">
                      {st.exerciseCount} exercises · from {st.originalOwnerName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(deleteConfirmId === st.id ? null : st.id)}
                    aria-label="Remove saved template"
                    className="w-8 h-8 rounded-[10px] bg-[#FF3B30]/10 flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#FF3B30]" />
                  </button>
                </div>

                {deleteConfirmId === st.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[12.5px] text-[#FF3B30] font-medium">Remove?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(st.id)}
                      className="px-3 py-1 rounded-lg bg-[#FF3B30] text-white text-[12px] font-semibold"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1 rounded-lg bg-[#F0F2F5] dark:bg-white/[0.08] text-[#5C616B] dark:text-[#9BA3B0] text-[12px] font-medium"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>

              {exercises.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : st.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[12.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0]"
                  >
                    <span>{isExpanded ? 'Hide exercises' : 'View exercises'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-1.5">
                      {exercises.map((ex, j) => (
                        <div key={j} className="flex items-center justify-between text-[13px]">
                          <span className="text-[#3A3D45] dark:text-[#D0D5DD] truncate mr-3">
                            {ex.exerciseName || ex.name || 'Exercise'}
                          </span>
                          <span className="font-numeric text-[12px] text-[#5C616B] dark:text-[#8E95A2] whitespace-nowrap shrink-0">
                            {ex.isTimeBased ? `${ex.sets || 3}s · hold` : `${ex.sets || 3}×${ex.targetReps || 10}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="px-4 pb-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleUseTemplate(st)}
                  className="w-full py-2.5 rounded-[12px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Use Routine</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}