import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Heart, MessageCircle, Send, Share2,
  Clock, Dumbbell, Flame, Copy, Check, X, Loader2,
  ChevronRight, Link as LinkIcon, Layers,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchActivityDetail, likeActivity, unlikeActivity,
  addComment, type ActivityPostDetail,
} from '../data/api';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/exercises';
import { useExerciseCatalog } from '../data/useExerciseCatalog';
import { RadialTelemetryRing } from './visuals/RadialTelemetryRing';
import { MuscleHeatMap } from './visuals/MuscleHeatMap';
import { KineticLoadRibbon } from './visuals/KineticLoadRibbon';
import {
  formatKineticTickerLabel,
  mapMuscleToZones,
  type KineticExercisePoint,
  type MuscleZoneId,
  type MuscleHeatEntry,
} from './visuals/WorkoutAnalyticsEngine';
import { BRAND_3D_ASSETS } from './visuals/brandAssets';

const CATEGORY_COLOR_MAP: Record<string, string> = {
  gym: CATEGORY_COLORS.gym,
  calisthenics: CATEGORY_COLORS.calisthenics,
  animalflow: CATEGORY_COLORS.animalflow,
};

export function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { catalogExercises } = useExerciseCatalog();

  const [post, setPost] = useState<ActivityPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentSending, setCommentSending] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!postId) return;
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      const { activity } = await fetchActivityDetail(postId);
      setPost(activity);
    } catch (err: any) {
      setError(err.message || 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    const wasLiked = post.isLiked;
    setPost(prev =>
      prev
        ? {
            ...prev,
            isLiked: !prev.isLiked,
            likesCount: (prev.likesCount || 0) + (prev.isLiked ? -1 : 1),
          }
        : null,
    );
    try {
      if (wasLiked) await unlikeActivity(post.id);
      else await likeActivity(post.id);
    } catch {
      setPost(prev => (prev ? { ...prev, isLiked: wasLiked, likesCount: post.likesCount } : null));
    }
  };

  const handleSendComment = async () => {
    if (!post || !commentText.trim()) return;
    setCommentSending(true);
    try {
      const { comment } = await addComment(post.id, commentText.trim());
      setPost(prev =>
        prev
          ? {
              ...prev,
              comments: [...(prev.comments || []), comment],
              commentsCount: (prev.commentsCount || 0) + 1,
            }
          : null,
      );
      setCommentText('');
    } finally {
      setCommentSending(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const derived = useMemo(() => {
    if (!post) return null;
    const byName = new Map(catalogExercises.map(e => [e.name.toLowerCase(), e]));
    const zoneCounts: Record<MuscleZoneId, number> = {
      chest: 0, shoulders: 0, biceps: 0, triceps: 0, forearms: 0,
      core: 0, quads: 0, calves: 0, back: 0, glutes: 0, hamstrings: 0,
    };

    const raw = (post.exercises || []).map((ex, i) => {
      const weightMatch = ex.bestSet?.match(/(\d+)\s*lb/i);
      const repsMatch = ex.bestSet?.match(/[x×]\s*(\d+)|(\d+)\s*reps/i);
      const bestWeight = weightMatch ? parseInt(weightMatch[1], 10) : 0;
      const bestReps = repsMatch ? parseInt(repsMatch[1] || repsMatch[2], 10) : 8;
      const rawScore = ex.sets * 15 + (bestWeight > 0 ? Math.min(45, bestWeight * 0.2) : bestReps * 2);

      const meta = byName.get(ex.name.toLowerCase());
      const muscles = meta?.muscleGroups?.length ? meta.muscleGroups : ['Core'];
      muscles.forEach((m, idx) => {
        for (const z of mapMuscleToZones(m)) {
          zoneCounts[z] += Math.max(1, ex.sets) * (idx === 0 ? 1 : 0.45);
        }
      });

      return {
        id: `post-ex-${i}`,
        name: ex.name,
        shortName: ex.name.length > 13 ? ex.name.slice(0, 12) + '…' : ex.name,
        tickerLabel: formatKineticTickerLabel(ex.name),
        completedSets: ex.sets,
        totalSets: ex.sets,
        volume: bestWeight * bestReps * ex.sets,
        bestWeight,
        bestReps,
        bestSetLabel: ex.bestSet || `${ex.sets} sets`,
        rawScore,
      };
    });

    const maxScore = Math.max(1, ...raw.map(r => r.rawScore));
    let peakIdx = 0;
    raw.forEach((r, idx) => {
      if (r.rawScore > raw[peakIdx].rawScore) peakIdx = idx;
    });

    const points: KineticExercisePoint[] = raw.map((r, idx) => ({
      ...r,
      effortScore: Math.min(100, Math.max(26, Math.round((r.rawScore / maxScore) * 100))),
      isPeak: idx === peakIdx,
    }));

    const workload = post.totalSets * 2.1 + Math.min(24, post.durationMinutes * 0.25) + Math.min(28, post.totalVolume / 700);
    const strainScore = Math.round(Math.min(20.6, 21 * (1 - Math.exp(-workload / 36))) * 10) / 10;
    const strainBand = strainScore < 8 ? 'Recovery' : strainScore < 13.5 ? 'Moderate' : strainScore < 17.5 ? 'Optimal' : 'Peak';

    const totalZone = Object.values(zoneCounts).reduce((a, b) => a + b, 0);
    const maxZone = Math.max(0.001, ...Object.values(zoneCounts));
    const zoneIntensity: Partial<Record<MuscleZoneId, number>> = {};
    const muscleHeat: MuscleHeatEntry[] = [];
    (Object.keys(zoneCounts) as MuscleZoneId[]).forEach(z => {
      if (zoneCounts[z] > 0) {
        const intensity = Math.min(1, Math.max(0.25, zoneCounts[z] / maxZone));
        zoneIntensity[z] = intensity;
        muscleHeat.push({
          zone: z,
          label: z.charAt(0).toUpperCase() + z.slice(1),
          sets: Math.round(zoneCounts[z]),
          pct: Math.round((zoneCounts[z] / totalZone) * 100),
          intensity,
        });
      }
    });
    muscleHeat.sort((a, b) => b.pct - a.pct);

    return { points, strainScore, strainBand, zoneIntensity, muscleHeat };
  }, [post, catalogExercises]);

  const timeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F7F9] dark:bg-[#0B0E13] gap-3">
        <Loader2 className="w-7 h-7 text-[#16A34A] dark:text-[#8BE649] animate-spin" />
        <p className="text-[14px] text-[#5C616B] dark:text-[#8E95A2]">Loading workout recap...</p>
      </div>
    );
  }

  if (error || !post || !derived) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F7F9] dark:bg-[#0B0E13] px-6 gap-3">
        <p className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
          {error || 'Workout not found'}
        </p>
        <button type="button" onClick={() => navigate(-1)} className="text-[#16A34A] dark:text-[#8BE649] text-[14px] font-semibold">
          Go back
        </button>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLOR_MAP[post.category] || '#16A34A';

  return (
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#0B0E13] text-[#111317] dark:text-[#F5F7FA] pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-5">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-[11px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[#111317] dark:text-white" />
          </button>

          <button
            type="button"
            onClick={() => navigate(`/athlete/${post.userId}`)}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-[#111317] dark:bg-[#8BE649] overflow-hidden flex items-center justify-center">
              {post.avatarUrl ? (
                <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white dark:text-[#0B0E13] text-[12px] font-bold">
                  {(post.displayName || 'A').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[13.5px] font-semibold text-[#111317] dark:text-white leading-none">
                {post.displayName}
              </p>
              <p className="text-[11.5px] text-[#5C616B] dark:text-[#8E95A2] mt-0.5">{timeAgo(post.postedAt || post.completedAt)}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8E95A2]" />
          </button>

          <button
            type="button"
            onClick={() => setShowShareSheet(true)}
            aria-label="Share workout"
            className="w-9 h-9 rounded-[11px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 text-[#111317] dark:text-white" />
          </button>
        </div>

        {/* Hero Summary Card (Light & Dark Native) */}
        <section className="rounded-[24px] bg-white dark:bg-[#131720] text-[#111317] dark:text-white border border-black/[0.07] dark:border-white/[0.08] p-5 relative overflow-hidden mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <img
            src={BRAND_3D_ASSETS.trophyRing}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-10 -top-10 w-44 h-44 object-cover opacity-[0.06] dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0">
                <RadialTelemetryRing
                  value={derived.strainScore}
                  max={21}
                  displayValue={derived.strainScore.toFixed(1)}
                  label="Strain"
                  sublabel={derived.strainBand}
                  accentColor="#16A34A"
                  darkAccentColor="#8BE649"
                  size={112}
                  segments={28}
                />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-semibold text-[#16A34A] dark:text-[#8BE649]">
                  {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS] || post.category}
                </span>
                <h1 className="font-display text-[20px] sm:text-[25px] font-bold tracking-[-0.02em] leading-[1.15] text-[#111317] dark:text-white mt-0.5 line-clamp-2">
                  {post.title || post.sessionName}
                </h1>
                {post.description && (
                  <p className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0] mt-1 line-clamp-2">{post.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[232px]">
              {[
                { icon: Clock, label: 'Duration', value: `${Math.round(post.durationMinutes)}m` },
                { icon: Flame, label: 'Volume (lb)', value: post.totalVolume > 1000 ? `${(post.totalVolume / 1000).toFixed(1)}k` : post.totalVolume > 0 ? `${post.totalVolume}` : 'BW' },
                { icon: Layers, label: 'Sets done', value: `${post.totalSets}` },
                { icon: Dumbbell, label: 'Moves', value: `${post.exerciseCount}` },
              ].map(k => (
                <div key={k.label} className="rounded-[13px] bg-[#F6F7F9] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.06] px-3 py-2">
                  <div className="flex items-center gap-1 text-[#5C616B] dark:text-[#9BA3B0]">
                    <k.icon className="w-3 h-3 text-[#16A34A] dark:text-[#8BE649]" />
                    <span className="text-[11px] font-medium">{k.label}</span>
                  </div>
                  <p className="font-numeric text-[15px] font-semibold text-[#111317] dark:text-white mt-1 leading-none">
                    {k.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Optional Workout Photo */}
        {post.mediaUrl && (
          <div className="rounded-[22px] overflow-hidden mb-4 border border-black/[0.07] dark:border-white/[0.08]">
            <img src={post.mediaUrl} alt="Workout" className="w-full max-h-[260px] object-cover" />
          </div>
        )}

        {/* Precision Visual Analytics Pair */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-[22px] bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#5C616B] dark:text-[#9BA3B0]">
                Muscle activation
              </p>
              <div className="space-y-2 mt-3">
                {derived.muscleHeat.slice(0, 4).map(m => (
                  <div key={m.zone}>
                    <div className="flex justify-between text-[12.5px] mb-0.5">
                      <span className="font-medium text-[#111317] dark:text-white">{m.label}</span>
                      <span className="font-numeric text-[#5C616B] dark:text-[#9BA3B0]">{m.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(12, m.pct)}%`, backgroundColor: categoryColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <MuscleHeatMap zoneIntensity={derived.zoneIntensity} accentColor={categoryColor} compact />
          </div>

          <KineticLoadRibbon points={derived.points} />
        </div>

        {/* Social Bar + Compact Comments */}
        <div className="rounded-[22px] bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] p-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[11px] text-[13px] font-semibold font-numeric transition-colors ${
                post.isLiked
                  ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                  : 'bg-[#F6F7F9] dark:bg-white/[0.06] text-[#5C616B] dark:text-[#9BA3B0]'
              }`}
            >
              <Heart className="w-4 h-4" fill={post.isLiked ? '#FF3B30' : 'none'} />
              {post.likesCount || 0}
            </button>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[11px] bg-[#F6F7F9] dark:bg-white/[0.06] text-[#5C616B] dark:text-[#9BA3B0] text-[13px] font-semibold font-numeric">
              <MessageCircle className="w-4 h-4" />
              {post.commentsCount || 0}
            </div>
          </div>

          {post.comments && post.comments.length > 0 && (
            <div className="py-3 space-y-2.5 max-h-48 overflow-y-auto">
              {post.comments.map(c => (
                <div key={c.commentId} className="text-[13px]">
                  <span className="font-semibold text-[#111317] dark:text-white mr-2">{c.displayName}</span>
                  <span className="text-[#48484A] dark:text-[#C7CCD6]">{c.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-3">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendComment()}
              placeholder="Write a comment..."
              className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#F6F7F9] dark:bg-[#0E1116] text-[13.5px] text-[#111317] dark:text-white outline-none"
            />
            <button
              type="button"
              onClick={handleSendComment}
              disabled={!commentText.trim() || commentSending}
              className="w-10 h-10 rounded-[11px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              {commentSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareSheet(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 inset-x-0 md:inset-0 md:m-auto md:max-w-sm md:h-fit z-[201] bg-white dark:bg-[#141820] rounded-t-[24px] md:rounded-[24px] p-5 border border-black/10 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
                  Share workout link
                </h3>
                <button type="button" onClick={() => setShowShareSheet(false)} className="w-8 h-8 rounded-[10px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center">
                  <X className="w-4 h-4 text-[#8E95A2]" />
                </button>
              </div>
              <div className="flex items-center gap-2.5 bg-[#F6F7F9] dark:bg-[#0E1116] rounded-[12px] px-3.5 py-3">
                <LinkIcon className="w-4 h-4 text-[#8E95A2] shrink-0" />
                <span className="text-[12.5px] text-[#111317] dark:text-white truncate flex-1">{window.location.href}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#16A34A] dark:text-[#8BE649] whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}