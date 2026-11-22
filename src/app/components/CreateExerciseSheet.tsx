import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Plus, Minus, Timer, Hash } from 'lucide-react';
import {
  CATEGORY_LABELS_FULL,
  CATEGORY_COLORS,
  CATEGORY_BG_LIGHT,
  CATEGORY_TEXT,
  COMMON_MUSCLE_GROUPS,
  type Category,
  type Exercise,
} from '../data/exercises';
import { generateId } from '../data/store';

interface CreateExerciseSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  editExercise?: Exercise | null;
}

export function CreateExerciseSheet({
  open,
  onClose,
  onSave,
  editExercise,
}: CreateExerciseSheetProps) {
  const [name, setName] = useState(editExercise?.name || '');
  const [category, setCategory] = useState<Category>(editExercise?.category || 'gym');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(
    editExercise?.muscleGroups || []
  );
  const [description, setDescription] = useState(editExercise?.description || '');
  const [defaultSets, setDefaultSets] = useState(editExercise?.defaultSets || 3);
  const [defaultReps, setDefaultReps] = useState(editExercise?.defaultReps || 10);
  const [isTimeBased, setIsTimeBased] = useState(editExercise?.isTimeBased || false);
  const [customMuscle, setCustomMuscle] = useState('');

  // Sync form when editExercise changes (switching between create/edit)
  useEffect(() => {
    if (editExercise) {
      setName(editExercise.name);
      setCategory(editExercise.category);
      setSelectedMuscles(editExercise.muscleGroups);
      setDescription(editExercise.description || '');
      setDefaultSets(editExercise.defaultSets || 3);
      setDefaultReps(editExercise.defaultReps || 10);
      setIsTimeBased(editExercise.isTimeBased || false);
    } else if (open) {
      setName('');
      setCategory('gym');
      setSelectedMuscles([]);
      setDescription('');
      setDefaultSets(3);
      setDefaultReps(10);
      setIsTimeBased(false);
    }
    setCustomMuscle('');
  }, [editExercise, open]);

  const categories: Category[] = ['gym', 'calisthenics', 'animalflow'];

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const addCustomMuscle = () => {
    const trimmed = customMuscle.trim();
    if (trimmed && !selectedMuscles.includes(trimmed)) {
      setSelectedMuscles(prev => [...prev, trimmed]);
      setCustomMuscle('');
    }
  };

  const handleSave = () => {
    if (!name.trim() || selectedMuscles.length === 0) return;

    const exercise: Exercise = {
      id: editExercise?.id || `custom_${generateId()}`,
      name: name.trim(),
      category,
      muscleGroups: selectedMuscles,
      description: description.trim() || undefined,
      defaultSets,
      defaultReps,
      isCustom: true,
      isTimeBased,
    };

    onSave(exercise);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    if (!editExercise) {
      setName('');
      setCategory('gym');
      setSelectedMuscles([]);
      setDescription('');
      setDefaultSets(3);
      setDefaultReps(10);
      setIsTimeBased(false);
      setCustomMuscle('');
    }
  };

  const canSave = name.trim().length > 0 && selectedMuscles.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#f5f5f7] rounded-t-[32px] max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[rgba(142,142,147,0.3)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[rgba(229,229,234,0.5)] flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[#8e8e93]" />
              </button>
              <h3 className="text-[17px] text-[#1c1c1e]" style={{ fontWeight: 600 }}>
                {editExercise ? 'Edit Exercise' : 'New Exercise'}
              </h3>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className="text-[16px] text-[#34C759] disabled:opacity-30"
                style={{ fontWeight: 600 }}
              >
                Save
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-10 no-scrollbar">
              {/* Name */}
              <div className="mb-6">
                <label className="text-[13px] text-[#8e8e93] tracking-[0.52px] uppercase block mb-2" style={{ fontWeight: 500 }}>
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Incline Curl"
                  className="w-full px-4 py-3.5 bg-white rounded-[16px] border border-[#e5e5ea] text-[17px] text-[#1c1c1e] outline-none focus:border-[#34C759] transition-colors placeholder:text-[#c7c7cc]"
                  style={{ fontWeight: 400 }}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-[13px] text-[#8e8e93] tracking-[0.52px] uppercase block mb-2" style={{ fontWeight: 500 }}>
                  Category
                </label>
                <div className="flex gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`flex-1 py-3 rounded-[16px] text-[14px] transition-all border ${
                        category === c
                          ? `${CATEGORY_BG_LIGHT[c]} ${CATEGORY_TEXT[c]} border-[${CATEGORY_COLORS[c]}33]`
                          : 'bg-white text-[#8e8e93] border-[#e5e5ea]'
                      }`}
                      style={{ fontWeight: category === c ? 600 : 400 }}
                    >
                      {CATEGORY_LABELS_FULL[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Muscle Groups */}
              <div className="mb-6">
                <label className="text-[13px] text-[#8e8e93] tracking-[0.52px] uppercase block mb-2" style={{ fontWeight: 500 }}>
                  Muscle Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_MUSCLE_GROUPS.map(m => {
                    const isSelected = selectedMuscles.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMuscle(m)}
                        className={`px-3 py-[7px] rounded-full text-[13px] transition-all border ${
                          isSelected
                            ? 'bg-[#34C759] text-white border-[#34C759]'
                            : 'bg-white text-[#8e8e93] border-[#e5e5ea]'
                        }`}
                        style={{ fontWeight: isSelected ? 500 : 400 }}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {m}
                      </button>
                    );
                  })}
                  {/* Show any custom muscles not in the common list */}
                  {selectedMuscles
                    .filter(m => !COMMON_MUSCLE_GROUPS.includes(m))
                    .map(m => (
                      <button
                        key={m}
                        onClick={() => toggleMuscle(m)}
                        className="px-3 py-[7px] rounded-full text-[13px] bg-[#34C759] text-white border border-[#34C759] transition-all"
                        style={{ fontWeight: 500 }}
                      >
                        <Check className="w-3 h-3 inline mr-1" />
                        {m}
                      </button>
                    ))}
                </div>
                {/* Custom muscle input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customMuscle}
                    onChange={e => setCustomMuscle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomMuscle()}
                    placeholder="Add custom muscle..."
                    className="flex-1 px-3 py-2 bg-white rounded-[12px] border border-[#e5e5ea] text-[14px] text-[#1c1c1e] outline-none focus:border-[#34C759] placeholder:text-[#c7c7cc]"
                    style={{ fontWeight: 400 }}
                  />
                  <button
                    onClick={addCustomMuscle}
                    disabled={!customMuscle.trim()}
                    className="w-9 h-9 rounded-[12px] bg-[#34C759] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {selectedMuscles.length === 0 && (
                  <p className="text-[12px] text-[#ff3b30] mt-1.5 px-1">
                    Select at least one muscle group
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="text-[13px] text-[#8e8e93] tracking-[0.52px] uppercase block mb-2" style={{ fontWeight: 500 }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-4 py-3.5 bg-white rounded-[16px] border border-[#e5e5ea] text-[15px] text-[#1c1c1e] outline-none focus:border-[#34C759] transition-colors placeholder:text-[#c7c7cc]"
                  style={{ fontWeight: 400 }}
                />
              </div>

              {/* Exercise Type Toggle */}
              <div className="mb-6">
                <label className="text-[13px] text-[#8e8e93] tracking-[0.52px] uppercase block mb-2" style={{ fontWeight: 500 }}>
                  Exercise Type
                </label>
                <div className="flex bg-white rounded-[16px] border border-[#e5e5ea] overflow-hidden">
                  <button
                    onClick={() => setIsTimeBased(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] transition-all ${
                      !isTimeBased
                        ? 'bg-[#34C759] text-white'
                        : 'text-[#8e8e93]'
                    }`}
                    style={{ fontWeight: !isTimeBased ? 600 : 400 }}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    Rep-Based
                  </button>
                  <button
                    onClick={() => setIsTimeBased(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] transition-all ${
                      isTimeBased
                        ? 'bg-[#34C759] text-white'
                        : 'text-[#8e8e93]'
                    }`}
                    style={{ fontWeight: isTimeBased ? 600 : 400 }}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    Time-Based
                  </button>
                </div>
                <p className="text-[12px] text-[#8e8e93] mt-1.5 px-1">
                  {isTimeBased
                    ? 'Uses a running timer per set (e.g. plank hold)'
                    : 'Track repetitions per set (e.g. bench press)'}
                </p>
              </div>

              {/* Defaults: Sets & Reps/Duration */}
              <div className="mb-6">
                <label className="text-[13px] text-[#8e8e93] tracking-[0.52px] uppercase block mb-2" style={{ fontWeight: 500 }}>
                  Defaults
                </label>
                <div className="flex gap-3">
                  {/* Sets */}
                  <div className="flex-1 bg-white rounded-[16px] border border-[#e5e5ea] p-3 flex items-center justify-between">
                    <span className="text-[13px] text-[#8e8e93]" style={{ fontWeight: 500 }}>Sets</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDefaultSets(Math.max(1, defaultSets - 1))}
                        className="w-7 h-7 rounded-full bg-[rgba(229,229,234,0.6)] flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 text-[#1c1c1e]" />
                      </button>
                      <span className="font-numeric text-[18px] text-[#1c1c1e] w-6 text-center" style={{ fontWeight: 500 }}>
                        {defaultSets}
                      </span>
                      <button
                        onClick={() => setDefaultSets(defaultSets + 1)}
                        className="w-7 h-7 rounded-full bg-[rgba(229,229,234,0.6)] flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 text-[#1c1c1e]" />
                      </button>
                    </div>
                  </div>

                  {/* Reps or Duration */}
                  <div className="flex-1 bg-white rounded-[16px] border border-[#e5e5ea] p-3 flex items-center justify-between">
                    <span className="text-[13px] text-[#8e8e93]" style={{ fontWeight: 500 }}>
                      {isTimeBased ? 'Sec' : 'Reps'}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDefaultReps(Math.max(1, defaultReps - (isTimeBased ? 5 : 1)))}
                        className="w-7 h-7 rounded-full bg-[rgba(229,229,234,0.6)] flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 text-[#1c1c1e]" />
                      </button>
                      <span className="font-numeric text-[18px] text-[#1c1c1e] w-8 text-center" style={{ fontWeight: 500 }}>
                        {defaultReps}
                      </span>
                      <button
                        onClick={() => setDefaultReps(defaultReps + (isTimeBased ? 5 : 1))}
                        className="w-7 h-7 rounded-full bg-[rgba(229,229,234,0.6)] flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 text-[#1c1c1e]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={!canSave}
                className="w-full py-4 rounded-[16px] bg-[#34C759] text-white text-[17px] flex items-center justify-center gap-2 shadow-[0px_8px_30px_0px_rgba(52,199,89,0.2)] disabled:opacity-30"
                style={{ fontWeight: 600 }}
              >
                {editExercise ? 'Update Exercise' : 'Create Exercise'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}