import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Play,
  Clock,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  Trash2,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { StudySession, StudySubject, IntensityLevel, UserSettings } from '../types';
import { formatDate, getRelativeDate } from '../utils/storage';
import { Modal } from '../components/common/Modal';

interface StudyViewProps {
  studySessions: StudySession[];
  subjects: StudySubject[];
  settings: UserSettings;
  onAddSession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onDeleteSession: (id: string) => void;
  onAddSubject: (subject: StudySubject) => void;
  onStartStudyTimer: (subjectName?: string) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  studySessions,
  subjects,
  settings,
  onAddSession,
  onDeleteSession,
  onAddSubject,
  onStartStudyTimer,
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Manual Log Form State
  const [subject, setSubject] = useState(subjects[0]?.name || 'DSA');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [durationMinutes, setDurationMinutes] = useState('120');
  const [intensity, setIntensity] = useState<IntensityLevel>(settings.defaultStudyIntensity || 3);
  const [notes, setNotes] = useState('');

  // New Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#3b82f6');

  const todayStr = formatDate(new Date());

  // 1. Calculations
  const todaySessions = studySessions.filter((s) => s.date === todayStr && s.completed);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // This week (last 7 days)
  const weekStartStr = getRelativeDate(-7);
  const weekSessions = studySessions.filter((s) => s.date >= weekStartStr && s.completed);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  // This month (last 30 days)
  const monthStartStr = getRelativeDate(-30);
  const monthSessions = studySessions.filter((s) => s.date >= monthStartStr && s.completed);
  const monthMinutes = monthSessions.reduce((sum, s) => sum + s.duration, 0);

  // Average intensity
  const completedSessions = studySessions.filter((s) => s.completed);
  const avgIntensity =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((sum, s) => sum + s.intensity, 0) /
          completedSessions.length
        ).toFixed(1)
      : '0.0';

  // Subject-wise study time (minutes)
  const subjectDistributionMap: Record<string, number> = {};
  completedSessions.forEach((s) => {
    subjectDistributionMap[s.subject] = (subjectDistributionMap[s.subject] || 0) + s.duration;
  });

  const subjectChartData = Object.entries(subjectDistributionMap).map(([name, minutes]) => ({
    name,
    hours: parseFloat((minutes / 60).toFixed(1)),
  }));

  // Daily study hours for the last 7 days chart
  const dailyChartData = [-6, -5, -4, -3, -2, -1, 0].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dStr = formatDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayMins = studySessions
      .filter((s) => s.date === dStr && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      day: dayName,
      date: dStr,
      hours: parseFloat((dayMins / 60).toFixed(1)),
    };
  });

  // Color palette for charts
  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(durationMinutes, 10) || 60;
    onAddSession({
      subject,
      topic: topic.trim() || 'General Practice',
      date,
      startTime,
      endTime,
      duration: dur,
      intensity,
      notes: notes.trim() || undefined,
      completed: true,
    });
    setIsLogModalOpen(false);
    setTopic('');
    setNotes('');
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    onAddSubject({
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      color: newSubColor,
    });
    setNewSubName('');
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header and Quick Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Study Tracker
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Log technical topics, monitor depth & intensity, and optimize focus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
          >
            + Subject
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
          >
            Log Past Session
          </button>
          <button
            onClick={() => onStartStudyTimer(subject)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors min-h-[44px]"
          >
            <Play className="w-4 h-4" />
            <span>Start Live Timer</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">Today's Study</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 tabular-nums">
            {(todayMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Goal: {settings.dailyStudyGoalHours}h ({Math.round((todayMinutes / ((settings.dailyStudyGoalHours || 1) * 60)) * 100)}%)
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">This Week</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 tabular-nums">
            {(weekMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Weekly Goal: {settings.weeklyStudyGoalHours}h
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">This Month (30d)</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 tabular-nums">
            {(monthMinutes / 60).toFixed(1)}h
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {completedSessions.length} total sessions completed
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">Average Intensity</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 mt-1 tabular-nums flex items-baseline gap-1">
            {avgIntensity}
            <span className="text-sm font-normal text-zinc-500">/ 5</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Scale: 1 (Very Low) to 5 (Very High)
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Study Hours Bar Chart */}
        <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Daily Study Hours (Last 7 Days)
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Hours / Day</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val ?? 0} hours`, 'Studied']}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution Chart */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Subject Share
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Hours</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectChartData}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {subjectChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
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
                  formatter={(val: any) => [`${val ?? 0} hrs`, 'Time']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-400 mt-2 max-h-24 overflow-y-auto">
            {subjectChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <span className="truncate">{item.name}</span>
                <span className="ml-auto font-mono text-zinc-300 tabular-nums">
                  {item.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History List */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">Recent Study Sessions</h2>
          <span className="text-xs text-zinc-400 font-mono">
            {studySessions.length} total logged
          </span>
        </div>

        {studySessions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No study sessions logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studySessions.map((session) => {
              const intensityLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
              return (
                <div
                  key={session.id}
                  className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {session.subject}
                      </span>
                      <span className="text-zinc-500 font-mono">{session.date}</span>
                      {session.startTime && (
                        <>
                          <span className="text-zinc-500">·</span>
                          <span className="text-zinc-400 font-mono tabular-nums">
                            {session.startTime} - {session.endTime}
                          </span>
                        </>
                      )}
                      <span className="text-zinc-500">·</span>
                      <span className="text-amber-400 text-[11px] font-medium">
                        Intensity: {session.intensity}/5 ({intensityLabels[session.intensity - 1]})
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white">{session.topic}</h3>

                    {session.notes && (
                      <p className="text-xs text-zinc-400 italic leading-relaxed pt-0.5">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-white tabular-nums">
                        {session.duration} mins
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {(session.duration / 60).toFixed(1)} hrs
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Past Session Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Completed Study Session"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Topic / Chapter Covered *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dynamic Programming: 0/1 Knapsack"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Study Intensity: {intensity}/5
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as IntensityLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-colors ${
                    intensity === lvl
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notes & Key Learnings
            </label>
            <textarea
              rows={2}
              placeholder="Important formulas, references, or concepts to revise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-xl transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors min-h-[44px]"
            >
              Save Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Custom Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Custom Subject"
      >
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. System Design, Rust, Kotlin"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Color Accent
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newSubColor}
                onChange={(e) => setNewSubColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-zinc-400">{newSubColor}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-xl transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors min-h-[44px]"
            >
              Create Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
