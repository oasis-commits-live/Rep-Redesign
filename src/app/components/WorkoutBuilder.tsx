import {
  generateId,
  getTemplates,
  saveTemplateStatic,
  saveCustomExerciseStatic,
  useCustomExercises,
  type WorkoutTemplate,
  type WorkoutExercise,
} from '../data/store';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Search,
  Minus,
  Timer,
  ArrowUp,
  ArrowDown,
  Check,
  Dumbbell,
  Clock,
  Layers,
  Trash2,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_BG_LIGHT,
  CATEGORY_TEXT,
  type Category,
  type Exercise,
} from '../data/exercises';
import { useExerciseCatalog } from '../data/useExerciseCatalog';
import {
  STARTER_PRESETS,
  estimateRoutineMinutes,
  moveListItem,
  type WorkoutPreset,
} from '../data/workoutPresets';
import { CreateExerciseSheet } from './CreateExerciseSheet';

export interface WorkoutBuilderProps {
  /** When provided, runs in drawer mode — no route navigation */
  isDrawer?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
  editTemplateId?: string | null;
}

const QUICK_ROUTINE_NAMES = ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Full Body', 'Core Flow'];
const REST_OPTIONS = [45, 60, 90, 120];
const PICKER_MUSCLES = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Glutes', 'Core', 'Biceps', 'Triceps'];

export function WorkoutBuilder({
  isDrawer = false,
  onClose,
  onSaved,
  editTemplateId,
}: WorkoutBuilderProps = {}) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const prefillExerciseId = !isDrawer ? searchParams.get('exercise') : null;
  const prefillAppliedRef = useRef(false);

  const id = isDrawer ? editTemplateId || undefined : routeId;
  const isEdit = !!id && id !== 'new';

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('gym');
  const [exerciseList, setExerciseList] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState<Category | 'all'>('all');
  const [pickerMuscle, setPickerMuscle] = useState<string>('All');
  const [pickerSelectedIds, setPickerSelectedIds] = useState<string[]>([]);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const { catalogExercises } = useExerciseCatalog();
  const { customExercises } = useCustomExercises();

  const currentExerciseDB = useMemo(
    () => [...customExercises, ...catalogExercises],
    [customExercises, catalogExercises],
  );

  useEffect(() => {
    if (isEdit) {
      const templates = getTemplates();
      const t = templates.find(item => item.id === id);
      if (t) {
        setName(t.name);
        setCategory(t.category);
        setExerciseList(t.exercises);
      }
    }
  }, [id, isEdit]);

  // Pre-add exercise when navigated via /builder/new?exercise=<id>
  useEffect(() => {
    if (isEdit || !prefillExerciseId || prefillAppliedRef.current) return;
    const target = prefillExerciseId.toLowerCase();
    const found = currentExerciseDB.find(
      e =>
        e.id.toLowerCase() === target ||
        e.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') === target,
    );
    if (!found) return;
    prefillAppliedRef.current = true;
    setCategory(found.category);
    setExerciseList(prev => {
      if (prev.some(e => e.exerciseId === found.id)) return prev;
      return [
        ...prev,
        {
          exerciseId: found.id,
          exerciseName: found.name,
          sets: found.defaultSets || 3,
          targetReps: found.defaultReps || 10,
          weight: undefined,
          restSeconds: 60,
          isTimeBased: found.isTimeBased || false,
        },
      ];
    });
  }, [prefillExerciseId, isEdit, currentExerciseDB]);

  const recalcDominantCategory = (next: WorkoutExercise[]) => {
    const catCounts: Record<string, number> = {};
    next.forEach(we => {
      const dbEx = currentExerciseDB.find(e => e.id === we.exerciseId);
      if (dbEx) catCounts[dbEx.category] = (catCounts[dbEx.category] || 0) + 1;
    });
    const dominant = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominant) setCategory(dominant[0] as Category);
  };

  const filteredExercises = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return currentExerciseDB
      .filter(e => {
        if (pickerCategory !== 'all' && e.category !== pickerCategory) return false;
        if (pickerMuscle !== 'All') {
          const needle = pickerMuscle.toLowerCase();
          const match = (e.muscleGroups || []).some(m => {
            const ml = m.toLowerCase();
            if (needle === 'back') return ml.includes('back') || ml.includes('lat') || ml.includes('trap');
            if (needle === 'quads') return ml.includes('quad') || ml.includes('leg');
            return ml.includes(needle);
          });
          if (!match) return false;
        }
        if (
          q &&
          !e.name.toLowerCase().includes(q) &&
          !(e.equipment && e.equipment.toLowerCase().includes(q)) &&
          !(e.muscleGroups || []).some(m => m.toLowerCase().includes(q))
        ) {
          return false;
        }
        return true;
      })
      .slice(0, 100);
  }, [currentExerciseDB, pickerCategory, pickerMuscle, pickerSearch]);

  const openPicker = () => {
    setPickerSelectedIds([]);
    setShowExercisePicker(true);
  };

  const togglePickerSelection = (exId: string) => {
    setPickerSelectedIds(prev =>
      prev.includes(exId) ? prev.filter(idItem => idItem !== exId) : [...prev, exId],
    );
  };

  const commitPickerSelection = () => {
    if (pickerSelectedIds.length === 0) {
      setShowExercisePicker(false);
      return;
    }
    setExerciseList(prev => {
      const existingIds = new Set(prev.map(e => e.exerciseId));
      const toAdd: WorkoutExercise[] = [];
      for (const exId of pickerSelectedIds) {
        if (existingIds.has(exId)) continue;
        const ex = currentExerciseDB.find(e => e.id === exId);
        if (!ex) continue;
        toAdd.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          sets: ex.defaultSets || 3,
          targetReps: ex.defaultReps || 10,
          weight: undefined,
          restSeconds: 60,
          isTimeBased: ex.isTimeBased || false,
        });
      }
      const next = [...prev, ...toAdd];
      recalcDominantCategory(next);
      return next;
    });
    setPickerSelectedIds([]);
    setShowExercisePicker(false);
  };

  const applyStarterPreset = (preset: WorkoutPreset) => {
    if (!name.trim()) setName(preset.name);
    setCategory(preset.category);
    setExerciseList(preset.exercises.map(ex => ({ ...ex })));
  };

  const handleCreateExerciseSave = (exercise: Exercise) => {
    saveCustomExerciseStatic(exercise);
    setExerciseList(prev => {
      const next = [
        ...prev,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: exercise.defaultSets || 3,
          targetReps: exercise.defaultReps || 10,
          weight: undefined,
          restSeconds: 60,
          isTimeBased: exercise.isTimeBased || false,
        },
      ];
      recalcDominantCategory(next);
      return next;
    });
    setShowCreateSheet(false);
    setShowExercisePicker(false);
    setPickerSearch('');
  };

  const removeExercise = (idx: number) => {
    setExerciseList(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0) recalcDominantCategory(next);
      return next;
    });
  };

  const moveExercise = (idx: number, dir: -1 | 1) => {
    setExerciseList(prev => moveListItem(prev, idx, dir));
  };

  const updateExerciseSets = (idx: number, delta: number) => {
    setExerciseList(prev =>
      prev.map((ex, i) => (i === idx ? { ...ex, sets: Math.max(1, ex.sets + delta) } : ex)),
    );
  };

  const updateExerciseReps = (idx: number, delta: number) => {
    setExerciseList(prev =>
      prev.map((ex, i) => {
        if (i !== idx) return ex;
        if (ex.isTimeBased) {
          return { ...ex, targetReps: Math.max(5, ex.targetReps + delta * 5) };
        }
        return { ...ex, targetReps: Math.max(1, ex.targetReps + delta) };
      }),
    );
  };

  const updateExerciseWeight = (idx: number, value: string) => {
    const cleaned = value.trim();
    const parsed = cleaned === '' ? undefined : Math.max(0, Number(cleaned));
    setExerciseList(prev =>
      prev.map((ex, i) =>
        i === idx ? { ...ex, weight: parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined } : ex,
      ),
    );
  };

  const updateExerciseRest = (idx: number, restSeconds: number) => {
    setExerciseList(prev => prev.map((ex, i) => (i === idx ? { ...ex, restSeconds } : ex)));
  };

  const canSave = name.trim().length > 0 && exerciseList.length > 0;
  const saveHelperText = !name.trim() && exerciseList.length === 0
    ? 'Name your routine and add at least 1 exercise to save'
    : !name.trim()
    ? 'Give this routine a name above to save'
    : exerciseList.length === 0
    ? 'Add at least 1 exercise to save this routine'
    : null;

  const saveWorkout = () => {
    if (!canSave) return;
    const template: WorkoutTemplate = {
      id: isEdit ? id! : generateId(),
      name: name.trim(),
      category,
      exercises: exerciseList,
      createdAt: new Date().toISOString(),
    };

    saveTemplateStatic(template);
    if (isDrawer && onSaved) {
      onSaved();
    } else {
      navigate('/builder');
    }
  };

  const modalitySplit = exerciseList.reduce((acc, ex) => {
    const dbEx = currentExerciseDB.find(e => e.id === ex.exerciseId);
    if (dbEx) acc[dbEx.category] = (acc[dbEx.category] || 0) + 1;
    return acc;
  }, {} as Record<Category, number>);

  const totalExercises = exerciseList.length;
  const totalSets = exerciseList.reduce((acc, e) => acc + e.sets, 0);
  const estMinutes = estimateRoutineMinutes(exerciseList);

  return (
    <div className="h-full min-h-screen flex flex-col bg-[#F3F4F6] dark:bg-[#080A0E] text-[#0E1116] dark:text-[#F5F7FA] relative">
      {/* Top Bar */}
      <header className="sticky top-0 backdrop-blur-xl bg-white/92 dark:bg-[#10141C]/92 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-black/[0.07] dark:border-white/[0.08] z-20">
        <button
          type="button"
          onClick={() => (isDrawer ? onClose?.() : navigate(-1))}
          aria-label="Close routine builder"
          className="w-10 h-10 rounded-[12px] bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center shrink-0"
        >
          <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
        </button>
        <div className="text-center min-w-0 px-2">
          <span className="font-display text-[16px] font-bold text-[#0E1116] dark:text-white whitespace-nowrap">
            {isEdit ? 'Edit Routine' : 'New Routine'}
          </span>
        </div>
        <button
          type="button"
          onClick={saveWorkout}
          disabled={!canSave}
          className="rep-cta-action rep-cta-sm"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-36 no-scrollbar max-w-3xl w-full mx-auto px-4 sm:px-6 pt-5">
        {/* Routine Name Card */}
        <section className="rounded-[22px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-4 sm:p-5 mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <label
            htmlFor="routine-name-input"
            className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5C616B] dark:text-[#8E95A2] mb-2"
          >
            Routine name
          </label>
          <input
            id="routine-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Upper Push Power"
            className="w-full px-3.5 py-3 rounded-[14px] bg-[#F3F4F6] dark:bg-[#0B0E14] border border-black/[0.08] dark:border-white/[0.09] focus:border-[#16A34A] dark:focus:border-[#8BE649] font-display text-[20px] sm:text-[22px] font-bold tracking-[-0.015em] text-[#0E1116] dark:text-white placeholder:text-[#9BA3B0] dark:placeholder:text-[#4E5666] outline-none transition-colors"
          />

          {/* 1-tap quick name chips */}
          {!isEdit && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-3">
              {QUICK_ROUTINE_NAMES.map(suggestion => {
                const active = name.trim().toLowerCase() === suggestion.toLowerCase();
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setName(suggestion)}
                    className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-[#0E1116] dark:bg-[#8BE649] text-white dark:text-[#080A0E]'
                        : 'bg-[#F3F4F6] dark:bg-white/[0.06] text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#0E1116] dark:hover:text-white'
                    }`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
          )}

          {/* Live Telemetry Summary Strip */}
          <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.07] text-[12.5px] font-numeric text-[#5C616B] dark:text-[#9BA3B0]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649]" />
              <strong className="text-[#0E1116] dark:text-white font-semibold">{estMinutes}</strong> min est.
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649]" />
              <strong className="text-[#0E1116] dark:text-white font-semibold">{totalExercises}</strong>{' '}
              exercise{totalExercises !== 1 ? 's' : ''}
            </span>
            <span>
              <strong className="text-[#0E1116] dark:text-white font-semibold">{totalSets}</strong> sets
            </span>
          </div>

          {/* Modality Split Bar */}
          {totalExercises > 0 && (
            <div className="mt-3">
              <div className="flex h-1.5 rounded-full overflow-hidden bg-black/[0.07] dark:bg-white/[0.08]">
                {Object.entries(modalitySplit).map(([cat, count]) => (
                  <div
                    key={cat}
                    className="h-full"
                    style={{
                      width: `${(count / totalExercises) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[cat as Category],
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-1.5">
                {Object.entries(modalitySplit).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="text-[11px] font-semibold"
                    style={{ color: CATEGORY_COLORS[cat as Category] }}
                  >
                    {CATEGORY_LABELS[cat as Category]} {Math.round((count / totalExercises) * 100)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Primary Add Exercises Action */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={openPicker}
          className="w-full h-12 rounded-[16px] bg-[#0E1116] dark:bg-[#8BE649] text-white dark:text-[#080A0E] text-[14.5px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
          <span>{exerciseList.length === 0 ? 'Add Exercises from Library' : 'Add More Exercises'}</span>
        </motion.button>

        {/* Starter Presets Shelf when Empty */}
        {exerciseList.length === 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649]" />
                <h2 className="font-display text-[15px] font-bold text-[#0E1116] dark:text-white">
                  Or start from a proven split
                </h2>
              </div>
              <span className="text-[12px] text-[#5C616B] dark:text-[#8E95A2]">1 tap to pre-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STARTER_PRESETS.map(preset => {
                const accent = CATEGORY_COLORS[preset.category];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyStarterPreset(preset)}
                    className="group rounded-[18px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/25 dark:hover:border-[#8BE649]/60 p-4 text-left transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold" style={{ color: accent }}>
                        {CATEGORY_LABELS[preset.category]}
                      </span>
                      <span className="font-numeric text-[11.5px] text-[#5C616B] dark:text-[#8E95A2]">
                        {preset.exercises.length} moves · ~{estimateRoutineMinutes(preset.exercises)}m
                      </span>
                    </div>
                    <p className="font-display text-[16px] font-bold text-[#0E1116] dark:text-white">
                      {preset.name}
                    </p>
                    <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5 line-clamp-1">
                      {preset.exercises.map(e => e.exerciseName).join(' · ')}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Exercise List */}
        <div>
          <AnimatePresence mode="popLayout">
            {exerciseList.map((ex, idx) => {
              const dbEx = currentExerciseDB.find(e => e.id === ex.exerciseId);
              return (
                <motion.div
                  key={`${ex.exerciseId}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] rounded-[20px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                    {/* Card Header with Working Reorder + Remove */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveExercise(idx, -1)}
                          disabled={idx === 0}
                          aria-label={`Move ${ex.exerciseName} up`}
                          className="w-7 h-7 rounded-[8px] bg-[#F3F4F6] dark:bg-white/[0.07] flex items-center justify-center text-[#5C616B] dark:text-[#9BA3B0] disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(idx, 1)}
                          disabled={idx === exerciseList.length - 1}
                          aria-label={`Move ${ex.exerciseName} down`}
                          className="w-7 h-7 rounded-[8px] bg-[#F3F4F6] dark:bg-white/[0.07] flex items-center justify-center text-[#5C616B] dark:text-[#9BA3B0] disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-numeric text-[12px] font-semibold text-[#8E95A2] shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="font-display text-[16px] font-bold text-[#0E1116] dark:text-white truncate">
                            {ex.exerciseName}
                          </span>
                          {ex.isTimeBased && (
                            <Timer className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649] shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {dbEx && (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-[7px] shrink-0 ${CATEGORY_BG_LIGHT[dbEx.category]} ${CATEGORY_TEXT[dbEx.category]}`}
                            >
                              {CATEGORY_LABELS[dbEx.category]}
                            </span>
                          )}
                          <span className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] truncate">
                            {dbEx ? (dbEx.muscleGroups || []).slice(0, 2).join(' · ') : 'Custom movement'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeExercise(idx)}
                        aria-label={`Remove ${ex.exerciseName}`}
                        className="w-9 h-9 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] text-[#5C616B] dark:text-[#9BA3B0] flex items-center justify-center shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Prescription Controls Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.07]">
                      {/* Sets */}
                      <div className="rounded-[13px] bg-[#F3F4F6] dark:bg-[#0B0E14] px-3 py-2 flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0]">Sets</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateExerciseSets(idx, -1)}
                            aria-label={`Decrease sets for ${ex.exerciseName}`}
                            className="w-7 h-7 rounded-[8px] bg-white dark:bg-white/[0.09] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-[#0E1116] dark:text-white" />
                          </button>
                          <span className="font-numeric text-[14px] font-semibold text-[#0E1116] dark:text-white w-6 text-center">
                            {ex.sets}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateExerciseSets(idx, 1)}
                            aria-label={`Increase sets for ${ex.exerciseName}`}
                            className="w-7 h-7 rounded-[8px] bg-white dark:bg-white/[0.09] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-[#0E1116] dark:text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Reps / Secs */}
                      <div className="rounded-[13px] bg-[#F3F4F6] dark:bg-[#0B0E14] px-3 py-2 flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0]">
                          {ex.isTimeBased ? 'Sec' : 'Reps'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateExerciseReps(idx, -1)}
                            aria-label={`Decrease target for ${ex.exerciseName}`}
                            className="w-7 h-7 rounded-[8px] bg-white dark:bg-white/[0.09] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-[#0E1116] dark:text-white" />
                          </button>
                          <span className="font-numeric text-[14px] font-semibold text-[#0E1116] dark:text-white w-6 text-center">
                            {ex.targetReps}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateExerciseReps(idx, 1)}
                            aria-label={`Increase target for ${ex.exerciseName}`}
                            className="w-7 h-7 rounded-[8px] bg-white dark:bg-white/[0.09] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-[#0E1116] dark:text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Target Weight */}
                      {!ex.isTimeBased && (
                        <div className="col-span-2 sm:col-span-1 rounded-[13px] bg-[#F3F4F6] dark:bg-[#0B0E14] px-3 py-2 flex items-center justify-between gap-2">
                          <label
                            htmlFor={`weight-${idx}`}
                            className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] whitespace-nowrap"
                          >
                            Load (lb)
                          </label>
                          <input
                            id={`weight-${idx}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            placeholder="BW"
                            value={ex.weight ?? ''}
                            onChange={e => updateExerciseWeight(idx, e.target.value)}
                            className="w-20 text-right font-numeric text-[14px] font-semibold bg-white dark:bg-white/[0.09] text-[#0E1116] dark:text-white placeholder:text-[#8E95A2] px-2.5 py-1 rounded-[8px] outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Rest Timer Selector */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06]">
                      <span className="text-[12px] font-medium text-[#5C616B] dark:text-[#9BA3B0]">
                        Rest between sets
                      </span>
                      <div className="flex items-center gap-1">
                        {REST_OPTIONS.map(secs => {
                          const active = (ex.restSeconds || 60) === secs;
                          return (
                            <button
                              key={secs}
                              type="button"
                              onClick={() => updateExerciseRest(idx, secs)}
                              className={`px-2.5 py-1 rounded-[8px] font-numeric text-[11.5px] font-semibold transition-colors ${
                                active
                                  ? 'bg-[#0E1116] dark:bg-[#8BE649] text-white dark:text-[#080A0E]'
                                  : 'bg-[#F3F4F6] dark:bg-white/[0.06] text-[#5C616B] dark:text-[#9BA3B0]'
                              }`}
                            >
                              {secs}s
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent Bottom Save Bar with Clear Validation State */}
      <div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-[#F3F4F6]/95 dark:bg-[#080A0E]/95 border-t border-black/[0.07] dark:border-white/[0.08] px-4 sm:px-6 pt-3 z-20"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-3xl mx-auto">
          {saveHelperText && (
            <p className="text-center text-[12px] font-medium text-[#5C616B] dark:text-[#9BA3B0] mb-2">
              {saveHelperText}
            </p>
          )}
          <motion.button
            type="button"
            whileTap={canSave ? { scale: 0.985 } : undefined}
            onClick={saveWorkout}
            disabled={!canSave}
            className="w-full rep-cta-action rep-cta-lg"
          >
            <span>{isEdit ? 'Save Changes' : 'Save Routine'}</span>
          </motion.button>
        </div>
      </div>

      {/* Multi-Select Exercise Picker Modal */}
      <AnimatePresence>
        {showExercisePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExercisePicker(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl z-50 bg-[#F3F4F6] dark:bg-[#10141C] rounded-t-[26px] max-h-[86vh] flex flex-col border-t border-black/10 dark:border-white/10 shadow-2xl"
            >
              <div className="px-5 pt-4 pb-3 bg-white dark:bg-[#141923] rounded-t-[26px] border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex justify-center pb-2.5">
                  <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-display text-[18px] font-bold text-[#0E1116] dark:text-white">
                      Select exercises
                    </h3>
                    <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                      Tap multiple movements to add them all at once
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExercisePicker(false)}
                    aria-label="Close exercise picker"
                    className="w-9 h-9 rounded-[11px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                  </button>
                </div>

                <div className="relative mb-2.5">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A2]" />
                  <input
                    type="text"
                    placeholder="Search 500+ exercises, muscles, equipment..."
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F3F4F6] dark:bg-[#0B0E14] border border-black/[0.08] dark:border-white/[0.09] rounded-[12px] text-[14px] text-[#0E1116] dark:text-white placeholder:text-[#8E95A2] outline-none"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-2">
                  {(['all', 'gym', 'calisthenics', 'animalflow'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPickerCategory(c)}
                      className={`px-3 py-1.5 rounded-[9px] text-[12px] whitespace-nowrap shrink-0 transition-all ${
                        pickerCategory === c
                          ? 'bg-[#0E1116] dark:bg-[#8BE649] text-white dark:text-[#080A0E] font-semibold'
                          : 'bg-[#F3F4F6] dark:bg-white/[0.06] text-[#5C616B] dark:text-[#9BA3B0] font-medium'
                      }`}
                    >
                      {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>

                {/* Muscle Filter */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {PICKER_MUSCLES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPickerMuscle(m)}
                      className={`px-2.5 py-1 rounded-[8px] text-[11.5px] whitespace-nowrap shrink-0 transition-all ${
                        pickerMuscle === m
                          ? 'bg-[#16A34A]/15 dark:bg-[#8BE649]/20 text-[#15803D] dark:text-[#8BE649] font-semibold'
                          : 'text-[#5C616B] dark:text-[#8E95A2] hover:text-[#0E1116] dark:hover:text-white font-medium'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
                {filteredExercises.length === 0 && pickerSearch.trim().length > 0 && (
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="font-display text-[16px] font-bold text-[#0E1116] dark:text-white mb-1">
                      "{pickerSearch.trim()}" not found
                    </p>
                    <p className="text-[13px] text-[#5C616B] dark:text-[#9BA3B0] mb-4">
                      Create it as a custom movement and add it directly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCreateSheet(true)}
                      className="rep-cta-action rep-cta-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create "{pickerSearch.trim()}"</span>
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  {filteredExercises.map(ex => {
                    const alreadyAdded = exerciseList.some(e => e.exerciseId === ex.id);
                    const isSelected = pickerSelectedIds.includes(ex.id);
                    const thumb = ex.demoFrames?.[0] || ex.gifUrl;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => !alreadyAdded && togglePickerSelection(ex.id)}
                        disabled={alreadyAdded}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-[14px] border text-left transition-all ${
                          alreadyAdded
                            ? 'opacity-45 bg-white/60 dark:bg-white/[0.02] border-transparent'
                            : isSelected
                            ? 'bg-[#16A34A]/10 dark:bg-[#8BE649]/12 border-[#16A34A] dark:border-[#8BE649]'
                            : 'bg-white dark:bg-[#141923] border-black/[0.06] dark:border-white/[0.07]'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-[10px] overflow-hidden bg-[#111317] shrink-0 flex items-center justify-center">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Dumbbell
                              className="w-4 h-4"
                              style={{ color: CATEGORY_COLORS[ex.category] }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-semibold text-[#0E1116] dark:text-white truncate">
                              {ex.name}
                            </span>
                            {ex.isTimeBased && (
                              <Timer className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649] shrink-0" />
                            )}
                          </div>
                          <div className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] truncate">
                            <span style={{ color: CATEGORY_COLORS[ex.category] }} className="font-semibold">
                              {CATEGORY_LABELS[ex.category]}
                            </span>
                            {' · '}
                            {(ex.muscleGroups || []).slice(0, 2).join(', ')}
                          </div>
                        </div>

                        {alreadyAdded ? (
                          <span className="text-[11.5px] font-semibold text-[#8E95A2] whitespace-nowrap pr-1">
                            In routine
                          </span>
                        ) : (
                          <div
                            className={`w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 border transition-colors ${
                              isSelected
                                ? 'bg-[#16A34A] dark:bg-[#8BE649] border-transparent text-white dark:text-[#080A0E]'
                                : 'border-black/20 dark:border-white/20 bg-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateSheet(true)}
                  className="w-full flex items-center gap-3 py-4 px-2 mt-2 text-left"
                >
                  <div className="w-8 h-8 rounded-[10px] bg-[#16A34A]/12 dark:bg-[#8BE649]/15 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[14px] font-semibold text-[#16A34A] dark:text-[#8BE649]">
                      Create custom exercise
                    </span>
                    <div className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                      Add your own movement to this routine
                    </div>
                  </div>
                </button>
              </div>

              {/* Sticky Batch Confirm Bar */}
              <div
                className="px-5 pt-3 bg-white dark:bg-[#141923] border-t border-black/[0.07] dark:border-white/[0.08] flex items-center gap-2.5"
                style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
              >
                <button
                  type="button"
                  onClick={commitPickerSelection}
                  disabled={pickerSelectedIds.length === 0}
                  className="w-full rep-cta-action rep-cta-md"
                >
                  <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>
                    {pickerSelectedIds.length === 0
                      ? 'Tap exercises above to select'
                      : `Add ${pickerSelectedIds.length} Exercise${pickerSelectedIds.length > 1 ? 's' : ''}`}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreateExerciseSheet
        open={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
        onSave={handleCreateExerciseSave}
      />
    </div>
  );
}