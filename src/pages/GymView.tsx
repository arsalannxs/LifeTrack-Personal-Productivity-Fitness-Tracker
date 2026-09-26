import React, { useState } from 'react';
import {
  Dumbbell,
  Play,
  Plus,
  Flame,
  Calendar,
  Layers,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Timer as TimerIcon,
  Activity
} from 'lucide-react';
import {
  Workout,
  Exercise,
  WorkoutType,
  MuscleGroup,
  IntensityLevel,
  UserSettings
} from '../types';
import { formatDate } from '../utils/storage';
import { Modal } from '../components/common/Modal';

interface GymViewProps {
  workouts: Workout[];
  settings: UserSettings;
  onAddWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => void;
  onDeleteWorkout: (id: string) => void;
  onStartLiveWorkout: () => void;
  onOpenRestTimer: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest & Triceps',
  'Back & Biceps',
  'Legs & Core',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Full Body',
  'Cardio & Core',
];

const WORKOUT_TYPES: WorkoutType[] = [
  'Strength',
  'Hypertrophy',
  'Cardio',
  'Mobility',
  'Calisthenics',
];

export const GymView: React.FC<GymViewProps> = ({
  workouts,
  settings,
  onAddWorkout,
  onDeleteWorkout,
  onStartLiveWorkout,
  onOpenRestTimer,
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    workouts[0]?.id || null
  );

  // Manual Log Form State
  const [date, setDate] = useState(formatDate(new Date()));
  const [title, setTitle] = useState('Chest & Triceps Hypertrophy');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Strength');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest & Triceps');
  const [durationMinutes, setDurationMinutes] = useState('65');
  const [intensity, setIntensity] = useState<IntensityLevel>(settings.defaultWorkoutIntensity || 4);
  const [rpe, setRpe] = useState(8);
  const [calories, setCalories] = useState('400');
  const [notes, setNotes] = useState('');

  // Exercises builder for manual modal
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: 'ex-log-1',
      name: 'Flat Barbell Bench Press',
      sets: 3,
      reps: 10,
      weight: 60,
      volume: 1800,
    },
    {
      id: 'ex-log-2',
      name: 'Incline Dumbbell Press',
      sets: 3,
      reps: 10,
      weight: 24,
      volume: 720,
    },
    {
      id: 'ex-log-3',
      name: 'Tricep Rope Pushdown',
      sets: 3,
      reps: 12,
      weight: 30,
      volume: 1080,
    },
  ]);

  const [curExName, setCurExName] = useState('');
  const [curExSets, setCurExSets] = useState('3');
  const [curExReps, setCurExReps] = useState('10');
  const [curExWeight, setCurExWeight] = useState('60');

  // Overall Gym Stats
  const totalWorkouts = workouts.length;
  const totalVolumeAllTime = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
  const totalWorkoutHours = (workouts.reduce((sum, w) => sum + w.duration, 0) / 60).toFixed(1);
  const avgDuration =
    totalWorkouts > 0
      ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / totalWorkouts)
      : 0;
  const avgIntensity =
    totalWorkouts > 0
      ? (workouts.reduce((sum, w) => sum + w.intensity, 0) / totalWorkouts).toFixed(1)
      : '0.0';

  const handleAddExerciseToModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curExName.trim()) return;
    const sets = parseInt(curExSets, 10) || 1;
    const reps = parseInt(curExReps, 10) || 1;
    const weight = parseFloat(curExWeight) || 0;
    const volume = sets * reps * weight;

    setExercises([
      ...exercises,
      {
        id: `ex-${Date.now()}`,
        name: curExName.trim(),
        sets,
        reps,
        weight,
        volume,
      },
    ]);
    setCurExName('');
  };

  const handleRemoveExerciseFromModal = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const currentTotalModalVolume = exercises.reduce((sum, ex) => sum + ex.volume, 0);
  const currentTotalModalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(durationMinutes, 10) || 45;
    onAddWorkout({
      title: title.trim() || `${muscleGroup} Session`,
      date,
      workoutType,
      muscleGroup,
      startTime: '17:00',
      finishTime: '18:15',
      duration: dur,
      intensity,
      rpe,
      totalVolume: currentTotalModalVolume,
      totalSets: currentTotalModalSets,
      calories: calories ? parseInt(calories, 10) : undefined,
      notes: notes.trim() || undefined,
      exercises,
    });
    setIsLogModalOpen(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-400" />
            Gym & Workout Tracker
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Log exercises, calculate total tonnage volume, monitor RPE, and track muscle growth.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRestTimer}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
          >
            <TimerIcon className="w-4 h-4" />
            <span>Rest Timer</span>
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
          >
            Log Past Workout
          </button>

          <button
            onClick={onStartLiveWorkout}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors min-h-[44px]"
          >
            <Play className="w-4 h-4" />
            <span>Start Workout</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">Workouts Completed</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 tabular-nums">
            {totalWorkouts}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Goal: {settings.weeklyWorkoutGoalDays} days / week
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">Total Volume Lifted</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-orange-400 mt-1 tabular-nums truncate">
            {totalVolumeAllTime.toLocaleString()}
            <span className="text-xs font-normal text-zinc-500 ml-1">{settings.weightUnit}</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Sets × Reps × Weight sum</div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">Avg Session Time</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1 tabular-nums">
            {avgDuration}m
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Total gym time: {totalWorkoutHours}h
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
          <span className="text-xs text-zinc-400 font-medium">Average Intensity</span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 mt-1 tabular-nums flex items-baseline gap-1">
            {avgIntensity}
            <span className="text-sm font-normal text-zinc-500">/ 5</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Scale: 1 (Very Easy) to 5 (Very Hard)
          </div>
        </div>
      </div>

      {/* Workout History Log with Exercise & Volume Breakdowns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Workout History & Progression
          </h2>
          <span className="text-xs text-zinc-400 font-mono">
            {workouts.length} recorded workouts
          </span>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No workout sessions logged yet.</p>
            <button
              onClick={onStartLiveWorkout}
              className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold"
            >
              Start First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => {
              const isExpanded = expandedWorkoutId === workout.id;
              const intensityLabels = ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'];

              return (
                <div
                  key={workout.id}
                  className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
                >
                  {/* Workout Header Summary */}
                  <div
                    onClick={() =>
                      setExpandedWorkoutId(isExpanded ? null : workout.id)
                    }
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-850 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">
                          {workout.muscleGroup}
                        </span>
                        <span className="text-zinc-500 font-mono">{workout.date}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-400 font-mono tabular-nums">
                          {workout.duration} mins
                        </span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-amber-400 text-[11px] font-medium">
                          Intensity: {workout.intensity}/5 ({intensityLabels[workout.intensity - 1]})
                        </span>
                        <span className="text-zinc-500">·</span>
                        <span className="text-zinc-400 font-mono text-[11px]">
                          RPE: {workout.rpe}/10
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white truncate">{workout.title}</h3>

                      {workout.notes && (
                        <p className="text-xs text-zinc-400 italic line-clamp-1">
                          {workout.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-base font-mono font-bold text-orange-400 tabular-nums">
                          {workout.totalVolume.toLocaleString()} {settings.weightUnit}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {workout.exercises.length} exercises · {workout.totalSets} sets
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteWorkout(workout.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label="Delete workout"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="text-zinc-400 p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-zinc-800/80 space-y-3 bg-zinc-950/60">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Exercise Breakdown & Volume
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {workout.exercises.map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-zinc-200">{ex.name}</div>
                              <div className="text-zinc-400 font-mono mt-0.5">
                                {ex.sets} sets × {ex.reps} reps @ {ex.weight} {settings.weightUnit}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-orange-400 tabular-nums">
                                {ex.volume.toLocaleString()} {settings.weightUnit}
                              </div>
                              <div className="text-[10px] text-zinc-500">volume</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Workout Final Summary Pill */}
                      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-300">
                        <span>
                          Workout Duration:{' '}
                          <strong className="text-white">{workout.duration}m</strong>
                        </span>
                        <span>
                          Exercises:{' '}
                          <strong className="text-white">{workout.exercises.length}</strong>
                        </span>
                        <span>
                          Total Sets: <strong className="text-white">{workout.totalSets}</strong>
                        </span>
                        <span>
                          Total Volume:{' '}
                          <strong className="text-orange-400">
                            {workout.totalVolume.toLocaleString()} {settings.weightUnit}
                          </strong>
                        </span>
                        <span>
                          Intensity:{' '}
                          <strong className="text-amber-400">{workout.intensity}/5</strong>
                        </span>
                        {workout.calories && (
                          <span>
                            Calories: <strong className="text-white">{workout.calories} kcal</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Past Workout Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Completed Workout"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Workout Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chest + Triceps"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Muscle Group
              </label>
              <select
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
              >
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>
                    {mg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Workout Type
              </label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
              >
                {WORKOUT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercises Section */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-zinc-300">
                Exercises & Volume ({exercises.length})
              </span>
              <span className="font-mono text-orange-400 font-bold tabular-nums">
                Total: {currentTotalModalVolume.toLocaleString()} {settings.weightUnit}
              </span>
            </div>

            <div className="space-y-2">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{ex.name}</span>
                    <span className="text-zinc-400 font-mono ml-2">
                      {ex.sets} × {ex.reps} @ {ex.weight} {settings.weightUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-300 font-medium">
                      {ex.volume.toLocaleString()} {settings.weightUnit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseFromModal(ex.id)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add exercise row */}
            <div className="grid grid-cols-12 gap-2 pt-2 border-t border-zinc-800">
              <div className="col-span-12 sm:col-span-5">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={curExName}
                  onChange={(e) => setCurExName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="number"
                  placeholder="Sets"
                  value={curExSets}
                  onChange={(e) => setCurExSets(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 text-center"
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="number"
                  placeholder="Reps"
                  value={curExReps}
                  onChange={(e) => setCurExReps(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 text-center"
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="number"
                  placeholder={`Wt (${settings.weightUnit})`}
                  value={curExWeight}
                  onChange={(e) => setCurExWeight(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 text-center"
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <button
                  type="button"
                  onClick={handleAddExerciseToModal}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg p-1.5 flex items-center justify-center min-h-[32px]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Workout Intensity: {intensity}/5
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as IntensityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-colors ${
                      intensity === lvl
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                RPE: {rpe}/10 · Calories (Est.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(parseInt(e.target.value, 10))}
                  className="w-2/3 accent-orange-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Workout Notes & Observations
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Increase bench press weight next week. Back pump was intense."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 resize-none"
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
              className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors min-h-[44px]"
            >
              Save Workout
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
