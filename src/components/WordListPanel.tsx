import React, { useState, useMemo } from 'react';
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
  const [showAllSolvable, setShowAllSolvable] = useState<boolean>(false);
  const [showScoringGuide, setShowScoringGuide] = useState<boolean>(false);

  // Standalone word validator tester
  const [testWordInput, setTestWordInput] = useState<string>('');
  const [testResult, setTestResult] = useState<{
    word: string;
    isValid: boolean;
    definition?: string;
  } | null>(null);

  // Map of discovered words by word string
  const foundMap = useMemo(() => {
    return new Map(foundWords.map(f => [f.word, f]));
  }, [foundWords]);

  // Unified list of all target words on this board, combining pre-indexed solvableWords with any discovered valid words
  const allTargetWords = useMemo(() => {
    const list = [...solvableWords];
    const existing = new Set(solvableWords.map(w => w.word));
    for (const f of foundWords) {
      if (!existing.has(f.word)) {
        list.push({
          word: f.word,
          paths: [f.path],
          definition: f.definition,
          estimatedPoints: f.points,
        });
      }
    }
    // Keep sorted by word length descending, then alphabetical
    return list.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word));
  }, [solvableWords, foundWords]);

  const totalPossible = allTargetWords.length;
  const foundCount = foundWords.length;
  const progressPercent = totalPossible > 0 ? Math.round((foundCount / totalPossible) * 100) : 0;

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
                  <span className="text-[10px] uppercase tracking-wide">Common English Words (4-16 L)</span>
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

      </div>

      {/* Words List Container with Placeholders */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[260px] max-h-[380px] sm:max-h-[460px]">
        {allTargetWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4 text-slate-400">
            <Sparkles className="w-8 h-8 text-amber-400/60 mb-2" />
            <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">
              No words on this board
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {allTargetWords.map((target) => {
              const foundEntry = foundMap.get(target.word);
              const isFound = Boolean(foundEntry);

              // 1. Discovered / Found Word: Fills into tile-shaped placeholders matching main grid!
              if (isFound && foundEntry) {
                const isSelectedForReplay =
                  activeReplayPath &&
                  activeReplayPath.length === foundEntry.path.length &&
                  activeReplayPath.every((val, i) => val === foundEntry.path[i]);

                const b = foundEntry.scoreBreakdown;

                return (
                  <motion.div
                    key={target.word}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all gap-2 ${
                      isSelectedForReplay
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 shadow-sm'
                        : 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07] border-emerald-500/25 hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Word tile container & details */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      
                      {/* Length badge */}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded font-mono shrink-0">
                        {foundEntry.word.length}L
                      </span>

                      {/* Letter Tiles matching the main grid characters */}
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 shrink-0 max-w-[150px] xs:max-w-[190px] sm:max-w-[240px]">
                        {foundEntry.word.split('').map((char, charIdx) => (
                          <div
                            key={charIdx}
                            className={`w-6 h-7 sm:w-7 sm:h-8 rounded-md sm:rounded-lg font-display font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 select-none shadow-2xs border transition-all ${
                              isSelectedForReplay
                                ? 'bg-blue-500 text-white border-blue-600 scale-102'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-black/10 dark:border-white/10'
                            }`}
                          >
                            {char}
                          </div>
                        ))}
                      </div>

                      {/* Points badge & bonuses */}
                      <div className="flex items-center gap-1 shrink-0 flex-wrap">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono-nums">
                          +{foundEntry.points}
                        </span>

                        {b && b.rareLetterBonus > 0 && (
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded">
                            <Star className="w-2.5 h-2.5" />
                            +{b.rareLetterBonus}
                          </span>
                        )}

                        {b && b.speedBonus > 0 && (
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded">
                            <Zap className="w-2.5 h-2.5" />
                            +{b.speedBonus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Show Path on Board & View Definition */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onSelectWordForReplay(foundEntry.path)}
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
                        onClick={() => onOpenDefinition(foundEntry.word, foundEntry.definition, foundEntry.scoreBreakdown)}
                        title="Word Definition & Point Breakdown"
                        className="p-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              }

              // 2. Unfound Word: Revealed Mode (Surrender / Inspector mode)
              if (showAllSolvable) {
                return (
                  <motion.div
                    key={target.word}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300 gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                      
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded font-mono shrink-0">
                        {target.word.length}L
                      </span>

                      {/* Revealed Letter Tiles */}
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 shrink-0 max-w-[150px] xs:max-w-[190px] sm:max-w-[240px]">
                        {target.word.split('').map((char, charIdx) => (
                          <div
                            key={charIdx}
                            className="w-6 h-7 sm:w-7 sm:h-8 rounded-md sm:rounded-lg font-display font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 select-none shadow-2xs border bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-500/30"
                          >
                            {char}
                          </div>
                        ))}
                      </div>

                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono-nums shrink-0">
                        +{target.estimatedPoints || 100}
                      </span>
                    </div>

                    {target.paths.length > 0 && (
                      <button
                        onClick={() => onSelectWordForReplay(target.paths[0])}
                        title="Show path on board"
                        className="p-1.5 rounded-lg text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                );
              }

              // 3. Unfound Word: Tile-shaped placeholders matching main grid character tiles!
              return (
                <motion.div
                  key={target.word}
                  layout
                  className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-slate-400 gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-4 h-4 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    </div>

                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-mono shrink-0">
                      {target.word.length}L
                    </span>

                    {/* Mystery tile placeholders shaped identically to main grid character tiles */}
                    <div
                      className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 shrink-0 max-w-[150px] xs:max-w-[190px] sm:max-w-[240px]"
                      aria-label={`${target.word.length} letters mystery tiles`}
                    >
                      {Array.from({ length: target.word.length }).map((_, slotIdx) => (
                        <div
                          key={slotIdx}
                          className="w-6 h-7 sm:w-7 sm:h-8 rounded-md sm:rounded-lg border-2 border-dashed border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-800/40 shadow-2xs flex items-center justify-center shrink-0 select-none"
                        >
                          <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 select-none">
                            ?
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 shrink-0">
                    ~{target.estimatedPoints || 100} pts
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
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
                &quot;{testResult.word}&quot; is {testResult.isValid ? 'a valid common English word!' : 'NOT a recognized common English word.'}
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
          {foundCount} of {totalPossible} words found
        </span>
        <button
          onClick={() => setShowAllSolvable(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
        >
          {showAllSolvable ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Unfound Words</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Reveal All Words</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
