import React from 'react';
import { X, BookOpen, ExternalLink, Sparkles, Star, Zap } from 'lucide-react';
import { ScoreBreakdown } from '../types.ts';

interface WordDetailModalProps {
  word: string | null;
  definition?: string;
  scoreBreakdown?: ScoreBreakdown;
  onClose: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  definition,
  scoreBreakdown,
  onClose
}) => {
  if (!word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Word Title & Badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-2xl tracking-wider text-slate-900 dark:text-white">
              {word}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Valid 4-Letter English Word
            </span>
          </div>
        </div>

        {/* Scoring Breakdown Breakdown Box */}
        {scoreBreakdown && (
          <div className="my-3 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
              <span>Scoring Breakdown</span>
              <span className="font-mono-nums text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {scoreBreakdown.totalPoints} pts
              </span>
            </div>

            <div className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
              <div className="flex justify-between items-center">
                <span>Word Length (4 letters):</span>
                <span className="font-mono-nums font-semibold">
                  +{scoreBreakdown.baseLengthPoints} pts
                </span>
              </div>

              {scoreBreakdown.rareLetterBonus > 0 && (
                <div className="flex justify-between items-center text-purple-700 dark:text-purple-300">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Rare Letters (
                    {scoreBreakdown.rareLetters.map(r => `${r.letter}: +${r.bonus}`).join(', ')}
                    ):
                  </span>
                  <span className="font-mono-nums font-bold">
                    +{scoreBreakdown.rareLetterBonus} pts
                  </span>
                </div>
              )}

              {scoreBreakdown.speedBonus > 0 && (
                <div className="flex justify-between items-center text-amber-700 dark:text-amber-300">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Speed Bonus ({scoreBreakdown.speedTier} · {scoreBreakdown.secondsTaken}s):
                  </span>
                  <span className="font-mono-nums font-bold">
                    +{scoreBreakdown.speedBonus} pts
                  </span>
                </div>
              )}

              {scoreBreakdown.streakBonus > 0 && (
                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300">
                  <span>Combo Streak ({scoreBreakdown.streak}x):</span>
                  <span className="font-mono-nums font-bold">
                    +{scoreBreakdown.streakBonus} pts
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Word Definition */}
        <div className="my-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-black/5 dark:border-white/5">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
            Definition
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {definition || 'A recognized 4-letter English word valid in word puzzle games.'}
          </p>
        </div>

        {/* Footer info & Wiktionary link */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Standard English Dictionary</span>
          </div>
          <a
            href={`https://en.wiktionary.org/wiki/${word.toLowerCase()}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Wiktionary</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
