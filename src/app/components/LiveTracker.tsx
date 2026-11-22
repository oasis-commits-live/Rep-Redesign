import {
  ListChecks,
  Plus,
  Minus,
  Check,
  SkipForward,
  Play,
  Pause,
  Timer,
  BookOpen,
  X,
  ChevronRight,
  Flame,
  Flag,
} from 'lucide-react';
import { CATEGORY_COLORS } from '../data/exercises';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  getTemplates,
  generateId,
  saveSessionStatic,
  clearActiveSession,
  incrementTemplateUsage,
  useCustomExercises,
  type WorkoutSession,
  type SessionExercise,
  type SetRecord,
} from '../data/store';
import { useExerciseCatalog } from '../data/useExerciseCatalog';
import { ExerciseMotionPlayer } from './visuals/ExerciseMotionPlayer';
import { fetchExerciseGif, type ExerciseGifResult } from '../data/api';

export function LiveTracker() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [templateRestMap, setTemplateRestMap] = useState<Record<string, number>>({});
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [restDuration, setRestDuration] = useState(60);
  const [restTotal, setRestTotal] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [weightInput, setWeightInput] = useState(0);
  const [repsInput, setRepsInput] = useState(0);

  const [setTimerRunning, setSetTimerRunning] = useState(false);
  const [setTimerElapsed, setSetTimerElapsed] = useState(0);
  const setTimerRef = useRef<number | null>(null);

  const [showEndModal, setShowEndModal] = useState(false);
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [showFormGuide, setShowFormGuide] = useState(false);
  const [formGif, setFormGif] = useState<ExerciseGifResult | null>(null);

  const timerRef = useRef<number | null>(null);
  const restRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { catalogExercises } = useExerciseCatalog();
  const { customExercises } = useCustomExercises();

  const allExercises = useMemo(
    () => [...customExercises, ...catalogExercises],
    [customExercises, catalogExercises],
  );

  useEffect(() => {
    const templates = getTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) {
      navigate('/builder');
      return;
    }

    const restMap: Record<string, number> = {};
    template.exercises.forEach(ex => {
      restMap[ex.exerciseId] = ex.restSeconds || 60;
    });
    setTemplateRestMap(restMap);

    const exercises: SessionExercise[] = template.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      isTimeBased: ex.isTimeBased || false,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.targetReps,
        weight: ex.weight,
        completed: false,
      })),
    }));

    const newSession: WorkoutSession = {
      id: generateId(),
      templateId: template.id,
      name: template.name,
      category: template.category,
      startedAt: new Date().toISOString(),
      exercises,
    };

    setSession(newSession);
    startTimeRef.current = Date.now();

    if (template.exercises.length > 0) {
      setRestDuration(template.exercises[0].restSeconds || 60);
      setWeightInput(template.exercises[0].weight || 0);
      setRepsInput(template.exercises[0].targetReps || 8);
    }
  }, [id, navigate]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!resting) return;
    restRef.current = window.setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) {
          setResting(false);
          if (restRef.current) clearInterval(restRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [resting]);

  useEffect(() => {
    if (!setTimerRunning) {
      if (setTimerRef.current) clearInterval(setTimerRef.current);
      return;
    }
    setTimerRef.current = window.setInterval(() => {
      setSetTimerElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      if (setTimerRef.current) clearInterval(setTimerRef.current);
    };
  }, [setTimerRunning]);

  const currentExercise = session?.exercises[currentExIdx];
  const currentSet = currentExercise?.sets[currentSetIdx];
  const isCurrentTimeBased = currentExercise?.isTimeBased || false;
  const accentColor = session ? CATEGORY_COLORS[session.category] : '#16A34A';

  const currentExerciseMeta = useMemo(() => {
    if (!currentExercise) return null;
    const byId = allExercises.find(e => e.id === currentExercise.exerciseId);
    if (byId) return byId;
    const targetName = currentExercise.exerciseName.toLowerCase();
    return allExercises.find(e => e.name.toLowerCase() === targetName) || null;
  }, [currentExercise, allExercises]);

  useEffect(() => {
    if (!showFormGuide || !currentExerciseMeta) {
      setFormGif(null);
      return;
    }
    if (currentExerciseMeta.demoFrames?.length || currentExerciseMeta.gifUrl) return;
    let cancelled = false;
    fetchExerciseGif(currentExerciseMeta.name)
      .then(res => {
        if (!cancelled) setFormGif(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showFormGuide, currentExerciseMeta]);

  useEffect(() => {
    if (currentSet) {
      setWeightInput(currentSet.weight || 0);
      setRepsInput(currentSet.reps);
    }
    setSetTimerRunning(false);
    setSetTimerElapsed(0);
    if (currentExercise) {
      setRestDuration(templateRestMap[currentExercise.exerciseId] || 60);
    }
  }, [currentExIdx, currentSetIdx, currentSet?.weight, currentSet?.reps, currentExercise, templateRestMap]);

  const totalSetsCount = useMemo(
    () => (session ? session.exercises.reduce((a, ex) => a + ex.sets.length, 0) : 0),
    [session],
  );
  const completedSetsCount = useMemo(
    () =>
      session
        ? session.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0)
        : 0,
    [session],
  );

  const findNextIncompleteSlot = (
    exercises: SessionExercise[],
    fromEx: number,
    fromSet: number,
  ): { exIdx: number; setIdx: number } | null => {
    // Check remaining sets in current exercise first
    for (let si = fromSet + 1; si < exercises[fromEx].sets.length; si++) {
      if (!exercises[fromEx].sets[si].completed) return { exIdx: fromEx, setIdx: si };
    }
    // Check subsequent exercises
    for (let ei = fromEx + 1; ei < exercises.length; ei++) {
      const idx = exercises[ei].sets.findIndex(s => !s.completed);
      if (idx !== -1) return { exIdx: ei, setIdx: idx };
    }
    // Wrap around from beginning in case user jumped ahead earlier
    for (let ei = 0; ei <= fromEx; ei++) {
      const idx = exercises[ei].sets.findIndex(s => !s.completed);
      if (idx !== -1) return { exIdx: ei, setIdx: idx };
    }
    return null;
  };

  const commitSessionAndOpenSummary = (finalSession: WorkoutSession) => {
    const completed: WorkoutSession = {
      ...finalSession,
      completedAt: new Date().toISOString(),
    };
    saveSessionStatic(completed);
    clearActiveSession();
    if (completed.templateId) {
      incrementTemplateUsage(completed.templateId);
    }
    navigate(`/workout/${completed.id}/summary`, { replace: true });
  };

  const completeSet = () => {
    if (!session || !currentExercise) return;

    if (isCurrentTimeBased) {
      setSetTimerRunning(false);
    }

    const updatedSet: Partial<SetRecord> = isCurrentTimeBased
      ? { completed: true, duration: Math.max(1, setTimerElapsed), reps: 1 }
      : { completed: true, weight: weightInput, reps: repsInput };

    const nextExercises = session.exercises.map((ex, ei) => {
      if (ei !== currentExIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, si) => {
          if (si === currentSetIdx) return { ...s, ...updatedSet };
          // Carry working weight & reps forward to the next uncompleted set of the same exercise
          if (!isCurrentTimeBased && si === currentSetIdx + 1 && !s.completed) {
            return { ...s, weight: weightInput, reps: repsInput };
          }
          return s;
        }),
      };
    });

    const nextSession: WorkoutSession = { ...session, exercises: nextExercises };
    setSession(nextSession);

    const nextSlot = findNextIncompleteSlot(nextExercises, currentExIdx, currentSetIdx);
    if (!nextSlot) {
      commitSessionAndOpenSummary(nextSession);
      return;
    }

    const nextRestSecs = templateRestMap[nextExercises[currentExIdx].exerciseId] || restDuration || 60;
    setRestTime(nextRestSecs);
    setRestTotal(nextRestSecs);
    setResting(true);
    setCurrentExIdx(nextSlot.exIdx);
    setCurrentSetIdx(nextSlot.setIdx);
  };

  const skipCurrentSet = () => {
    if (!session) return;
    const nextSlot = findNextIncompleteSlot(session.exercises, currentExIdx, currentSetIdx);
    if (nextSlot && (nextSlot.exIdx !== currentExIdx || nextSlot.setIdx !== currentSetIdx)) {
      setCurrentExIdx(nextSlot.exIdx);
      setCurrentSetIdx(nextSlot.setIdx);
    } else if (completedSetsCount > 0) {
      setShowEndModal(true);
    }
  };

  const addExtraSet = () => {
    if (!session || !currentExercise) return;
    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex, ei) => {
          if (ei !== currentExIdx) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                setNumber: ex.sets.length + 1,
                reps: lastSet?.reps || repsInput || 10,
                weight: lastSet?.weight ?? weightInput,
                completed: false,
              },
            ],
          };
        }),
      };
    });
  };

  const jumpToExercise = (exIdx: number) => {
    if (!session) return;
    const firstIncomplete = session.exercises[exIdx].sets.findIndex(s => !s.completed);
    setCurrentExIdx(exIdx);
    setCurrentSetIdx(firstIncomplete !== -1 ? firstIncomplete : 0);
    setShowPlanDrawer(false);
    setResting(false);
  };

  const skipRest = () => {
    setResting(false);
    setRestTime(0);
    if (restRef.current) clearInterval(restRef.current);
  };

  const adjustRestTime = (delta: number) => {
    setRestTime(prev => {
      const next = Math.max(5, prev + delta);
      setRestTotal(curr => Math.max(curr, next));
      return next;
    });
  };

  const formatRestTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  if (!session || !currentExercise || !currentSet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] dark:bg-[#080A0E]">
        <div className="text-[#5C616B] dark:text-[#9BA3B0]">Loading workout...</div>
      </div>
    );
  }

  const progressPct = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;
  const isFinalRemainingSet = totalSetsCount - completedSetsCount <= 1 && !currentSet.completed;
  const upNextLabel = `Set ${currentSetIdx + 1} · ${currentExercise.exerciseName}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] dark:bg-[#080A0E] text-[#0E1116] dark:text-[#F5F7FA] relative overflow-hidden">
      <div className="max-w-xl w-full mx-auto flex-1 flex flex-col">
        {/* Top Action Bar — Distinct Plan & End Controls */}
        <header className="px-4 sm:px-5 pt-4 pb-3 z-10">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowPlanDrawer(true)}
              aria-label="Open workout plan overview"
              className="h-10 px-3 rounded-[12px] bg-white dark:bg-[#12161E] border border-black/[0.08] dark:border-white/[0.08] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0E1116] dark:text-white whitespace-nowrap shrink-0"
            >
              <ListChecks className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649]" />
              <span>
                Plan{' '}
                <span className="font-numeric text-[#5C616B] dark:text-[#9BA3B0]">
                  {currentExIdx + 1}/{session.exercises.length}
                </span>
              </span>
            </button>

            <div className="text-center min-w-0 px-1">
              <p className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] truncate">
                {session.name}
              </p>
              <div className="font-numeric text-[14px] font-semibold text-[#0E1116] dark:text-white leading-tight">
                {formatElapsed(elapsed)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              aria-label="End or finish workout"
              className="h-10 px-3.5 rounded-[12px] bg-white dark:bg-[#12161E] border border-black/[0.08] dark:border-white/[0.08] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0E1116] dark:text-white whitespace-nowrap shrink-0"
            >
              <Flag className="w-3.5 h-3.5 text-[#D9592E] dark:text-[#F08865]" />
              <span>End</span>
            </button>
          </div>

          {/* Overall Session Progress Bar */}
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex-1 h-1.5 rounded-full bg-black/[0.07] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="font-numeric text-[11.5px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] shrink-0">
              {completedSetsCount}/{totalSetsCount} sets
            </span>
          </div>
        </header>

        {/* Main Active Exercise Stage */}
        <main className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-4">
          {/* Exercise Heading & Form Guide */}
          <motion.div
            key={`${currentExIdx}-header`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#5C616B] dark:text-[#8E95A2] mb-1">
              Set <span className="font-numeric text-[#0E1116] dark:text-white">{currentSetIdx + 1}</span> of{' '}
              <span className="font-numeric">{currentExercise.sets.length}</span>
            </p>
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-display text-[25px] sm:text-[30px] font-bold text-[#0E1116] dark:text-white tracking-[-0.02em] leading-[1.12] text-balance">
                {currentExercise.exerciseName}
              </h1>
              {isCurrentTimeBased && <Timer className="w-5 h-5 text-[#16A34A] dark:text-[#8BE649] shrink-0" />}
            </div>

            {/* Interactive Set Pill Strip + Form Guide trigger */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] rounded-[11px] p-1">
                {currentExercise.sets.map((s, i) => {
                  const isCurrent = i === currentSetIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentSetIdx(i)}
                      aria-label={`Select set ${i + 1}`}
                      className={`h-7 min-w-[28px] px-2 rounded-[8px] font-numeric text-[12px] font-semibold transition-all inline-flex items-center justify-center ${
                        s.completed
                          ? 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#080A0E]'
                          : isCurrent
                          ? 'bg-[#0E1116] dark:bg-white text-white dark:text-[#080A0E]'
                          : 'text-[#5C616B] dark:text-[#8E95A2]'
                      }`}
                    >
                      {s.completed ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={addExtraSet}
                  aria-label="Add an extra set"
                  className="h-7 px-2 rounded-[8px] text-[12px] font-semibold text-[#16A34A] dark:text-[#8BE649] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] inline-flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowFormGuide(true)}
                className="h-9 px-3 rounded-[11px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0E1116] dark:text-white whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#8BE649]" />
                <span>Form Guide</span>
              </button>
            </div>
          </motion.div>

          {/* Compact Movement Reference Strip — balances layout & offers 1-tap demo */}
          <button
            type="button"
            onClick={() => setShowFormGuide(true)}
            className="w-full mb-3.5 rounded-[18px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-2.5 flex items-center gap-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/20 dark:hover:border-[#8BE649]/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-[12px] overflow-hidden bg-[#0D1016] shrink-0 relative flex items-center justify-center">
              {currentExerciseMeta?.demoFrames?.[0] || currentExerciseMeta?.gifUrl ? (
                <img
                  src={currentExerciseMeta.demoFrames?.[0] || currentExerciseMeta.gifUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Play className="w-4 h-4 text-[#8BE649]" />
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded bg-black/75 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-white fill-white ml-[1px]" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-semibold text-[#0E1116] dark:text-white truncate">
                {currentExerciseMeta?.muscleGroups?.slice(0, 2).join(' · ') || 'Watch form cues & setup'}
              </p>
              <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] font-numeric truncate mt-0.5">
                Target:{' '}
                {isCurrentTimeBased
                  ? `${currentSet.reps}s hold`
                  : `${currentSet.weight || 0} lb × ${currentSet.reps} reps`}
                {' · '}
                {restDuration}s rest
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8E95A2] shrink-0" />
          </button>

          {/* Timer vs. Weight+Reps Logging Card */}
          {isCurrentTimeBased ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-full rounded-[24px] bg-[#0D1016] text-white border border-white/[0.08] p-6 flex flex-col items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <span className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#9BA3B0]">
                  Hold Timer · Target {currentSet.reps}s
                </span>
                <span
                  className="font-numeric text-[66px] sm:text-[74px] font-semibold tracking-[-0.03em] my-3 leading-none"
                  style={{ color: setTimerRunning ? '#8BE649' : '#FFFFFF' }}
                >
                  {formatRestTime(setTimerElapsed)}
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSetTimerRunning(prev => !prev)}
                  className="mt-2 h-12 px-7 rounded-[14px] font-semibold text-[14.5px] inline-flex items-center gap-2 whitespace-nowrap"
                  style={{
                    backgroundColor: setTimerRunning ? 'rgba(255,255,255,0.14)' : '#8BE649',
                    color: setTimerRunning ? '#FFFFFF' : '#080A0E',
                  }}
                >
                  {setTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" fill="currentColor" />
                      <span>Pause Timer</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" fill="currentColor" />
                      <span>{setTimerElapsed > 0 ? 'Resume Hold' : 'Start Hold'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-3">
              {/* Side-by-side dedicated Weight & Reps cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Weight Card */}
                <div className="rounded-[22px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-4 flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                  <label
                    htmlFor="live-weight-input"
                    className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5C616B] dark:text-[#8E95A2]"
                  >
                    Weight (lb)
                  </label>
                  <input
                    id="live-weight-input"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={weightInput}
                    onChange={e => setWeightInput(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full text-center font-numeric text-[46px] sm:text-[52px] font-semibold tracking-[-0.03em] text-[#0E1116] dark:text-white bg-transparent outline-none my-2"
                  />
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setWeightInput(prev => Math.max(0, prev - 5))}
                      aria-label="Decrease weight by 5 pounds"
                      className="flex-1 h-11 rounded-[12px] bg-[#F3F4F6] dark:bg-white/[0.08] flex items-center justify-center text-[#0E1116] dark:text-white active:scale-95 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightInput(prev => prev + 5)}
                      aria-label="Increase weight by 5 pounds"
                      className="flex-1 h-11 rounded-[12px] bg-[#F3F4F6] dark:bg-white/[0.08] flex items-center justify-center text-[#0E1116] dark:text-white active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reps Card */}
                <div className="rounded-[22px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] p-4 flex flex-col items-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                  <label
                    htmlFor="live-reps-input"
                    className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5C616B] dark:text-[#8E95A2]"
                  >
                    Reps
                  </label>
                  <input
                    id="live-reps-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={repsInput}
                    onChange={e => setRepsInput(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full text-center font-numeric text-[46px] sm:text-[52px] font-semibold tracking-[-0.03em] text-[#0E1116] dark:text-white bg-transparent outline-none my-2"
                  />
                  <div className="flex items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setRepsInput(prev => Math.max(1, prev - 1))}
                      aria-label="Decrease reps by 1"
                      className="flex-1 h-11 rounded-[12px] bg-[#F3F4F6] dark:bg-white/[0.08] flex items-center justify-center text-[#0E1116] dark:text-white active:scale-95 transition-transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepsInput(prev => prev + 1)}
                      aria-label="Increase reps by 1"
                      className="flex-1 h-11 rounded-[12px] bg-[#F3F4F6] dark:bg-white/[0.08] flex items-center justify-center text-[#0E1116] dark:text-white active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Weight Plate Adjustments */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {[
                  { label: 'BW', action: () => setWeightInput(0) },
                  { label: '+2.5 lb', action: () => setWeightInput(prev => prev + 2.5) },
                  { label: '+5 lb', action: () => setWeightInput(prev => prev + 5) },
                  { label: '+10 lb', action: () => setWeightInput(prev => prev + 10) },
                  { label: '+25 lb', action: () => setWeightInput(prev => prev + 25) },
                ].map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.action}
                    className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] font-numeric text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#0E1116] dark:hover:text-white transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtle Skip Set / Add Set Utility Row */}
          <div className="flex items-center justify-between pt-4 text-[12.5px]">
            <button
              type="button"
              onClick={addExtraSet}
              className="inline-flex items-center gap-1 font-semibold text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#0E1116] dark:hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Set</span>
            </button>
            <button
              type="button"
              onClick={skipCurrentSet}
              className="inline-flex items-center gap-1 font-semibold text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#0E1116] dark:hover:text-white"
            >
              <span>Skip Set</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>

        {/* Primary Complete Set Footer */}
        <div
          className="px-4 sm:px-5 pt-2 z-10"
          style={{ paddingBottom: 'max(22px, env(safe-area-inset-bottom))' }}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={completeSet}
            disabled={isCurrentTimeBased && setTimerElapsed === 0}
            className="w-full rep-cta-action rep-cta-lg"
          >
            <Check className="w-4 h-4 shrink-0" strokeWidth={3} />
            <span>
              {isFinalRemainingSet
                ? 'Finish Workout'
                : isCurrentTimeBased
                ? `Log Hold · ${formatRestTime(setTimerElapsed)}`
                : `Log Set ${currentSetIdx + 1} · ${weightInput > 0 ? `${weightInput} lb × ` : ''}${repsInput} reps`}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Rest Timer Bottom Sheet */}
      <AnimatePresence>
        {resting && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-[#0D1016] text-white rounded-t-[26px] z-20 border-t border-white/10 shadow-2xl"
          >
            <div className="flex justify-center pt-3">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="flex flex-col items-center pt-4 pb-8 px-6">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#8BE649]">
                Rest & Recover
              </span>

              <div className="font-numeric text-[54px] font-semibold text-white leading-tight mt-1">
                {formatRestTime(restTime)}
              </div>

              <div className="w-full max-w-[290px] mt-2">
                <div className="h-1.5 w-full rounded-full bg-white/12 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#8BE649]"
                    initial={{ width: '100%' }}
                    animate={{ width: `${restTotal > 0 ? (restTime / restTotal) * 100 : 0}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <p className="text-[13px] text-[#9BA3B0] mt-3.5 text-center truncate max-w-full">
                Up next: <span className="text-white font-semibold">{upNextLabel}</span>
              </p>

              <div className="flex gap-2.5 mt-5 w-full max-w-[320px]">
                <button
                  type="button"
                  onClick={() => adjustRestTime(-15)}
                  className="h-11 px-3.5 bg-white/[0.08] rounded-[12px] font-numeric text-[13.5px] font-semibold text-white whitespace-nowrap"
                >
                  −15s
                </button>
                <button
                  type="button"
                  onClick={() => adjustRestTime(30)}
                  className="h-11 px-3.5 bg-white/[0.08] rounded-[12px] font-numeric text-[13.5px] font-semibold text-white whitespace-nowrap"
                >
                  +30s
                </button>
                <button
                  type="button"
                  onClick={skipRest}
                  className="flex-1 h-11 bg-[#8BE649] rounded-[12px] inline-flex items-center justify-center gap-1.5 text-[14px] font-semibold text-[#080A0E] whitespace-nowrap"
                >
                  <span>Skip Rest</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Plan Overview Drawer */}
      <AnimatePresence>
        {showPlanDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlanDrawer(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-[#F3F4F6] dark:bg-[#10141C] rounded-t-[26px] max-h-[82vh] flex flex-col z-50 border-t border-black/10 dark:border-white/10 shadow-2xl"
            >
              <div className="px-5 pt-4 pb-3 bg-white dark:bg-[#141923] rounded-t-[26px] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <div>
                  <h2 className="font-display text-[18px] font-bold text-[#0E1116] dark:text-white">
                    Session Plan
                  </h2>
                  <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0]">
                    Tap any exercise to jump straight to it
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanDrawer(false)}
                  aria-label="Close session plan"
                  className="w-9 h-9 rounded-[11px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar pb-8">
                {session.exercises.map((ex, idx) => {
                  const doneSets = ex.sets.filter(s => s.completed).length;
                  const allDone = doneSets === ex.sets.length;
                  const isCurrent = idx === currentExIdx;
                  return (
                    <button
                      key={`${ex.exerciseId}-${idx}`}
                      type="button"
                      onClick={() => jumpToExercise(idx)}
                      className={`w-full rounded-[16px] p-3.5 border text-left flex items-center gap-3 transition-all ${
                        isCurrent
                          ? 'bg-[#0E1116] dark:bg-[#1A222E] text-white border-[#0E1116] dark:border-[#8BE649]'
                          : 'bg-white dark:bg-[#141923] border-black/[0.06] dark:border-white/[0.07]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-[10px] font-numeric text-[13px] font-bold flex items-center justify-center shrink-0 ${
                          allDone
                            ? 'bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#080A0E]'
                            : isCurrent
                            ? 'bg-[#8BE649] text-[#080A0E]'
                            : 'bg-[#F3F4F6] dark:bg-white/[0.08] text-[#5C616B] dark:text-[#9BA3B0]'
                        }`}
                      >
                        {allDone ? <Check className="w-4 h-4" strokeWidth={3} /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-display text-[15px] font-bold truncate ${
                            isCurrent ? 'text-white' : 'text-[#0E1116] dark:text-white'
                          }`}
                        >
                          {ex.exerciseName}
                        </p>
                        <p
                          className={`text-[12px] font-numeric mt-0.5 ${
                            isCurrent ? 'text-[#9BA3B0]' : 'text-[#5C616B] dark:text-[#8E95A2]'
                          }`}
                        >
                          {doneSets}/{ex.sets.length} sets done · Target {ex.sets[0]?.reps || 10}
                          {ex.isTimeBased ? 's' : ' reps'}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 ${
                          isCurrent ? 'text-[#8BE649]' : 'text-[#9BA3B0]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* In-Workout Form Guide Modal */}
      <AnimatePresence>
        {showFormGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormGuide(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              className="fixed bottom-0 left-0 right-0 md:inset-0 md:m-auto md:max-w-lg md:max-h-[82vh] max-h-[84vh] bg-[#F3F4F6] dark:bg-[#10141C] rounded-t-[26px] md:rounded-[26px] flex flex-col z-50 border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="px-5 py-3.5 bg-white dark:bg-[#141923] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#16A34A] dark:text-[#8BE649]">
                    Form Guide
                  </p>
                  <h2 className="font-display text-[18px] font-bold text-[#0E1116] dark:text-white truncate">
                    {currentExercise.exerciseName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormGuide(false)}
                  aria-label="Close form guide"
                  className="w-9 h-9 rounded-[11px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center shrink-0"
                >
                  <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
                {currentExerciseMeta && (
                  <ExerciseMotionPlayer
                    exercise={currentExerciseMeta}
                    liveGifUrl={formGif?.gifUrl}
                  />
                )}
                <div className="rounded-[18px] bg-white dark:bg-[#141923] border border-black/[0.07] dark:border-white/[0.08] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-[#16A34A] dark:text-[#8BE649]" />
                    <h3 className="font-display text-[15px] font-bold text-[#0E1116] dark:text-white">
                      Execution cues
                    </h3>
                  </div>
                  <ol className="space-y-2.5">
                    {(currentExerciseMeta?.instructions?.length
                      ? currentExerciseMeta.instructions
                      : [
                          `Brace your core and establish a stable base for ${currentExercise.exerciseName}.`,
                          'Move through a controlled full range of motion and return under tension.',
                        ]
                    ).map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-[#F3F4F6] dark:bg-white/[0.08] font-numeric text-[11px] font-semibold text-[#0E1116] dark:text-[#8BE649] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-[13.5px] text-[#3A3D45] dark:text-[#D0D5DD] leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Smart End / Save Early Modal */}
      <AnimatePresence>
        {showEndModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEndModal(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center px-5 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="w-full max-w-sm bg-white dark:bg-[#141923] border border-black/10 dark:border-white/10 rounded-[24px] p-6 text-center shadow-2xl pointer-events-auto"
              >
                <h3 className="font-display text-[20px] font-bold text-[#0E1116] dark:text-white">
                  {completedSetsCount > 0 ? 'Wrap up workout?' : 'Leave workout?'}
                </h3>
                <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-2 leading-relaxed">
                  Elapsed{' '}
                  <span className="font-numeric font-semibold text-[#0E1116] dark:text-white">
                    {formatElapsed(elapsed)}
                  </span>
                  {' · '}
                  <span className="font-numeric font-semibold text-[#0E1116] dark:text-white">
                    {completedSetsCount}/{totalSetsCount}
                  </span>{' '}
                  sets logged.
                </p>

                <div className="flex flex-col gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowEndModal(false)}
                    className="w-full rep-cta-primary rep-cta-md"
                  >
                    Keep Going
                  </button>

                  {completedSetsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => commitSessionAndOpenSummary(session)}
                      className="w-full rep-cta-action rep-cta-md"
                    >
                      Finish & Save Progress
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      clearActiveSession();
                      navigate('/builder', { replace: true });
                    }}
                    className="w-full h-11 rounded-[12px] bg-[#FF3B30]/10 text-[#DC2626] dark:text-[#FF6961] text-[14px] font-semibold whitespace-nowrap"
                  >
                    Discard Session
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}