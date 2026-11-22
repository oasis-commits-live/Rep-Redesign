import { useState } from 'react';
import { motion } from 'motion/react';
import type { KineticExercisePoint } from './WorkoutAnalyticsEngine';

interface KineticLoadRibbonProps {
  points: KineticExercisePoint[];
  accentColor?: string;
}

/**
 * Tactile vertical capsule intensity visualizer.
 * Refined warm-amber daylight tint in Light Mode, obsidian surface in Dark Mode.
 */
export function KineticLoadRibbon({
  points,
}: KineticLoadRibbonProps) {
  const defaultIdx = Math.max(
    0,
    points.findIndex(p => p.isPeak),
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(defaultIdx);
  const active = points[selectedIdx] || points[0];

  if (points.length === 0) return null;

  return (
    <div className="h-full rounded-[22px] bg-[#FEF9E7] dark:bg-[#141820] border border-[#F0DC9B] dark:border-white/[0.08] p-4 flex flex-col justify-between transition-colors">
      {/* Header readout */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <span className="text-[12px] font-medium text-[#7C5E10] dark:text-[#9BA3B0]">
            {active.isPeak ? 'Peak load exercise' : 'Exercise output'}
          </span>
          <p className="font-display text-[16px] font-bold text-[#111317] dark:text-white truncate mt-0.5 leading-snug">
            {active.name}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-numeric text-[16px] font-semibold text-[#111317] dark:text-white leading-none whitespace-nowrap">
            {active.bestSetLabel}
          </span>
          <p className="text-[11.5px] text-[#7C5E10]/85 dark:text-[#9BA3B0] mt-1 font-numeric whitespace-nowrap">
            {active.completedSets}/{active.totalSets} sets
            {active.volume > 0 ? ` · ${active.volume.toLocaleString()} lb` : ''}
          </p>
        </div>
      </div>

      {/* Interactive vertical capsule bars */}
      <div className="flex items-end justify-between gap-2 h-[106px] pt-3 px-1">
        {points.slice(0, 8).map((pt, idx) => {
          const isSelected = idx === selectedIdx;
          const heightPct = Math.max(22, pt.effortScore);
          return (
            <button
              key={`${pt.id}-${idx}`}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group focus:outline-none"
              aria-label={`Inspect ${pt.name}`}
            >
              <div className="relative w-full max-w-[30px] h-[78px] flex items-end justify-center">
                {/* Background ghost rail */}
                <div className="absolute inset-x-1 bottom-0 top-1 rounded-full bg-[#111317]/[0.07] dark:bg-white/[0.06]" />
                {/* Active kinetic bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.035, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative w-[10px] rounded-full transition-colors ${
                    isSelected
                      ? 'bg-[#111317] dark:bg-[#8BE649]'
                      : 'bg-[#111317]/25 dark:bg-white/25 group-hover:bg-[#111317]/45 dark:group-hover:bg-white/45'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#111317] dark:bg-[#8BE649] ring-2 ring-[#FEF9E7] dark:ring-[#141820] flex items-center justify-center shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8BE649] dark:bg-[#0B0E13]" />
                    </span>
                  )}
                </motion.div>
              </div>
              <span
                className={`text-[10.5px] font-numeric truncate max-w-full ${
                  isSelected
                    ? 'text-[#111317] dark:text-white font-semibold'
                    : 'text-[#7C5E10]/75 dark:text-[#8E95A2] font-medium'
                }`}
              >
                {pt.tickerLabel || pt.shortName.slice(0, 5).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
