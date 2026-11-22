import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'motion/react';
import {
  Home, BookOpen, Dumbbell, User, Search, Plus,
  Heart, Play, ChevronRight, ArrowRight,
  Zap, TrendingUp, Users, Filter, Clock,
  BarChart3, CheckCircle, Shield,
} from 'lucide-react';
import { RepLogo } from './RepLogo';

interface AppWalkthroughProps {
  displayName: string;
  onComplete: () => void;
}

interface WalkthroughStep {
  id: string;
  tabIcon?: any;
  tabLabel?: string;
  tabColor?: string;
  title: string;
  subtitle: string;
  features: { icon: any; label: string; desc: string; color: string }[];
  illustration: 'welcome' | 'home' | 'library' | 'builder' | 'profile' | 'ready';
}

const steps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Rep',
    subtitle: 'Your premium fitness companion. Here\u2019s a quick tour of everything you can do.',
    features: [],
    illustration: 'welcome',
  },
  {
    id: 'home',
    tabIcon: Home,
    tabLabel: 'Home',
    tabColor: '#34C759',
    title: 'Community Feed',
    subtitle: 'Your home base \u2014 see what athletes around you are training.',
    features: [
      { icon: Users, label: 'Discover Athletes', desc: 'Find and follow people who train like you', color: '#0056D6' },
      { icon: Heart, label: 'Like & Comment', desc: 'Engage with workouts from your network', color: '#FF3B30' },
      { icon: TrendingUp, label: 'Stay Motivated', desc: 'See real training from real people', color: '#34C759' },
    ],
    illustration: 'home',
  },
  {
    id: 'library',
    tabIcon: BookOpen,
    tabLabel: 'Library',
    tabColor: '#0056D6',
    title: 'Exercise Library',
    subtitle: 'Browse 150+ exercises across Gym, Calisthenics, and Animal Flow.',
    features: [
      { icon: Search, label: 'Search & Filter', desc: 'Find any exercise by name or muscle group', color: '#8e8e93' },
      { icon: Filter, label: 'By Category', desc: 'Gym, Calisthenics, and Animal Flow sections', color: '#AF52DE' },
      { icon: Plus, label: 'Custom Exercises', desc: 'Add your own exercises to the library', color: '#E8772E' },
    ],
    illustration: 'library',
  },
  {
    id: 'builder',
    tabIcon: Dumbbell,
    tabLabel: 'Builder',
    tabColor: '#E8772E',
    title: 'Workout Builder',
    subtitle: 'Create templates, then track every set and rep in real time.',
    features: [
      { icon: Plus, label: 'Build Routines', desc: 'Drag exercises into custom workout templates', color: '#34C759' },
      { icon: Play, label: 'Live Tracking', desc: 'Start a session and log sets as you go', color: '#0056D6' },
      { icon: Clock, label: 'Full History', desc: 'Review every past workout with detailed stats', color: '#8e8e93' },
    ],
    illustration: 'builder',
  },
  {
    id: 'profile',
    tabIcon: User,
    tabLabel: 'Profile',
    tabColor: '#AF52DE',
    title: 'Your Profile',
    subtitle: 'Track your progress, manage followers, and personalize your experience.',
    features: [
      { icon: BarChart3, label: 'Your Stats', desc: 'Total workouts, volume, and streaks at a glance', color: '#34C759' },
      { icon: Users, label: 'Followers', desc: 'Build your training community', color: '#0056D6' },
      { icon: Shield, label: 'Settings', desc: 'Theme, units, notifications, and account', color: '#8e8e93' },
    ],
    illustration: 'profile',
  },
  {
    id: 'ready',
    title: 'You\u2019re Ready',
    subtitle: 'Every rep counts. Let\u2019s make them all visible.',
    features: [],
    illustration: 'ready',
  },
];

// Illustration components for each step
function WelcomeIllustration() {
  return (
    <div className="relative flex items-center justify-center h-[200px]">
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.2 }}
      >
        <RepLogo size={96} radius={28} />
      </motion.div>
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#34C759]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
            x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 15)],
            y: [0, -30 - i * 12],
          }}
          transition={{
            duration: 2.5,
            delay: 0.5 + i * 0.15,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          style={{
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}

function TabIllustration({ tabIcon: Icon, tabColor, features }: {
  tabIcon: any; tabColor: string; features: WalkthroughStep['features'];
}) {
  return (
    <div className="relative flex flex-col items-center h-[200px] justify-center">
      {/* Large tab icon with glow */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
        className="w-16 h-16 rounded-[22px] flex items-center justify-center mb-5"
        style={{ backgroundColor: `${tabColor}14` }}
      >
        <Icon className="w-8 h-8" style={{ color: tabColor }} />
      </motion.div>
      {/* Feature icon row */}
      <div className="flex gap-4">
        {features.map((f, i) => {
          const FIcon = f.icon;
          return (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 250, damping: 22 }}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center"
              style={{ backgroundColor: `${f.color}12` }}
            >
              <FIcon className="w-5 h-5" style={{ color: f.color }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReadyIllustration() {
  return (
    <div className="relative flex items-center justify-center h-[200px]">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
        className="w-20 h-20 rounded-full bg-[#34C759] flex items-center justify-center"
        style={{ boxShadow: '0 12px 40px -8px rgba(52,199,89,0.45)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        >
          <CheckCircle className="w-10 h-10 text-white" strokeWidth={2} />
        </motion.div>
      </motion.div>
      {/* Celebration ring */}
      <motion.div
        className="absolute w-32 h-32 rounded-full border-2 border-[#34C759]"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.2, 1.4], opacity: [0, 0.3, 0] }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute w-40 h-40 rounded-full border border-[#34C759]"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.3, 1.6], opacity: [0, 0.2, 0] }}
        transition={{ duration: 1.8, delay: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

const SWIPE_THRESHOLD = 50;

export function AppWalkthrough({ displayName, onComplete }: AppWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const dragX = useMotionValue(0);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -300) {
      goNext();
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 300) {
      goPrev();
    }
  }, [goNext, goPrev]);

  const handleFinish = () => {
    localStorage.setItem('rep_walkthrough_seen', 'true');
    onComplete();
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

  return (
    <div className="h-full min-h-screen min-h-[100dvh] flex flex-col bg-[#f5f5f7] dark:bg-black relative overflow-hidden">
      {/* Skip button */}
      {!isLast && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleFinish}
          className="absolute top-[56px] right-6 z-50 text-[14px] text-[#8e8e93] active:text-[#636366]"
          style={{ fontWeight: 500 }}
        >
          Skip
        </motion.button>
      )}

      {/* Progress dots */}
      <div className="absolute top-[56px] left-0 right-0 flex justify-center gap-2 z-40">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className="h-[6px] rounded-full"
            animate={{
              width: i === currentStep ? 24 : 6,
              backgroundColor: i === currentStep ? '#34C759' : (
                i < currentStep ? '#34C759' : 'rgba(142,142,147,0.3)'
              ),
              opacity: i <= currentStep ? 1 : 0.5,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        ))}
      </div>

      {/* Main content area — swipeable */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="flex-1 flex flex-col items-center justify-center px-8 pt-[80px] touch-pan-y"
          style={{ x: dragX }}
        >
          {/* Illustration */}
          <div className="w-full max-w-[320px]">
            {step.illustration === 'welcome' && <WelcomeIllustration />}
            {step.illustration === 'home' && (
              <TabIllustration tabIcon={step.tabIcon} tabColor={step.tabColor!} features={step.features} />
            )}
            {step.illustration === 'library' && (
              <TabIllustration tabIcon={step.tabIcon} tabColor={step.tabColor!} features={step.features} />
            )}
            {step.illustration === 'builder' && (
              <TabIllustration tabIcon={step.tabIcon} tabColor={step.tabColor!} features={step.features} />
            )}
            {step.illustration === 'profile' && (
              <TabIllustration tabIcon={step.tabIcon} tabColor={step.tabColor!} features={step.features} />
            )}
            {step.illustration === 'ready' && <ReadyIllustration />}
          </div>

          {/* Tab badge */}
          {step.tabLabel && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 mt-2"
              style={{ backgroundColor: `${step.tabColor}14` }}
            >
              {step.tabIcon && (
                <step.tabIcon className="w-3.5 h-3.5" style={{ color: step.tabColor }} />
              )}
              <span className="text-[12px] tracking-[0.8px] uppercase" style={{ color: step.tabColor, fontWeight: 600 }}>
                {step.tabLabel} Tab
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center text-[28px] tracking-[-0.8px] text-[#1c1c1e] dark:text-white mb-2"
            style={{ fontWeight: 700 }}
          >
            {step.illustration === 'welcome'
              ? `Hey ${displayName} \u{1F44B}`
              : step.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-center text-[15px] text-[#8e8e93] leading-[1.55] max-w-[300px] mb-6"
          >
            {step.subtitle}
          </motion.p>

          {/* Feature list */}
          {step.features.length > 0 && (
            <div className="w-full max-w-[320px] flex flex-col gap-2.5">
              {step.features.map((f, i) => {
                const FIcon = f.icon;
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
                    className="flex items-center gap-3.5 bg-white dark:bg-[#1c1c1e] rounded-[16px] px-4 py-3.5"
                  >
                    <div
                      className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${f.color}12` }}
                    >
                      <FIcon className="w-[18px] h-[18px]" style={{ color: f.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-[#1c1c1e] dark:text-white" style={{ fontWeight: 600 }}>
                        {f.label}
                      </div>
                      <div className="text-[12px] text-[#8e8e93] leading-[1.4]">{f.desc}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom navigation */}
      <div
        className="flex-shrink-0 px-6 pb-10 pt-4"
        style={{ paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}
      >
        {isFirst ? (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            className="w-full py-4 rounded-[16px] text-[17px] bg-[#34C759] text-white flex items-center justify-center gap-2"
            style={{ fontWeight: 600, boxShadow: '0 8px 30px -4px rgba(52,199,89,0.35)' }}
          >
            Show Me Around
            <ArrowRight className="w-[18px] h-[18px]" />
          </motion.button>
        ) : isLast ? (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="w-full py-4 rounded-[16px] text-[17px] bg-[#34C759] text-white flex items-center justify-center gap-2"
            style={{ fontWeight: 600, boxShadow: '0 8px 30px -4px rgba(52,199,89,0.35)' }}
          >
            Start Training
            <Zap className="w-[18px] h-[18px]" />
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goPrev}
              className="px-5 py-4 rounded-[16px] text-[15px] text-[#8e8e93] bg-[rgba(229,229,234,0.5)] dark:bg-[rgba(58,58,60,0.5)]"
              style={{ fontWeight: 500 }}
            >
              Back
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              className="flex-1 py-4 rounded-[16px] text-[17px] bg-[#34C759] text-white flex items-center justify-center gap-2"
              style={{ fontWeight: 600, boxShadow: '0 8px 30px -4px rgba(52,199,89,0.35)' }}
            >
              Next
              <ChevronRight className="w-[18px] h-[18px]" />
            </motion.button>
          </div>
        )}

        {/* Swipe hint on first content page */}
        {currentStep === 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-[12px] text-[#8e8e93] mt-3"
          >
            Swipe left or right to navigate
          </motion.p>
        )}
      </div>
    </div>
  );
}