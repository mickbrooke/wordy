import React from 'react';
import { RotateCcw, HelpCircle, Palette, Volume2, VolumeX, Share2, Check } from 'lucide-react';
import { GameTheme } from '../types.ts';

interface BottomToolbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewGame: () => void;
  onOpenHowToPlay: () => void;
  onShare: () => void;
  isCopied?: boolean;
  theme: GameTheme;
  onChangeTheme: (theme: GameTheme) => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
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
    slate: 'Slate',
    emerald: 'Felt',
    ivory: 'Ivory'
  };

  return (
    <nav
      aria-label="Game Controls"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-black/10 dark:border-white/10 shadow-lg px-2 sm:px-6 py-1.5 sm:py-2 transition-colors"
    >
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around gap-1 sm:gap-3">
        {/* New Board Action */}
        <button
          onClick={onNewGame}
          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-white bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all rounded-lg sm:rounded-xl shadow-xs font-semibold text-[10px] sm:text-xs cursor-pointer min-h-[40px] sm:min-h-[38px] shrink-0"
          title="Start a new game board with new letters"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>New Board</span>
        </button>

        {/* How to Play / Rules */}
        <button
          onClick={onOpenHowToPlay}
          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium cursor-pointer min-h-[40px] sm:min-h-[38px]"
          title="How to play instructions"
        >
          <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Help</span>
        </button>

        {/* Theme Picker */}
        <button
          onClick={() => onChangeTheme(nextTheme[theme])}
          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium cursor-pointer min-h-[40px] sm:min-h-[38px]"
          title={`Switch Theme: current ${themeLabels[theme]}`}
        >
          <Palette className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="capitalize">{themeLabels[theme]}</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium cursor-pointer min-h-[40px] sm:min-h-[38px]"
          title={soundEnabled ? 'Mute Game Sound' : 'Enable Game Sound'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span>{soundEnabled ? 'Sound' : 'Muted'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onShare}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all cursor-pointer min-h-[40px] sm:min-h-[38px] active:scale-95 border ${
            isCopied
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          title="Share QuadraWord with friends"
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
