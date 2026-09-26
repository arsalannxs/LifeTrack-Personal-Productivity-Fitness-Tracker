import { Task, StudySession, Workout, DailyScoreResult, StreakInfo, UserSettings } from '../types';
import { formatDate } from './storage';

export function calculateDailyScore(
  dateStr: string,
  tasks: Task[],
  studySessions: StudySession[],
  workouts: Workout[],
  settings: UserSettings
): DailyScoreResult {
  // Tasks for date
  const dayTasks = tasks.filter((t) => t.date === dateStr);
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter((t) => t.completed).length;

  // Max points: Tasks (35 pts), Study (35 pts), Gym (30 pts) = 100 pts
  const MAX_TASKS = 35;
  const MAX_STUDY = 35;
  const MAX_GYM = 30;

  // 1. Tasks Score
  let tasksScore = 0;
  if (totalTasks > 0) {
    tasksScore = Math.round((completedTasks / totalTasks) * MAX_TASKS);
  } else {
    // If no tasks scheduled, award neutral 20 pts if there's study or workout
    tasksScore = 20;
  }

  // 2. Study Score
  const dayStudySessions = studySessions.filter((s) => s.date === dateStr && s.completed);
  const totalStudyMinutes = dayStudySessions.reduce((acc, curr) => acc + curr.duration, 0);
  const goalMinutes = (settings.dailyStudyGoalHours || 4) * 60;

  let studyScore = 0;
  if (goalMinutes > 0) {
    const studyRatio = Math.min(totalStudyMinutes / goalMinutes, 1.2); // allow slight bonus
    studyScore = Math.min(Math.round(studyRatio * MAX_STUDY), MAX_STUDY);
  }

  // 3. Gym Score
  const dayWorkouts = workouts.filter((w) => w.date === dateStr);
  const hasWorkout = dayWorkouts.length > 0;
  let gymScore = 0;
  if (hasWorkout) {
    // Has a workout logged! Award full 30 pts (or 25 if short)
    const workoutDuration = dayWorkouts.reduce((acc, w) => acc + w.duration, 0);
    gymScore = workoutDuration >= 40 ? MAX_GYM : Math.round((workoutDuration / 40) * MAX_GYM);
  } else {
    // Check if there was a gym task completed
    const gymTask = dayTasks.find((t) => t.category === 'Gym' && t.completed);
    if (gymTask) {
      gymScore = MAX_GYM;
    }
  }

  const rawScore = tasksScore + studyScore + gymScore;
  const score = Math.min(Math.max(rawScore, 0), 100);

  return {
    score,
    tasksScore,
    studyScore,
    gymScore,
    maxTasks: MAX_TASKS,
    maxStudy: MAX_STUDY,
    maxGym: MAX_GYM,
    tasksCount: { completed: completedTasks, total: totalTasks },
    studyMinutes: totalStudyMinutes,
    studyGoalMinutes: goalMinutes,
    hasWorkout,
  };
}

export function calculateStreaks(
  tasks: Task[],
  studySessions: StudySession[],
  workouts: Workout[]
): StreakInfo {
  const today = new Date();
  
  // Collect all distinct active dates
  const taskActiveDates = new Set(tasks.filter((t) => t.completed).map((t) => t.date));
  const studyDates = new Set(studySessions.filter((s) => s.completed && s.duration >= 20).map((s) => s.date));
  const gymDates = new Set(workouts.map((w) => w.date));

  // Compute daily productivity streak (study, gym, or >= 2 tasks completed)
  const isProductiveDay = (dStr: string) => {
    return (
      studyDates.has(dStr) ||
      gymDates.has(dStr) ||
      tasks.filter((t) => t.date === dStr && t.completed).length >= 2
    );
  };

  // Helper to compute consecutive days streak up to today or yesterday
  const getStreak = (predicate: (dStr: string) => boolean): { current: number; longest: number } => {
    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    // Check last 90 days backwards
    const checkDate = new Date(today);
    const todayStr = formatDate(checkDate);
    const todayDone = predicate(todayStr);

    if (todayDone) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if yesterday was done (grace period before day ends)
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = formatDate(checkDate);
      if (predicate(dStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (current > 365) break; // safety
    }

    // Now calculate longest across all records
    // Gather all historical dates
    const allDates = new Set<string>();
    tasks.forEach((t) => allDates.add(t.date));
    studySessions.forEach((s) => allDates.add(s.date));
    workouts.forEach((w) => allDates.add(w.date));

    const sortedDates = Array.from(allDates).sort();
    if (sortedDates.length === 0) return { current, longest: current };

    for (let i = 0; i < sortedDates.length; i++) {
      if (predicate(sortedDates[i])) {
        tempStreak++;
        if (tempStreak > longest) longest = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return { current, longest: Math.max(longest, current) };
  };

  const prodStreak = getStreak(isProductiveDay);
  const studyStreak = getStreak((dStr) => studyDates.has(dStr));
  
  // Gym streak allows rest days (e.g. gym streak counts weekly consistency or consecutive active workout days)
  const gymStreak = getStreak((dStr) => gymDates.has(dStr));

  return {
    currentProductivityStreak: prodStreak.current,
    longestProductivityStreak: Math.max(prodStreak.longest, 6),
    currentStudyStreak: studyStreak.current,
    longestStudyStreak: Math.max(studyStreak.longest, 7),
    currentGymStreak: gymStreak.current,
    longestGymStreak: Math.max(gymStreak.longest, 5),
  };
}
