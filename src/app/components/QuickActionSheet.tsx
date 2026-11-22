import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Play, Plus, Compass, X, ChevronRight, Dumbbell } from 'lucide-react';
import { getTemplates } from '../data/store';
import { CATEGORY_LABELS } from '../data/exercises';
import { estimateRoutineMinutes } from '../data/workoutPresets';

interface QuickActionSheetProps {
  open: boolean;
  onClose: () => void;
}

export function QuickActionSheet({ open, onClose }: QuickActionSheetProps) {
  const navigate = useNavigate();
  const templates = getTemplates();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[180]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 360 }}
            className="fixed inset-x-0 bottom-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[181] bg-[#F5F6F8] dark:bg-[#11151C] rounded-t-[28px] border-t border-black/10 dark:border-white/10 shadow-2xl overflow-hidden"
            style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20" />
            </div>

            <div className="px-5 pt-2 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-[#111317] dark:text-white leading-tight">
                  Start Training
                </h2>
                <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5">
                  Launch a saved routine or build a new split
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close quick actions"
                className="w-9 h-9 rounded-[11px] bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[#5C616B] dark:text-[#9BA3B0]" />
              </button>
            </div>

            <div className="px-5 space-y-3 max-h-[68vh] overflow-y-auto no-scrollbar">
              {/* Saved Routines — Instant 1-tap Start */}
              {templates.length > 0 && (
                <div>
                  <p className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2">
                    Your routines
                  </p>
                  <div className="space-y-2">
                    {templates.slice(0, 3).map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => go(`/workouts/${t.id}/live`)}
                        className="w-full p-3.5 rounded-[18px] bg-[#111317] dark:bg-[#1A212C] text-white flex items-center justify-between gap-3 text-left hover:bg-[#1C2028] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-[12px] bg-[#8BE649] text-[#0B0E13] flex items-center justify-center shrink-0">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-[15.5px] font-bold text-white truncate">
                              {t.name}
                            </p>
                            <p className="text-[12px] text-[#A2AAB8] font-numeric">
                              {CATEGORY_LABELS[t.category]} · ~{estimateRoutineMinutes(t.exercises)}m · {t.exercises.length} exercises
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8BE649] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Creation & Discovery Flows */}
              <div>
                <p className="text-[12px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2">
                  Create & explore
                </p>
                <div className="bg-white dark:bg-[#171C25] rounded-[20px] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.06] dark:divide-white/[0.06] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => go('/builder/new')}
                    className="w-full px-4 py-3.5 flex items-center gap-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-[#EAF8E0] dark:bg-[#8BE649]/15 text-[#15803D] dark:text-[#8BE649] flex items-center justify-center shrink-0">
                      <Plus className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-semibold text-[#111317] dark:text-white">
                        Create New Routine
                      </p>
                      <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                        Pick a starter split or build your own exercise list
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E95A2] shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => go('/library')}
                    className="w-full px-4 py-3.5 flex items-center gap-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] dark:bg-[#3B82F6]/15 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-semibold text-[#111317] dark:text-white">
                        Explore 500+ Exercises
                      </p>
                      <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                        Watch form demos, muscle heat maps & instructions
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E95A2] shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => go('/library?create=1')}
                    className="w-full px-4 py-3.5 flex items-center gap-3.5 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-[#FFF1EB] dark:bg-[#E97852]/15 text-[#D9592E] dark:text-[#F08865] flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-semibold text-[#111317] dark:text-white">
                        Add Custom Movement
                      </p>
                      <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0]">
                        Save your own exercise with sets, reps, or timer
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E95A2] shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
