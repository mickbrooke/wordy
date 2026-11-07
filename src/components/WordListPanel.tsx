import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  Award,
  Zap,
  Star,
  HelpCircle,
  Check,
  XCircle
} from 'lucide-react';
import { FoundWordEntry, SolvableWord } from '../types.ts';
import { isValidWord, getWordDefinition } from '../data/dictionary.ts';

interface WordListPanelProps {
  foundWords: FoundWordEntry[];
  solvableWords: SolvableWord[];
  onSelectWordForReplay: (path: number[]) => void;
  onOpenDefinition: (word: string, def?: string, breakdown?: FoundWordEntry['scoreBreakdown']) => void;
  activeReplayPath: number[] | null;
  score: number;
}

export const WordListPanel: React.FC<WordListPanelProps> = ({
  foundWords,
  solvableWords,
  onSelectWordForReplay,
  onOpenDefinition,
  activeReplayPath,
  score
}) => {
  const [sortMode, setSortMode] = useState<'length' | 'score' | 'alpha'>('length');
  const [showAllSolvable, setShowAllSolvable] = useState<boolean>(false);
  const [showScoringGuide, setShowScoringGuide] = useState<boolean>(false);

  // Standalone word validator tester
  const [testWordInput, setTestWordInput] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    word: string;
    isValid: boolean;
    definition?: string;
  } | null>(null);

  const totalPossible = solvableWords.length;
  const foundCount = foundWords.length;
  const progressPercent = totalPossible > 0 ? Math.round((foundCount / totalPossible) * 100) : 0;

  // Sorted found words (Length, Top Pts, A - Z)
  const displayedWords = [...foundWords].sort((a, b) => {
    if (sortMode === 'score') {
      return b.points - a.points || b.word.length - a.word.length || a.word.localeCompare(b.word);
    }
    if (sortMode === 'alpha') {
      return a.word.localeCompare(b.word);
    }
    return b.word.length - a.word.length || b.points - a.points || a.word.localeCompare(b.word);
  });

  // Set of found word strings
  const foundWordsSet = new Set(foundWords.map(w => w.word));

  // Run test word verification
  const handleTestWordCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = testWordInput.trim().toUpperCase();
    if (clean.length === 0) return;

    const valid = isValidWord(clean);
    const def = getWordDefinition(clean);
    setTestResult({
      word: clean,
      isValid: valid,
      definition: def,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Panel Header & Metrics */}
      <div className="p-4 border-b border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-slate-850/50">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Words Discovered
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScoringGuide(prev => !prev)}
              title="View Scoring Rules & Bonus System"
              className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono-nums">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                {score}
              </span>
              <span>pts</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              Found <strong className="text-slate-900 dark:text-white font-mono-nums">{foundCount}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white font-mono-nums">{totalPossible}</strong> valid words
            </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono-nums">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Scoring Guide Dropdown */}
        <AnimatePresence>
          {showScoringGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-xs"
            >
              <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
                  <span>QuadraWord Scoring System</span>
                  <span className="text-[10px] uppercase tracking-wide">English Dictionary (4-16 L)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Word Length:</span>
                    <p>4 letters = 100 base pts, up to 6,500 pts for 16-letter board swipe!</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Rare Letter Bonus:</span>
                    <p>Q, Z (+40) · J, X (+30) · K (+20) · V, W, Y (+15) · B, C, P (+10)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Speed Bonus:</span>
                    <p>&lt;3s (+50) · &lt;6s (+30) · &lt;10s (+15)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Combo Streak:</span>
                    <p>Up to +80 pts for quick sequential words</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls: Sort Options */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
          {/* Segmented Sort Controls */}
          <div className="flex items-center p-0.5 bg-black/5 dark:bg-white/10 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSortMode('length')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                sortMode === 'length'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Length
            </button>
            <button
              onClick={() => setSortMode('score')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                sortMode === 'score'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top Pts
            </button>
            <button
              onClick={() => setSortMode('alpha')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                sortMode === 'alpha'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              A - Z
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-nums">
            {foundWords.length} {foundWords.length === 1 ? 'word' : 'words'}
          </span>
        </div>
      </div>

      {/* Words List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[260px] max-h-[380px] sm:max-h-[460px]">
        {foundWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4 text-slate-400">
            <Sparkles className="w-8 h-8 text-amber-400/60 mb-2" />
            <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
              No words discovered yet
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Swipe or tap 4 to 16 adjacent letters (horizontal & vertical) to create valid words. Longer words earn huge exponential bonus points!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayedWords.map((item) => {
              const isSelectedForReplay =
                activeReplayPath &&
                activeReplayPath.length === item.path.length &&
                activeReplayPath.every((val, i) => val === item.path[i]);

              const b = item.scoreBreakdown;

              return (
                <motion.div
                  key={`${item.word}-${item.timestamp}`}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isSelectedForReplay
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 shadow-sm'
                      : 'bg-slate-50/80 dark:bg-slate-800/60 border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15'
                  }`}
                >
                  {/* Word title & points breakdown */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-display font-extrabold text-base tracking-wider text-slate-900 dark:text-white">
                          {item.word}
                        </span>

                        {/* Length badge */}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded font-mono">
                          {item.word.length}L
                        </span>

                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono-nums">
                          +{item.points} pts
                        </span>

                        {/* Badges for rare letter or speed bonus */}
                        {b && b.rareLetterBonus > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded">
                            <Star className="w-2.5 h-2.5" />
                            +{b.rareLetterBonus} rare
                          </span>
                        )}

                        {b && b.speedBonus > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded">
                            <Zap className="w-2.5 h-2.5" />
                            +{b.speedBonus} speed
                          </span>
                        )}
                      </div>

                      {/* Definition preview or score breakdown text */}
                      {item.definition ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 truncate max-w-[170px] sm:max-w-[210px] mt-0.5">
                          {item.definition}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Base: {b?.baseLengthPoints || 100} pts · Standard dictionary word
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Show Path on Board & View Definition */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => onSelectWordForReplay(item.path)}
                      title="Highlight word path on the grid"
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelectedForReplay
                          ? 'bg-blue-500 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenDefinition(item.word, item.definition, item.scoreBreakdown)}
                      title="Word Definition & Point Breakdown"
                      className="p-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Revealed Solvable Words (Surrender/Inspector mode) */}
        {showAllSolvable && (
          <div className="mt-4 pt-4 border-t border-dashed border-black/15 dark:border-white/15">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Solvable Words ({solvableWords.length})
              </h4>
              <span className="text-[10px] text-slate-400">Validated by English dictionary</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {solvableWords.map((solvable) => {
                const isFound = foundWordsSet.has(solvable.word);
                return (
                  <button
                    key={solvable.word}
                    onClick={() => {
                      if (solvable.paths.length > 0) {
                        onSelectWordForReplay(solvable.paths[0]);
                      }
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                      isFound
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                        : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 hover:border-black/10'
                    }`}
                  >
                    <span className="font-bold tracking-wide">{solvable.word}</span>
                    <span className="text-[10px] font-mono-nums opacity-60">
                      {isFound ? '✓' : `${solvable.estimatedPoints || 100}p`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dictionary Word Validation Tester Section */}
      <div className="p-3 border-t border-black/10 dark:border-white/10 bg-slate-50/70 dark:bg-slate-850/70">
        <form onSubmit={handleTestWordCheck} className="flex items-center gap-2">
          <input
            type="text"
            maxLength={16}
            value={testWordInput}
            onChange={(e) => setTestWordInput(e.target.value.toUpperCase())}
            placeholder="Validate 4-16 letter word..."
            className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
          >
            Check Word
          </button>
        </form>

        {testResult && (
          <div
            className={`mt-2 p-2 rounded-lg text-[11px] flex items-start gap-1.5 ${
              testResult.isValid
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            }`}
          >
            {testResult.isValid ? (
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
            )}
            <div>
              <p className="font-semibold">
                &quot;{testResult.word}&quot; is {testResult.isValid ? 'a valid English word!' : 'NOT in the dictionary (4-16 letters).'}
              </p>
              {testResult.definition && (
                <p className="text-[10px] opacity-80 mt-0.5">{testResult.definition}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Summary & Reveal/Hide Solution Mode */}
      <div className="p-3 border-t border-black/10 dark:border-white/10 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {foundCount} of {totalPossible} collected
        </span>
        <button
          onClick={() => setShowAllSolvable(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
        >
          {showAllSolvable ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Full List</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal All {totalPossible} Words</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
