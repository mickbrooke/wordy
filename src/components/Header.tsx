import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Palette, Share2, Check } from 'lucide-react';
import { GameTheme } from '../types.ts';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewGame: () => void;
  onOpenHowToPlay: () => void;
  onShare: () => void;
  isCopied?: boolean;
  theme: GameTheme;
  onChangeTheme: (theme: GameTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onNewGame,
  onOpenHowToPlay,
  onShare,
  isCopied = false,
  theme,
  onChangeTheme
}) => {
  const nextTheme: Record<GameTheme, GameTheme> = {
    slate: 'emerald',
    emerald: 'ivory',
    ivory: 'slate'
  };

  const themeLabels: Record<GameTheme, string> = {
    slate: 'Midnight Slate',
    emerald: 'Forest Felt',
    ivory: 'Warm Sandstone'
  };

  return (
    <header className="w-full border-b border-black/10 dark:border-white/10 px-4 sm:px-8 py-3.5 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-sm tracking-tight font-display">
            4
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display leading-none text-slate-900 dark:text-white">
              QuadraWord
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block mt-0.5">
              4x4 Word Swipe Puzzle
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation / Info */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={onOpenHowToPlay}
            className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Play</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Swipe 4 letters (horizontal &amp; vertical only) to collect words
          </span>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onChangeTheme(nextTheme[theme])}
            title={`Switch Theme: current ${themeLabels[theme]}`}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline capitalize">{theme}</span>
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-2 rounded-lg border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="md:hidden p-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer"
            aria-label="Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Share Button with Copied Feedback */}
          <button
            onClick={onShare}
            title="Share QuadraWord with friends"
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          <button
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Board</span>
          </button>
        </div>
      </div>
    </header>
  );
};
