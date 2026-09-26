import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Target,
  Bell,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { UserSettings, IntensityLevel } from '../types';
import { soundEffects } from '../utils/audio';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetSeedData: () => void;
  onClearAllData: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetSeedData,
  onClearAllData,
  showToast,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme);
  const [dailyStudyGoal, setDailyStudyGoal] = useState(String(settings.dailyStudyGoalHours));
  const [weeklyStudyGoal, setWeeklyStudyGoal] = useState(String(settings.weeklyStudyGoalHours));
  const [weeklyWorkoutGoal, setWeeklyWorkoutGoal] = useState(String(settings.weeklyWorkoutGoalDays));
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(settings.weightUnit);
  const [defaultStudyIntensity, setDefaultStudyIntensity] = useState<IntensityLevel>(
    settings.defaultStudyIntensity
  );
  const [defaultWorkoutIntensity, setDefaultWorkoutIntensity] = useState<IntensityLevel>(
    settings.defaultWorkoutIntensity
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [soundChimeEnabled, setSoundChimeEnabled] = useState(settings.soundChimeEnabled);

  // Dialog states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSettings = {
      userName: userName.trim() || 'User',
      theme,
      dailyStudyGoalHours: parseFloat(dailyStudyGoal) || 4,
      weeklyStudyGoalHours: parseFloat(weeklyStudyGoal) || 25,
      weeklyWorkoutGoalDays: parseInt(weeklyWorkoutGoal, 10) || 5,
      weightUnit,
      defaultStudyIntensity,
      defaultWorkoutIntensity,
      notificationsEnabled,
      soundChimeEnabled,
    };
    onUpdateSettings(updated);
    showToast('Settings saved successfully', 'success');
  };

  const handleTestSound = () => {
    soundEffects.playSuccess();
    showToast('Sound effect played', 'info');
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Notifications are not supported in this browser', 'error');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('LifeTrack Notifications Enabled', {
        body: 'You will receive study and workout reminders right on time!',
        icon: '/favicon.ico',
      });
      setNotificationsEnabled(true);
      showToast('Notification permission granted', 'success');
    } else {
      showToast('Notification permission was denied or dismissed', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportData(content);
        if (success) {
          showToast('Data backup restored successfully', 'success');
        } else {
          showToast('Invalid backup file format', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-zinc-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          Customize personal goals, units, reminders, and data backups.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Profile & Identity Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-zinc-800">
            <User className="w-4 h-4 text-blue-400" />
            Personal Profile
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Your Name / Nickname
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Preferred Weight Unit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    weightUnit === 'kg'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Kilograms (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lbs')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    weightUnit === 'lbs'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Pounds (lbs)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Goals & Targets Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-zinc-800">
            <Target className="w-4 h-4 text-emerald-400" />
            Study & Workout Targets
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Daily Study Goal (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={dailyStudyGoal}
                onChange={(e) => setDailyStudyGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Weekly Study Goal (Hours)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={weeklyStudyGoal}
                onChange={(e) => setWeeklyStudyGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Weekly Gym Goal (Days)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={weeklyWorkoutGoal}
                onChange={(e) => setWeeklyWorkoutGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Default Study Intensity: {defaultStudyIntensity}/5
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as IntensityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDefaultStudyIntensity(lvl)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-colors ${
                      defaultStudyIntensity === lvl
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Default Workout Intensity: {defaultWorkoutIntensity}/5
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as IntensityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDefaultWorkoutIntensity(lvl)}
                    className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-colors ${
                      defaultWorkoutIntensity === lvl
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cues & Notifications */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-zinc-800">
            <Bell className="w-4 h-4 text-purple-400" />
            Notifications & Sound Feedback
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl">
              <div>
                <div className="text-sm font-medium text-white">Browser Notifications</div>
                <div className="text-xs text-zinc-400">
                  Optional reminders for planned study blocks and workouts.
                </div>
              </div>
              <button
                type="button"
                onClick={handleRequestNotificationPermission}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors min-h-[36px]"
              >
                Enable / Test
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl">
              <div>
                <div className="text-sm font-medium text-white">Timer Sound Chimes</div>
                <div className="text-xs text-zinc-400">
                  Acoustic chime when gym rest timer expires or sessions complete.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 min-h-[36px]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Chime</span>
                </button>
                <input
                  type="checkbox"
                  checked={soundChimeEnabled}
                  onChange={(e) => setSoundChimeEnabled(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors min-h-[44px]"
          >
            Save All Preferences
          </button>
        </div>
      </form>

      {/* 10. Data Storage, Export & Backup Management */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white pb-3 border-b border-zinc-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Data Backup & Privacy (Local Storage)
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          LifeTrack stores all your study logs, gym records, routines, and streaks locally in your
          browser. Your data never leaves your device. You can download an offline JSON backup at
          any time or restore it on any computer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Export */}
          <button
            type="button"
            onClick={onExportData}
            className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Data (JSON)</span>
          </button>

          {/* Import */}
          <label className="p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-colors min-h-[44px]">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Reset Seed Data */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-3 bg-zinc-950 hover:bg-zinc-800 text-amber-300 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            className="p-3 bg-zinc-950 hover:bg-zinc-800 text-red-400 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors min-h-[44px]"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset to Sample Data?"
        message="This will overwrite your current schedule and study/gym records with the standard rich 14-day sample dataset. Proceed?"
        confirmLabel="Reset Data"
        onConfirm={() => {
          onResetSeedData();
          setIsResetConfirmOpen(false);
          showToast('Sample dataset restored', 'info');
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Permanently Clear All Local Data?"
        message="Are you sure you want to erase all tasks, study sessions, workouts, and settings? This cannot be undone unless you have a backup."
        confirmLabel="Erase Everything"
        isDestructive={true}
        onConfirm={() => {
          onClearAllData();
          setIsClearConfirmOpen(false);
          showToast('All local data cleared', 'info');
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
