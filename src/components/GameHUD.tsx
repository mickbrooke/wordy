import React from 'react';
import { Timer, Zap, Trophy } from 'lucide-react';
import { GameMode } from '../types.ts';

interface GameHUDProps {
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  wordsFoundCount: number;
  totalSolvableCount: number;
  score: number;
  streak: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  onRestartTimer: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  onChangeMode,
  wordsFoundCount,
  score,
  streak,
  timeRemaining,
  isTimerRunning,
  onRestartTimer
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 py-2 px-1 text-sm">
      {/* Mode Selector Tabs */}
      <div className="flex items-center p-1 bg-black/5 dark:bg-white/10 rounded-xl">
        <button
          onClick={() => onChangeMode('relaxed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'relaxed'
              ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Relaxed Mode
        </button>
        <button
          onClick={() => onChangeMode('timed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            mode === 'timed'
              ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Timer className="w-3.5 h-3.5 text-amber-500" />
          <span>Timed (2 Min)</span>
        </button>
      </div>

      {/* Metrics & Status */}
      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
        {/* Blitz Countdown Timer */}
        {mode === 'timed' && (
          <div className="flex items-center gap-1.5">
            <Timer className={`w-4 h-4 ${timeRemaining <= 15 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
            <span className={`font-mono-nums font-bold text-sm ${timeRemaining <= 15 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
            {!isTimerRunning && timeRemaining === 0 && (
              <button
                onClick={onRestartTimer}
                className="ml-1 text-[11px] underline text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Play Again
              </button>
            )}
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          </div>
        )}

        {/* Streak Meter */}
        {streak > 1 && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>{streak}x Combo</span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          </div>
        )}

        {/* Words Count */}
        <div className="flex items-center gap-1.5">
          <span>Words:</span>
          <strong className="text-slate-900 dark:text-white font-mono-nums text-sm">
            {wordsFoundCount}
          </strong>
        </div>

        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>

        {/* Total Score */}
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Score:</span>
          <strong className="text-slate-900 dark:text-white font-mono-nums text-sm">
            {score}
          </strong>
        </div>
      </div>
    </div>
  );
};
