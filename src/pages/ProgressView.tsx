import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  Flame,
  Calendar,
  BookOpen,
  Dumbbell,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Task, StudySession, Workout, StreakInfo, UserSettings } from '../types';
import { formatDate } from '../utils/storage';

interface ProgressViewProps {
  tasks: Task[];
  studySessions: StudySession[];
  workouts: Workout[];
  streaks: StreakInfo;
  settings: UserSettings;
}

type TimeframeOption = '7d' | '30d' | '90d' | 'all';

export const ProgressView: React.FC<ProgressViewProps> = ({
  tasks,
  studySessions,
  workouts,
  streaks,
  settings,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30d');

  // Days count based on timeframe
  const daysCount = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 180;

  // Generate date array for the selected timeframe
  const today = new Date();
  const dateRange: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dateRange.push(formatDate(d));
  }

  // Filter datasets for timeframe
  const filteredTasks = tasks.filter((t) =>
    timeframe === 'all' ? true : dateRange.includes(t.date)
  );
  const filteredStudy = studySessions.filter((s) =>
    s.completed && (timeframe === 'all' ? true : dateRange.includes(s.date))
  );
  const filteredWorkouts = workouts.filter((w) =>
    timeframe === 'all' ? true : dateRange.includes(w.date)
  );

  // STUDY METRICS
  const totalStudyMinutes = filteredStudy.reduce((sum, s) => sum + s.duration, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const avgStudyIntensity =
    filteredStudy.length > 0
      ? (filteredStudy.reduce((sum, s) => sum + s.intensity, 0) / filteredStudy.length).toFixed(1)
      : '0.0';

  // Find most studied subject
  const subjectMap: Record<string, number> = {};
  filteredStudy.forEach((s) => {
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration;
  });
  let mostStudiedSubject = 'None';
  let maxSubMinutes = 0;
  Object.entries(subjectMap).forEach(([sub, mins]) => {
    if (mins > maxSubMinutes) {
      maxSubMinutes = mins;
      mostStudiedSubject = sub;
    }
  });

  // GYM METRICS
  const workoutCount = filteredWorkouts.length;
  const totalWorkoutMinutes = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalWorkoutHours = (totalWorkoutMinutes / 60).toFixed(1);
  const avgWorkoutDuration = workoutCount > 0 ? Math.round(totalWorkoutMinutes / workoutCount) : 0;
  const avgGymIntensity =
    workoutCount > 0
      ? (filteredWorkouts.reduce((sum, w) => sum + w.intensity, 0) / workoutCount).toFixed(1)
      : '0.0';
  const totalVolume = filteredWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);

  // PRODUCTIVITY METRICS
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.completed).length;
  const taskCompletionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalProductiveHours = (
    (totalStudyMinutes + totalWorkoutMinutes) /
    60
  ).toFixed(1);

  // CHART 1: Study Hours Timeline (Area chart)
  const studyHoursChartData = dateRange.map((dStr) => {
    const daySessions = filteredStudy.filter((s) => s.date === dStr);
    const mins = daySessions.reduce((sum, s) => sum + s.duration, 0);
    const d = new Date(dStr + 'T00:00:00');
    return {
      date: dStr,
      label: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      hours: parseFloat((mins / 60).toFixed(1)),
    };
  });

  // CHART 2: Workout Duration (Bar chart)
  const workoutDurationChartData = dateRange
    .filter((dStr) => filteredWorkouts.some((w) => w.date === dStr))
    .map((dStr) => {
      const dayWorkouts = filteredWorkouts.filter((w) => w.date === dStr);
      const mins = dayWorkouts.reduce((sum, w) => sum + w.duration, 0);
      const d = new Date(dStr + 'T00:00:00');
      return {
        date: dStr,
        label: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        duration: mins,
      };
    });

  // CHART 4: Task Completion Doughnut
  const taskCompletionPieData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    {
      name: 'Pending / Incomplete',
      value: Math.max(0, totalTasks - completedTasks),
      color: '#3f3f46',
    },
  ];

  // CHART 5: Workout Volume Progression (Line chart)
  const workoutVolumeChartData = filteredWorkouts
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => {
      const d = new Date(w.date + 'T00:00:00');
      return {
        date: w.date,
        label: `${d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}`,
        title: w.title,
        volume: w.totalVolume,
      };
    });

  // CHART 6: Study vs Gym Time Comparison
  const comparisonChartData = dateRange.slice(-14).map((dStr) => {
    const sMins = filteredStudy
      .filter((s) => s.date === dStr)
      .reduce((sum, s) => sum + s.duration, 0);
    const gMins = filteredWorkouts
      .filter((w) => w.date === dStr)
      .reduce((sum, w) => sum + w.duration, 0);
    const d = new Date(dStr + 'T00:00:00');

    return {
      date: dStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      studyHours: parseFloat((sMins / 60).toFixed(1)),
      gymHours: parseFloat((gMins / 60).toFixed(1)),
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header and Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Analytics & Progress
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Holistic trends for study discipline, weight volume, and task consistency.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 self-start sm:self-auto">
          {(['7d', '30d', '90d', 'all'] as TimeframeOption[]).map((tf) => {
            const labels: Record<TimeframeOption, string> = {
              '7d': '7 Days',
              '30d': '30 Days',
              '90d': '90 Days',
              all: 'All Time',
            };
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                  timeframe === tf
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labels[tf]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Streaks System Showcase Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          Active Streak Engine
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-xl">
            <div className="text-xs text-zinc-400 font-medium">Daily Productivity Streak</div>
            <div className="text-3xl font-mono font-bold text-white mt-1 tabular-nums flex items-baseline gap-1">
              {streaks.currentProductivityStreak}
              <span className="text-xs font-normal text-zinc-500">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Best record: {streaks.longestProductivityStreak} consecutive days
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-xl">
            <div className="text-xs text-blue-400 font-medium">Study Focus Streak</div>
            <div className="text-3xl font-mono font-bold text-white mt-1 tabular-nums flex items-baseline gap-1">
              {streaks.currentStudyStreak}
              <span className="text-xs font-normal text-zinc-500">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Best record: {streaks.longestStudyStreak} consecutive days
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-xl">
            <div className="text-xs text-orange-400 font-medium">Gym Consistency Streak</div>
            <div className="text-3xl font-mono font-bold text-white mt-1 tabular-nums flex items-baseline gap-1">
              {streaks.currentGymStreak}
              <span className="text-xs font-normal text-zinc-500">workouts</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Best record: {streaks.longestGymStreak} active sessions
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillar Summary Grids (Study, Gym, Productivity) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Study Pillar */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-blue-400 pb-2 border-b border-zinc-800">
            <span className="font-bold uppercase tracking-wider">Study Metrics</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Study Time:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {totalStudyHours} hrs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Top Subject:</span>
              <span className="font-semibold text-blue-300">{mostStudiedSubject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Avg Study Intensity:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {avgStudyIntensity} / 5
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Sessions Completed:</span>
              <span className="font-mono text-zinc-200 tabular-nums">
                {filteredStudy.length}
              </span>
            </div>
          </div>
        </div>

        {/* Gym Pillar */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-orange-400 pb-2 border-b border-zinc-800">
            <span className="font-bold uppercase tracking-wider">Gym Metrics</span>
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Workouts Logged:</span>
              <span className="font-mono font-bold text-white tabular-nums">{workoutCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Volume Lifted:</span>
              <span className="font-mono font-bold text-orange-400 tabular-nums">
                {totalVolume.toLocaleString()} {settings.weightUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Avg Session Duration:</span>
              <span className="font-mono text-zinc-200 tabular-nums">
                {avgWorkoutDuration} mins
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Avg Gym Intensity:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {avgGymIntensity} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Productivity Pillar */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-400 pb-2 border-b border-zinc-800">
            <span className="font-bold uppercase tracking-wider">Productivity Metrics</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Tasks Completed:</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {completedTasks} / {totalTasks}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Task Completion Rate:</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {taskCompletionPercentage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Productive Hours:</span>
              <span className="font-mono text-zinc-200 tabular-nums">
                {totalProductiveHours} hrs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Daily Consistency:</span>
              <span className="font-semibold text-zinc-300">
                {taskCompletionPercentage >= 70 ? 'High' : 'Moderate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART 3: Activity Calendar Heatmap (Days grid showing consistency) */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Consistency Heatmap (Recent Activity)
          </h2>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-950" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5 pt-2 overflow-x-auto">
          {dateRange.slice(-28).map((dStr) => {
            const hasStudy = filteredStudy.some((s) => s.date === dStr);
            const hasGym = filteredWorkouts.some((w) => w.date === dStr);
            const taskCount = filteredTasks.filter((t) => t.date === dStr && t.completed).length;

            const score = (hasStudy ? 2 : 0) + (hasGym ? 2 : 0) + (taskCount >= 2 ? 1 : 0);
            const bgClass =
              score >= 4
                ? 'bg-emerald-500'
                : score >= 3
                ? 'bg-emerald-700'
                : score >= 1
                ? 'bg-emerald-950 border border-emerald-800/40'
                : 'bg-zinc-800/60';

            const d = new Date(dStr + 'T00:00:00');
            const tooltip = `${dStr}: ${hasStudy ? 'Study ' : ''}${hasGym ? 'Gym ' : ''}${taskCount} tasks`;

            return (
              <div
                key={dStr}
                title={tooltip}
                className={`h-7 rounded-md ${bgClass} flex flex-col items-center justify-center text-[9px] font-mono text-zinc-300 transition-transform hover:scale-110 cursor-pointer`}
              >
                <span>{d.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Study Hours Line/Area Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              1. Study Hours Progression
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Hours</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyHoursChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val ?? 0} hrs`, 'Study']}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#studyGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Workout Duration Bar Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              2. Workout Duration per Session
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Minutes</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutDurationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}m`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val ?? 0} mins`, 'Duration']}
                />
                <Bar dataKey="duration" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Task Completion Doughnut Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              4. Task Completion Ratio
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {taskCompletionPercentage}%
            </span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskCompletionPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {taskCompletionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Done: {completedTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span>Pending: {Math.max(0, totalTasks - completedTasks)}</span>
            </div>
          </div>
        </div>

        {/* CHART 5: Workout Volume Progression Line Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              5. Workout Volume (Tonnage)
            </h2>
            <span className="text-xs text-zinc-400 font-mono">{settings.weightUnit}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workoutVolumeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [
                    `${(val ?? 0).toLocaleString()} ${settings.weightUnit}`,
                    'Volume',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Study vs Gym Time Dual Comparison Chart */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              6. Study vs. Gym Hours (Daily Comparison)
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" /> Study
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-500" /> Gym
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}h`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="studyHours" name="Study Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gymHours" name="Gym Hours" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
