import React, { useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Dumbbell,
  BookOpen,
  X
} from 'lucide-react';
import {
  ActiveTimer,
  Exercise,
  IntensityLevel,
  MuscleGroup,
  StudySubject,
  WorkoutType
} from '../../types';
import { Modal } from './Modal';

interface ActiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTimer: ActiveTimer | null;
  onToggleTimer: () => void;
  onCancelTimer: () => void;
  onFinishStudy: (sessionData: {
    subject: string;
    topic: string;
    intensity: IntensityLevel;
    notes: string;
    durationMinutes: number;
  }) => void;
  onFinishWorkout: (workoutData: {
    title: string;
    workoutType: WorkoutType;
    muscleGroup: MuscleGroup;
    exercises: Exercise[];
    durationMinutes: number;
    intensity: IntensityLevel;
    rpe: number;
    calories?: number;
    notes: string;
  }) => void;
  subjects: StudySubject[];
  elapsedSeconds: number;
  weightUnit: 'kg' | 'lbs';
  onOpenRestTimer?: () => void;
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

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  isOpen,
  onClose,
  activeTimer,
  onToggleTimer,
  onCancelTimer,
  onFinishStudy,
  onFinishWorkout,
  subjects,
  elapsedSeconds,
  weightUnit,
  onOpenRestTimer,
}) => {
  // Study session local state
  const [studySubject, setStudySubject] = useState<string>(
    activeTimer?.subject || (subjects[0]?.name ?? 'DSA')
  );
  const [studyTopic, setStudyTopic] = useState<string>(activeTimer?.topic || '');
  const [studyIntensity, setStudyIntensity] = useState<IntensityLevel>(
    activeTimer?.intensity || 3
  );
  const [studyNotes, setStudyNotes] = useState<string>(activeTimer?.notes || '');

  // Workout session local state
  const [workoutTitle, setWorkoutTitle] = useState<string>(
    activeTimer?.workoutTitle || 'Chest & Triceps Hypertrophy'
  );
  const [workoutType, setWorkoutType] = useState<WorkoutType>(
    activeTimer?.workoutType || 'Strength'
  );
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(
    activeTimer?.muscleGroup || 'Chest & Triceps'
  );
  const [workoutIntensity, setWorkoutIntensity] = useState<IntensityLevel>(
    activeTimer?.intensity || 4
  );
  const [workoutRpe, setWorkoutRpe] = useState<number>(activeTimer?.rpe || 8);
  const [workoutCalories, setWorkoutCalories] = useState<string>('380');
  const [workoutNotes, setWorkoutNotes] = useState<string>(activeTimer?.notes || '');

  // Dynamic Exercises for active workout
  const [exercises, setExercises] = useState<Exercise[]>(
    activeTimer?.exercises && activeTimer.exercises.length > 0
      ? activeTimer.exercises
      : [
          {
            id: 'ex-init-1',
            name: 'Barbell Flat Bench Press',
            sets: 3,
            reps: 10,
            weight: 60,
            volume: 1800,
          },
        ]
  );

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState('60');

  if (!isOpen || !activeTimer) return null;

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(
    minutes
  ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const sets = parseInt(newExSets, 10) || 1;
    const reps = parseInt(newExReps, 10) || 1;
    const weight = parseFloat(newExWeight) || 0;
    const volume = sets * reps * weight;

    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: newExName.trim(),
      sets,
      reps,
      weight,
      volume,
    };

    setExercises([...exercises, newEx]);
    setNewExName('');
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const totalWorkoutVolume = exercises.reduce((sum, ex) => sum + ex.volume, 0);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);

  const handleFinish = () => {
    if (activeTimer.type === 'study') {
      onFinishStudy({
        subject: studySubject,
        topic: studyTopic || 'General Study & Practice',
        intensity: studyIntensity,
        notes: studyNotes,
        durationMinutes,
      });
    } else {
      onFinishWorkout({
        title: workoutTitle || 'Workout Session',
        workoutType,
        muscleGroup,
        exercises,
        durationMinutes,
        intensity: workoutIntensity,
        rpe: workoutRpe,
        calories: workoutCalories ? parseInt(workoutCalories, 10) : undefined,
        notes: workoutNotes,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTimer.type === 'study' ? 'Live Study Session' : 'Live Gym Workout'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Timer Highlight Box */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                activeTimer.type === 'study'
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'bg-orange-500/10 text-orange-400'
              }`}
            >
              {activeTimer.type === 'study' ? (
                <BookOpen className="w-6 h-6" />
              ) : (
                <Dumbbell className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                Session Duration
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight tabular-nums">
                {formattedTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onToggleTimer}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px] transition-colors ${
                activeTimer.isRunning
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {activeTimer.isRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Resume
                </>
              )}
            </button>

            {activeTimer.type === 'workout' && onOpenRestTimer && (
              <button
                type="button"
                onClick={onOpenRestTimer}
                className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-orange-400 border border-zinc-700 rounded-xl text-xs font-semibold min-h-[44px]"
              >
                Rest Timer
              </button>
            )}
          </div>
        </div>

        {/* Study Mode Fields */}
        {activeTimer.type === 'study' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <select
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
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
                  Topic / Subtopic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graph Traversal BFS/DFS"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Study Intensity */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Focus / Intensity: {studyIntensity}/5
              </label>
              <div className="grid grid-cols-5 gap-2">
                {([1, 2, 3, 4, 5] as IntensityLevel[]).map((level) => {
                  const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setStudyIntensity(level)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-colors ${
                        studyIntensity === level
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="block font-bold">{level}</span>
                      <span className="hidden sm:inline text-[10px] opacity-80">{labels[level - 1]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Study Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Session Notes & Takeaways
              </label>
              <textarea
                rows={2}
                placeholder="Key concepts grasped, roadblocks, or revision bookmarks..."
                value={studyNotes}
                onChange={(e) => setStudyNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Workout Mode Fields */}
        {activeTimer.type === 'workout' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Workout Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chest + Triceps"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Muscle Focus
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
                  Type
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

            {/* Exercises List & Volume summary */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Exercises ({exercises.length})
                </span>
                <div className="text-xs font-mono text-zinc-300">
                  Total Sets: <span className="text-white font-bold">{totalSets}</span> · Volume:{' '}
                  <span className="text-orange-400 font-bold tabular-nums">
                    {totalWorkoutVolume.toLocaleString()} {weightUnit}
                  </span>
                </div>
              </div>

              {exercises.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">
                  No exercises logged yet. Add your first exercise below.
                </p>
              ) : (
                <div className="space-y-2 mb-3">
                  {exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between bg-zinc-900 border border-zinc-800/80 px-3 py-2 rounded-lg text-xs"
                    >
                      <div>
                        <div className="font-semibold text-zinc-200">{ex.name}</div>
                        <div className="text-zinc-400 font-mono">
                          {ex.sets} sets × {ex.reps} reps @ {ex.weight} {weightUnit}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-300 tabular-nums">
                          {ex.volume.toLocaleString()} {weightUnit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                          aria-label="Remove exercise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Exercise Form */}
              <form onSubmit={handleAddExercise} className="grid grid-cols-12 gap-2 pt-2 border-t border-zinc-800">
                <div className="col-span-12 sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Exercise name (e.g. Incline DB Press)"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Sets"
                    value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 text-center focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Reps"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 text-center focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={`Wt (${weightUnit})`}
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-zinc-500 text-center focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 flex items-center justify-end">
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg p-1.5 flex items-center justify-center transition-colors min-h-[32px]"
                    title="Add exercise"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Intensity & RPE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Intensity: {workoutIntensity}/5
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as IntensityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setWorkoutIntensity(lvl)}
                      className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-colors ${
                        workoutIntensity === lvl
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
                  RPE (Rate of Perceived Exertion): {workoutRpe}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={workoutRpe}
                  onChange={(e) => setWorkoutRpe(parseInt(e.target.value, 10))}
                  className="w-full accent-orange-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>1 (Light)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Max Effort)</span>
                </div>
              </div>
            </div>

            {/* Calories & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Est. Calories
                </label>
                <input
                  type="number"
                  placeholder="e.g. 400"
                  value={workoutCalories}
                  onChange={(e) => setWorkoutCalories(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Workout Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Increase bench press weight next week"
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancelTimer}
            className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors min-h-[44px]"
          >
            Discard Session
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors min-h-[44px]"
            >
              Keep Running
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors flex items-center gap-2 min-h-[44px] ${
                activeTimer.type === 'study'
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish & Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
