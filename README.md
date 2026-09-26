# LifeTrack — Personal Productivity & Fitness Tracker

A mobile-first, private personal dashboard for managing your daily study schedule, task routines, gym workouts, volume progression, streaks, and holistic productivity analytics.

---

## Key Features

1. **Dashboard**
   - Today's date, personalized greeting, and live daily score (0–100) with points breakdown (Tasks + Study + Gym).
   - Metric cards: study hours vs daily goal, workout status & volume, task completion rate, and active streak.
   - Chronological daily plan view (07:00 to 22:30) with category indicators, priority levels, and completion checkboxes.
   - Quick action triggers: Add Task, Start Study, Start Workout, Log Workout, and Quick Note.

2. **Daily Plan**
   - Calendar date switcher with quick 5-day carousel (M, T, W, etc.) and date picker.
   - Visual **Hourly Timeline** (06:00 to 23:00) that prevents overlapping confusion.
   - Task management: Add, edit, delete, priority tags (Low, Medium, High), and recurring schedules (Daily, Weekly).
   - Category filtering (Study, Gym, College, Personal, Other).

3. **Study Tracker**
   - Track topics across subjects (DSA, Java, Python, Software Engineering, Web Development, Database Systems, or custom subjects).
   - Live study timer stopwatch with pause/resume and auto-calculated duration.
   - Record focus intensity (1: Very Low to 5: Very High) and notes.
   - Automatic calculations: Today, this week, this month, subject distribution, and average intensity.
   - Charts: Daily study hours (last 7 days) and subject share distribution.

4. **Gym / Workout Tracker**
   - **Live Workout Mode**: Automatically tracks workout duration with live pause/resume timer.
   - Exercise builder: Record sets, reps, weight, and auto-calculates volume (`Sets × Reps × Weight`).
   - Built-in **Rest Interval Timer** (45s, 60s, 90s, 120s) with Web Audio chime alerts.
   - Tracks workout type, muscle groups, intensity (1–5), RPE scale (1–10), and estimated calories burned.
   - Complete workout history with expandable exercise sets, volume, and session summaries.

5. **Progress & Analytics**
   - Filter by **7 Days**, **30 Days**, **90 Days**, or **All Time**.
   - 6 Interactive Charts:
     1. Study Hours Progression (Area chart)
     2. Workout Duration per Session (Bar chart)
     3. Consistency Heatmap (Activity calendar grid)
     4. Task Completion Ratio (Doughnut chart)
     5. Workout Volume / Tonnage Progression (Line chart)
     6. Study vs. Gym Hours Comparison (Dual bar chart)
   - Triple Streak System: Daily Productivity Streak, Study Focus Streak, and Gym Streak (current vs. best records).

6. **Data Storage & Privacy**
   - Stored in browser `localStorage` without external databases or tracking.
   - **Export Data**: One-click download of personal data as JSON backup.
   - **Import Data**: Instant restore from JSON file with validation.
   - **Reset Sample Data**: Instant reset to sample logs.
   - **Clear All Data**: With confirmation modal.

---

## Folder Structure

```
lifetrack/
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # Applet configuration & metadata
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite & Tailwind CSS plugins
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root application state & modal coordinator
│   ├── index.css                # Tailwind CSS & custom scrollbar styles
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces (Task, Workout, StudySession, etc.)
│   ├── utils/
│   │   ├── storage.ts           # LocalStorage persistence, seed data & backup import/export
│   │   ├── score.ts             # Daily score & streak calculator engine
│   │   └── audio.ts             # Web Audio API acoustic cues (success, rest timer alerts)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx       # Top Bar contract + Mobile fixed thumb navigation
│   │   └── common/
│   │       ├── Modal.tsx        # Accessible dialog wrapper
│   │       ├── Toast.tsx        # Auto-dismissing feedback notifications
│   │       ├── ConfirmDialog.tsx# Confirmation dialog for reset/clear actions
│   │       ├── RestTimerWidget.tsx # Gym rest interval countdown with chime
│   │       └── ActiveSessionModal.tsx # Live stopwatch modal for Study & Gym sessions
│   └── pages/
│       ├── DashboardView.tsx    # Daily summary, score ring, timeline & quick actions
│       ├── DailyPlanView.tsx    # Hourly schedule planner & task CRUD
│       ├── StudyView.tsx        # Subject logs, intensity metrics & study charts
│       ├── GymView.tsx          # Workout builder, volume calculations & session history
│       ├── ProgressView.tsx     # 6 interactive Recharts graphs & streak tracking
│       └── SettingsView.tsx     # Profile, goals, units, audio tests & JSON backup
```

---

## Local Setup & Development

To run LifeTrack locally on your machine:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```
