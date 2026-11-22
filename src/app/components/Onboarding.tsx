import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from 'lucide-react';
import type { Category } from '../data/exercises';
import type { UserPreferences } from '../data/store';
import { RepLogo } from './RepLogo';
import { BRAND_3D_ASSETS } from './visuals/brandAssets';
import { RadialTelemetryRing } from './visuals/RadialTelemetryRing';

interface OnboardingProps {
  onComplete: (prefs: Partial<UserPreferences>) => void;
}

const DISCIPLINES: {
  id: Category;
  title: string;
  subtitle: string;
  image: string;
}[] = [
  {
    id: 'gym',
    title: 'Gym & Strength',
    subtitle: 'Barbells, cables & progressive overload',
    image: BRAND_3D_ASSETS.gym,
  },
  {
    id: 'calisthenics',
    title: 'Calisthenics',
    subtitle: 'Rings, pull-up bars & bodyweight skill',
    image: BRAND_3D_ASSETS.calisthenics,
  },
  {
    id: 'animalflow',
    title: 'Flow & Mobility',
    subtitle: 'Ground movement, joints & athletic control',
    image: BRAND_3D_ASSETS.animalflow,
  },
];

const GOALS = [
  { id: 'strength', label: 'Strength' },
  { id: 'muscle', label: 'Muscle' },
  { id: 'endurance', label: 'Conditioning' },
  { id: 'flexibility', label: 'Mobility' },
];

const FREQUENCY_PRESETS = [
  { days: 2, key: '1-2', band: 'Light Rhythm', detail: 'Recovery-first consistency' },
  { days: 4, key: '3-4', band: 'Balanced Split', detail: 'Optimal training & recovery' },
  { days: 5, key: '5-6', band: 'High Output', detail: 'Dedicated weekly progression' },
  { days: 7, key: '7', band: 'Daily Habit', detail: 'Training + active mobility' },
];

function mapDaysToFrequencyKey(days: number): string {
  if (days <= 2) return '1-2';
  if (days <= 4) return '3-4';
  if (days <= 6) return '5-6';
  return '7';
}

function getBandForDays(days: number): { band: string; detail: string } {
  if (days <= 2) return FREQUENCY_PRESETS[0];
  if (days <= 4) return FREQUENCY_PRESETS[1];
  if (days <= 6) return FREQUENCY_PRESETS[2];
  return FREQUENCY_PRESETS[3];
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const [preferredStyle, setPreferredStyle] = useState<Category>('gym');
  const [goal, setGoal] = useState<string>('strength');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4);

  const finish = () => {
    onComplete({
      preferredStyle,
      goal,
      workoutFrequency: mapDaysToFrequencyKey(daysPerWeek),
    });
  };

  const activeBand = getBandForDays(daysPerWeek);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#F6F7F9] dark:bg-[#0B0E13] text-[#111317] dark:text-white flex flex-col">
      {/* Compact Top Bar */}
      <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(0)}
              aria-label="Back to step 1"
              className="w-10 h-10 rounded-[12px] bg-white dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#111317] dark:text-white" />
            </button>
          ) : (
            <RepLogo size={32} />
          )}
          <div>
            <p className="text-[12.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0] leading-none">
              Step {step + 1} of 2
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="h-1 w-9 rounded-full bg-[#16A34A] dark:bg-[#8BE649]" />
              <span
                className={`h-1 w-9 rounded-full transition-colors ${
                  step === 1
                    ? 'bg-[#16A34A] dark:bg-[#8BE649]'
                    : 'bg-black/10 dark:bg-white/15'
                }`}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={finish}
          className="text-[13.5px] font-medium text-[#5C616B] dark:text-[#9BA3B0] hover:text-[#111317] dark:hover:text-white transition-colors px-2 py-1.5 whitespace-nowrap shrink-0"
        >
          Skip
        </button>
      </div>

      {/* Main Content — 2 Focused Steps */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-8 py-4 flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h1 className="font-display text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] leading-[1.14] text-[#111317] dark:text-white text-balance">
                How do you like to train?
              </h1>
              <p className="text-[14.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1.5 mb-5 leading-[1.45]">
                We tailor your 500+ exercise library and weekly goals around your focus.
              </p>

              {/* 3D Discipline Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {DISCIPLINES.map(d => {
                  const selected = preferredStyle === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setPreferredStyle(d.id)}
                      className={`group relative rounded-[20px] p-3.5 text-left transition-all border flex sm:flex-col items-center sm:items-start gap-3.5 sm:gap-3 ${
                        selected
                          ? 'bg-white dark:bg-[#161B24] border-[#16A34A] dark:border-[#8BE649] ring-1 ring-[#16A34A]/30 dark:ring-[#8BE649]/40 shadow-[0_6px_20px_rgba(17,19,23,0.06)] dark:shadow-none'
                          : 'bg-white dark:bg-[#12161E] border-black/[0.07] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="w-14 h-14 sm:w-full sm:h-28 rounded-[13px] overflow-hidden bg-[#0E1116] shrink-0 relative">
                        <img
                          src={d.image}
                          alt={d.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {selected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#16A34A] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-[15.5px] font-bold text-[#111317] dark:text-white leading-tight">
                          {d.title}
                        </p>
                        <p className="text-[12.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1 leading-snug">
                          {d.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Primary Goal */}
              <div>
                <p className="text-[13px] font-semibold text-[#5C616B] dark:text-[#9BA3B0] mb-2">
                  Primary goal
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GOALS.map(g => {
                    const active = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`h-11 px-3 rounded-[13px] text-[13.5px] font-semibold whitespace-nowrap transition-all border ${
                          active
                            ? 'bg-[#111317] dark:bg-white text-white dark:text-[#0B0E13] border-[#111317] dark:border-white'
                            : 'bg-white dark:bg-[#12161E] text-[#3A3D45] dark:text-[#D0D5DD] border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-center items-center text-center"
            >
              <h1 className="font-display text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] leading-[1.14] text-[#111317] dark:text-white text-balance">
                Set your weekly goal
              </h1>
              <p className="text-[14.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-1.5 mb-6 max-w-md leading-[1.45]">
                Pick how many days you plan to train. You can change this anytime in Settings.
              </p>

              {/* Tactile Weekly Cadence Ring */}
              <div className="bg-white dark:bg-[#12161E] border border-black/[0.07] dark:border-white/[0.08] rounded-[26px] p-6 sm:p-7 w-full max-w-md flex flex-col items-center shadow-[0_8px_28px_rgba(17,19,23,0.05)] dark:shadow-none">
                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setDaysPerWeek(d => Math.max(1, d - 1))}
                    aria-label="Decrease weekly days"
                    className="w-11 h-11 rounded-[14px] bg-[#F1F3F6] dark:bg-white/[0.08] hover:bg-[#E5E8EE] dark:hover:bg-white/[0.14] active:scale-95 flex items-center justify-center transition-all"
                  >
                    <Minus className="w-5 h-5 text-[#111317] dark:text-white" />
                  </button>

                  <RadialTelemetryRing
                    value={daysPerWeek}
                    max={7}
                    displayValue={`${daysPerWeek}d`}
                    label="per week"
                    sublabel={activeBand.band}
                    accentColor="#16A34A"
                    darkAccentColor="#8BE649"
                    size={164}
                    segments={28}
                  />

                  <button
                    type="button"
                    onClick={() => setDaysPerWeek(d => Math.min(7, d + 1))}
                    aria-label="Increase weekly days"
                    className="w-11 h-11 rounded-[14px] bg-[#F1F3F6] dark:bg-white/[0.08] hover:bg-[#E5E8EE] dark:hover:bg-white/[0.14] active:scale-95 flex items-center justify-center transition-all"
                  >
                    <Plus className="w-5 h-5 text-[#111317] dark:text-white" />
                  </button>
                </div>

                <p className="text-[13.5px] text-[#5C616B] dark:text-[#9BA3B0] mt-4">
                  {activeBand.detail}
                </p>

                {/* Quick Day Presets */}
                <div className="grid grid-cols-4 gap-2 w-full mt-5">
                  {FREQUENCY_PRESETS.map(p => {
                    const active = daysPerWeek === p.days;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setDaysPerWeek(p.days)}
                        className={`h-10 rounded-[11px] text-[13px] font-semibold whitespace-nowrap transition-all border ${
                          active
                            ? 'bg-[#111317] dark:bg-[#8BE649] text-white dark:text-[#0B0E13] border-[#111317] dark:border-[#8BE649]'
                            : 'bg-[#F6F7F9] dark:bg-white/[0.05] text-[#3A3D45] dark:text-[#D0D5DD] border-black/[0.06] dark:border-white/[0.08]'
                        }`}
                      >
                        {p.days} days
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Primary CTA */}
        <div
          className="pt-6 pb-4"
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        >
          {step === 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={() => setStep(1)}
              className="w-full rep-cta-primary rep-cta-lg"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={finish}
              className="w-full rep-cta-action rep-cta-lg"
            >
              <span>Start Training</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}