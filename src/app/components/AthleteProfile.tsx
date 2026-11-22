import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, UserPlus, UserCheck, Activity, Dumbbell,
  Clock, TrendingUp, Loader2, X, Flame, Bookmark, Check,
  ChevronDown, ChevronUp, Play,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchUserProfile, fetchUserActivities,
  fetchFollowers, fetchFollowing,
  followUser, unfollowUser,
  fetchUserTemplates, saveUserTemplate,
} from '../data/api';
import type { CommunityProfile, ActivityPost, TopTemplate } from '../data/api';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/exercises';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLOR_MAP: Record<string, string> = {
  gym: CATEGORY_COLORS.gym,
  calisthenics: CATEGORY_COLORS.calisthenics,
  animalflow: CATEGORY_COLORS.animalflow,
};

export function AthleteProfile() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [activities, setActivities] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [listType, setListType] = useState<'followers' | 'following' | null>(null);
  const [listData, setListData] = useState<CommunityProfile[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [topTemplates, setTopTemplates] = useState<TopTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState<string | null>(null);
  const [savedTemplateIds, setSavedTemplateIds] = useState<Set<string>>(new Set());
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadProfile();
    loadActivities();
    loadTemplates();
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { profile: p } = await fetchUserProfile(userId);
      setProfile(p);
    } catch (err) {
      console.log('[AthleteProfile] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!userId) return;
    try {
      const { activities: a } = await fetchUserActivities(userId);
      setActivities(a);
    } catch (err) {
      console.log('[AthleteProfile] Activities error:', err);
    }
  };

  const loadTemplates = async () => {
    if (!userId) return;
    try {
      const { templates } = await fetchUserTemplates(userId);
      setTopTemplates(templates || []);
    } catch (err) {
      console.log('[AthleteProfile] Templates error:', err);
    }
  };

  const handleSaveTemplate = async (templateId: string) => {
    if (!userId || savingTemplate) return;
    setSavingTemplate(templateId);
    try {
      console.log(`[AthleteProfile] Saving template ${templateId} from owner ${userId}...`);
      const result = await saveUserTemplate(templateId, userId);
      console.log(`[AthleteProfile] Save template result:`, result);
      setSavedTemplateIds(prev => new Set([...prev, templateId]));
      toast.success('Template saved! Check your Saved Templates on your profile.');
    } catch (err) {
      console.log('[AthleteProfile] Save template error:', err);
      toast.error(`Could not save template: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSavingTemplate(null);
    }
  };

  const handleFollow = async () => {
    if (!userId || !profile) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await unfollowUser(userId);
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: false,
          followersCount: (prev.followersCount || 1) - 1,
        } : null);
      } else {
        await followUser(userId);
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1,
        } : null);
      }
    } catch (err) {
      console.log('[AthleteProfile] Follow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const openList = async (type: 'followers' | 'following') => {
    if (!userId) return;
    setListType(type);
    setListLoading(true);
    try {
      if (type === 'followers') {
        const { followers } = await fetchFollowers(userId);
        setListData(followers);
      } else {
        const { following } = await fetchFollowing(userId);
        setListData(following);
      }
    } catch (err) {
      console.log(`[AthleteProfile] ${type} load error:`, err);
    } finally {
      setListLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-[#34C759] animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <p className="text-[17px] text-[#1c1c1e] mb-2" style={{ fontWeight: 600 }}>
          Athlete not found
        </p>
        <button onClick={() => navigate(-1)} className="text-[#34C759] text-[15px]" style={{ fontWeight: 500 }}>
          Go back
        </button>
      </div>
    );
  }

  const preferredLabel = profile.preferredStyle
    ? CATEGORY_LABELS[profile.preferredStyle as keyof typeof CATEGORY_LABELS] || profile.preferredStyle
    : 'All styles';

  return (
    <div className="pb-28 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-10 h-10 rounded-[12px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111317] dark:text-white" />
        </motion.button>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] leading-[1.15] text-[#111317] dark:text-white flex-1 truncate">
          {profile.displayName}
        </h1>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-4 bg-white rounded-[24px] p-6 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[28px]" style={{ fontWeight: 600 }}>
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[22px] text-[#1c1c1e]" style={{ fontWeight: 700 }}>
              {profile.displayName}
            </p>
            <p className="text-[13px] text-[#8e8e93] mt-0.5">
              {preferredLabel}
            </p>
            {profile.bio && (
              <p className="text-[14px] text-[#48484a] mt-1">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-around mb-5">
          <div className="text-center">
            <div className="font-numeric text-[22px] text-[#1c1c1e]" style={{ fontWeight: 600 }}>
              {profile.workoutCount || 0}
            </div>
            <div className="text-[12px] text-[#8e8e93]">Workouts</div>
          </div>
          <button onClick={() => openList('followers')} className="text-center">
            <div className="font-numeric text-[22px] text-[#1c1c1e]" style={{ fontWeight: 600 }}>
              {profile.followersCount || 0}
            </div>
            <div className="text-[12px] text-[#8e8e93]">Followers</div>
          </button>
          <button onClick={() => openList('following')} className="text-center">
            <div className="font-numeric text-[22px] text-[#1c1c1e]" style={{ fontWeight: 600 }}>
              {profile.followingCount || 0}
            </div>
            <div className="text-[12px] text-[#8e8e93]">Following</div>
          </button>
        </div>

        {/* Follow button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFollow}
          disabled={followLoading}
          className={`w-full py-3 rounded-[14px] text-[15px] flex items-center justify-center gap-2 transition-colors ${
            profile.isFollowing
              ? 'bg-[rgba(229,229,234,0.7)] text-[#1c1c1e]'
              : 'bg-[#34C759] text-white'
          }`}
          style={{ fontWeight: 600 }}
        >
          {followLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : profile.isFollowing ? (
            <>
              <UserCheck className="w-4 h-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Follow
            </>
          )}
        </motion.button>
      </motion.div>

      {/* All-Time Stats */}
      {((profile.totalVolume ?? 0) > 0 || (profile.totalDuration ?? 0) > 0 || (profile.totalSets ?? 0) > 0 || (profile.totalReps ?? 0) > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-6 mt-6"
        >
          <span className="text-[13px] text-[#8e8e93] tracking-[1.3px] uppercase block mb-3" style={{ fontWeight: 500 }}>
            Stats
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Activity, label: 'Workouts', value: profile.workoutCount || 0 },
              { icon: TrendingUp, label: 'Total Reps', value: (profile.totalReps || 0).toLocaleString() },
              { icon: Dumbbell, label: 'Total Sets', value: (profile.totalSets || 0).toLocaleString() },
              { icon: Clock, label: 'Minutes', value: profile.totalDuration || 0 },
            ].map(stat => (
              <div
                key={stat.label}
                className="bg-white rounded-[20px] p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)]"
              >
                <stat.icon className="w-4 h-4 text-[#8e8e93] mb-2" />
                <div
                  className="font-numeric text-[22px] text-[#1c1c1e] tracking-[-0.5px]"
                  style={{ fontWeight: 500 }}
                >
                  {stat.value}
                </div>
                <div className="text-[12px] text-[#727272] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
          {(profile.totalVolume || 0) > 0 && (
            <div className="bg-white rounded-[20px] p-4 mt-3 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)]">
              <div
                className="font-numeric text-[22px] text-[#1c1c1e] tracking-[-0.5px]"
                style={{ fontWeight: 500 }}
              >
                {(profile.totalVolume || 0).toLocaleString()}{' '}
                <span className="text-[14px] text-[#727272]">lbs</span>
              </div>
              <div className="text-[12px] text-[#727272] mt-0.5">Total Volume Lifted</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Workout Templates */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mx-6 mt-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-4 h-4 text-[#34C759]" />
          <span className="text-[13px] text-[#8e8e93] tracking-[1.3px] uppercase" style={{ fontWeight: 500 }}>
            Workout Templates
          </span>
        </div>
        {topTemplates.length === 0 ? (
          <div className="bg-white rounded-[20px] p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(52,199,89,0.08)] flex items-center justify-center mb-3">
              <Dumbbell className="w-5 h-5 text-[#34C759]" />
            </div>
            <p className="text-[15px] text-[#1c1c1e] mb-1" style={{ fontWeight: 600 }}>
              No templates yet
            </p>
            <p className="text-[13px] text-[#8e8e93] max-w-[220px]">
              {profile.displayName} hasn't created any workout templates yet.
            </p>
          </div>
        ) : (
        <div className="flex flex-col gap-3">
          {topTemplates.map(t => {
              const catColor = CATEGORY_COLOR_MAP[t.category] || '#34C759';
              const catLabel = CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category;
              const isSaved = savedTemplateIds.has(t.templateId);
              const isSaving = savingTemplate === t.templateId;
              const isExpanded = expandedTemplateId === t.templateId;
              const exercises = (t.exercises || []) as { exerciseName?: string; name?: string; sets?: number; targetReps?: number; weight?: number; isTimeBased?: boolean }[];
              return (
                <div
                  key={t.templateId}
                  className="bg-white rounded-[24px] shadow-[0px_8px_30px_0px_rgba(0,0,0,0.06)] overflow-hidden"
                >
                  <div className="p-5">
                    {/* Category badge */}
                    <span
                      className="inline-block px-2.5 py-1 rounded-[12px] text-[11px] tracking-[0.55px] uppercase mb-4"
                      style={{ backgroundColor: `${catColor}18`, color: catColor, fontWeight: 700 }}
                    >
                      {catLabel}
                    </span>

                    {/* Play button */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-5"
                      style={{ backgroundColor: 'rgba(229,229,234,0.5)' }}
                    >
                      <Play className="w-4 h-4 text-[#1c1c1e] ml-0.5" fill="#1c1c1e" />
                    </div>

                    {/* Template name & info */}
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-[18px] text-[#1c1c1e] tracking-[-0.2px]" style={{ fontWeight: 600 }}>
                        {t.templateName}
                      </h3>
                      {t.usageCount > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2 mt-1">
                          <Flame className="w-3 h-3 text-[#E8772E]" />
                          <span className="text-[12px] text-[#E8772E]" style={{ fontWeight: 600 }}>
                            {t.usageCount}x
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[12px] text-[#8e8e93]">
                      {t.estimatedMinutes > 0 ? `${t.estimatedMinutes} min` : ''}{t.estimatedMinutes > 0 && t.exerciseCount > 0 ? ' \u2022 ' : ''}{t.exerciseCount} exercise{t.exerciseCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Exercises toggle */}
                  {exercises.length > 0 && (
                    <>
                      <button
                        onClick={() => setExpandedTemplateId(isExpanded ? null : t.templateId)}
                        className="w-full flex items-center justify-between px-5 py-3 border-t border-[rgba(142,142,147,0.1)]"
                      >
                        <span className="text-[13px] text-[#8e8e93]" style={{ fontWeight: 500 }}>
                          {isExpanded ? 'Hide exercises' : 'View exercises'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#8e8e93]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#8e8e93]" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4">
                              {exercises.map((ex, j) => (
                                <div
                                  key={j}
                                  className={`flex items-center justify-between py-2.5 ${
                                    j < exercises.length - 1 ? 'border-b border-[rgba(142,142,147,0.08)]' : ''
                                  }`}
                                >
                                  <span className="text-[14px] text-[#48484a] truncate mr-3" style={{ fontWeight: 500 }}>
                                    {ex.exerciseName || ex.name || 'Exercise'}
                                  </span>
                                  <span className="text-[12px] text-[#8e8e93] whitespace-nowrap flex-shrink-0">
                                    {ex.isTimeBased
                                      ? `${ex.sets || 3}s \u00b7 hold`
                                      : `${ex.sets || 3}s \u00d7 ${ex.targetReps || 10}r${ex.weight ? ` \u00b7 ${ex.weight}lb` : ''}`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}

                  {/* Save button */}
                  <div className="px-5 pb-5 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSaveTemplate(t.templateId)}
                      disabled={isSaved || isSaving}
                      className={`w-full py-2.5 rounded-[12px] text-[13px] flex items-center justify-center gap-1.5 transition-colors ${
                        isSaved
                          ? 'bg-[rgba(52,199,89,0.1)] text-[#34C759]'
                          : 'bg-[rgba(0,86,214,0.08)] text-[#0056D6]'
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          Save Template
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-6 mt-6"
      >
        <span className="text-[13px] text-[#8e8e93] tracking-[1.3px] uppercase block mb-3" style={{ fontWeight: 500 }}>
          Recent Workouts
        </span>

        {activities.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 flex flex-col items-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)]">
            <Dumbbell className="w-6 h-6 text-[#c7c7cc] mb-2" />
            <p className="text-[14px] text-[#8e8e93]">No workouts shared yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)]">
            {activities.map((post, i) => {
              const categoryColor = CATEGORY_COLOR_MAP[post.category] || '#34C759';
              return (
                <div
                  key={post.id}
                  className={`px-4 py-3.5 ${i < activities.length - 1 ? 'border-b border-[#f2f2f7]' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="px-2 py-0.5 rounded-[6px] text-[10px] tracking-[0.5px] uppercase text-white"
                      style={{ backgroundColor: categoryColor, fontWeight: 700 }}
                    >
                      {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS] || post.category}
                    </div>
                    <span className="text-[14px] text-[#1c1c1e]" style={{ fontWeight: 600 }}>
                      {post.sessionName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#8e8e93]">
                    {post.durationMinutes > 0 && (
                      <span>{formatDuration(post.durationMinutes)}</span>
                    )}
                    <span>{post.exerciseCount} exercises</span>
                    {post.totalVolume > 0 && (
                      <span>{post.totalVolume.toLocaleString()} lb</span>
                    )}
                    <span className="ml-auto">{timeAgo(post.postedAt || post.completedAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Followers / Following List Sheet ── */}
      <AnimatePresence>
        {listType && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setListType(null); setListData([]); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-[24px] max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#f2f2f7]">
                <h2 className="text-[17px] text-[#1c1c1e]" style={{ fontWeight: 600 }}>
                  {listType === 'followers' ? 'Followers' : 'Following'}
                </h2>
                <button
                  onClick={() => { setListType(null); setListData([]); }}
                  className="w-8 h-8 rounded-full bg-[rgba(229,229,234,0.7)] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#636366]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-8">
                {listLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 text-[#34C759] animate-spin" />
                  </div>
                ) : listData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[14px] text-[#8e8e93]">
                      {listType === 'followers' ? 'No followers yet' : 'Not following anyone'}
                    </p>
                  </div>
                ) : (
                  listData.map((user, i) => (
                    <div
                      key={user.userId}
                      className={`flex items-center gap-3 py-3 ${
                        i < listData.length - 1 ? 'border-b border-[#f2f2f7]' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          setListType(null);
                          setListData([]);
                          if (!user.isMe) {
                            navigate(`/athlete/${user.userId}`);
                          }
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#34C759] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-[14px]" style={{ fontWeight: 600 }}>
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] text-[#1c1c1e] truncate" style={{ fontWeight: 600 }}>
                            {user.displayName}
                            {user.isMe && <span className="text-[#8e8e93]"> (you)</span>}
                          </p>
                        </div>
                      </button>
                      {!user.isMe && (
                        <button
                          onClick={async () => {
                            if (user.isFollowing) {
                              await unfollowUser(user.userId);
                              setListData(prev =>
                                prev.map(u => u.userId === user.userId ? { ...u, isFollowing: false } : u)
                              );
                            } else {
                              await followUser(user.userId);
                              setListData(prev =>
                                prev.map(u => u.userId === user.userId ? { ...u, isFollowing: true } : u)
                              );
                            }
                          }}
                          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] transition-colors ${
                            user.isFollowing
                              ? 'bg-[rgba(229,229,234,0.7)] text-[#1c1c1e]'
                              : 'bg-[#34C759] text-white'
                          }`}
                          style={{ fontWeight: 600 }}
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