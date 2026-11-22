import { motion } from 'motion/react';

interface RadialTelemetryRingProps {
  value: number;
  max?: number;
  displayValue: string;
  label: string;
  sublabel?: string;
  accentColor?: string;
  darkAccentColor?: string;
  size?: number;
  segments?: number;
  darkSurface?: boolean;
  forceDarkSurface?: boolean;
}

/**
 * Segmented radial athletic progress ring with crisp tabular readout.
 * Adapts smoothly to both Light and Dark surfaces.
 */
export function RadialTelemetryRing({
  value,
  max = 100,
  displayValue,
  label,
  sublabel,
  accentColor = '#16A34A',
  darkAccentColor,
  size = 136,
  segments = 36,
  darkSurface = false,
  forceDarkSurface = false,
}: RadialTelemetryRingProps) {
  const isDarkSurface = darkSurface || forceDarkSurface;
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const activeCount = Math.round(pct * segments);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.382;

  const ticks = Array.from({ length: segments }, (_, i) => {
    const angleDeg = -90 + (i / segments) * 360;
    const rad = (angleDeg * Math.PI) / 180;
    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    const isActive = i < activeCount;
    return { i, x1, y1, x2, y2, isActive };
  });

  const activeStrokeClass = isDarkSurface
    ? ''
    : darkAccentColor
    ? 'stroke-[var(--ring-light)] dark:stroke-[var(--ring-dark)]'
    : '';

  return (
    <div
      className="relative inline-flex items-center justify-center flex-shrink-0 select-none"
      style={
        {
          width: size,
          height: size,
          '--ring-light': accentColor,
          '--ring-dark': darkAccentColor || accentColor,
        } as React.CSSProperties
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={cx}
          cy={cy}
          r={innerR - 5}
          fill="none"
          className={isDarkSurface ? 'stroke-white/[0.08]' : 'stroke-black/[0.06] dark:stroke-white/[0.07]'}
          strokeWidth={1}
        />
        {ticks.map(t => (
          <motion.line
            key={t.i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={
              t.isActive
                ? isDarkSurface || !darkAccentColor
                  ? accentColor
                  : undefined
                : undefined
            }
            className={
              t.isActive
                ? activeStrokeClass
                : isDarkSurface
                ? 'stroke-white/15'
                : 'stroke-black/[0.12] dark:stroke-white/[0.14]'
            }
            strokeWidth={size >= 130 ? 3.2 : 2.5}
            strokeLinecap="round"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: t.isActive ? 1 : 0.75 }}
            transition={{ duration: 0.25, delay: t.isActive ? t.i * 0.01 : 0 }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        <span
          className={`font-numeric leading-none tracking-[-0.03em] font-semibold ${
            isDarkSurface ? 'text-white' : 'text-[#111317] dark:text-white'
          }`}
          style={{ fontSize: size >= 130 ? 27 : 20 }}
        >
          {displayValue}
        </span>
        <span
          className={`mt-1 text-[10.5px] font-medium leading-none ${
            isDarkSurface ? 'text-[#9BA3B0]' : 'text-[#5C616B] dark:text-[#9BA3B0]'
          }`}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className={`mt-1 text-[10px] font-semibold leading-none ${
              isDarkSurface ? '' : 'text-[#16A34A] dark:text-[#8BE649]'
            }`}
            style={isDarkSurface ? { color: accentColor } : undefined}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
