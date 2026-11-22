import { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, Share2, Camera, Image as ImageIcon, X, Loader2,
  ChevronDown, ArrowLeft, Trophy, Flame, Clock, Layers,
} from 'lucide-react';
import { getSessions, useCustomExercises } from '../data/store';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/exercises';
import { useExerciseCatalog } from '../data/useExerciseCatalog';
import { postActivity, uploadWorkoutMedia } from '../data/api';
import { format } from 'date-fns';
import { RadialTelemetryRing } from './visuals/RadialTelemetryRing';
import { MuscleHeatMap } from './visuals/MuscleHeatMap';
import { KineticLoadRibbon } from './visuals/KineticLoadRibbon';
import { computeSessionAnalytics } from './visuals/WorkoutAnalyticsEngine';
import { BRAND_3D_ASSETS } from './visuals/brandAssets';

function compressImage(file: File, maxDim = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function WorkoutSummary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);

  const { catalogExercises } = useExerciseCatalog();
  const { customExercises } = useCustomExercises();
  const allExercises = useMemo(
    () => [...customExercises, ...catalogExercises],
    [customExercises, catalogExercises],
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [title, setTitle] = useState(session?.name || '');
  const [description, setDescription] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [expandedExId, setExpandedExId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analytics = useMemo(() => {
    if (!session) return null;
    return computeSessionAnalytics(session, allExercises);
  }, [session, allExercises]);

  if (!session || !analytics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F6F7F9] dark:bg-[#0B0E13]">
        <p className="text-[16px] text-[#5C616B] dark:text-[#9BA3B0] mb-4">Workout session not found</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-[12px] bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[14px] font-semibold whitespace-nowrap"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[session.category] || '#16A34A';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setMediaPreview(compressed);
    } catch {
      setPostError('Could not process that photo. Try another image.');
    }
    e.target.value = '';
  };

  const handlePost = async () => {
    setPosting(true);
    setPostError(null);
    try {
      let mediaUrl: string | null = null;
      if (mediaPreview) {
        const res = await uploadWorkoutMedia(session.id, mediaPreview);
        mediaUrl = res.url;
      }
      await postActivity({
        id: session.id,
        sessionName: session.name,
        title: title.trim() || session.name,
        description: description.trim() || undefined,
        category: session.category,
        completedAt: session.completedAt || new Date().toISOString(),
        exerciseCount: session.exercises.length,
        totalSets: analytics.completedSets,
        totalVolume: analytics.totalVolume,
        durationMinutes: analytics.durationMinutes,
        exercises: analytics.exercisePoints.map(pt => ({
          name: pt.name,
          sets: pt.completedSets,
          bestSet: pt.bestSetLabel,
        })),
        mediaUrl,
      });
      setPosted(true);
      setShareOpen(false);
    } catch (err: any) {
      setPostError(err.message || 'Could not post workout right now.');
    } finally {
      setPosting(false);
    }
  };

  const formatVolume = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v > 0 ? v.toLocaleString() : 'BW';

  return (
    <div className="min-h-screen bg-[#F6F7F9] dark:bg-[#0B0E13] text-[#111317] dark:text-[#F5F7FA] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-5">
        {/* Compact Top Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-[11px] bg-white dark:bg-[#141820] border border-black/[0.08] dark:border-white/[0.08] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#111317] dark:text-white" />
          </button>

          <p className="text-[12.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0] truncate">
            {CATEGORY_LABELS[session.category]} ·{' '}
            {session.completedAt ? format(new Date(session.completedAt), 'MMM d, h:mm a') : 'Completed'}
          </p>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className={
              posted
                ? 'rep-cta-secondary rep-cta-sm !text-[#15803D] dark:!text-[#8BE649]'
                : 'rep-cta-primary rep-cta-sm'
            }
          >
            {posted ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Share2 className="w-3.5 h-3.5 shrink-0" />}
            <span>{posted ? 'Shared' : 'Share'}</span>
          </button>
        </div>

        {/* 1. HERO PERFORMANCE SUMMARY (Light & Dark Mode Native) */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] bg-white dark:bg-[#131720] text-[#111317] dark:text-white border border-black/[0.07] dark:border-white/[0.08] p-5 relative overflow-hidden mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
        >
          <img
            src={BRAND_3D_ASSETS.trophyRing}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-10 -top-10 w-44 h-44 object-cover opacity-[0.06] dark:opacity-20 mix-blend-multiply dark:mix-blend-screen [mask-image:radial-gradient(circle_at_68%_42%,black_18%,transparent_70%)]"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0">
                <RadialTelemetryRing
                  value={analytics.strainScore}
                  max={21}
                  displayValue={analytics.strainScore.toFixed(1)}
                  label="Strain"
                  sublabel={analytics.strainBand}
                  accentColor="#16A34A"
                  darkAccentColor="#8BE649"
                  size={116}
                  segments={30}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[12px] font-semibold text-[#16A34A] dark:text-[#8BE649]">
                  Session summary
                </span>
                <h1 className="font-display text-[20px] sm:text-[25px] font-bold tracking-[-0.015em] leading-[1.15] text-[#111317] dark:text-white mt-0.5 line-clamp-2">
                  {session.name}
                </h1>
                <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1 truncate">
                  <span className="font-numeric">{analytics.completionPct}%</span> sets done
                  {analytics.peakExercise ? ` · Peak: ${analytics.peakExercise.shortName}` : ''}
                </p>
              </div>
            </div>

            {/* Crisp 2x2 KPI Grid */}
            <div className="grid grid-cols-2 gap-2 sm:min-w-[232px]">
              {[
                { icon: Clock, label: 'Duration', value: `${analytics.durationMinutes}m` },
                { icon: Flame, label: 'Volume (lb)', value: formatVolume(analytics.totalVolume) },
                { icon: Layers, label: 'Sets done', value: `${analytics.completedSets}/${analytics.totalPlannedSets}` },
                { icon: Trophy, label: 'Pace', value: `${analytics.paceSetsPerMin}/m` },
              ].map(kpi => (
                <div
                  key={kpi.label}
                  className="rounded-[13px] bg-[#F6F7F9] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.06] px-3 py-2.5"
                >
                  <div className="flex items-center gap-1.5 text-[#5C616B] dark:text-[#9BA3B0]">
                    <kpi.icon className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649] shrink-0" />
                    <span className="text-[11.5px] font-medium whitespace-nowrap">{kpi.label}</span>
                  </div>
                  <p className="font-numeric text-[16px] font-semibold text-[#111317] dark:text-white mt-1 leading-none">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 2. BESPOKE VISUAL ANALYTICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Anatomical Muscle Heat Map */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[22px] bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] p-4 flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#5C616B] dark:text-[#9BA3B0]">
                Muscle activation
              </p>
              <h2 className="font-display text-[16px] font-bold text-[#111317] dark:text-white mt-0.5 mb-3">
                Load distribution
              </h2>
              <div className="space-y-2">
                {analytics.muscleHeat.slice(0, 4).map(entry => (
                  <div key={entry.zone}>
                    <div className="flex items-center justify-between text-[12.5px] mb-1">
                      <span className="font-medium text-[#111317] dark:text-[#E4E7EC]">
                        {entry.label}
                      </span>
                      <span className="font-numeric text-[#5C616B] dark:text-[#9BA3B0]">
                        {entry.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(10, entry.pct)}%`,
                          backgroundColor: categoryColor,
                          opacity: 0.45 + entry.intensity * 0.55,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <MuscleHeatMap
                zoneIntensity={analytics.zoneIntensity}
                accentColor={categoryColor}
                compact
              />
            </div>
          </motion.section>

          {/* Kinetic Load Ribbon */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09 }}
          >
            <KineticLoadRibbon points={analytics.exercisePoints} />
          </motion.section>
        </div>

        {/* 3. COMPACT EXPANDABLE EXERCISE LOG */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-[22px] bg-white dark:bg-[#141820] border border-black/[0.07] dark:border-white/[0.08] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <span className="font-display text-[15px] font-bold text-[#111317] dark:text-white">
              Exercise log ({session.exercises.length})
            </span>
            <span className="text-[12px] text-[#5C616B] dark:text-[#8E95A2]">Tap for set splits</span>
          </div>

          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            {session.exercises.map((ex, idx) => {
              const pt = analytics.exercisePoints[idx];
              const expanded = expandedExId === `${ex.exerciseId}-${idx}`;
              const doneSets = ex.sets.filter(s => s.completed);
              return (
                <div key={`${ex.exerciseId}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedExId(expanded ? null : `${ex.exerciseId}-${idx}`)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg font-numeric text-[11px] font-semibold flex items-center justify-center shrink-0 ${
                          pt?.isPeak
                            ? 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13]'
                            : 'bg-[#F0F2F5] dark:bg-white/[0.07] text-[#5C616B] dark:text-[#9BA3B0]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[14.5px] font-semibold text-[#111317] dark:text-white truncate">
                          {ex.exerciseName}
                        </p>
                        <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] font-numeric">
                          {doneSets.length}/{ex.sets.length} sets
                          {pt?.volume ? ` · ${pt.volume.toLocaleString()} lb` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-numeric text-[12.5px] font-semibold text-[#111317] dark:text-[#E4E7EC]">
                        {pt?.bestSetLabel || '—'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8E95A2] transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 pl-13 flex flex-wrap gap-2">
                          {ex.sets.map(s => (
                            <span
                              key={s.setNumber}
                              className={`px-2.5 py-1 rounded-lg font-numeric text-[11.5px] font-semibold ${
                                s.completed
                                  ? 'bg-[#F0F2F5] dark:bg-white/[0.08] text-[#111317] dark:text-white'
                                  : 'bg-transparent border border-dashed border-black/15 dark:border-white/15 text-[#8E95A2]'
                              }`}
                            >
                              S{s.setNumber}:{' '}
                              {ex.isTimeBased
                                ? `${s.reps}s`
                                : s.weight
                                ? `${s.weight}×${s.reps}`
                                : `${s.reps}r`}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* Compact Sticky Bottom Action Footer */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 bg-[#F6F7F9]/95 dark:bg-[#0B0E13]/95 backdrop-blur-xl border-t border-black/[0.07] dark:border-white/[0.08]"
        style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-3 flex items-center gap-3">
          {!posted && (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex-1 rep-cta-secondary rep-cta-md"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Share to Feed</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 rep-cta-action rep-cta-md"
          >
            Done
          </button>
        </div>
      </div>

      {/* Share to Community Bottom Sheet */}
      <AnimatePresence>
        {shareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-md md:h-fit z-[121] bg-white dark:bg-[#141820] rounded-t-[24px] md:rounded-[24px] p-5 border border-black/10 dark:border-white/10 shadow-2xl"
              style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-[18px] font-bold text-[#111317] dark:text-white">
                  Share workout
                </h3>
                <button
                  type="button"
                  onClick={() => setShareOpen(false)}
                  className="w-8 h-8 rounded-[10px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Workout title"
                  className="w-full px-4 py-3 rounded-[13px] bg-[#F6F7F9] dark:bg-[#0E1116] border border-black/[0.07] dark:border-white/[0.08] text-[14px] text-[#111317] dark:text-white outline-none"
                />
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="How did the session feel? Add a note..."
                  className="w-full px-4 py-3 rounded-[13px] bg-[#F6F7F9] dark:bg-[#0E1116] border border-black/[0.07] dark:border-white/[0.08] text-[14px] text-[#111317] dark:text-white outline-none resize-none"
                />

                {mediaPreview ? (
                  <div className="relative rounded-[13px] overflow-hidden h-40">
                    <img src={mediaPreview} alt="Workout preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaPreview(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 py-2.5 rounded-[11px] bg-[#F6F7F9] dark:bg-white/[0.06] text-[13px] font-semibold text-[#111317] dark:text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Camera className="w-4 h-4" />
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 rounded-[11px] bg-[#F6F7F9] dark:bg-white/[0.06] text-[13px] font-semibold text-[#111317] dark:text-white inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Photo
                    </button>
                  </div>
                )}

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {postError && <p className="text-[12.5px] text-[#FF3B30]">{postError}</p>}

                <button
                  type="button"
                  disabled={posting}
                  onClick={handlePost}
                  className="w-full py-3 rounded-[13px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[14px] font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                  <span>{posting ? 'Posting…' : 'Post to Community'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}