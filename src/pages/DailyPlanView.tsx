import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Repeat
} from 'lucide-react';
import { Task, TaskCategory, Priority, RecurringType } from '../types';
import { formatDate, getRelativeDate } from '../utils/storage';
import { Modal } from '../components/common/Modal';

interface DailyPlanViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  initialDate?: string;
}

const CATEGORIES: TaskCategory[] = ['Study', 'Gym', 'College', 'Personal', 'Other'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || formatDate(new Date())
  );
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Task form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [recurring, setRecurring] = useState<RecurringType>('None');
  const [notes, setNotes] = useState('');

  // Date offsets for quick carousel buttons (-2, -1, 0, +1, +2)
  const carouselDates = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      dateStr: formatDate(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: offset === 0,
    };
  });

  const handlePrevDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() - 1);
    setSelectedDate(formatDate(cur));
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + 1);
    setSelectedDate(formatDate(cur));
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Study');
    setStartTime('09:00');
    setEndTime('10:30');
    setPriority('Medium');
    setRecurring('None');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setPriority(task.priority);
    setRecurring(task.recurring || 'None');
    setNotes(task.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        category,
        date: selectedDate,
        startTime,
        endTime,
        priority,
        recurring,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddTask({
        title: title.trim(),
        category,
        date: selectedDate,
        startTime,
        endTime,
        completed: false,
        priority,
        recurring,
        notes: notes.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  // Filter tasks for selected date
  const dayTasks = tasks
    .filter((t) => {
      if (t.date === selectedDate) return true;
      if (t.recurring === 'Daily') return true;
      return false;
    })
    .filter((t) => {
      if (selectedCategoryFilter === 'all') return true;
      return t.category === selectedCategoryFilter;
    })
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  const completedCount = dayTasks.filter((t) => t.completed).length;

  // Timeline hours from 06:00 to 23:00 (18 hours)
  const timelineHours = Array.from({ length: 18 }, (_, i) => i + 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Daily Planner
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Organize time blocks, recurring routines, and priorities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors min-h-[44px] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Time Block</span>
        </button>
      </div>

      {/* Date Carousel & Selector */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {carouselDates.map((item) => {
              const isSelected = item.dateStr === selectedDate;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs transition-colors min-h-[44px] ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-medium">{item.dayName}</span>
                  <span className="text-sm font-mono font-bold tabular-nums">
                    {item.dayNumber}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Date picker input & View Mode Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
          />

          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                viewMode === 'timeline'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              List ({dayTasks.length})
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1 mr-1" />
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors min-h-[36px] ${
            selectedCategoryFilter === 'all'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors min-h-[36px] ${
              selectedCategoryFilter === cat
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      {viewMode === 'timeline' ? (
        /* Timeline View: Prevents overlapping confusion and shows clear chronological time blocks */
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
            <span>Day Schedule ({selectedDate})</span>
            <span className="font-mono tabular-nums">
              Completed: {completedCount} / {dayTasks.length}
            </span>
          </div>

          <div className="space-y-3 relative">
            {timelineHours.map((h) => {
              const hourStr = `${String(h).padStart(2, '0')}:00`;
              const nextHourStr = `${String(h + 1).padStart(2, '0')}:00`;

              // Find tasks that start in or encompass this hour
              const matchingTasks = dayTasks.filter((t) => {
                const [startH] = (t.startTime || '00:00').split(':').map(Number);
                return startH === h;
              });

              return (
                <div key={h} className="flex items-start gap-4 min-h-[50px] group">
                  {/* Hour label */}
                  <div className="w-12 text-xs font-mono text-zinc-400 shrink-0 pt-1 text-right tabular-nums">
                    {hourStr}
                  </div>

                  {/* Divider line & Events column */}
                  <div className="flex-1 border-t border-zinc-800/60 pt-1 space-y-2">
                    {matchingTasks.length > 0 ? (
                      matchingTasks.map((task) => {
                        const categoryColor =
                          task.category === 'Study'
                            ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                            : task.category === 'Gym'
                            ? 'bg-orange-950/40 border-orange-500/40 text-orange-300'
                            : task.category === 'College'
                            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                            : task.category === 'Personal'
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                            : 'bg-zinc-950/40 border-zinc-700/40 text-zinc-300';

                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${categoryColor} ${
                              task.completed ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => onToggleTask(task.id)}
                                className="p-1 hover:text-emerald-400 transition-colors shrink-0"
                                aria-label="Toggle task"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-mono font-bold tabular-nums">
                                    {task.startTime} - {task.endTime}
                                  </span>
                                  <span className="text-zinc-500">·</span>
                                  <span className="font-medium">{task.category}</span>
                                  {task.priority === 'High' && (
                                    <span className="text-red-400 text-[10px] font-bold">
                                      High
                                    </span>
                                  )}
                                  {task.recurring !== 'None' && (
                                    <span className="text-zinc-400 text-[10px] flex items-center gap-0.5">
                                      <Repeat className="w-3 h-3" />
                                      {task.recurring}
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`text-sm font-semibold text-white mt-0.5 truncate ${
                                    task.completed ? 'line-through text-zinc-400' : ''
                                  }`}
                                >
                                  {task.title}
                                </div>
                                {task.notes && (
                                  <div className="text-xs text-zinc-400 italic mt-0.5">
                                    {task.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                aria-label="Edit task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                                aria-label="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-3">
          {dayTasks.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks found for this date and filter.</p>
            </div>
          ) : (
            dayTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between gap-3 ${
                  task.completed ? 'opacity-65' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="p-1 text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-zinc-300 font-semibold tabular-nums">
                        {task.startTime} - {task.endTime}
                      </span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400">{task.category}</span>
                      <span className="text-zinc-500">·</span>
                      <span
                        className={
                          task.priority === 'High'
                            ? 'text-red-400 font-bold'
                            : task.priority === 'Medium'
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                        }
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-semibold text-white mt-0.5 ${
                        task.completed ? 'line-through text-zinc-500' : ''
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.notes && (
                      <div className="text-xs text-zinc-400 italic mt-0.5">{task.notes}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Study DSA Dynamic Programming"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Recurrence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['None', 'Daily', 'Weekly'] as RecurringType[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecurring(r)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                    recurring === r
                      ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add key objectives or reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-xl transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors min-h-[44px]"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
