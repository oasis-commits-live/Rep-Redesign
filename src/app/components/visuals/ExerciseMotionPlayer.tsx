import { useState, useEffect } from 'react';
import { Play, Pause, Gauge } from 'lucide-react';
import type { Exercise } from '../../data/exercises';
import { CATEGORY_COLORS } from '../../data/exercises';
import { MuscleHeatMap } from './MuscleHeatMap';
import { mapMuscleToZones, type MuscleZoneId } from './WorkoutAnalyticsEngine';

interface ExerciseMotionPlayerProps {
  exercise: Exercise;
  liveGifUrl?: string | null;
}

/**
 * Interactive form demonstration viewer for every exercise in the Library.
 * - Plays live animated GIFs if available.
 * - Smoothly loops verified 2-frame motion sequences (Start Position <-> Peak Contraction)
 *   with Play/Pause, 0.5x/1x tempo toggle, and step scrubber.
 * - Falls back cleanly to a targeted anatomical focus card if offline or custom.
 */
export function ExerciseMotionPlayer({ exercise, liveGifUrl }: ExerciseMotionPlayerProps) {
  const frames = exercise.demoFrames?.filter(Boolean) || [];
  const hasMotionFrames = frames.length >= 2;
  const hasSingleImage = Boolean(liveGifUrl || exercise.gifUrl || frames.length === 1);

  const [playing, setPlaying] = useState(true);
  const [slowMo, setSlowMo] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  const accent = CATEGORY_COLORS[exercise.category] || '#34C759';

  useEffect(() => {
    setFrameIdx(0);
    setPlaying(true);
    setBrokenUrls(new Set());
  }, [exercise.id]);

  useEffect(() => {
    if (!hasMotionFrames || !playing) return;
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % frames.length);
    }, slowMo ? 1700 : 950);
    return () => clearInterval(interval);
  }, [hasMotionFrames, playing, slowMo, frames.length]);

  const validFrames = frames.filter(u => !brokenUrls.has(u));
  const activeGif = (liveGifUrl || exercise.gifUrl) && !brokenUrls.has((liveGifUrl || exercise.gifUrl)!)
    ? (liveGifUrl || exercise.gifUrl)!
    : null;

  // Build muscle heat map for visual fallback or overlay
  const zoneIntensity: Partial<Record<MuscleZoneId, number>> = {};
  (exercise.muscleGroups || []).forEach((m, idx) => {
    for (const z of mapMuscleToZones(m)) {
      zoneIntensity[z] = idx === 0 ? 1 : 0.55;
    }
  });

  const markBroken = (url: string) => {
    setBrokenUrls(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  if (activeGif && (!hasMotionFrames || activeGif.endsWith('.gif'))) {
    return (
      <div className="relative rounded-[20px] overflow-hidden bg-[#101318] border border-black/10 dark:border-white/10 aspect-[16/10] flex items-center justify-center">
        <img
          src={activeGif}
          alt={`${exercise.name} form demonstration`}
          referrerPolicy="no-referrer"
          onError={() => markBroken(activeGif)}
          className="w-full h-full object-contain bg-white"
        />
        <span
          className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[11px] bg-black/75 text-white backdrop-blur-sm"
          style={{ fontWeight: 600 }}
        >
          Form Demo
        </span>
      </div>
    );
  }

  if (validFrames.length >= 2) {
    const activeIdx = frameIdx % validFrames.length;
    const phaseLabel = activeIdx === 0 ? 'Phase 1 · Start' : 'Phase 2 · Peak';
    return (
      <div className="relative rounded-[20px] overflow-hidden bg-[#0E1116] border border-black/10 dark:border-white/10">
        <div className="relative aspect-[16/10] w-full bg-[#0E1116] overflow-hidden">
          {validFrames.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${exercise.name} ${i === 0 ? 'start position' : 'peak contraction'}`}
              referrerPolicy="no-referrer"
              onError={() => markBroken(src)}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
              style={{ opacity: i === activeIdx ? 1 : 0 }}
            />
          ))}

          {/* Top phase caption */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 text-white text-[11px] backdrop-blur-md">
            <span style={{ fontWeight: 600 }}>{phaseLabel}</span>
          </div>

          {/* Bottom interactive motion controls */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPlaying(p => !p)}
                aria-label={playing ? 'Pause motion demo' : 'Play motion demo'}
                className="w-8 h-8 rounded-lg bg-white/95 text-[#0E1116] flex items-center justify-center active:scale-95 transition-transform"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => setSlowMo(s => !s)}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-numeric font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
                  slowMo ? 'bg-[#8BE649] text-[#0E1116]' : 'bg-black/65 text-white border border-white/15'
                }`}
              >
                <Gauge className="w-3 h-3" />
                {slowMo ? '0.5x' : '1.0x'}
              </button>
            </div>

            {/* Interactive 2-step scrubber */}
            <div className="flex items-center gap-1.5">
              {validFrames.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setFrameIdx(i);
                  }}
                  className={`h-7 px-2.5 rounded-md text-[11px] ${
                    activeIdx === i
                      ? 'bg-white text-[#0E1116]'
                      : 'bg-black/55 text-white/80 hover:text-white'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {i === 0 ? 'Start' : 'Peak'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasSingleImage && validFrames.length === 1) {
    return (
      <div className="relative rounded-[20px] overflow-hidden bg-[#0E1116] border border-black/10 dark:border-white/10 aspect-[16/10]">
        <img
          src={validFrames[0]}
          alt={`${exercise.name} form reference`}
          referrerPolicy="no-referrer"
          onError={() => markBroken(validFrames[0])}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Crisp Anatomical Muscle Activation Visual for custom/niche movements (never shows "coming soon")
  return (
    <div className="rounded-[20px] bg-[#10141B] text-white border border-white/10 p-4 flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.1em] text-[#9BA3B0]" style={{ fontWeight: 600 }}>
          Target Mechanics
        </p>
        <p className="text-[16px] text-white mt-1 leading-snug" style={{ fontWeight: 700 }}>
          {exercise.muscleGroups.join(' · ')}
        </p>
        <p className="text-[12px] text-[#9BA3B0] mt-1.5 leading-relaxed">
          {exercise.equipment || 'Bodyweight'} · {exercise.mechanic === 'isolation' ? 'Isolation' : 'Compound'} control
        </p>
      </div>
      <div className="flex-shrink-0">
        <MuscleHeatMap zoneIntensity={zoneIntensity} accentColor={accent} compact />
      </div>
    </div>
  );
}
