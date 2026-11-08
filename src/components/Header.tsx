import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-black/10 dark:border-white/10 px-3 sm:px-8 py-1.5 sm:py-2.5 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm sm:text-lg shadow-xs tracking-tight font-display">
            4
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight font-display leading-none text-slate-900 dark:text-white">
              QuadraWord
            </h1>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden xs:inline">
              4x4 Swipe Puzzle
            </span>
          </div>
        </div>

        {/* Quiet gameplay hint */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
          Swipe 4–16 letters (horizontal &amp; vertical)
        </div>
      </div>
    </header>
  );
};
