import type { MuscleZoneId } from './WorkoutAnalyticsEngine';

interface MuscleHeatMapProps {
  zoneIntensity: Partial<Record<MuscleZoneId, number>>;
  accentColor?: string;
  compact?: boolean;
}

/**
 * Precision dual-view (Front + Back) anatomical muscle activation map.
 * Illuminates worked muscle groups proportional to workout volume intensity.
 */
export function MuscleHeatMap({
  zoneIntensity,
  accentColor = '#34C759',
  compact = false,
}: MuscleHeatMapProps) {
  const fillFor = (zone: MuscleZoneId) => {
    const v = zoneIntensity[zone] || 0;
    if (v <= 0) return 'currentColor';
    return accentColor;
  };

  const opacityFor = (zone: MuscleZoneId) => {
    const v = zoneIntensity[zone] || 0;
    if (v <= 0) return 0.12;
    return 0.35 + v * 0.65;
  };

  const height = compact ? 118 : 146;

  return (
    <div className="flex items-center justify-center gap-3 text-[#8E95A2] dark:text-[#5A6270] select-none">
      {/* FRONT ANATOMY */}
      <div className="flex flex-col items-center">
        <svg
          width={compact ? 58 : 70}
          height={height}
          viewBox="0 0 100 200"
          fill="none"
          aria-label="Front muscle activation"
        >
          {/* Head & Neck */}
          <circle cx="50" cy="18" r="10.5" fill="currentColor" opacity="0.22" />
          <rect x="45" y="29" width="10" height="7" rx="3" fill="currentColor" opacity="0.2" />

          {/* Shoulders / Delts */}
          <ellipse cx="27" cy="46" rx="8.5" ry="9" fill={fillFor('shoulders')} opacity={opacityFor('shoulders')} />
          <ellipse cx="73" cy="46" rx="8.5" ry="9" fill={fillFor('shoulders')} opacity={opacityFor('shoulders')} />

          {/* Chest / Pecs */}
          <path d="M35 39 C35 37 48 37 49 40 L49 56 C44 58 36 56 34 50 Z" fill={fillFor('chest')} opacity={opacityFor('chest')} />
          <path d="M65 39 C65 37 52 37 51 40 L51 56 C56 58 64 56 66 50 Z" fill={fillFor('chest')} opacity={opacityFor('chest')} />

          {/* Biceps */}
          <rect x="17.5" y="55" width="9" height="24" rx="4.5" fill={fillFor('biceps')} opacity={opacityFor('biceps')} />
          <rect x="73.5" y="55" width="9" height="24" rx="4.5" fill={fillFor('biceps')} opacity={opacityFor('biceps')} />

          {/* Forearms */}
          <rect x="15" y="81" width="7.5" height="25" rx="3.75" fill={fillFor('forearms')} opacity={opacityFor('forearms')} />
          <rect x="77.5" y="81" width="7.5" height="25" rx="3.75" fill={fillFor('forearms')} opacity={opacityFor('forearms')} />

          {/* Core / Abs */}
          <rect x="38" y="60" width="10.5" height="10" rx="2.5" fill={fillFor('core')} opacity={opacityFor('core')} />
          <rect x="51.5" y="60" width="10.5" height="10" rx="2.5" fill={fillFor('core')} opacity={opacityFor('core')} />
          <rect x="38.5" y="72" width="10" height="10" rx="2.5" fill={fillFor('core')} opacity={opacityFor('core')} />
          <rect x="51.5" y="72" width="10" height="10" rx="2.5" fill={fillFor('core')} opacity={opacityFor('core')} />
          <rect x="39.5" y="84" width="9" height="11" rx="2.5" fill={fillFor('core')} opacity={opacityFor('core')} />
          <rect x="51.5" y="84" width="9" height="11" rx="2.5" fill={fillFor('core')} opacity={opacityFor('core')} />

          {/* Pelvis connector */}
          <path d="M35 98 L65 98 L58 110 L42 110 Z" fill="currentColor" opacity="0.16" />

          {/* Quads */}
          <path d="M33 108 L47 110 L45 148 L35 148 Z" fill={fillFor('quads')} opacity={opacityFor('quads')} />
          <path d="M67 108 L53 110 L55 148 L65 148 Z" fill={fillFor('quads')} opacity={opacityFor('quads')} />

          {/* Calves / Shins */}
          <rect x="35.5" y="152" width="9" height="34" rx="4.5" fill={fillFor('calves')} opacity={opacityFor('calves')} />
          <rect x="55.5" y="152" width="9" height="34" rx="4.5" fill={fillFor('calves')} opacity={opacityFor('calves')} />
        </svg>
        <span className="text-[9px] uppercase tracking-[0.08em] text-[#8e8e93] mt-0.5" style={{ fontWeight: 600 }}>
          Front
        </span>
      </div>

      {/* BACK ANATOMY */}
      <div className="flex flex-col items-center">
        <svg
          width={compact ? 58 : 70}
          height={height}
          viewBox="0 0 100 200"
          fill="none"
          aria-label="Back muscle activation"
        >
          {/* Head & Neck */}
          <circle cx="50" cy="18" r="10.5" fill="currentColor" opacity="0.22" />
          <rect x="45" y="29" width="10" height="7" rx="3" fill="currentColor" opacity="0.2" />

          {/* Rear Delts */}
          <ellipse cx="27" cy="46" rx="8.5" ry="9" fill={fillFor('shoulders')} opacity={opacityFor('shoulders')} />
          <ellipse cx="73" cy="46" rx="8.5" ry="9" fill={fillFor('shoulders')} opacity={opacityFor('shoulders')} />

          {/* Upper & Mid Back / Lats */}
          <path d="M34 38 L50 35 L66 38 L62 66 L50 70 L38 66 Z" fill={fillFor('back')} opacity={opacityFor('back')} />
          {/* Lower Back */}
          <rect x="40" y="72" width="20" height="20" rx="5" fill={fillFor('back')} opacity={Math.max(0.12, opacityFor('back') * 0.85)} />

          {/* Triceps */}
          <rect x="17.5" y="55" width="9" height="24" rx="4.5" fill={fillFor('triceps')} opacity={opacityFor('triceps')} />
          <rect x="73.5" y="55" width="9" height="24" rx="4.5" fill={fillFor('triceps')} opacity={opacityFor('triceps')} />

          {/* Forearms */}
          <rect x="15" y="81" width="7.5" height="25" rx="3.75" fill={fillFor('forearms')} opacity={opacityFor('forearms')} />
          <rect x="77.5" y="81" width="7.5" height="25" rx="3.75" fill={fillFor('forearms')} opacity={opacityFor('forearms')} />

          {/* Glutes */}
          <ellipse cx="42" cy="105" rx="10" ry="11" fill={fillFor('glutes')} opacity={opacityFor('glutes')} />
          <ellipse cx="58" cy="105" rx="10" ry="11" fill={fillFor('glutes')} opacity={opacityFor('glutes')} />

          {/* Hamstrings */}
          <rect x="34.5" y="118" width="12" height="31" rx="6" fill={fillFor('hamstrings')} opacity={opacityFor('hamstrings')} />
          <rect x="53.5" y="118" width="12" height="31" rx="6" fill={fillFor('hamstrings')} opacity={opacityFor('hamstrings')} />

          {/* Calves */}
          <ellipse cx="40" cy="166" rx="5.5" ry="16" fill={fillFor('calves')} opacity={opacityFor('calves')} />
          <ellipse cx="60" cy="166" rx="5.5" ry="16" fill={fillFor('calves')} opacity={opacityFor('calves')} />
        </svg>
        <span className="text-[9px] uppercase tracking-[0.08em] text-[#8e8e93] mt-0.5" style={{ fontWeight: 600 }}>
          Back
        </span>
      </div>
    </div>
  );
}
