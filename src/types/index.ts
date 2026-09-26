export type Priority = 'Low' | 'Medium' | 'High';

export type TaskCategory = 'Study' | 'Gym' | 'College' | 'Personal' | 'Other';

export type RecurringType = 'None' | 'Daily' | 'Weekly';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  completed: boolean;
  priority: Priority;
  notes?: string;
  recurring?: RecurringType;
  createdAt: string;
}

export interface StudySubject {
  id: string;
  name: string;
  color: string;
}

export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // in minutes
  intensity: IntensityLevel; // 1: Very Low, 2: Low, 3: Moderate, 4: High, 5: Very High
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number; // sets * reps * weight
  detailedSets?: ExerciseSet[];
}

export type WorkoutType = 'Strength' | 'Hypertrophy' | 'Cardio' | 'Mobility' | 'Calisthenics';

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Legs' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Chest & Triceps'
  | 'Back & Biceps'
  | 'Legs & Core'
  | 'Full Body' 
  | 'Cardio & Core';

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  workoutType: WorkoutType;
  muscleGroup: MuscleGroup;
  exercises: Exercise[];
  startTime: string;
  finishTime: string;
  duration: number; // in minutes
  intensity: IntensityLevel; // 1: Very Easy to 5: Very Hard
  rpe: number; // 1-10
  totalVolume: number;
  totalSets: number;
  calories?: number;
  notes?: string;
  createdAt: string;
}

export interface QuickNote {
  id: string;
  date: string;
  text: string;
  category: 'Study' | 'Gym' | 'General';
  createdAt: string;
}

export interface ActiveTimer {
  type: 'study' | 'workout';
  subject?: string;
  topic?: string;
  workoutTitle?: string;
  workoutType?: WorkoutType;
  muscleGroup?: MuscleGroup;
  exercises?: Exercise[];
  startTimestamp: number;
  elapsedSeconds: number;
  isRunning: boolean;
  notes?: string;
  intensity?: IntensityLevel;
  rpe?: number;
}

export interface UserSettings {
  userName: string;
  theme: 'dark' | 'light';
  dailyStudyGoalHours: number;
  weeklyStudyGoalHours: number;
  weeklyWorkoutGoalDays: number;
  defaultWorkoutIntensity: IntensityLevel;
  defaultStudyIntensity: IntensityLevel;
  weightUnit: 'kg' | 'lbs';
  notificationsEnabled: boolean;
  soundChimeEnabled: boolean;
}

export interface DailyScoreResult {
  score: number;
  tasksScore: number;
  studyScore: number;
  gymScore: number;
  maxTasks: number;
  maxStudy: number;
  maxGym: number;
  tasksCount: { completed: number; total: number };
  studyMinutes: number;
  studyGoalMinutes: number;
  hasWorkout: boolean;
}

export interface StreakInfo {
  currentProductivityStreak: number;
  longestProductivityStreak: number;
  currentStudyStreak: number;
  longestStudyStreak: number;
  currentGymStreak: number;
  longestGymStreak: number;
}
