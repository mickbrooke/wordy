import React from 'react';
import { Zap, Trophy, BookOpen } from 'lucide-react';

interface GameHUDProps {
  wordsFoundCount: number;
  totalSolvableCount?: number;
  score: number;
  streak: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  wordsFoundCount,
  totalSolvableCount,
  score,
  streak
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-2.5 py-1 px-0.5 text-xs sm:text-sm font-medium">
      {/* Words Count */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300">
        <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Words Found:</span>
        <strong className="text-slate-900 dark:text-white font-mono-nums text-sm font-bold">
          {wordsFoundCount}
          {totalSolvableCount ? ` / ${totalSolvableCount}` : ''}
        </strong>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Meter */}
        {streak > 1 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>{streak}x Combo</span>
          </div>
        )}

        {/* Total Score */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300">
          <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Score:</span>
          <strong className="text-amber-600 dark:text-amber-400 font-mono-nums text-sm font-bold">
            {score} pts
          </strong>
        </div>
      </div>
    </div>
  );
};

