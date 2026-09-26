import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Dumbbell,
  LineChart,
  Settings as SettingsIcon,
  Play,
  Pause,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ActiveTimer } from '../../types';

export type NavTab = 'dashboard' | 'daily-plan' | 'study' | 'gym' | 'progress' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeTimer: ActiveTimer | null;
  onOpenTimerModal: () => void;
  onToggleTimerRunning: () => void;
  timerElapsedFormatted: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeTimer,
  onOpenTimerModal,
  onToggleTimerRunning,
  timerElapsedFormatted,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily-plan' as NavTab, label: 'Daily Plan', icon: CalendarDays },
    { id: 'study' as NavTab, label: 'Study', icon: BookOpen },
    { id: 'gym' as NavTab, label: 'Gym', icon: Dumbbell },
    { id: 'progress' as NavTab, label: 'Progress', icon: LineChart },
    { id: 'settings' as NavTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Desktop / Tablet Top Navigation Bar (compliant with Top Bar Contract) */}
      <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left font-bold text-lg sm:text-xl tracking-tight text-white hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              LifeTrack
            </button>
          </div>

          {/* Zone 2: Clean navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
                    isActive
                      ? 'bg-zinc-800/90 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            {activeTimer ? (
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono">
                <button
                  onClick={onOpenTimerModal}
                  className="flex items-center gap-1.5 text-zinc-200 hover:text-white transition-colors"
                  title="Click to view ongoing session"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeTimer.type === 'study' ? 'bg-blue-400' : 'bg-orange-400'
                    } ${activeTimer.isRunning ? 'animate-ping' : ''}`}
                  />
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
                    {activeTimer.type}:
                  </span>
                  <span className="text-white tabular-nums font-medium">
                    {timerElapsedFormatted}
                  </span>
                </button>

                <button
                  onClick={onToggleTimerRunning}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors ml-1"
                  aria-label={activeTimer.isRunning ? 'Pause' : 'Resume'}
                >
                  {activeTimer.isRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={onOpenTimerModal}
                  className="p-1 hover:bg-emerald-950/50 text-emerald-400 rounded transition-colors"
                  title="Complete session"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center text-xs text-zinc-400 tabular-nums">
                <Clock className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                <span>Ready to track</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Banner for Mobile when Active Timer is Running */}
      {activeTimer && (
        <div className="md:hidden sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs">
          <button
            onClick={onOpenTimerModal}
            className="flex items-center gap-2 text-zinc-200 font-mono"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeTimer.type === 'study' ? 'bg-blue-400' : 'bg-orange-400'
              } ${activeTimer.isRunning ? 'animate-ping' : ''}`}
            />
            <span className="font-semibold text-zinc-300 capitalize">{activeTimer.type}:</span>
            <span className="text-white tabular-nums font-bold text-sm">
              {timerElapsedFormatted}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTimerRunning}
              className="px-2.5 py-1 bg-zinc-800 rounded text-zinc-200 text-xs font-medium"
            >
              {activeTimer.isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={onOpenTimerModal}
              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-medium"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Constitution) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 pb-safe">
        <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors relative ${
                  isActive ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap truncate max-w-[54px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
