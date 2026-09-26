/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  StudySession,
  Workout,
  StudySubject,
  QuickNote,
  UserSettings,
  ActiveTimer,
  Exercise,
  IntensityLevel,
  MuscleGroup,
  WorkoutType,
  Priority,
  TaskCategory
} from './types';
import { StorageManager, formatDate } from './utils/storage';
import { calculateDailyScore, calculateStreaks } from './utils/score';
import { soundEffects } from './utils/audio';
import { Navbar, NavTab } from './components/layout/Navbar';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Modal } from './components/common/Modal';
import { RestTimerWidget } from './components/common/RestTimerWidget';
import { ActiveSessionModal } from './components/common/ActiveSessionModal';

// Views
import { DashboardView } from './pages/DashboardView';
import { DailyPlanView } from './pages/DailyPlanView';
import { StudyView } from './pages/StudyView';
import { GymView } from './pages/GymView';
import { ProgressView } from './pages/ProgressView';
import { SettingsView } from './pages/SettingsView';

export default function App() {
  // Initialize storage on first load
  useEffect(() => {
    StorageManager.init();
  }, []);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Application Data States
  const [tasks, setTasks] = useState<Task[]>(() => StorageManager.getTasks());
  const [studySessions, setStudySessions] = useState<StudySession[]>(() =>
    StorageManager.getStudySessions()
  );
  const [workouts, setWorkouts] = useState<Workout[]>(() => StorageManager.getWorkouts());
  const [subjects, setSubjects] = useState<StudySubject[]>(() => StorageManager.getSubjects());
  const [notes, setNotes] = useState<QuickNote[]>(() => StorageManager.getNotes());
  const [settings, setSettings] = useState<UserSettings>(() => StorageManager.getSettings());

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() =>
    StorageManager.getActiveTimer()
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const saved = StorageManager.getActiveTimer();
    return saved ? saved.elapsedSeconds : 0;
  });

  // UI Modals
  const [isActiveSessionModalOpen, setIsActiveSessionModalOpen] = useState(false);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);

  // Quick Task Form
  const [qTaskTitle, setQTaskTitle] = useState('');
  const [qTaskCategory, setQTaskCategory] = useState<TaskCategory>('Study');
  const [qTaskPriority, setQTaskPriority] = useState<Priority>('High');
  const [qTaskStartTime, setQTaskStartTime] = useState('14:00');
  const [qTaskEndTime, setQTaskEndTime] = useState('15:30');

  // Quick Note Form
  const [qNoteText, setQNoteText] = useState('');
  const [qNoteCategory, setQNoteCategory] = useState<'Study' | 'Gym' | 'General'>('Study');

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state changes with localStorage
  useEffect(() => {
    StorageManager.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageManager.saveStudySessions(studySessions);
  }, [studySessions]);

  useEffect(() => {
    StorageManager.saveWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    StorageManager.saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    StorageManager.saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    StorageManager.saveSettings(settings);
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Active Timer Interval Runner
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer && activeTimer.isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Periodically save to localStorage
          if (next % 5 === 0 && activeTimer) {
            StorageManager.saveActiveTimer({
              ...activeTimer,
              elapsedSeconds: next,
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Formatted Timer string (HH:MM:SS or MM:SS)
  const formatTimerString = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(
      2,
      '0'
    )}:${String(s).padStart(2, '0')}`;
  };

  // Timer Control Handlers
  const handleToggleTimerRunning = () => {
    if (!activeTimer) return;
    const updated: ActiveTimer = {
      ...activeTimer,
      isRunning: !activeTimer.isRunning,
      elapsedSeconds,
    };
    setActiveTimer(updated);
    StorageManager.saveActiveTimer(updated);
  };

  const handleStartStudyTimer = (preferredSubject?: string) => {
    const newTimer: ActiveTimer = {
      type: 'study',
      subject: preferredSubject || (subjects[0]?.name ?? 'DSA'),
      topic: '',
      startTimestamp: Date.now(),
      elapsedSeconds: 0,
      isRunning: true,
      intensity: settings.defaultStudyIntensity,
    };
    setElapsedSeconds(0);
    setActiveTimer(newTimer);
    StorageManager.saveActiveTimer(newTimer);
    setIsActiveSessionModalOpen(true);
    addToast('Study timer started!', 'info');
  };

  const handleStartWorkoutTimer = () => {
    const newTimer: ActiveTimer = {
      type: 'workout',
      workoutTitle: 'Chest & Triceps Hypertrophy',
      workoutType: 'Strength',
      muscleGroup: 'Chest & Triceps',
      startTimestamp: Date.now(),
      elapsedSeconds: 0,
      isRunning: true,
      intensity: settings.defaultWorkoutIntensity,
      rpe: 8,
    };
    setElapsedSeconds(0);
    setActiveTimer(newTimer);
    StorageManager.saveActiveTimer(newTimer);
    setIsActiveSessionModalOpen(true);
    addToast('Workout tracker timer started! Have a great session.', 'info');
  };

  const handleCancelTimer = () => {
    setActiveTimer(null);
    setElapsedSeconds(0);
    StorageManager.saveActiveTimer(null);
    setIsActiveSessionModalOpen(false);
    addToast('Session timer cancelled', 'info');
  };

  // Complete Study Session
  const handleFinishStudySession = (data: {
    subject: string;
    topic: string;
    intensity: IntensityLevel;
    notes: string;
    durationMinutes: number;
  }) => {
    const now = new Date();
    const newSession: StudySession = {
      id: `study-${Date.now()}`,
      subject: data.subject,
      topic: data.topic,
      date: formatDate(now),
      startTime: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: new Date(now.getTime() + data.durationMinutes * 60000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      duration: data.durationMinutes,
      intensity: data.intensity,
      notes: data.notes || undefined,
      completed: true,
      createdAt: now.toISOString(),
    };

    setStudySessions([newSession, ...studySessions]);
    setActiveTimer(null);
    setElapsedSeconds(0);
    StorageManager.saveActiveTimer(null);

    if (settings.soundChimeEnabled) {
      soundEffects.playSuccess();
    }
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    addToast(`Great focus! ${data.durationMinutes} minutes logged for ${data.subject}`, 'success');
  };

  // Complete Workout Session
  const handleFinishWorkoutSession = (data: {
    title: string;
    workoutType: WorkoutType;
    muscleGroup: MuscleGroup;
    exercises: Exercise[];
    durationMinutes: number;
    intensity: IntensityLevel;
    rpe: number;
    calories?: number;
    notes: string;
  }) => {
    const totalVolume = data.exercises.reduce((sum, ex) => sum + ex.volume, 0);
    const totalSets = data.exercises.reduce((sum, ex) => sum + ex.sets, 0);

    const now = new Date();
    const newWorkout: Workout = {
      id: `workout-${Date.now()}`,
      date: formatDate(now),
      title: data.title,
      workoutType: data.workoutType,
      muscleGroup: data.muscleGroup,
      exercises: data.exercises,
      startTime: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      finishTime: new Date(now.getTime() + data.durationMinutes * 60000).toLocaleTimeString(
        'en-US',
        { hour: '2-digit', minute: '2-digit', hour12: false }
      ),
      duration: data.durationMinutes,
      intensity: data.intensity,
      rpe: data.rpe,
      totalVolume,
      totalSets,
      calories: data.calories,
      notes: data.notes || undefined,
      createdAt: now.toISOString(),
    };

    setWorkouts([newWorkout, ...workouts]);
    setActiveTimer(null);
    setElapsedSeconds(0);
    StorageManager.saveActiveTimer(null);

    if (settings.soundChimeEnabled) {
      soundEffects.playSuccess();
    }
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    addToast(
      `Workout saved! ${totalVolume.toLocaleString()} ${settings.weightUnit} volume logged.`,
      'success'
    );
  };

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const next = !t.completed;
          if (next && settings.soundChimeEnabled) {
            soundEffects.playSuccess();
          }
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    addToast('Task added to schedule', 'success');
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    addToast('Task updated', 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    addToast('Task removed', 'info');
  };

  // Quick Task Submit
  const handleQuickTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTaskTitle.trim()) return;
    handleAddTask({
      title: qTaskTitle.trim(),
      category: qTaskCategory,
      priority: qTaskPriority,
      date: formatDate(new Date()),
      startTime: qTaskStartTime,
      endTime: qTaskEndTime,
      completed: false,
      recurring: 'None',
    });
    setQTaskTitle('');
    setIsQuickTaskModalOpen(false);
  };

  // Quick Note Submit
  const handleQuickNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qNoteText.trim()) return;
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      date: formatDate(new Date()),
      text: qNoteText.trim(),
      category: qNoteCategory,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setQNoteText('');
    setIsQuickNoteModalOpen(false);
    addToast('Note added', 'success');
  };

  // Data Export & Import Handlers
  const handleExportData = () => {
    const jsonStr = StorageManager.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifetrack-backup-${formatDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Data backup downloaded', 'success');
  };

  const handleImportData = (jsonStr: string): boolean => {
    const ok = StorageManager.importData(jsonStr);
    if (ok) {
      setTasks(StorageManager.getTasks());
      setStudySessions(StorageManager.getStudySessions());
      setWorkouts(StorageManager.getWorkouts());
      setSubjects(StorageManager.getSubjects());
      setNotes(StorageManager.getNotes());
      setSettings(StorageManager.getSettings());
    }
    return ok;
  };

  const handleResetSeedData = () => {
    StorageManager.resetToDefaultSeed();
    setTasks(StorageManager.getTasks());
    setStudySessions(StorageManager.getStudySessions());
    setWorkouts(StorageManager.getWorkouts());
    setSubjects(StorageManager.getSubjects());
    setNotes(StorageManager.getNotes());
    setSettings(StorageManager.getSettings());
    setActiveTimer(null);
    setElapsedSeconds(0);
  };

  const handleClearAllData = () => {
    StorageManager.clearAllData();
    setTasks([]);
    setStudySessions([]);
    setWorkouts([]);
    setSubjects([]);
    setNotes([]);
    setActiveTimer(null);
    setElapsedSeconds(0);
  };

  // Calculations
  const todayStr = formatDate(new Date());
  const dailyScore = calculateDailyScore(
    todayStr,
    tasks,
    studySessions,
    workouts,
    settings
  );
  const streaks = calculateStreaks(tasks, studySessions, workouts);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-20 md:pb-8">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeTimer={activeTimer}
        onOpenTimerModal={() => setIsActiveSessionModalOpen(true)}
        onToggleTimerRunning={handleToggleTimerRunning}
        timerElapsedFormatted={formatTimerString(elapsedSeconds)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            tasks={tasks.filter((t) => t.date === todayStr)}
            studySessions={studySessions.filter((s) => s.date === todayStr)}
            workouts={workouts.filter((w) => w.date === todayStr)}
            notes={notes}
            settings={settings}
            dailyScore={dailyScore}
            streaks={streaks}
            onToggleTask={handleToggleTask}
            onOpenAddTask={() => setIsQuickTaskModalOpen(true)}
            onStartStudy={() => handleStartStudyTimer()}
            onStartWorkout={handleStartWorkoutTimer}
            onOpenLogWorkout={() => {
              setCurrentTab('gym');
            }}
            onOpenAddNote={() => setIsQuickNoteModalOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'daily-plan' && (
          <DailyPlanView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
          />
        )}

        {currentTab === 'study' && (
          <StudyView
            studySessions={studySessions}
            subjects={subjects}
            settings={settings}
            onAddSession={(session) => {
              const newSession: StudySession = {
                ...session,
                id: `study-${Date.now()}`,
                createdAt: new Date().toISOString(),
              };
              setStudySessions([newSession, ...studySessions]);
              addToast('Study session logged successfully', 'success');
            }}
            onDeleteSession={(id) => {
              setStudySessions(studySessions.filter((s) => s.id !== id));
              addToast('Study session deleted', 'info');
            }}
            onAddSubject={(subject) => {
              setSubjects([...subjects, subject]);
              addToast(`Added subject ${subject.name}`, 'success');
            }}
            onStartStudyTimer={(subName) => handleStartStudyTimer(subName)}
          />
        )}

        {currentTab === 'gym' && (
          <GymView
            workouts={workouts}
            settings={settings}
            onAddWorkout={(workout) => {
              const newWorkout: Workout = {
                ...workout,
                id: `workout-${Date.now()}`,
                createdAt: new Date().toISOString(),
              };
              setWorkouts([newWorkout, ...workouts]);
              addToast('Workout logged successfully', 'success');
            }}
            onDeleteWorkout={(id) => {
              setWorkouts(workouts.filter((w) => w.id !== id));
              addToast('Workout deleted', 'info');
            }}
            onStartLiveWorkout={handleStartWorkoutTimer}
            onOpenRestTimer={() => setIsRestTimerOpen(true)}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            tasks={tasks}
            studySessions={studySessions}
            workouts={workouts}
            streaks={streaks}
            settings={settings}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetSeedData={handleResetSeedData}
            onClearAllData={handleClearAllData}
            showToast={addToast}
          />
        )}
      </main>

      {/* Floating Gym Rest Timer Widget */}
      <RestTimerWidget
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        soundEnabled={settings.soundChimeEnabled}
      />

      {/* Active Live Session Modal (Study or Gym) */}
      <ActiveSessionModal
        isOpen={isActiveSessionModalOpen}
        onClose={() => setIsActiveSessionModalOpen(false)}
        activeTimer={activeTimer}
        onToggleTimer={handleToggleTimerRunning}
        onCancelTimer={handleCancelTimer}
        onFinishStudy={handleFinishStudySession}
        onFinishWorkout={handleFinishWorkoutSession}
        subjects={subjects}
        elapsedSeconds={elapsedSeconds}
        weightUnit={settings.weightUnit}
        onOpenRestTimer={() => setIsRestTimerOpen(true)}
      />

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={isQuickTaskModalOpen}
        onClose={() => setIsQuickTaskModalOpen(false)}
        title="Quick Add Task"
      >
        <form onSubmit={handleQuickTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Study Java Spring Security"
              value={qTaskTitle}
              onChange={(e) => setQTaskTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={qTaskCategory}
                onChange={(e) => setQTaskCategory(e.target.value as TaskCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Study">Study</option>
                <option value="Gym">Gym</option>
                <option value="College">College</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={qTaskPriority}
                onChange={(e) => setQTaskPriority(e.target.value as Priority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={qTaskStartTime}
                onChange={(e) => setQTaskStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={qTaskEndTime}
                onChange={(e) => setQTaskEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsQuickTaskModalOpen(false)}
              className="px-4 py-2 text-sm text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Note Modal */}
      <Modal
        isOpen={isQuickNoteModalOpen}
        onClose={() => setIsQuickNoteModalOpen(false)}
        title="Add Daily Note / Reflection"
      >
        <form onSubmit={handleQuickNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Study', 'Gym', 'General'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setQNoteCategory(cat)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    qNoteCategory === cat
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Note Text *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Today DSA was difficult because I struggled with recursion. Increase bench press weight next week."
              value={qNoteText}
              onChange={(e) => setQNoteText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsQuickNoteModalOpen(false)}
              className="px-4 py-2 text-sm text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-sm"
            >
              Save Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
