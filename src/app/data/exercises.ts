export type Category = 'gym' | 'calisthenics' | 'animalflow';

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  muscleGroups: string[];
  description?: string;
  defaultSets?: number;
  defaultReps?: number;
  isCustom?: boolean;
  isTimeBased?: boolean;
  /** Effort level 1–5 (1 = beginner-friendly, 5 = elite) */
  effort?: number;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  mechanic?: 'compound' | 'isolation';
  instructions?: string[];
  demoFrames?: string[];
  gifUrl?: string;
  videoUrl?: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  gym: '#0647F9',
  calisthenics: '#FF6B00',
  animalflow: '#2D6A4F',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  gym: 'Gym',
  calisthenics: 'Cali',
  animalflow: 'Flow',
};

// Full labels for places where we want the complete name
export const CATEGORY_LABELS_FULL: Record<Category, string> = {
  gym: 'Gym',
  calisthenics: 'Calisthenics',
  animalflow: 'Animal Flow',
};

export const CATEGORY_BG: Record<Category, string> = {
  gym: 'bg-[#0647F9]',
  calisthenics: 'bg-[#FF6B00]',
  animalflow: 'bg-[#2D6A4F]',
};

export const CATEGORY_BG_LIGHT: Record<Category, string> = {
  gym: 'bg-[rgba(6,71,249,0.1)]',
  calisthenics: 'bg-[rgba(255,107,0,0.1)]',
  animalflow: 'bg-[rgba(45,106,79,0.1)]',
};

export const CATEGORY_TEXT: Record<Category, string> = {
  gym: 'text-[#0647F9]',
  calisthenics: 'text-[#FF6B00]',
  animalflow: 'text-[#2D6A4F]',
};

export const CATEGORY_BORDER: Record<Category, string> = {
  gym: 'border-[rgba(6,71,249,0.2)]',
  calisthenics: 'border-[rgba(255,107,0,0.2)]',
  animalflow: 'border-[rgba(45,106,79,0.2)]',
};

// Common muscle groups for the exercise creation form
export const COMMON_MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core',
  'Hip Flexors', 'Spine', 'Full Body', 'Legs',
];

/** The hardcoded built-in exercises — used as seed data for the KV catalog */
export const BUILT_IN_EXERCISES: Exercise[] = [
  // ═══════════════════════════════════════
  // GYM (g1–g60)
  // ═══════════════════════════════════════
  // — Chest —
  { id: 'g1', name: 'Barbell Bench Press', category: 'gym', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], description: 'Compound chest press on flat bench', defaultSets: 4, defaultReps: 8, effort: 3 },
  { id: 'g14', name: 'Incline Dumbbell Press', category: 'gym', muscleGroups: ['Chest', 'Shoulders'], description: 'Incline bench dumbbell press', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g10', name: 'Cable Fly', category: 'gym', muscleGroups: ['Chest'], description: 'Cable chest fly', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g16', name: 'Decline Bench Press', category: 'gym', muscleGroups: ['Chest', 'Triceps'], description: 'Barbell press on decline bench', defaultSets: 4, defaultReps: 8, effort: 3 },
  { id: 'g17', name: 'Dumbbell Fly', category: 'gym', muscleGroups: ['Chest'], description: 'Flat bench dumbbell fly', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g18', name: 'Machine Chest Press', category: 'gym', muscleGroups: ['Chest', 'Triceps'], description: 'Seated machine chest press', defaultSets: 3, defaultReps: 10, effort: 1 },
  { id: 'g19', name: 'Dumbbell Pullover', category: 'gym', muscleGroups: ['Chest', 'Back'], description: 'Dumbbell pullover across bench', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'g20', name: 'Close-Grip Bench Press', category: 'gym', muscleGroups: ['Triceps', 'Chest'], description: 'Narrow grip barbell bench press', defaultSets: 3, defaultReps: 10, effort: 2 },

  // — Back —
  { id: 'g3', name: 'Deadlift', category: 'gym', muscleGroups: ['Back', 'Hamstrings', 'Glutes'], description: 'Conventional deadlift from floor', defaultSets: 4, defaultReps: 6, effort: 4 },
  { id: 'g5', name: 'Barbell Row', category: 'gym', muscleGroups: ['Back', 'Biceps'], description: 'Bent-over barbell row', defaultSets: 4, defaultReps: 8, effort: 3 },
  { id: 'g8', name: 'Lat Pulldown', category: 'gym', muscleGroups: ['Back', 'Biceps'], description: 'Wide-grip cable lat pulldown', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g21', name: 'Seated Cable Row', category: 'gym', muscleGroups: ['Back', 'Biceps'], description: 'Close-grip seated cable row', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g22', name: 'T-Bar Row', category: 'gym', muscleGroups: ['Back', 'Biceps'], description: 'T-bar row with chest support', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'g23', name: 'Single-Arm Dumbbell Row', category: 'gym', muscleGroups: ['Back', 'Biceps'], description: 'One-arm row on bench', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g24', name: 'Pendlay Row', category: 'gym', muscleGroups: ['Back', 'Core'], description: 'Explosive barbell row from floor', defaultSets: 4, defaultReps: 6, effort: 3 },
  { id: 'g25', name: 'Rack Pull', category: 'gym', muscleGroups: ['Back', 'Glutes'], description: 'Partial deadlift from rack', defaultSets: 4, defaultReps: 6, effort: 3 },
  { id: 'g26', name: 'Straight-Arm Pulldown', category: 'gym', muscleGroups: ['Back'], description: 'Cable pulldown with straight arms', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g27', name: 'Chest-Supported Row', category: 'gym', muscleGroups: ['Back', 'Biceps'], description: 'Incline bench dumbbell row', defaultSets: 3, defaultReps: 10, effort: 2 },

  // — Shoulders —
  { id: 'g4', name: 'Overhead Press', category: 'gym', muscleGroups: ['Shoulders', 'Triceps'], description: 'Standing barbell shoulder press', defaultSets: 4, defaultReps: 8, effort: 3 },
  { id: 'g12', name: 'Lateral Raise', category: 'gym', muscleGroups: ['Shoulders'], description: 'Dumbbell lateral raise', defaultSets: 3, defaultReps: 15, effort: 1 },
  { id: 'g13', name: 'Face Pull', category: 'gym', muscleGroups: ['Shoulders', 'Back'], description: 'Cable face pull for rear delts', defaultSets: 3, defaultReps: 15, effort: 1 },
  { id: 'g28', name: 'Dumbbell Shoulder Press', category: 'gym', muscleGroups: ['Shoulders', 'Triceps'], description: 'Seated dumbbell shoulder press', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g29', name: 'Arnold Press', category: 'gym', muscleGroups: ['Shoulders'], description: 'Rotational dumbbell press', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g30', name: 'Rear Delt Fly', category: 'gym', muscleGroups: ['Shoulders'], description: 'Bent-over reverse fly', defaultSets: 3, defaultReps: 15, effort: 1 },
  { id: 'g31', name: 'Upright Row', category: 'gym', muscleGroups: ['Shoulders', 'Triceps'], description: 'Barbell or dumbbell upright row', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'g32', name: 'Cable Lateral Raise', category: 'gym', muscleGroups: ['Shoulders'], description: 'Single-arm cable lateral raise', defaultSets: 3, defaultReps: 15, effort: 1 },
  { id: 'g33', name: 'Front Raise', category: 'gym', muscleGroups: ['Shoulders'], description: 'Dumbbell front raise', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g34', name: 'Landmine Press', category: 'gym', muscleGroups: ['Shoulders', 'Chest'], description: 'Single-arm landmine overhead press', defaultSets: 3, defaultReps: 10, effort: 2 },

  // — Arms —
  { id: 'g6', name: 'Dumbbell Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Standing dumbbell bicep curl', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g7', name: 'Tricep Pushdown', category: 'gym', muscleGroups: ['Triceps'], description: 'Cable tricep pushdown', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g35', name: 'Barbell Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Standing barbell curl', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g36', name: 'Hammer Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Neutral-grip dumbbell curl', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g37', name: 'Preacher Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Preacher bench EZ-bar curl', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g38', name: 'Incline Dumbbell Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Seated incline curl for long head', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g39', name: 'Concentration Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Seated single-arm concentration curl', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g40', name: 'Skull Crusher', category: 'gym', muscleGroups: ['Triceps'], description: 'Lying EZ-bar tricep extension', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g41', name: 'Overhead Tricep Extension', category: 'gym', muscleGroups: ['Triceps'], description: 'Dumbbell overhead tricep extension', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'g42', name: 'Cable Overhead Extension', category: 'gym', muscleGroups: ['Triceps'], description: 'Rope cable overhead extension', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g43', name: 'Wrist Curl', category: 'gym', muscleGroups: ['Biceps'], description: 'Barbell wrist curl for forearms', defaultSets: 3, defaultReps: 15, effort: 1 },

  // — Legs —
  { id: 'g2', name: 'Barbell Squat', category: 'gym', muscleGroups: ['Quads', 'Glutes', 'Core'], description: 'Back squat with barbell', defaultSets: 4, defaultReps: 8, effort: 4 },
  { id: 'g9', name: 'Leg Press', category: 'gym', muscleGroups: ['Quads', 'Glutes'], description: 'Machine leg press', defaultSets: 4, defaultReps: 10, effort: 2 },
  { id: 'g11', name: 'Romanian Deadlift', category: 'gym', muscleGroups: ['Hamstrings', 'Glutes'], description: 'Stiff-legged barbell RDL', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'g15', name: 'Calf Raise', category: 'gym', muscleGroups: ['Calves'], description: 'Standing or seated calf raise', defaultSets: 4, defaultReps: 15, effort: 1 },
  { id: 'g44', name: 'Front Squat', category: 'gym', muscleGroups: ['Quads', 'Core'], description: 'Barbell front squat', defaultSets: 4, defaultReps: 8, effort: 4 },
  { id: 'g45', name: 'Bulgarian Split Squat', category: 'gym', muscleGroups: ['Quads', 'Glutes'], description: 'Rear-foot elevated split squat', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'g46', name: 'Leg Extension', category: 'gym', muscleGroups: ['Quads'], description: 'Machine leg extension', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g47', name: 'Leg Curl', category: 'gym', muscleGroups: ['Hamstrings'], description: 'Lying or seated leg curl', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g48', name: 'Hip Thrust', category: 'gym', muscleGroups: ['Glutes', 'Hamstrings'], description: 'Barbell hip thrust on bench', defaultSets: 4, defaultReps: 10, effort: 3 },
  { id: 'g49', name: 'Hack Squat', category: 'gym', muscleGroups: ['Quads', 'Glutes'], description: 'Machine hack squat', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'g50', name: 'Goblet Squat', category: 'gym', muscleGroups: ['Quads', 'Glutes', 'Core'], description: 'Dumbbell or kettlebell goblet squat', defaultSets: 3, defaultReps: 12, effort: 1 },
  { id: 'g51', name: 'Sumo Deadlift', category: 'gym', muscleGroups: ['Glutes', 'Hamstrings', 'Quads'], description: 'Wide-stance sumo deadlift', defaultSets: 4, defaultReps: 6, effort: 4 },
  { id: 'g52', name: 'Walking Lunge', category: 'gym', muscleGroups: ['Quads', 'Glutes'], description: 'Dumbbell walking lunges', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'g53', name: 'Good Morning', category: 'gym', muscleGroups: ['Hamstrings', 'Back'], description: 'Barbell good morning', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'g54', name: 'Seated Calf Raise', category: 'gym', muscleGroups: ['Calves'], description: 'Seated calf raise for soleus', defaultSets: 4, defaultReps: 15, effort: 1 },

  // — Core & compound —
  { id: 'g55', name: 'Cable Crunch', category: 'gym', muscleGroups: ['Core'], description: 'Kneeling cable crunch', defaultSets: 3, defaultReps: 15, effort: 1 },
  { id: 'g56', name: 'Ab Rollout', category: 'gym', muscleGroups: ['Core'], description: 'Ab wheel rollout', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'g57', name: 'Hanging Leg Raise', category: 'gym', muscleGroups: ['Core', 'Hip Flexors'], description: 'Hanging straight-leg raise', defaultSets: 3, defaultReps: 12, effort: 3 },
  { id: 'g58', name: 'Farmer Walk', category: 'gym', muscleGroups: ['Full Body', 'Core'], description: 'Heavy dumbbell carry for distance', defaultSets: 3, defaultReps: 1, isTimeBased: true, effort: 2 },
  { id: 'g59', name: 'Kettlebell Swing', category: 'gym', muscleGroups: ['Glutes', 'Hamstrings', 'Core'], description: 'Russian kettlebell swing', defaultSets: 3, defaultReps: 15, effort: 2 },
  { id: 'g60', name: 'Power Clean', category: 'gym', muscleGroups: ['Full Body'], description: 'Olympic barbell power clean', defaultSets: 4, defaultReps: 5, effort: 5 },

  // ═══════════════════════════════════════
  // CALISTHENICS (c1–c40)
  // ═══════════════════════════════════════
  // — Push —
  { id: 'c1', name: 'Push-Up', category: 'calisthenics', muscleGroups: ['Chest', 'Triceps', 'Core'], description: 'Standard push-up', defaultSets: 4, defaultReps: 15, effort: 1 },
  { id: 'c3', name: 'Dip', category: 'calisthenics', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], description: 'Parallel bar dip', defaultSets: 4, defaultReps: 10, effort: 2 },
  { id: 'c7', name: 'Handstand Push-Up', category: 'calisthenics', muscleGroups: ['Shoulders', 'Triceps'], description: 'Wall-assisted HSPU', defaultSets: 3, defaultReps: 6, effort: 5 },
  { id: 'c9', name: 'Planche Lean', category: 'calisthenics', muscleGroups: ['Shoulders', 'Core', 'Chest'], description: 'Planche progression hold', defaultSets: 3, defaultReps: 10, isTimeBased: true, effort: 5 },
  { id: 'c13', name: 'Diamond Push-Up', category: 'calisthenics', muscleGroups: ['Triceps', 'Chest'], description: 'Narrow hand position push-up', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'c14', name: 'Pike Push-Up', category: 'calisthenics', muscleGroups: ['Shoulders', 'Triceps'], description: 'Elevated hips push-up for shoulders', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'c15', name: 'Archer Push-Up', category: 'calisthenics', muscleGroups: ['Chest', 'Triceps'], description: 'Wide unilateral push-up', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'c16', name: 'Pseudo Planche Push-Up', category: 'calisthenics', muscleGroups: ['Shoulders', 'Chest', 'Core'], description: 'Push-up with hands turned back', defaultSets: 3, defaultReps: 8, effort: 4 },
  { id: 'c17', name: 'Ring Dip', category: 'calisthenics', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], description: 'Gymnastics ring dip', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'c18', name: 'Tiger Bend Push-Up', category: 'calisthenics', muscleGroups: ['Triceps', 'Shoulders'], description: 'Forearm to push-up transition', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'c19', name: 'One-Arm Push-Up', category: 'calisthenics', muscleGroups: ['Chest', 'Triceps', 'Core'], description: 'Single-arm push-up', defaultSets: 3, defaultReps: 5, effort: 5 },
  { id: 'c20', name: 'Clapping Push-Up', category: 'calisthenics', muscleGroups: ['Chest', 'Triceps'], description: 'Explosive plyometric push-up', defaultSets: 3, defaultReps: 8, effort: 3 },

  // — Pull —
  { id: 'c2', name: 'Pull-Up', category: 'calisthenics', muscleGroups: ['Back', 'Biceps'], description: 'Overhand pull-up', defaultSets: 4, defaultReps: 8, effort: 3 },
  { id: 'c5', name: 'Muscle-Up', category: 'calisthenics', muscleGroups: ['Back', 'Chest', 'Triceps'], description: 'Bar muscle-up transition', defaultSets: 3, defaultReps: 5, effort: 5 },
  { id: 'c8', name: 'Chin-Up', category: 'calisthenics', muscleGroups: ['Back', 'Biceps'], description: 'Underhand grip pull-up', defaultSets: 4, defaultReps: 8, effort: 2 },
  { id: 'c21', name: 'Wide-Grip Pull-Up', category: 'calisthenics', muscleGroups: ['Back'], description: 'Extra-wide overhand pull-up', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'c22', name: 'Commando Pull-Up', category: 'calisthenics', muscleGroups: ['Back', 'Biceps', 'Core'], description: 'Alternating side pull-up', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'c23', name: 'Typewriter Pull-Up', category: 'calisthenics', muscleGroups: ['Back', 'Biceps'], description: 'Horizontal shifting pull-up', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'c24', name: 'Archer Pull-Up', category: 'calisthenics', muscleGroups: ['Back', 'Biceps'], description: 'Unilateral wide pull-up', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'c25', name: 'Ring Muscle-Up', category: 'calisthenics', muscleGroups: ['Back', 'Chest', 'Triceps'], description: 'Muscle-up on gymnastics rings', defaultSets: 3, defaultReps: 4, effort: 5 },
  { id: 'c26', name: 'Front Lever Hold', category: 'calisthenics', muscleGroups: ['Back', 'Core'], description: 'Horizontal hold on bar', defaultSets: 3, defaultReps: 15, isTimeBased: true, effort: 5 },
  { id: 'c27', name: 'Back Lever Hold', category: 'calisthenics', muscleGroups: ['Shoulders', 'Back', 'Core'], description: 'Inverted horizontal hold', defaultSets: 3, defaultReps: 15, isTimeBased: true, effort: 5 },
  { id: 'c28', name: 'Australian Pull-Up', category: 'calisthenics', muscleGroups: ['Back', 'Biceps'], description: 'Inverted bodyweight row', defaultSets: 3, defaultReps: 12, effort: 1 },

  // — Legs & Core —
  { id: 'c4', name: 'Pistol Squat', category: 'calisthenics', muscleGroups: ['Quads', 'Glutes', 'Core'], description: 'Single-leg squat', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'c6', name: 'L-Sit', category: 'calisthenics', muscleGroups: ['Core', 'Hip Flexors'], description: 'Isometric hold on parallettes', defaultSets: 3, defaultReps: 15, isTimeBased: true, effort: 4 },
  { id: 'c10', name: 'Dragon Flag', category: 'calisthenics', muscleGroups: ['Core'], description: 'Advanced core exercise', defaultSets: 3, defaultReps: 8, effort: 5 },
  { id: 'c11', name: 'Bodyweight Squat', category: 'calisthenics', muscleGroups: ['Quads', 'Glutes'], description: 'Deep bodyweight squat', defaultSets: 3, defaultReps: 20, effort: 1 },
  { id: 'c12', name: 'Burpee', category: 'calisthenics', muscleGroups: ['Full Body'], description: 'Full burpee with jump', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'c29', name: 'Shrimp Squat', category: 'calisthenics', muscleGroups: ['Quads', 'Glutes'], description: 'Rear-leg-grab single-leg squat', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'c30', name: 'Nordic Curl', category: 'calisthenics', muscleGroups: ['Hamstrings'], description: 'Eccentric bodyweight hamstring curl', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'c31', name: 'V-Sit', category: 'calisthenics', muscleGroups: ['Core', 'Hip Flexors'], description: 'Elevated V-shaped hold', defaultSets: 3, defaultReps: 15, isTimeBased: true, effort: 5 },
  { id: 'c32', name: 'Hollow Body Hold', category: 'calisthenics', muscleGroups: ['Core'], description: 'Gymnastics core hold', defaultSets: 3, defaultReps: 30, isTimeBased: true, effort: 2 },
  { id: 'c33', name: 'Toes to Bar', category: 'calisthenics', muscleGroups: ['Core', 'Hip Flexors'], description: 'Hanging toe touch to bar', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'c34', name: 'Windshield Wiper', category: 'calisthenics', muscleGroups: ['Core'], description: 'Hanging or lying rotational core', defaultSets: 3, defaultReps: 8, effort: 4 },
  { id: 'c35', name: 'Handstand Hold', category: 'calisthenics', muscleGroups: ['Shoulders', 'Core'], description: 'Freestanding or wall handstand', defaultSets: 3, defaultReps: 30, isTimeBased: true, effort: 3 },
  { id: 'c36', name: 'Plank', category: 'calisthenics', muscleGroups: ['Core'], description: 'Standard front plank hold', defaultSets: 3, defaultReps: 60, isTimeBased: true, effort: 1 },
  { id: 'c37', name: 'Side Plank', category: 'calisthenics', muscleGroups: ['Core'], description: 'Lateral isometric hold', defaultSets: 3, defaultReps: 30, isTimeBased: true, effort: 1 },
  { id: 'c38', name: 'Box Jump', category: 'calisthenics', muscleGroups: ['Quads', 'Glutes'], description: 'Explosive jump onto box', defaultSets: 3, defaultReps: 8, effort: 2 },
  { id: 'c39', name: 'Jump Squat', category: 'calisthenics', muscleGroups: ['Quads', 'Glutes'], description: 'Plyometric bodyweight squat', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'c40', name: 'Skin the Cat', category: 'calisthenics', muscleGroups: ['Shoulders', 'Back', 'Core'], description: 'Full rotation hang on rings or bar', defaultSets: 3, defaultReps: 6, effort: 4 },

  // ═══════════════════════════════════════
  // ANIMAL FLOW (a1–a30)
  // ═══════════════════════════════════════
  { id: 'a1', name: 'Beast Reach', category: 'animalflow', muscleGroups: ['Shoulders', 'Core'], description: 'Loaded beast to forward reach', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a2', name: 'Crab Reach', category: 'animalflow', muscleGroups: ['Shoulders', 'Core', 'Hip Flexors'], description: 'Tabletop to sky reach', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a3', name: 'Scorpion Reach', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'], description: 'Rotational ground flow', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'a4', name: 'Ape Reach', category: 'animalflow', muscleGroups: ['Core', 'Legs', 'Shoulders'], description: 'Deep squat lateral movement', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a5', name: 'Wave Unload', category: 'animalflow', muscleGroups: ['Spine', 'Core'], description: 'Spinal wave from beast position', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'a6', name: 'Side Kickthrough', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'], description: 'Lateral kick from beast', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'a7', name: 'Front Kickthrough', category: 'animalflow', muscleGroups: ['Core', 'Shoulders'], description: 'Front kick from beast position', defaultSets: 3, defaultReps: 12, effort: 2 },
  { id: 'a8', name: 'Loaded Beast', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Quads'], description: 'Static beast hold with knees hovering', defaultSets: 3, defaultReps: 15, isTimeBased: true, effort: 1 },
  { id: 'a9', name: 'Underswitch', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'], description: 'Transition from beast to crab', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'a10', name: 'Full Scorpion', category: 'animalflow', muscleGroups: ['Core', 'Spine', 'Shoulders'], description: 'Complete scorpion rotation flow', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'a11', name: 'Beast Wave', category: 'animalflow', muscleGroups: ['Core', 'Spine', 'Shoulders'], description: 'Forward-backward spinal wave in beast', defaultSets: 3, defaultReps: 8, effort: 2 },
  { id: 'a12', name: 'Lateral Ape', category: 'animalflow', muscleGroups: ['Core', 'Legs', 'Shoulders'], description: 'Side-to-side ape traveling', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a13', name: 'Forward Traveling Beast', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Quads'], description: 'Crawling beast pattern forward', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a14', name: 'Lateral Traveling Beast', category: 'animalflow', muscleGroups: ['Core', 'Shoulders'], description: 'Side crawling in beast position', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a15', name: 'Crab Walk', category: 'animalflow', muscleGroups: ['Shoulders', 'Core', 'Glutes'], description: 'Traveling in tabletop position', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a16', name: 'Switchback', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'], description: 'Quick beast-to-crab switch', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'a17', name: 'Flying Underswitch', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'], description: 'Airborne beast-to-crab transition', defaultSets: 3, defaultReps: 6, effort: 5 },
  { id: 'a18', name: 'Crocodile Walk', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Chest'], description: 'Low crawl with push-up motion', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'a19', name: 'Loaded Beast to Crab', category: 'animalflow', muscleGroups: ['Full Body'], description: 'Flow from beast to crab reach', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'a20', name: 'Static Beast Hold', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Quads'], description: 'Isometric knees-off-ground hold', defaultSets: 3, defaultReps: 30, isTimeBased: true, effort: 2 },
  { id: 'a21', name: 'Traveling Ape', category: 'animalflow', muscleGroups: ['Legs', 'Core', 'Shoulders'], description: 'Deep squat hop traveling pattern', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'a22', name: 'Scorpion Switch', category: 'animalflow', muscleGroups: ['Core', 'Hip Flexors', 'Shoulders'], description: 'Alternating scorpion reaches', defaultSets: 3, defaultReps: 8, effort: 3 },
  { id: 'a23', name: 'Beast to Side Kick', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Hip Flexors'], description: 'Beast position to lateral kick combo', defaultSets: 3, defaultReps: 10, effort: 2 },
  { id: 'a24', name: 'Flow Combo 1', category: 'animalflow', muscleGroups: ['Full Body'], description: 'Beast → underswitch → crab reach → scorpion', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'a25', name: 'Flow Combo 2', category: 'animalflow', muscleGroups: ['Full Body'], description: 'Ape → beast wave → side kick → crab walk', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'a26', name: 'Monkey Spin', category: 'animalflow', muscleGroups: ['Core', 'Shoulders'], description: '360° rotation from beast position', defaultSets: 3, defaultReps: 6, effort: 4 },
  { id: 'a27', name: 'Frog Jump', category: 'animalflow', muscleGroups: ['Legs', 'Core'], description: 'Deep squat explosive forward jump', defaultSets: 3, defaultReps: 8, effort: 2 },
  { id: 'a28', name: 'Reverse Traveling Beast', category: 'animalflow', muscleGroups: ['Core', 'Shoulders', 'Quads'], description: 'Backward crawling beast pattern', defaultSets: 3, defaultReps: 10, effort: 3 },
  { id: 'a29', name: 'Hip Wave', category: 'animalflow', muscleGroups: ['Hip Flexors', 'Spine', 'Core'], description: 'Circular hip mobility wave', defaultSets: 3, defaultReps: 8, effort: 2 },
  { id: 'a30', name: 'Beast to Crab Flow', category: 'animalflow', muscleGroups: ['Full Body'], description: 'Continuous beast-crab transition flow', defaultSets: 3, defaultReps: 8, effort: 3 },
];

// Keep the old export name as an alias so nothing breaks
export const exercises = BUILT_IN_EXERCISES;

// ── Custom exercise helpers ──

const CUSTOM_EXERCISES_KEY = 'forma_custom_exercises';

/** Read custom exercises from localStorage */
export function getCustomExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Return all exercises: built-in + user custom */
export function getAllExercises(): Exercise[] {
  return [...exercises, ...getCustomExercises()];
}

export function getExerciseById(id: string): Exercise | undefined {
  return getAllExercises().find(e => e.id === id);
}

export function getExercisesByCategory(category: Category): Exercise[] {
  return getAllExercises().filter(e => e.category === category);
}

export function getAllMuscleGroups(): string[] {
  const groups = new Set<string>();
  getAllExercises().forEach(e => e.muscleGroups.forEach(g => groups.add(g)));
  return Array.from(groups).sort();
}