import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Plus,
  Trash2,
  Play,
  Flame,
  Dumbbell,
  ChevronRight,
  SlidersHorizontal,
  Check,
  ListPlus,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_LABELS_FULL,
  type Category,
  type Exercise,
} from '../data/exercises';
import {
  getSessionsForExercise,
  useCustomExercises,
  useTemplates,
  saveTemplateStatic,
} from '../data/store';
import { useExerciseCatalog } from '../data/useExerciseCatalog';
import { fetchExerciseGif, type ExerciseGifResult } from '../data/api';
import { CreateExerciseSheet } from './CreateExerciseSheet';
import { ExerciseMotionPlayer } from './visuals/ExerciseMotionPlayer';
import { MuscleHeatMap } from './visuals/MuscleHeatMap';
import { mapMuscleToZones, type MuscleZoneId } from './visuals/WorkoutAnalyticsEngine';

const MUSCLE_FILTERS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Glutes',
  'Hamstrings',
  'Core',
  'Biceps',
  'Triceps',
  'Mobility',
];

function EffortBars({ level = 3, color }: { level?: number; color: string }) {
  const clamped = Math.max(1, Math.min(5, Math.round(level)));
  return (
    <div className="flex items-end gap-[2.5px] h-3.5 shrink-0" aria-label={`Difficulty ${clamped} of 5`}>
      {[1, 2, 3, 4, 5].map(bar => (
        <span
          key={bar}
          className="w-[3px] rounded-full transition-colors"
          style={{
            height: 5 + bar * 1.8,
            backgroundColor: bar <= clamped ? color : 'rgba(142,149,162,0.28)',
          }}
        />
      ))}
    </div>
  );
}

export function ExerciseLibrary() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(48);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);

  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [addedToRoutineId, setAddedToRoutineId] = useState<string | null>(null);

  const [gifResult, setGifResult] = useState<ExerciseGifResult | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { catalogExercises, loading: catalogLoading } = useExerciseCatalog();
  const { customExercises, saveCustomExercise, deleteCustomExercise } = useCustomExercises();
  const { templates } = useTemplates();

  // Open custom exercise sheet directly when navigated via /library?create=1
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setCreateSheetOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('create');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const allExercises = useMemo(() => {
    const customMarked = customExercises.map(e => ({ ...e, isCustom: true }));
    return [...customMarked, ...catalogExercises];
  }, [customExercises, catalogExercises]);

  const categoryCounts = useMemo(() => {
    const counts = { all: allExercises.length, gym: 0, calisthenics: 0, animalflow: 0 };
    for (const ex of allExercises) {
      if (ex.category === 'gym') counts.gym++;
      else if (ex.category === 'calisthenics') counts.calisthenics++;
      else if (ex.category === 'animalflow') counts.animalflow++;
    }
    return counts;
  }, [allExercises]);

  useEffect(() => {
    setVisibleLimit(48);
  }, [selectedCategory, selectedMuscle, search]);

  useEffect(() => {
    setShowRoutinePicker(false);
    setAddedToRoutineId(null);
    if (!selectedExercise) {
      setGifResult(null);
      return;
    }
    let cancelled = false;
    setGifResult(null);

    if (!selectedExercise.demoFrames?.length && !selectedExercise.gifUrl) {
      fetchExerciseGif(selectedExercise.name)
        .then(res => {
          if (!cancelled) setGifResult(res);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [selectedExercise?.id]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allExercises.filter(ex => {
      if (selectedCategory !== 'all' && ex.category !== selectedCategory) return false;
      if (selectedMuscle !== 'All') {
        const needle = selectedMuscle.toLowerCase();
        const matchesMuscle = (ex.muscleGroups || []).some(m => {
          const ml = m.toLowerCase();
          if (needle === 'back') return ml.includes('back') || ml.includes('lat') || ml.includes('trap');
          if (needle === 'quads') return ml.includes('quad') || ml.includes('leg');
          return ml.includes(needle);
        });
        if (!matchesMuscle) return false;
      }
      if (q) {
        return (
          ex.name.toLowerCase().includes(q) ||
          (ex.equipment && ex.equipment.toLowerCase().includes(q)) ||
          (ex.muscleGroups || []).some(m => m.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allExercises, selectedCategory, selectedMuscle, search]);

  const visibleExercises = filtered.slice(0, visibleLimit);

  const selectedHistory = useMemo(
    () => (selectedExercise ? getSessionsForExercise(selectedExercise.id) : []),
    [selectedExercise],
  );

  const selectedZoneIntensity = useMemo(() => {
    if (!selectedExercise) return {};
    const map: Partial<Record<MuscleZoneId, number>> = {};
    (selectedExercise.muscleGroups || []).forEach((m, idx) => {
      for (const z of mapMuscleToZones(m)) {
        map[z] = idx === 0 ? 1 : 0.55;
      }
    });
    return map;
  }, [selectedExercise]);

  const handleSaveNewExercise = (ex: Exercise) => {
    saveCustomExercise({ ...ex, isCustom: true });
  };

  const handleDeleteCustom = (id: string) => {
    deleteCustomExercise(id);
    setDeleteConfirmId(null);
    if (selectedExercise?.id === id) setSelectedExercise(null);
  };

  const appendExerciseToRoutine = (templateId: string) => {
    if (!selectedExercise) return;
    const target = templates.find(t => t.id === templateId);
    if (!target) return;
    const exists = target.exercises.some(e => e.exerciseId === selectedExercise.id);
    if (!exists) {
      saveTemplateStatic({
        ...target,
        exercises: [
          ...target.exercises,
          {
            exerciseId: selectedExercise.id,
            exerciseName: selectedExercise.name,
            sets: selectedExercise.defaultSets || 3,
            targetReps: selectedExercise.defaultReps || 10,
            restSeconds: 60,
            isTimeBased: selectedExercise.isTimeBased || false,
          },
        ],
      });
    }
    setAddedToRoutineId(templateId);
    setTimeout(() => {
      setShowRoutinePicker(false);
    }, 650);
  };

  const disciplineSegments: { id: Category | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: categoryCounts.all },
    { id: 'gym', label: 'Gym', count: categoryCounts.gym },
    { id: 'calisthenics', label: 'Calisthenics', count: categoryCounts.calisthenics },
    { id: 'animalflow', label: 'Flow', count: categoryCounts.animalflow },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-5 md:pt-8 pb-8">
      {/* Crisp Single-Line Header */}
      <div className="rep-page-header">
        <div className="min-w-0">
          <h1 className="rep-page-title">Exercises</h1>
          <p className="rep-page-subtitle">
            {catalogLoading ? 'Syncing library…' : `${allExercises.length} movements with form guides`}
          </p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setCreateSheetOpen(true)}
          className="rep-cta-primary rep-cta-sm"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          <span>Custom</span>
        </motion.button>
      </div>

      {/* Compact Segmented Discipline Bar (keeps search + list immediately above the fold) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-3">
        {disciplineSegments.map(seg => {
          const active = selectedCategory === seg.id;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSelectedCategory(seg.id)}
              className={`h-10 px-3.5 rounded-[12px] inline-flex items-center gap-2 text-[13px] whitespace-nowrap shrink-0 transition-all border ${
                active
                  ? 'bg-[#0E1116] dark:bg-[#8BE649] text-white dark:text-[#080A0E] border-transparent font-semibold'
                  : 'bg-white dark:bg-[#12161E] text-[#5C616B] dark:text-[#9BA3B0] border-black/[0.07] dark:border-white/[0.08] font-medium'
              }`}
            >
              <span>{seg.label}</span>
              <span
                className={`font-numeric text-[11.5px] ${
                  active ? 'text-[#8BE649] dark:text-[#080A0E]/75' : 'text-[#8E95A2]'
                }`}
              >
                {seg.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A2]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercise, muscle, or equipment..."
          className="w-full pl-10 pr-10 py-3 rounded-[14px] bg-white dark:bg-[#12161E] border border-black/[0.08] dark:border-white/[0.08] text-[14px] text-[#0E1116] dark:text-white placeholder:text-[#8E95A2] outline-none focus:border-[#16A34A] dark:focus:border-[#8BE649] transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/[0.06] dark:bg-white/10 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-[#5C616B] dark:text-[#9BA3B0]" />
          </button>
        )}
      </div>

      {/* Muscle Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3.5">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#8E95A2] shrink-0 mr-1" />
        {MUSCLE_FILTERS.map(m => {
          const active = selectedMuscle === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-[10px] text-[12.5px] whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-[#16A34A]/14 dark:bg-[#8BE649]/18 text-[#15803D] dark:text-[#8BE649] font-semibold'
                  : 'bg-white dark:bg-[#12161E] text-[#5C616B] dark:text-[#9BA3B0] border border-black/[0.07] dark:border-white/[0.08] hover:text-[#0E1116] dark:hover:text-white font-medium'
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Results Summary Line */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] font-medium">
          Showing <span className="font-numeric">{visibleExercises.length}</span> of{' '}
          <span className="font-numeric">{filtered.length}</span>
        </span>
        {(selectedCategory !== 'all' || selectedMuscle !== 'All' || search) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedMuscle('All');
              setSearch('');
            }}
            className="text-[12.5px] font-semibold text-[#16A34A] dark:text-[#8BE649] whitespace-nowrap"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Exercise Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-[22px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] py-14 px-6 text-center">
          <Dumbbell className="w-8 h-8 text-[#8E95A2] mx-auto mb-3" />
          <p className="font-display text-[17px] font-bold text-[#0E1116] dark:text-white">
            No matching exercises
          </p>
          <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1 mb-5">
            Try clearing a filter or add your own custom movement.
          </p>
          <button
            type="button"
            onClick={() => setCreateSheetOpen(true)}
            className="rep-cta-action rep-cta-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Exercise</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {visibleExercises.map(ex => {
              const catColor = CATEGORY_COLORS[ex.category] || '#16A34A';
              const thumb = ex.demoFrames?.[0] || ex.gifUrl;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExercise(ex)}
                  className="group w-full bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-[#8BE649]/50 rounded-[16px] p-3 flex items-center gap-3.5 text-left transition-all active:scale-[0.99] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  {/* Visual Preview Thumbnail */}
                  <div className="w-14 h-14 rounded-[12px] overflow-hidden bg-[#111317] shrink-0 relative border border-black/10 dark:border-white/10">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dumbbell className="w-5 h-5" style={{ color: catColor }} />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-md bg-black/75 text-white flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 fill-white ml-[1px]" />
                    </div>
                  </div>

                  {/* Clean Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11.5px]">
                      <span className="font-semibold shrink-0" style={{ color: catColor }}>
                        {CATEGORY_LABELS[ex.category]}
                      </span>
                      {ex.equipment && (
                        <>
                          <span className="text-[#C7C7CC] dark:text-[#48484A]">·</span>
                          <span className="text-[#5C616B] dark:text-[#9BA3B0] truncate">
                            {ex.equipment}
                          </span>
                        </>
                      )}
                      {ex.isCustom && (
                        <>
                          <span className="text-[#C7C7CC] dark:text-[#48484A]">·</span>
                          <span className="text-[#16A34A] dark:text-[#8BE649] font-semibold">
                            Custom
                          </span>
                        </>
                      )}
                    </div>
                    <p className="font-display text-[15.5px] font-bold text-[#0E1116] dark:text-white truncate mt-0.5 leading-snug">
                      {ex.name}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] truncate">
                        {(ex.muscleGroups || []).slice(0, 2).join(' · ')}
                      </span>
                      <EffortBars level={ex.effort} color={catColor} />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#C7C7CC] dark:text-[#525866] group-hover:text-[#0E1116] dark:group-hover:text-white shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>

          {filtered.length > visibleLimit && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleLimit(l => l + 60)}
                className="rep-cta-secondary rep-cta-sm"
              >
                Load more ({filtered.length - visibleLimit} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Exercise Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[120]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="fixed inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-xl md:max-h-[88vh] max-h-[90vh] z-[121] bg-[#F3F4F6] dark:bg-[#0D1016] rounded-t-[26px] md:rounded-[26px] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 pt-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-start justify-between gap-3 shrink-0 bg-white dark:bg-[#12161E]">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <span
                      className="font-semibold"
                      style={{ color: CATEGORY_COLORS[selectedExercise.category] }}
                    >
                      {CATEGORY_LABELS_FULL[selectedExercise.category]}
                    </span>
                    {selectedExercise.difficulty && (
                      <>
                        <span className="text-[#8E95A2]">·</span>
                        <span className="capitalize text-[#5C616B] dark:text-[#9BA3B0] font-medium">
                          {selectedExercise.difficulty}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-[21px] font-bold text-[#0E1116] dark:text-white tracking-[-0.02em] leading-snug mt-0.5">
                    {selectedExercise.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedExercise.isCustom && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(selectedExercise.id)}
                      aria-label="Delete custom exercise"
                      className="w-9 h-9 rounded-[11px] bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedExercise(null)}
                    aria-label="Close exercise details"
                    className="w-9 h-9 rounded-[11px] bg-black/[0.06] dark:bg-white/[0.08] text-[#0E1116] dark:text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Detail Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
                <ExerciseMotionPlayer
                  exercise={selectedExercise}
                  liveGifUrl={gifResult?.gifUrl}
                />

                {/* Key Specs + Anatomical Target Map */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-4 flex flex-col justify-between">
                    <p className="text-[12.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-3">
                      Movement profile
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11.5px] text-[#5C616B] dark:text-[#8E95A2]">Equipment</p>
                        <p className="text-[13.5px] font-semibold text-[#0E1116] dark:text-white mt-0.5">
                          {selectedExercise.equipment || 'Bodyweight'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11.5px] text-[#5C616B] dark:text-[#8E95A2]">Default Rx</p>
                        <p className="text-[13.5px] font-numeric font-semibold text-[#0E1116] dark:text-white mt-0.5">
                          {selectedExercise.defaultSets || 3} × {selectedExercise.defaultReps || 10}
                          {selectedExercise.isTimeBased ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11.5px] text-[#5C616B] dark:text-[#8E95A2]">Primary target</p>
                        <p className="text-[13.5px] font-semibold text-[#0E1116] dark:text-white mt-0.5">
                          {selectedExercise.muscleGroups?.[0] || 'Full Body'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11.5px] text-[#5C616B] dark:text-[#8E95A2]">Intensity</p>
                        <div className="mt-1">
                          <EffortBars
                            level={selectedExercise.effort}
                            color={CATEGORY_COLORS[selectedExercise.category]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[18px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-3 flex items-center justify-center">
                    <MuscleHeatMap
                      zoneIntensity={selectedZoneIntensity}
                      accentColor={CATEGORY_COLORS[selectedExercise.category]}
                      compact
                    />
                  </div>
                </div>

                {/* Step-by-Step Execution Cues */}
                <div className="rounded-[18px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649]" />
                    <h3 className="font-display text-[15px] font-bold text-[#0E1116] dark:text-white">
                      How to perform
                    </h3>
                  </div>
                  <ol className="space-y-2.5">
                    {(selectedExercise.instructions?.length
                      ? selectedExercise.instructions
                      : [
                          selectedExercise.description ||
                            `Brace your core and set up smoothly for ${selectedExercise.name}.`,
                          'Drive through full controlled range of motion and return under tension.',
                        ]
                    ).map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-md bg-[#F3F4F6] dark:bg-white/[0.08] text-[#0E1116] dark:text-[#8BE649] font-numeric text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-[13.5px] text-[#3A3D45] dark:text-[#D0D5DD] leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Personal History Snapshot */}
                {selectedHistory.length > 0 && (
                  <div className="rounded-[18px] bg-[#0D1016] text-white p-4 flex items-center justify-between border border-white/[0.08]">
                    <div>
                      <p className="text-[12px] text-[#9BA3B0] font-medium">Your logged history</p>
                      <p className="text-[14.5px] font-semibold text-white mt-0.5">
                        {selectedHistory.length} session{selectedHistory.length > 1 ? 's' : ''} recorded
                      </p>
                    </div>
                    <div className="text-right font-numeric">
                      <p className="text-[18px] font-semibold text-[#8BE649]">
                        {Math.max(...selectedHistory.map(h => h.maxWeight)) > 0
                          ? `${Math.max(...selectedHistory.map(h => h.maxWeight))} lb`
                          : `${Math.max(...selectedHistory.map(h => h.maxReps))} reps`}
                      </p>
                      <p className="text-[11px] text-[#9BA3B0]">Personal best</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Add-to-Existing-Routine Picker Tray */}
              <AnimatePresence>
                {showRoutinePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#F3F4F6] dark:bg-[#10141C] border-t border-black/[0.07] dark:border-white/[0.08] shrink-0"
                  >
                    <div className="px-5 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5C616B] dark:text-[#8E95A2]">
                          Choose a routine
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowRoutinePicker(false)}
                          className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0]"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                        {templates.map(t => {
                          const alreadyIn = t.exercises.some(e => e.exerciseId === selectedExercise.id);
                          const justAdded = addedToRoutineId === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => appendExerciseToRoutine(t.id)}
                              className="w-full px-3.5 py-2.5 rounded-[12px] bg-white dark:bg-[#141923] border border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between gap-2 text-left"
                            >
                              <div className="min-w-0">
                                <p className="text-[13.5px] font-semibold text-[#0E1116] dark:text-white truncate">
                                  {t.name}
                                </p>
                                <p className="text-[11.5px] font-numeric text-[#5C616B] dark:text-[#8E95A2]">
                                  {t.exercises.length} exercise{t.exercises.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              {justAdded || alreadyIn ? (
                                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#16A34A] dark:text-[#8BE649] shrink-0">
                                  <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
                                  {justAdded ? 'Added' : 'In routine'}
                                </span>
                              ) : (
                                <Plus className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actionable Sticky Footer CTA — Add to Existing OR New Routine */}
              <div
                className="px-5 py-3.5 bg-white dark:bg-[#12161E] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center gap-2.5 shrink-0"
                style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
              >
                {templates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowRoutinePicker(prev => !prev)}
                    className="flex-1 rep-cta-action rep-cta-md"
                  >
                    <ListPlus className="w-4 h-4 shrink-0" />
                    <span>Add to Routine</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedExercise.id;
                    setSelectedExercise(null);
                    navigate(`/builder/new?exercise=${encodeURIComponent(id)}`);
                  }}
                  className={
                    templates.length > 0
                      ? 'rep-cta-secondary rep-cta-md'
                      : 'flex-1 rep-cta-action rep-cta-md'
                  }
                >
                  <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>{templates.length > 0 ? 'New Routine' : 'Add to New Routine'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation for Custom Exercise */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-black/50 z-[140]"
            />
            <div className="fixed inset-0 z-[141] flex items-center justify-center px-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-sm bg-white dark:bg-[#171B22] rounded-[22px] p-6 text-center pointer-events-auto shadow-2xl border border-black/10 dark:border-white/10"
              >
                <h3 className="font-display text-[18px] font-bold text-[#0E1116] dark:text-white">
                  Delete custom exercise?
                </h3>
                <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1.5 mb-5">
                  This removes it from your personal library. Past logged sessions stay intact.
                </p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 rounded-[12px] bg-[#F0F2F5] dark:bg-white/[0.08] text-[#0E1116] dark:text-white text-[14px] font-semibold whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustom(deleteConfirmId)}
                    className="flex-1 py-2.5 rounded-[12px] bg-[#FF3B30] text-white text-[14px] font-semibold whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Create Custom Exercise Sheet */}
      <CreateExerciseSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onSave={handleSaveNewExercise}
        defaultCategory={selectedCategory === 'all' ? 'gym' : selectedCategory}
      />
    </div>
  );
}