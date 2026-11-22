import type { WorkoutSession } from '../../data/store';
import type { Exercise } from '../../data/exercises';

export type MuscleZoneId =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'calves'
  | 'back'
  | 'glutes'
  | 'hamstrings';

export interface MuscleHeatEntry {
  zone: MuscleZoneId;
  label: string;
  sets: number;
  pct: number; // 0-100 share of worked muscle volume
  intensity: number; // 0-1 normalized heat for SVG shading
}

export interface KineticExercisePoint {
  id: string;
  name: string;
  shortName: string;
  tickerLabel: string;
  completedSets: number;
  totalSets: number;
  volume: number;
  bestWeight: number;
  bestReps: number;
  bestSetLabel: string;
  effortScore: number; // 0-100 normalized for compact load ribbon
  isPeak: boolean;
}

export interface SessionAnalyticsSummary {
  durationMinutes: number;
  completedSets: number;
  totalPlannedSets: number;
  completionPct: number;
  totalReps: number;
  totalVolume: number;
  strainScore: number; // 0.0 - 21.0 precision athletic strain index
  strainBand: 'Recovery' | 'Moderate' | 'Optimal' | 'Overreaching';
  paceSetsPerMin: number;
  workDensityPerMin: number;
  peakExercise: KineticExercisePoint | null;
  muscleHeat: MuscleHeatEntry[];
  zoneIntensity: Record<MuscleZoneId, number>;
  exercisePoints: KineticExercisePoint[];
}

const ZONE_LABELS: Record<MuscleZoneId, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quads: 'Quads',
  calves: 'Calves',
  back: 'Back',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
};

export function mapMuscleToZones(muscleRaw: string): MuscleZoneId[] {
  const m = muscleRaw.toLowerCase();
  if (m.includes('chest') || m.includes('pec')) return ['chest'];
  if (m.includes('shoulder') || m.includes('delt') || m.includes('neck')) return ['shoulders'];
  if (m.includes('bicep')) return ['biceps'];
  if (m.includes('tricep')) return ['triceps'];
  if (m.includes('forearm') || m.includes('wrist') || m.includes('grip')) return ['forearms'];
  if (m.includes('core') || m.includes('ab') || m.includes('oblique') || m.includes('hip flexor')) return ['core'];
  if (m.includes('quad') || m.includes('adductor')) return ['quads'];
  if (m.includes('hamstring') || m.includes('posterior')) return ['hamstrings'];
  if (m.includes('glute') || m.includes('hip')) return ['glutes'];
  if (m.includes('calf') || m.includes('calves')) return ['calves'];
  if (m.includes('back') || m.includes('lat') || m.includes('trap') || m.includes('rhomboid')) return ['back'];
  if (m.includes('leg') || m.includes('lower body')) return ['quads', 'hamstrings', 'glutes'];
  if (m.includes('arm')) return ['biceps', 'triceps'];
  if (m.includes('upper')) return ['chest', 'back', 'shoulders'];
  if (m.includes('full') || m.includes('mobility') || m.includes('cardio')) {
    return ['core', 'shoulders', 'quads', 'back'];
  }
  return ['core'];
}

const EQUIPMENT_PREFIX_RE =
  /^(barbell|dumbbell|cable|machine|seated|standing|bodyweight|weighted|smith machine|ez[- ]bar|kettlebell|incline|decline|flat|band|resistance band|tricep|triceps|bicep|biceps)\s+/i;

export function formatKineticTickerLabel(name: string): string {
  const lower = name.trim().toLowerCase();
  if (lower.includes('overhead')) return 'OHP';
  if (lower.includes('lateral raise')) return 'DELT';
  if (lower.includes('face pull')) return 'FACE';
  if (lower.includes('push-up') || lower.includes('push up') || lower.includes('pushup')) return 'PUSH';
  if (lower.includes('pull-up') || lower.includes('pull up') || lower.includes('pullup')) return 'PULL';
  if (lower.includes('bench')) return 'BENCH';
  if (lower.includes('deadlift')) return 'DEAD';
  if (lower.includes('squat')) return 'SQUAT';

  let cleaned = name.trim();
  // Strip up to two generic prefixes (e.g. "Incline Dumbbell Press" -> "Press", "Barbell Bent Over Row" -> "Bent Over Row")
  for (let i = 0; i < 2; i++) {
    const next = cleaned.replace(EQUIPMENT_PREFIX_RE, '').trim();
    if (!next || next === cleaned) break;
    cleaned = next;
  }
  const words = cleaned.split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2 && words[0].toLowerCase() === 'bent') {
    return words[words.length - 1].slice(0, 5).toUpperCase();
  }
  const primary = words[0] || cleaned;
  return primary.slice(0, 5).toUpperCase();
}

export function computeSessionAnalytics(
  session: WorkoutSession,
  catalog: Exercise[],
): SessionAnalyticsSummary {
  const catalogById = new Map<string, Exercise>();
  const catalogByName = new Map<string, Exercise>();
  for (const ex of catalog) {
    catalogById.set(ex.id, ex);
    catalogByName.set(ex.name.toLowerCase(), ex);
  }

  const durationMs = session.completedAt
    ? Math.max(60_000, new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime())
    : 60_000;
  const durationMinutes = Math.max(1, Math.round(durationMs / 60_000));

  let completedSets = 0;
  let totalPlannedSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  const zoneCounts: Record<MuscleZoneId, number> = {
    chest: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    forearms: 0,
    core: 0,
    quads: 0,
    calves: 0,
    back: 0,
    glutes: 0,
    hamstrings: 0,
  };

  const rawPoints = session.exercises.map(ex => {
    const done = ex.sets.filter(s => s.completed);
    totalPlannedSets += ex.sets.length;
    completedSets += done.length;

    let vol = 0;
    let bestWeight = 0;
    let bestReps = 0;
    let bestSetScore = -1;
    let bestSetLabel = '';

    for (const s of done) {
      const reps = Math.max(0, s.reps || 0);
      const weight = Math.max(0, s.weight || 0);
      totalReps += reps;
      vol += reps * weight;
      const score = weight > 0 ? weight * Math.max(1, reps) : reps;
      if (score > bestSetScore) {
        bestSetScore = score;
        bestWeight = weight;
        bestReps = reps;
        bestSetLabel = ex.isTimeBased
          ? `${reps}s`
          : weight > 0
          ? `${weight}lb × ${reps}`
          : `${reps} reps`;
      }
    }
    totalVolume += vol;

    const meta =
      catalogById.get(ex.exerciseId) || catalogByName.get(ex.exerciseName.toLowerCase());
    const muscles = meta?.muscleGroups?.length ? meta.muscleGroups : ['Core'];
    const setWeight = Math.max(done.length, 0.5);
    muscles.forEach((m, idx) => {
      const weightFactor = idx === 0 ? 1 : 0.45;
      for (const z of mapMuscleToZones(m)) {
        zoneCounts[z] += setWeight * weightFactor;
      }
    });

    const rawEffort =
      done.length * 14 +
      (vol > 0 ? Math.min(45, Math.sqrt(vol) * 0.45) : Math.min(38, bestReps * 1.4)) +
      (meta?.effort ? meta.effort * 3 : 6);

    const shortName =
      ex.exerciseName.length > 13 ? ex.exerciseName.slice(0, 12).trim() + '…' : ex.exerciseName;

    return {
      id: ex.exerciseId,
      name: ex.exerciseName,
      shortName,
      tickerLabel: formatKineticTickerLabel(ex.exerciseName),
      completedSets: done.length,
      totalSets: ex.sets.length,
      volume: Math.round(vol),
      bestWeight,
      bestReps,
      bestSetLabel: bestSetLabel || (done.length > 0 ? `${done.length} sets` : '—'),
      rawEffort,
    };
  });

  const maxRawEffort = Math.max(1, ...rawPoints.map(p => p.rawEffort));
  let peakIdx = -1;
  let peakEffort = -1;
  rawPoints.forEach((p, idx) => {
    if (p.completedSets > 0 && p.rawEffort > peakEffort) {
      peakEffort = p.rawEffort;
      peakIdx = idx;
    }
  });

  const exercisePoints: KineticExercisePoint[] = rawPoints.map((p, idx) => ({
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    tickerLabel: p.tickerLabel,
    completedSets: p.completedSets,
    totalSets: p.totalSets,
    volume: p.volume,
    bestWeight: p.bestWeight,
    bestReps: p.bestReps,
    bestSetLabel: p.bestSetLabel,
    effortScore:
      p.completedSets === 0 ? 8 : Math.min(100, Math.max(24, Math.round((p.rawEffort / maxRawEffort) * 100))),
    isPeak: idx === peakIdx,
  }));

  const completionPct =
    totalPlannedSets > 0 ? Math.min(100, Math.round((completedSets / totalPlannedSets) * 100)) : 0;

  // Whoop-inspired logarithmic Strain Score (0.0 – 21.0)
  const workloadUnits =
    completedSets * 2.2 +
    Math.min(25, durationMinutes * 0.25) +
    (totalVolume > 0 ? Math.min(30, totalVolume / 650) : Math.min(20, totalReps / 12));
  const strainRaw = Math.min(20.8, 21 * (1 - Math.exp(-workloadUnits / 36)));
  const strainScore = completedSets === 0 ? 0 : Math.round(strainRaw * 10) / 10;

  const strainBand: SessionAnalyticsSummary['strainBand'] =
    strainScore < 8
      ? 'Recovery'
      : strainScore < 13.5
      ? 'Moderate'
      : strainScore < 17.5
      ? 'Optimal'
      : 'Overreaching';

  // Muscle heat normalization
  const totalZoneScore = Object.values(zoneCounts).reduce((a, b) => a + b, 0);
  const maxZoneScore = Math.max(0.001, ...Object.values(zoneCounts));

  const zoneIntensity = {} as Record<MuscleZoneId, number>;
  (Object.keys(zoneCounts) as MuscleZoneId[]).forEach(z => {
    zoneIntensity[z] = zoneCounts[z] > 0 ? Math.min(1, Math.max(0.22, zoneCounts[z] / maxZoneScore)) : 0;
  });

  const muscleHeat: MuscleHeatEntry[] = (Object.keys(zoneCounts) as MuscleZoneId[])
    .filter(z => zoneCounts[z] > 0)
    .map(z => ({
      zone: z,
      label: ZONE_LABELS[z],
      sets: Math.max(1, Math.round(zoneCounts[z])),
      pct: totalZoneScore > 0 ? Math.round((zoneCounts[z] / totalZoneScore) * 100) : 0,
      intensity: zoneIntensity[z],
    }))
    .sort((a, b) => b.pct - a.pct);

  return {
    durationMinutes,
    completedSets,
    totalPlannedSets,
    completionPct,
    totalReps,
    totalVolume: Math.round(totalVolume),
    strainScore,
    strainBand,
    paceSetsPerMin: Math.round((completedSets / durationMinutes) * 10) / 10,
    workDensityPerMin: Math.round(totalVolume / durationMinutes),
    peakExercise: peakIdx >= 0 ? exercisePoints[peakIdx] : null,
    muscleHeat,
    zoneIntensity,
    exercisePoints,
  };
}
