import {
  Task,
  StudySession,
  Workout,
  StudySubject,
  QuickNote,
  UserSettings,
  ActiveTimer
} from '../types';

const STORAGE_KEYS = {
  TASKS: 'lifetrack_tasks',
  STUDY_SESSIONS: 'lifetrack_study_sessions',
  WORKOUTS: 'lifetrack_workouts',
  SUBJECTS: 'lifetrack_subjects',
  NOTES: 'lifetrack_notes',
  SETTINGS: 'lifetrack_settings',
  ACTIVE_TIMER: 'lifetrack_active_timer',
};

export const DEFAULT_SUBJECTS: StudySubject[] = [
  { id: 'sub-1', name: 'DSA', color: '#3b82f6' },
  { id: 'sub-2', name: 'Java', color: '#f59e0b' },
  { id: 'sub-3', name: 'Python', color: '#10b981' },
  { id: 'sub-4', name: 'Software Engineering', color: '#8b5cf6' },
  { id: 'sub-5', name: 'Web Development', color: '#ec4899' },
  { id: 'sub-6', name: 'Database Systems', color: '#06b6d4' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Arsalan',
  theme: 'dark',
  dailyStudyGoalHours: 4,
  weeklyStudyGoalHours: 25,
  weeklyWorkoutGoalDays: 5,
  defaultWorkoutIntensity: 4,
  defaultStudyIntensity: 3,
  weightUnit: 'kg',
  notificationsEnabled: true,
  soundChimeEnabled: true,
};

// Formats a Date object to YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get offset date string relative to today
export function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

// Generate realistic seeded data for personal use
export function generateSeedData(): {
  tasks: Task[];
  studySessions: StudySession[];
  workouts: Workout[];
  subjects: StudySubject[];
  notes: QuickNote[];
  settings: UserSettings;
} {
  const today = formatDate(new Date());

  const tasks: Task[] = [
    // Today's schedule
    {
      id: 'task-today-1',
      title: 'Morning Routine & Hydration',
      category: 'Personal',
      date: today,
      startTime: '07:00',
      endTime: '07:30',
      completed: true,
      priority: 'Low',
      notes: 'Glass of warm water + 10 min stretch',
      recurring: 'Daily',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-today-2',
      title: 'Study DSA: Trees & Graph Traversal',
      category: 'Study',
      date: today,
      startTime: '08:00',
      endTime: '10:00',
      completed: true,
      priority: 'High',
      notes: 'Solved 3 LeetCode Medium problems on BFS/DFS',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-today-3',
      title: 'University / College Lectures',
      category: 'College',
      date: today,
      startTime: '10:30',
      endTime: '15:30',
      completed: true,
      priority: 'Medium',
      notes: 'Distributed Systems & Operating Systems lecture',
      recurring: 'Daily',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-today-4',
      title: 'Gym Workout: Chest & Triceps Hypertrophy',
      category: 'Gym',
      date: today,
      startTime: '17:00',
      endTime: '18:15',
      completed: true,
      priority: 'High',
      notes: 'Focused on pause reps at chest on heavy bench',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-today-5',
      title: 'Study Java: Spring Boot REST API & Security',
      category: 'Study',
      date: today,
      startTime: '19:15',
      endTime: '21:00',
      completed: false,
      priority: 'High',
      notes: 'JWT authentication implementation and role filters',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-today-6',
      title: 'Daily Review & Next Day Planning',
      category: 'Personal',
      date: today,
      startTime: '22:00',
      endTime: '22:30',
      completed: false,
      priority: 'Low',
      notes: 'Review solved questions and update streak log',
      recurring: 'Daily',
      createdAt: new Date().toISOString(),
    },

    // Yesterday's tasks
    {
      id: 'task-yest-1',
      title: 'Study Python: Asyncio & Concurrency',
      category: 'Study',
      date: getRelativeDate(-1),
      startTime: '08:00',
      endTime: '10:00',
      completed: true,
      priority: 'High',
      notes: 'Practiced event loop and task gathering',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-yest-2',
      title: 'Gym Workout: Back & Biceps Pull Day',
      category: 'Gym',
      date: getRelativeDate(-1),
      startTime: '17:00',
      endTime: '18:10',
      completed: true,
      priority: 'High',
      notes: 'Lat pulldowns and heavy barbell rows',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-yest-3',
      title: 'Software Engineering Assignment Review',
      category: 'College',
      date: getRelativeDate(-1),
      startTime: '19:00',
      endTime: '21:00',
      completed: true,
      priority: 'Medium',
      notes: 'UML diagrams and architectural design patterns',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },

    // 2 days ago
    {
      id: 'task-2d-1',
      title: 'Study Web Development: React 19 Server Actions',
      category: 'Study',
      date: getRelativeDate(-2),
      startTime: '08:30',
      endTime: '10:30',
      completed: true,
      priority: 'High',
      notes: 'Built a custom hook for optimistic UI updates',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2d-2',
      title: 'Gym Workout: Heavy Leg Day & Core',
      category: 'Gym',
      date: getRelativeDate(-2),
      startTime: '17:30',
      endTime: '18:45',
      completed: true,
      priority: 'High',
      notes: 'Squats 100kg 3x8 felt very smooth',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },

    // 3 days ago
    {
      id: 'task-3d-1',
      title: 'Study DSA: Dynamic Programming Knapsack',
      category: 'Study',
      date: getRelativeDate(-3),
      startTime: '09:00',
      endTime: '11:30',
      completed: true,
      priority: 'High',
      notes: '0/1 Knapsack memoization and tabulation matrix',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3d-2',
      title: 'Cardio & Mobility Session',
      category: 'Gym',
      date: getRelativeDate(-3),
      startTime: '17:00',
      endTime: '17:45',
      completed: true,
      priority: 'Medium',
      notes: 'Incline treadmill walk 30m + foam rolling',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },

    // 4 days ago
    {
      id: 'task-4d-1',
      title: 'Study Java: Multithreading & Executors',
      category: 'Study',
      date: getRelativeDate(-4),
      startTime: '08:00',
      endTime: '10:00',
      completed: true,
      priority: 'High',
      notes: 'ThreadPoolExecutor and CompletableFuture chaining',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4d-2',
      title: 'Gym Workout: Push Day (Shoulders & Chest Focus)',
      category: 'Gym',
      date: getRelativeDate(-4),
      startTime: '17:00',
      endTime: '18:15',
      completed: true,
      priority: 'High',
      notes: 'Overhead press PR: 55kg for 6 reps',
      recurring: 'None',
      createdAt: new Date().toISOString(),
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: 'study-today-1',
      subject: 'DSA',
      topic: 'Binary Search Trees & BFS/DFS Traversal',
      date: today,
      startTime: '08:00',
      endTime: '10:00',
      duration: 120,
      intensity: 4,
      notes: 'Practiced recursive vs iterative BFS. Need to revisit lowest common ancestor.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-yest-1',
      subject: 'Python',
      topic: 'Asyncio Coroutines and Task Gathering',
      date: getRelativeDate(-1),
      startTime: '08:00',
      endTime: '10:00',
      duration: 120,
      intensity: 3,
      notes: 'Built a lightweight async HTTP scraper demo using aiohttp.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-yest-2',
      subject: 'Software Engineering',
      topic: 'Clean Architecture & Dependency Injection',
      date: getRelativeDate(-1),
      startTime: '19:00',
      endTime: '21:00',
      duration: 120,
      intensity: 4,
      notes: 'Reviewed hexagonal architecture and test-driven development fundamentals.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-2d-1',
      subject: 'Web Development',
      topic: 'State Management & Performance Optimization',
      date: getRelativeDate(-2),
      startTime: '08:30',
      endTime: '10:30',
      duration: 120,
      intensity: 4,
      notes: 'Analyzed re-renders with React profiler and memoized selectors.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-3d-1',
      subject: 'DSA',
      topic: 'Dynamic Programming: 0/1 Knapsack Variants',
      date: getRelativeDate(-3),
      startTime: '09:00',
      endTime: '11:30',
      duration: 150,
      intensity: 5,
      notes: 'Deep dive into subset sum problem and partition equal subset sum.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-4d-1',
      subject: 'Java',
      topic: 'Executor Framework and CompletableFuture',
      date: getRelativeDate(-4),
      startTime: '08:00',
      endTime: '10:00',
      duration: 120,
      intensity: 4,
      notes: 'Implemented thread pool with custom rejection policy.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-5d-1',
      subject: 'DSA',
      topic: 'Graph Algorithms: Dijkstra & Prim MST',
      date: getRelativeDate(-5),
      startTime: '08:30',
      endTime: '11:00',
      duration: 150,
      intensity: 5,
      notes: 'Implemented priority queue based Dijkstra in Java.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'study-6d-1',
      subject: 'Database Systems',
      topic: 'B-Tree Indexing and Query Execution Plans',
      date: getRelativeDate(-6),
      startTime: '14:00',
      endTime: '16:00',
      duration: 120,
      intensity: 3,
      notes: 'Studied index selectivity, composite indexes, and EXPLAIN ANALYZE output.',
      completed: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const workouts: Workout[] = [
    {
      id: 'workout-today',
      date: today,
      title: 'Chest & Triceps Hypertrophy',
      workoutType: 'Strength',
      muscleGroup: 'Chest & Triceps',
      startTime: '17:00',
      finishTime: '18:15',
      duration: 75,
      intensity: 4,
      rpe: 8,
      totalVolume: 8450,
      totalSets: 14,
      calories: 420,
      notes: 'Felt very explosive on the flat bench press. Kept rest time strictly around 90s.',
      exercises: [
        {
          id: 'ex-1',
          name: 'Barbell Flat Bench Press',
          sets: 4,
          reps: 10,
          weight: 70,
          volume: 2800, // 4 * 10 * 70
        },
        {
          id: 'ex-2',
          name: 'Incline Dumbbell Press',
          sets: 4,
          reps: 10,
          weight: 26,
          volume: 2080, // (4 * 10 * 26 * 2 dumbbells = 2080kg)
        },
        {
          id: 'ex-3',
          name: 'Cable Chest Fly',
          sets: 3,
          reps: 12,
          weight: 25,
          volume: 900, // 3 * 12 * 25
        },
        {
          id: 'ex-4',
          name: 'Tricep Rope Pushdown',
          sets: 3,
          reps: 12,
          weight: 30,
          volume: 1080, // 3 * 12 * 30
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workout-yest',
      date: getRelativeDate(-1),
      title: 'Back & Biceps Heavy Pull',
      workoutType: 'Strength',
      muscleGroup: 'Back & Biceps',
      startTime: '17:00',
      finishTime: '18:10',
      duration: 70,
      intensity: 4,
      rpe: 8,
      totalVolume: 7920,
      totalSets: 13,
      calories: 395,
      notes: 'Strong mind-muscle connection on chest supported T-bar rows.',
      exercises: [
        {
          id: 'ex-y1',
          name: 'Barbell Bent Over Row',
          sets: 4,
          reps: 10,
          weight: 65,
          volume: 2600,
        },
        {
          id: 'ex-y2',
          name: 'Wide-Grip Lat Pulldown',
          sets: 3,
          reps: 10,
          weight: 60,
          volume: 1800,
        },
        {
          id: 'ex-y3',
          name: 'Seated Cable Row',
          sets: 3,
          reps: 12,
          weight: 55,
          volume: 1980,
        },
        {
          id: 'ex-y4',
          name: 'Incline Dumbbell Bicep Curl',
          sets: 3,
          reps: 10,
          weight: 14,
          volume: 840,
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workout-2d',
      date: getRelativeDate(-2),
      title: 'Leg Day & Core Foundation',
      workoutType: 'Strength',
      muscleGroup: 'Legs & Core',
      startTime: '17:30',
      finishTime: '18:45',
      duration: 75,
      intensity: 5,
      rpe: 9,
      totalVolume: 10400,
      totalSets: 15,
      calories: 490,
      notes: 'Hit 100kg for 3 sets of 8 reps on barbell squats without knee wrap discomfort.',
      exercises: [
        {
          id: 'ex-2d1',
          name: 'Barbell Back Squat',
          sets: 4,
          reps: 8,
          weight: 100,
          volume: 3200,
        },
        {
          id: 'ex-2d2',
          name: 'Leg Press (45 Degree)',
          sets: 4,
          reps: 12,
          weight: 140,
          volume: 6720,
        },
        {
          id: 'ex-2d3',
          name: 'Hamstring Lying Leg Curl',
          sets: 3,
          reps: 12,
          weight: 45,
          volume: 1620,
        },
        {
          id: 'ex-2d4',
          name: 'Standing Calf Raise',
          sets: 4,
          reps: 15,
          weight: 60,
          volume: 3600,
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workout-4d',
      date: getRelativeDate(-4),
      title: 'Shoulders & Arms Hypertrophy',
      workoutType: 'Strength',
      muscleGroup: 'Shoulders',
      startTime: '17:00',
      finishTime: '18:15',
      duration: 75,
      intensity: 4,
      rpe: 8,
      totalVolume: 6750,
      totalSets: 15,
      calories: 410,
      notes: 'New PR on dumbbell lateral raises with strict form (12kg for 12 reps).',
      exercises: [
        {
          id: 'ex-4d1',
          name: 'Overhead Barbell Military Press',
          sets: 4,
          reps: 8,
          weight: 50,
          volume: 1600,
        },
        {
          id: 'ex-4d2',
          name: 'Dumbbell Lateral Raise',
          sets: 4,
          reps: 12,
          weight: 12,
          volume: 1152,
        },
        {
          id: 'ex-4d3',
          name: 'Face Pulls with Rope',
          sets: 4,
          reps: 15,
          weight: 25,
          volume: 1500,
        },
        {
          id: 'ex-4d4',
          name: 'Barbell Bicep Curl',
          sets: 3,
          reps: 10,
          weight: 30,
          volume: 900,
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workout-6d',
      date: getRelativeDate(-6),
      title: 'Full Body Power & Core',
      workoutType: 'Strength',
      muscleGroup: 'Full Body',
      startTime: '16:45',
      finishTime: '18:00',
      duration: 75,
      intensity: 4,
      rpe: 8,
      totalVolume: 7800,
      totalSets: 14,
      calories: 430,
      notes: 'Conventional deadlifts feeling crisp. Focused on bracing and hip hinge.',
      exercises: [
        {
          id: 'ex-6d1',
          name: 'Conventional Barbell Deadlift',
          sets: 3,
          reps: 6,
          weight: 120,
          volume: 2160,
        },
        {
          id: 'ex-6d2',
          name: 'Incline Dumbbell Press',
          sets: 4,
          reps: 10,
          weight: 24,
          volume: 1920,
        },
        {
          id: 'ex-6d3',
          name: 'Weighted Pull-Ups',
          sets: 3,
          reps: 8,
          weight: 85, // bodyweight + added
          volume: 2040,
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const notes: QuickNote[] = [
    {
      id: 'note-1',
      date: today,
      text: 'Today DSA was productive: BFS queue logic clicked. Keep reviewing recursion base cases.',
      category: 'Study',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'note-2',
      date: today,
      text: 'Increase bench press weight next week to 72.5kg. Form felt solid on the 10-rep sets.',
      category: 'Gym',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'note-3',
      date: getRelativeDate(-1),
      text: 'Need to prep 1 hour earlier on Tuesdays to avoid afternoon fatigue before evening workouts.',
      category: 'General',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    tasks,
    studySessions,
    workouts,
    subjects: DEFAULT_SUBJECTS,
    notes,
    settings: DEFAULT_SETTINGS,
  };
}

// Storage Manager
export const StorageManager = {
  init(): void {
    if (typeof window === 'undefined') return;
    const existingTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!existingTasks) {
      const seed = generateSeedData();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seed.tasks));
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(seed.studySessions));
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(seed.workouts));
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(seed.subjects));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(seed.notes));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(seed.settings));
    }
  },

  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks', err);
    }
  },

  getStudySessions(): StudySession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudySessions(sessions: StudySession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
    } catch (err) {
      console.error('Failed to save study sessions', err);
    }
  },

  getWorkouts(): Workout[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWorkouts(workouts: Workout[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (err) {
      console.error('Failed to save workouts', err);
    }
  },

  getSubjects(): StudySubject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return data ? JSON.parse(data) : DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  },

  saveSubjects(subjects: StudySubject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (err) {
      console.error('Failed to save subjects', err);
    }
  },

  getNotes(): QuickNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveNotes(notes: QuickNote[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (err) {
      console.error('Failed to save notes', err);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  },

  getActiveTimer(): ActiveTimer | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveTimer(timer: ActiveTimer | null): void {
    try {
      if (timer === null) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(timer));
      }
    } catch (err) {
      console.error('Failed to save active timer', err);
    }
  },

  exportAllData(): string {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      studySessions: this.getStudySessions(),
      workouts: this.getWorkouts(),
      subjects: this.getSubjects(),
      notes: this.getNotes(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data && typeof data === 'object') {
        if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
        if (Array.isArray(data.studySessions)) this.saveStudySessions(data.studySessions);
        if (Array.isArray(data.workouts)) this.saveWorkouts(data.workouts);
        if (Array.isArray(data.subjects)) this.saveSubjects(data.subjects);
        if (Array.isArray(data.notes)) this.saveNotes(data.notes);
        if (data.settings && typeof data.settings === 'object') this.saveSettings(data.settings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  },

  resetToDefaultSeed(): void {
    const seed = generateSeedData();
    this.saveTasks(seed.tasks);
    this.saveStudySessions(seed.studySessions);
    this.saveWorkouts(seed.workouts);
    this.saveSubjects(seed.subjects);
    this.saveNotes(seed.notes);
    this.saveSettings(seed.settings);
    this.saveActiveTimer(null);
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.STUDY_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  }
};
