import React from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Dumbbell,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  CalendarCheck2
} from 'lucide-react';
import {
  Task,
  StudySession,
  Workout,
  QuickNote,
  DailyScoreResult,
  StreakInfo,
  UserSettings
} from '../types';

interface DashboardViewProps {
  tasks: Task[];
  studySessions: StudySession[];
  workouts: Workout[];
  notes: QuickNote[];
  settings: UserSettings;
  dailyScore: DailyScoreResult;
  streaks: StreakInfo;
  onToggleTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onStartStudy: () => void;
  onStartWorkout: () => void;
  onOpenLogWorkout: () => void;
  onOpenAddNote: () => void;
  onNavigateTab: (tab: 'daily-plan' | 'study' | 'gym' | 'progress') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  studySessions,
  workouts,
  notes,
  settings,
  dailyScore,
  streaks,
  onToggleTask,
  onOpenAddTask,
  onStartStudy,
  onStartWorkout,
  onOpenLogWorkout,
  onOpenAddNote,
  onNavigateTab,
}) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hour = today.getHours();
  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
      ? 'Good afternoon'
      : 'Good evening';

  // Sort today's tasks chronologically
  const todayTasks = [...tasks].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalTasks = todayTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Study hours today
  const totalStudyMinutes = studySessions
    .filter((s) => s.completed)
    .reduce((acc, curr) => acc + curr.duration, 0);
  const studyHours = (totalStudyMinutes / 60).toFixed(1);

  // Workout today
  const todayWorkout = workouts[0];
  const workoutTotalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);

  // Total productive time today (study minutes + workout minutes)
  const totalGymMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalProductiveHours = ((totalStudyMinutes + totalGymMinutes) / 60).toFixed(1);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero / Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-blue-400 font-mono">
            {dateFormatted}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {greeting}, {settings.userName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            You have completed {completedCount} of {totalTasks} planned tasks today.
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Task</span>
          </button>

          <button
            onClick={onStartStudy}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm min-h-[44px]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Start Study</span>
          </button>

          <button
            onClick={onStartWorkout}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm min-h-[44px]"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Start Workout</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Daily Score Card */}
        <div className="col-span-2 sm:col-span-1 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-medium">Daily Score</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-white tabular-nums">
              {dailyScore.score}
            </span>
            <span className="text-xs text-zinc-500 font-mono">/ 100</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyScore.score >= 80
                  ? 'bg-emerald-500'
                  : dailyScore.score >= 50
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${dailyScore.score}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
            <span>Tasks +{dailyScore.tasksScore}</span>
            <span>Study +{dailyScore.studyScore}</span>
            <span>Gym +{dailyScore.gymScore}</span>
          </div>
        </div>

        {/* Study Progress Card */}
        <div
          onClick={() => onNavigateTab('study')}
          className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-medium text-blue-400">Study Progress</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {studyHours}h
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Goal: {settings.dailyStudyGoalHours}h ({Math.round((totalStudyMinutes / ((settings.dailyStudyGoalHours || 1) * 60)) * 100)}%)
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-2">
            <span>Streak: {streaks.currentStudyStreak} days</span>
            <ChevronRight className="w-3 h-3 ml-auto text-zinc-600" />
          </div>
        </div>

        {/* Workout Status Card */}
        <div
          onClick={() => onNavigateTab('gym')}
          className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-orange-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-medium text-orange-400">Gym Status</span>
            <Dumbbell className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white truncate">
              {todayWorkout ? todayWorkout.muscleGroup : 'Rest Day'}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5 font-mono">
              {todayWorkout
                ? `${todayWorkout.totalVolume.toLocaleString()} ${settings.weightUnit} · ${todayWorkout.duration}m`
                : 'No session yet today'}
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-2">
            <span>Streak: {streaks.currentGymStreak} workouts</span>
            <ChevronRight className="w-3 h-3 ml-auto text-zinc-600" />
          </div>
        </div>

        {/* Productivity & Streaks Card */}
        <div
          onClick={() => onNavigateTab('progress')}
          className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-medium text-emerald-400">Consistency</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums flex items-baseline gap-1">
              {streaks.currentProductivityStreak}
              <span className="text-sm font-normal text-zinc-400">days</span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Best streak: {streaks.longestProductivityStreak} days
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-2">
            <span>{totalProductiveHours}h total tracked</span>
            <ChevronRight className="w-3 h-3 ml-auto text-zinc-600" />
          </div>
        </div>
      </div>

      {/* Main Content Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Chronological Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-white">Today's Schedule & Plan</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 tabular-nums">
                {completedCount}/{totalTasks} ({completionPercentage}%)
              </span>
              <button
                onClick={() => onNavigateTab('daily-plan')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 min-h-[44px]"
              >
                <span>Full Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Schedule Items List */}
          {todayTasks.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400 font-medium">No schedule items planned for today.</p>
              <button
                onClick={onOpenAddTask}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                + Add First Task
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => {
                const categoryColor =
                  task.category === 'Study'
                    ? 'text-blue-400 border-l-blue-500'
                    : task.category === 'Gym'
                    ? 'text-orange-400 border-l-orange-500'
                    : task.category === 'College'
                    ? 'text-cyan-400 border-l-cyan-500'
                    : task.category === 'Personal'
                    ? 'text-purple-400 border-l-purple-500'
                    : 'text-zinc-400 border-l-zinc-500';

                return (
                  <div
                    key={task.id}
                    className={`bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 border-l-4 ${categoryColor} flex items-start justify-between gap-3 transition-colors ${
                      task.completed ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 p-1 text-zinc-400 hover:text-emerald-400 transition-colors shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {task.startTime && (
                            <span className="font-mono text-zinc-300 font-semibold tabular-nums">
                              {task.startTime}
                              {task.endTime ? ` - ${task.endTime}` : ''}
                            </span>
                          )}
                          <span className="text-zinc-500">·</span>
                          <span className="text-zinc-400">{task.category}</span>
                          {task.priority === 'High' && (
                            <span className="text-red-400 text-[10px] font-semibold">Priority</span>
                          )}
                        </div>

                        <h3
                          className={`text-sm font-medium mt-1 text-zinc-100 ${
                            task.completed ? 'line-through text-zinc-500' : ''
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.notes && (
                          <p className="text-xs text-zinc-400 mt-1 italic leading-relaxed">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Log, Gym Overview & Daily Reflection */}
        <div className="space-y-4">
          {/* Quick Actions Panel */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={onOpenAddTask}
                className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Add Task</span>
              </button>
              <button
                onClick={onStartStudy}
                className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Start Study</span>
              </button>
              <button
                onClick={onStartWorkout}
                className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Dumbbell className="w-4 h-4 text-orange-400" />
                <span>Start Gym</span>
              </button>
              <button
                onClick={onOpenLogWorkout}
                className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Log Past Gym</span>
              </button>
            </div>
          </div>

          {/* Quick Notes & Thoughts */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Daily Notes & Insights
              </h2>
              <button
                onClick={onOpenAddNote}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                + Note
              </button>
            </div>

            {notes.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">
                No personal reflections yet. Jot down takeaways from study or workouts.
              </p>
            ) : (
              <div className="space-y-2.5">
                {notes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span className="font-semibold text-purple-400">{note.category}</span>
                      <span className="font-mono">{note.date}</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
