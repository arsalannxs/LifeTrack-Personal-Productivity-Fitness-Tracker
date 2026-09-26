import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Bell } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface RestTimerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const RestTimerWidget: React.FC<RestTimerWidgetProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(90); // default 90 seconds
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) {
              soundEffects.playTimerDone();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, soundEnabled]);

  const handleStartPreset = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = selectedDuration > 0 ? ((selectedDuration - timeLeft) / selectedDuration) * 100 : 0;

  return (
    <div className="fixed bottom-20 right-4 sm:right-8 z-40 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-4 w-72 text-zinc-100 backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold tracking-wide uppercase text-zinc-300">
            Rest Interval
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-md"
          aria-label="Close rest timer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center my-3">
        <div className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-orange-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[45, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            onClick={() => handleStartPreset(sec)}
            className={`py-1 text-xs font-mono font-medium rounded-lg transition-colors min-h-[36px] ${
              selectedDuration === sec && isRunning
                ? 'bg-orange-500 text-white font-bold'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[40px] transition-colors ${
            isRunning
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-orange-600 text-white hover:bg-orange-500'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Start
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
