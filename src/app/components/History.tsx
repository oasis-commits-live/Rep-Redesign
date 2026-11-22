import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Play, Dumbbell, BarChart3, Trash2, Smartphone,
  ArrowUpRight, Pencil, MoreHorizontal, Copy, Check,
} from 'lucide-react';
import {
  getTemplates,
  getSessions,
  deleteTemplateStatic,
  saveTemplateStatic,
  generateId,
  type WorkoutTemplate,
} from '../data/store';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Category,
} from '../data/exercises';
import {
  STARTER_PRESETS,
  buildTemplateFromPreset,
  estimateRoutineMinutes,
} from '../data/workoutPresets';
import { format, isToday, isYesterday } from 'date-fns';
import { WorkoutBuilder } from './WorkoutBuilder';
import { useIsWatch } from '../data/useWatchMode';
import { getCategory3DAsset } from './visuals/brandAssets';

export function History() {
  const navigate = useNavigate();
  const isWatch = useIsWatch();
  const [refreshKey, setRefreshKey] = useState(0);
  const templates = getTemplates();
  const sessions = getSessions()
    .filter(s => s.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [view, setView] = useState<'routines' | 'history'>('routines');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addedPresetId, setAddedPresetId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);

  const filteredTemplates = templates.filter(t => filter === 'all' || t.category === filter);

  const categories: (Category | 'all')[] = ['all', 'gym', 'calisthenics', 'animalflow'];
  const filterLabels: Record<string, string> = {
    all: 'All',
    gym: 'Gym',
    calisthenics: 'Calisthenics',
    animalflow: 'Flow',
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  const formatDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.max(1, Math.floor(ms / 60000));
    if (mins >= 60) {
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  const handleDelete = useCallback((id: string) => {
    deleteTemplateStatic(id);
    setDeleteConfirmId(null);
    setMenuOpenId(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleDuplicate = useCallback((tpl: WorkoutTemplate) => {
    saveTemplateStatic({
      ...tpl,
      id: generateId(),
      name: `${tpl.name} Copy`,
      exercises: tpl.exercises.map(ex => ({ ...ex })),
      createdAt: new Date().toISOString(),
    });
    setMenuOpenId(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleAddStarterPreset = useCallback((presetId: string) => {
    const tpl = buildTemplateFromPreset(presetId);
    if (!tpl) return;
    saveTemplateStatic(tpl);
    setAddedPresetId(presetId);
    setRefreshKey(k => k + 1);
    setTimeout(() => setAddedPresetId(null), 1800);
  }, []);

  const openBuilder = useCallback((templateId?: string) => {
    setMenuOpenId(null);
    setEditTemplateId(templateId || null);
    setBuilderOpen(true);
  }, []);

  const closeBuilder = useCallback(() => {
    setBuilderOpen(false);
    setEditTemplateId(null);
  }, []);

  const onBuilderSaved = useCallback(() => {
    setBuilderOpen(false);
    setEditTemplateId(null);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div
      className={isWatch ? 'pb-2 px-2 pt-4' : 'max-w-5xl mx-auto px-4 sm:px-8 pt-5 md:pt-8 pb-10'}
      key={refreshKey}
      onClick={() => menuOpenId && setMenuOpenId(null)}
    >
      {/* Crisp Single-Line Header */}
      <div className={isWatch ? 'flex items-center justify-between gap-2 mb-2' : 'rep-page-header'}>
        <div className="min-w-0">
          <h1
            className={
              isWatch
                ? 'font-display text-[18px] font-bold tracking-[-0.02em] leading-[1.12] text-[#111317] dark:text-white whitespace-nowrap'
                : 'rep-page-title'
            }
          >
            Train
          </h1>
          {!isWatch && (
            <p className="rep-page-subtitle">
              {templates.length} saved routine{templates.length === 1 ? '' : 's'} · {sessions.length} logged
            </p>
          )}
        </div>

        {!isWatch && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => openBuilder()}
            className="rep-cta-primary rep-cta-sm"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>New Routine</span>
          </motion.button>
        )}
      </div>

      {/* Clear Full-Width Segmented View Switcher */}
      {!isWatch && (
        <div className="grid grid-cols-2 sm:inline-grid p-1 rounded-[14px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] mb-5">
          {([
            { id: 'routines', label: `My Routines (${templates.length})` },
            { id: 'history', label: `History (${sessions.length})` },
          ] as const).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`px-4 sm:px-5 py-2 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all ${
                view === tab.id
                  ? 'bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#080A0E]'
                  : 'text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#111317] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {(isWatch ? true : view === 'routines') ? (
        <>
          {/* Category Filter */}
          <div className={`flex ${isWatch ? 'gap-1.5 mb-3' : 'gap-2 mb-5'} overflow-x-auto no-scrollbar`}>
            {categories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`${
                  isWatch ? 'px-2 py-1 text-[9px]' : 'px-3.5 py-1.5 text-[12.5px]'
                } rounded-[10px] transition-colors whitespace-nowrap shrink-0 ${
                  filter === c
                    ? 'bg-[#111317] dark:bg-white text-white dark:text-[#080A0E] font-semibold'
                    : 'bg-white dark:bg-[#131820] text-[#5C616B] dark:text-[#9BA3B0] border border-black/[0.07] dark:border-white/[0.08] font-medium'
                }`}
              >
                {filterLabels[c]}
              </button>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {filteredTemplates.length > 0 ? (
              <div className={isWatch ? 'flex flex-col gap-2' : 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'}>
                {filteredTemplates.map(t => {
                  const totalSets = t.exercises.reduce((a, e) => a + e.sets, 0);
                  const mins = estimateRoutineMinutes(t.exercises);
                  const catColor = CATEGORY_COLORS[t.category] || '#16A34A';
                  const menuOpen = menuOpenId === t.id;
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className={`bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative ${
                        isWatch ? 'rounded-[14px] p-2.5' : 'rounded-[22px] p-4 sm:p-5'
                      } flex flex-col justify-between gap-4`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {!isWatch && (
                              <div className="w-12 h-12 rounded-[13px] overflow-hidden bg-[#111317] shrink-0">
                                <img
                                  src={getCategory3DAsset(t.category)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span
                                className="text-[11.5px] font-semibold block leading-none"
                                style={{ color: catColor }}
                              >
                                {CATEGORY_LABELS[t.category]} · ~{mins} min
                              </span>
                              <h3
                                className={`font-display ${
                                  isWatch ? 'text-[12px]' : 'text-[16.5px] sm:text-[18px]'
                                } font-bold text-[#111317] dark:text-white line-clamp-2 leading-snug mt-0.5`}
                              >
                                {t.name}
                              </h3>
                              <p
                                className={`${
                                  isWatch ? 'text-[9px]' : 'text-[12.5px]'
                                } text-[#5C616B] dark:text-[#9BA3B0] font-numeric`}
                              >
                                {t.exercises.length} exercises · {totalSets} sets
                              </p>
                            </div>
                          </div>

                          {/* Overflow Menu instead of scary red trash button */}
                          {!isWatch && (
                            <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setMenuOpenId(menuOpen ? null : t.id)}
                                aria-label={`Options for ${t.name}`}
                                className="w-9 h-9 rounded-[10px] bg-[#F3F4F6] dark:bg-white/[0.07] text-[#5C616B] dark:text-[#9BA3B0] flex items-center justify-center hover:text-[#111317] dark:hover:text-white transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              <AnimatePresence>
                                {menuOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                                    className="absolute right-0 top-10 z-20 w-44 rounded-[14px] bg-white dark:bg-[#1A202B] border border-black/10 dark:border-white/10 shadow-xl py-1 overflow-hidden"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => openBuilder(t.id)}
                                      className="w-full px-3.5 py-2.5 text-left text-[13px] font-medium text-[#111317] dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center gap-2.5"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-[#5C616B] dark:text-[#9BA3B0]" />
                                      <span>Edit routine</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicate(t)}
                                      className="w-full px-3.5 py-2.5 text-left text-[13px] font-medium text-[#111317] dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center gap-2.5"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-[#5C616B] dark:text-[#9BA3B0]" />
                                      <span>Duplicate</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        setDeleteConfirmId(t.id);
                                      }}
                                      className="w-full px-3.5 py-2.5 text-left text-[13px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 flex items-center gap-2.5"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Inline Exercise Preview List so users know what's inside at a glance */}
                        {!isWatch && t.exercises.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
                            {t.exercises.slice(0, 3).map((ex, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[13px]">
                                <span className="text-[#3E434D] dark:text-[#CBD1DC] truncate pr-3">
                                  {ex.exerciseName}
                                </span>
                                <span className="font-numeric text-[12px] text-[#717784] dark:text-[#8E95A2] shrink-0">
                                  {ex.sets}×{ex.targetReps}{ex.isTimeBased ? 's' : ''}
                                  {ex.weight ? ` · ${ex.weight}lb` : ''}
                                </span>
                              </div>
                            ))}
                            {t.exercises.length > 3 && (
                              <p className="text-[12px] text-[#717784] dark:text-[#8E95A2] pt-0.5">
                                +{t.exercises.length - 3} more movement{t.exercises.length - 3 > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {isWatch ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/workouts/${t.id}/live`)}
                          className="w-full py-2 rounded-[10px] bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          Start
                        </button>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/workouts/${t.id}/live`)}
                            className="flex-1 rep-cta-action rep-cta-md"
                          >
                            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                            <span>Start Workout</span>
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openBuilder(t.id)}
                            className="rep-cta-secondary rep-cta-md"
                          >
                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                            <span>Edit</span>
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] rounded-[22px] py-12 px-6 text-center mb-8">
                <Dumbbell className="w-8 h-8 text-[#8E95A2] mx-auto mb-3" />
                <p className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
                  {filter === 'all' ? 'No routines yet' : `No ${filterLabels[filter]} routines yet`}
                </p>
                {isWatch ? (
                  <p className="text-[10px] text-[#007AFF] mt-2 flex items-center justify-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Open Rep on your phone to create routines
                  </p>
                ) : (
                  <>
                    <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1 mb-5">
                      Build a custom routine or add one of the starter plans below.
                    </p>
                    <button
                      type="button"
                      onClick={() => openBuilder()}
                      className="rep-cta-primary rep-cta-md"
                    >
                      <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                      <span>Create Routine</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </AnimatePresence>

          {/* Curated Starter Splits — 1-Tap Save into Your Routines */}
          {!isWatch && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="rep-section-title">Starter splits</h2>
                  <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5">
                    Add a proven workout plan to your routines in one tap
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STARTER_PRESETS.map(preset => {
                  const isAdded = addedPresetId === preset.id;
                  const mins = estimateRoutineMinutes(preset.exercises);
                  return (
                    <div
                      key={preset.id}
                      className="rounded-[20px] bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] p-4 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: CATEGORY_COLORS[preset.category] }}
                        >
                          {CATEGORY_LABELS[preset.category]} · ~{mins}m
                        </span>
                        <h3 className="font-display text-[15.5px] font-bold text-[#111317] dark:text-white mt-0.5 leading-snug">
                          {preset.name}
                        </h3>
                        <p className="text-[12px] text-[#5C616B] dark:text-[#9BA3B0] mt-0.5">
                          {preset.subtitle} · {preset.exercises.length} moves
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddStarterPreset(preset.id)}
                        className={`w-full h-9 rounded-[10px] text-[12.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                          isAdded
                            ? 'bg-[#EAF8E0] dark:bg-[#8BE649]/20 text-[#15803D] dark:text-[#8BE649]'
                            : 'bg-[#F3F4F6] dark:bg-white/[0.07] text-[#111317] dark:text-white hover:bg-[#E7E9EE] dark:hover:bg-white/[0.12]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Routines</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      ) : (
        /* History View */
        <div>
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] rounded-[22px] py-16 px-6 text-center">
              <BarChart3 className="w-8 h-8 text-[#8E95A2] mx-auto mb-3" />
              <p className="font-display text-[17px] font-bold text-[#111317] dark:text-white">
                No completed workouts yet
              </p>
              <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1 mb-5">
                Finish a session to unlock strain scores, muscle heat maps, and set splits.
              </p>
              <button
                type="button"
                onClick={() => setView('routines')}
                className="rep-cta-action rep-cta-md"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>Pick a Routine</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sessions.map(s => {
                const totalVol = s.exercises.reduce(
                  (a, ex) =>
                    a +
                    ex.sets
                      .filter(set => set.completed)
                      .reduce((b, set) => b + set.reps * (set.weight || 0), 0),
                  0,
                );
                const setsDone = s.exercises.reduce(
                  (a, ex) => a + ex.sets.filter(set => set.completed).length,
                  0,
                );
                const duration = s.completedAt ? formatDuration(s.startedAt, s.completedAt) : '';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => navigate(`/workout/${s.id}/summary`)}
                    className="group bg-white dark:bg-[#131820] border border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-[#8BE649]/50 rounded-[20px] p-4 flex items-center justify-between gap-3 text-left transition-all shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-[12px] overflow-hidden bg-[#111317] shrink-0">
                        <img src={getCategory3DAsset(s.category)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-[16px] font-bold text-[#111317] dark:text-white truncate">
                          {s.name}
                        </p>
                        <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0]">
                          {formatDate(s.completedAt!)} {duration && `· ${duration}`} · {setsDone} sets
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-numeric text-[13px] font-semibold text-[#111317] dark:text-[#8BE649]">
                        {totalVol > 0 ? `${totalVol.toLocaleString()} lb` : 'BW'}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#8E95A2] group-hover:text-[#111317] dark:group-hover:text-white" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {!isWatch && (
        <AnimatePresence>
          {deleteConfirmId && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmId(null)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  className="w-full max-w-sm bg-white dark:bg-[#171B22] rounded-[22px] p-6 text-center pointer-events-auto shadow-2xl border border-black/10 dark:border-white/10"
                >
                  <h3 className="font-display text-[18px] font-bold text-[#111317] dark:text-white mb-1">
                    Delete routine?
                  </h3>
                  <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mb-5">
                    This will permanently delete{' '}
                    <span className="text-[#111317] dark:text-white font-semibold">
                      {templates.find(t => t.id === deleteConfirmId)?.name}
                    </span>
                    . Past workout logs will stay intact.
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2.5 rounded-[12px] bg-[#F0F2F5] dark:bg-white/[0.08] text-[#111317] dark:text-white text-[14px] font-semibold whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(deleteConfirmId)}
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
      )}

      {/* Builder Drawer */}
      {!isWatch && (
        <AnimatePresence>
          {builderOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/45 z-40"
                onClick={closeBuilder}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed left-0 right-0 bottom-0 z-50 bg-[#F3F4F6] dark:bg-[#080A0E] rounded-t-[24px] flex flex-col"
                style={{ top: 24 }}
              >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-[#C7C7CC] dark:bg-white/20" />
                </div>
                <div className="flex-1 min-h-0">
                  <WorkoutBuilder
                    isDrawer
                    onClose={closeBuilder}
                    onSaved={onBuilderSaved}
                    editTemplateId={editTemplateId}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
