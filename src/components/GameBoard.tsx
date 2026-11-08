import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Lightbulb, Undo2, Zap, Star } from 'lucide-react';
import { BoardTile, WordValidationResult, ScoreBreakdown } from '../types.ts';
import { areNeighbors } from '../data/boardGenerator.ts';
import { soundEffects } from '../utils/audio.ts';
import { LETTER_RARITY_CONFIG } from '../utils/scoring.ts';

interface GameBoardProps {
  tiles: BoardTile[];
  onWordCompleted: (word: string, path: number[]) => WordValidationResult;
  highlightedPath: number[] | null;
  onClearHighlight: () => void;
  onRequestHint?: () => void;
  hintTileIndex?: number | null;
  hintMessage?: string | null;
  activeTileIndices?: Set<number>;
  outstandingWordsCount?: number;
  totalWordsCount?: number;
  onShuffleBoard: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface FloatingScoreData {
  id: number;
  word: string;
  points: number;
  breakdown: ScoreBreakdown;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  tiles,
  onWordCompleted,
  highlightedPath,
  onClearHighlight,
  onRequestHint,
  hintTileIndex,
  hintMessage,
  activeTileIndices,
  outstandingWordsCount,
  totalWordsCount,
  onShuffleBoard
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pointerPos, setPointerPos] = useState<Point | null>(null);
  const [tileCenters, setTileCenters] = useState<Point[]>([]);

  // Word validation and feedback status
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'idle' | 'success' | 'warning' | 'error';
    details?: string;
  }>({ text: 'Swipe 4 to 16 letters (horizontal & vertical) to form a word', type: 'idle' });

  // Floating score alert
  const [floatingScore, setFloatingScore] = useState<FloatingScoreData | null>(null);

  // Shake animation trigger for invalid/incomplete submissions
  const [shakeKey, setShakeKey] = useState<number>(0);

  // Recalculate tile center coordinates for the SVG path overlay
  const updateTileCenters = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const centers: Point[] = tileRefs.current.map((tileEl) => {
      if (!tileEl) return { x: 0, y: 0 };
      const tileRect = tileEl.getBoundingClientRect();
      return {
        x: tileRect.left + tileRect.width / 2 - containerRect.left,
        y: tileRect.top + tileRect.height / 2 - containerRect.top
      };
    });

    setTileCenters(centers);
  }, []);

  useEffect(() => {
    updateTileCenters();
    window.addEventListener('resize', updateTileCenters);
    return () => window.removeEventListener('resize', updateTileCenters);
  }, [updateTileCenters, tiles]);

  // Play subtle feedback sound when letter tiles are removed from play
  const prevActiveCount = useRef<number>(activeTileIndices ? activeTileIndices.size : 16);
  useEffect(() => {
    if (activeTileIndices) {
      if (activeTileIndices.size < prevActiveCount.current) {
        soundEffects.playClear();
      }
      prevActiveCount.current = activeTileIndices.size;
    }
  }, [activeTileIndices]);

  // Handle word evaluation and validation (4 to 16 characters)
  const evaluateWordPath = useCallback((path: number[]) => {
    if (path.length < 4 || path.length > 16) {
      if (path.length > 0) {
        setStatusMessage({
          text: path.length < 4 ? 'Word must be at least 4 letters' : 'Word cannot exceed 16 letters',
          type: 'warning',
          details: `${path.length} letters selected (need 4-16)`
        });
        soundEffects.playClear();
        setShakeKey(prev => prev + 1);
      }
      setSelectedPath([]);
      setPointerPos(null);
      return;
    }

    const word = path.map(idx => tiles[idx].letter).join('');
    const result = onWordCompleted(word, path);

    if (result.isValid && result.scoreBreakdown) {
      const { totalPoints, baseLengthPoints, rareLetterBonus, speedBonus, wordLength } = result.scoreBreakdown;
      let breakdownText = `+${totalPoints} pts (${wordLength} letters: ${baseLengthPoints} base`;
      if (rareLetterBonus > 0) breakdownText += ` + Rare: ${rareLetterBonus}`;
      if (speedBonus > 0) breakdownText += ` + ⚡Speed: ${speedBonus}`;
      breakdownText += ')';

      setStatusMessage({
        text: `"${word}" is valid! Added to list.`,
        type: 'success',
        details: breakdownText
      });

      setFloatingScore({
        id: Date.now(),
        word,
        points: totalPoints,
        breakdown: result.scoreBreakdown
      });

      setTimeout(() => setFloatingScore(null), 1400);
      setSelectedPath([]);
      setPointerPos(null);
    } else {
      if (result.status === 'ALREADY_FOUND') {
        setStatusMessage({
          text: `"${word}" is already in your word list!`,
          type: 'warning',
          details: 'Only new words score points'
        });
      } else if (result.status === 'NOT_IN_DICTIONARY') {
        setStatusMessage({
          text: `"${word}" is not in the English dictionary`,
          type: 'error',
          details: 'Only valid standard English words (4-16 letters) are accepted'
        });
      } else {
        setStatusMessage({
          text: result.message,
          type: 'error'
        });
      }

      setShakeKey(prev => prev + 1);
      setTimeout(() => {
        setSelectedPath([]);
        setPointerPos(null);
      }, 400);
    }
  }, [tiles, onWordCompleted]);

  // Pointer Down on a tile starts the swipe gesture
  const handleTilePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault();
    if (activeTileIndices && !activeTileIndices.has(index)) return;
    onClearHighlight();
    setIsDragging(true);
    setSelectedPath([index]);
    soundEffects.playSwipeStep(0);
    try {
      navigator.vibrate?.(10);
    } catch {
      // Ignore
    }

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setPointerPos({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }
  };

  // Global Pointer Move during active dragging
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - containerRect.left;
    const currentY = e.clientY - containerRect.top;
    setPointerPos({ x: currentX, y: currentY });

    // Detect hovered element under cursor/touch
    const targetElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const tileAttr = targetElement?.closest('[data-tile-index]')?.getAttribute('data-tile-index');

    if (tileAttr !== null && tileAttr !== undefined) {
      const targetIndex = parseInt(tileAttr, 10);
      if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= 16) return;
      if (activeTileIndices && !activeTileIndices.has(targetIndex)) return;

      setSelectedPath(prev => {
        // If selection was cleared or empty, start fresh path from target
        if (!prev || prev.length === 0) {
          return [targetIndex];
        }

        const lastIndex = prev[prev.length - 1];
        if (typeof lastIndex !== 'number' || isNaN(lastIndex)) {
          return [targetIndex];
        }

        // Same tile currently hovering
        if (lastIndex === targetIndex) return prev;

        // Backtrack / Undo previous step if dragging back to second-to-last tile
        if (prev.length >= 2 && prev[prev.length - 2] === targetIndex) {
          soundEffects.playClear();
          try {
            navigator.vibrate?.(6);
          } catch {
            // Ignore
          }
          return prev.slice(0, -1);
        }

        // Add next tile if adjacent, not already in path, and path length < 16
        if (!prev.includes(targetIndex) && areNeighbors(lastIndex, targetIndex)) {
          if (prev.length < 16) {
            const nextPath = [...prev, targetIndex];
            soundEffects.playSwipeStep(nextPath.length - 1);
            try {
              navigator.vibrate?.(12);
            } catch {
              // Ignore
            }

            // If maximum 16 tiles reached (full grid swipe!), auto complete and evaluate!
            if (nextPath.length === 16) {
              setIsDragging(false);
              setPointerPos(null);
              setTimeout(() => {
                evaluateWordPath(nextPath);
              }, 60);
            }

            return nextPath;
          }
        }

        return prev;
      });
    }
  }, [isDragging, evaluateWordPath]);

  // Pointer Up finishes swipe gesture and evaluates if >= 4 letters
  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);

    // If path is at least 4 letters, evaluate!
    if (selectedPath.length >= 4 && selectedPath.length <= 16) {
      evaluateWordPath(selectedPath);
    } else if (selectedPath.length > 0) {
      // Shorter than 4 letters, reset
      soundEffects.playClear();
      setSelectedPath([]);
      setStatusMessage({ text: 'Need at least 4 letters (horizontal & vertical)', type: 'idle' });
    }
  }, [isDragging, selectedPath, evaluateWordPath]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Accessible click-to-select for non-swipe users
  const handleTileClick = (index: number) => {
    if (isDragging) return; // Ignore if user was dragging
    if (activeTileIndices && !activeTileIndices.has(index)) return;
    onClearHighlight();

    setSelectedPath(prev => {
      // Deselect last tile if clicked again
      if (prev.length > 0 && prev[prev.length - 1] === index) {
        soundEffects.playClear();
        return prev.slice(0, -1);
      }

      // First tile
      if (prev.length === 0) {
        soundEffects.playSwipeStep(0);
        return [index];
      }

      // Adjacent tile
      const lastIndex = prev[prev.length - 1];
      if (!prev.includes(index) && areNeighbors(lastIndex, index)) {
        if (prev.length < 16) {
          const next = [...prev, index];
          soundEffects.playSwipeStep(next.length - 1);

          if (next.length === 16) {
            setTimeout(() => {
              evaluateWordPath(next);
            }, 100);
          }
          return next;
        }
      }

      // If clicked a disconnected tile, start fresh from that tile
      soundEffects.playSwipeStep(0);
      return [index];
    });
  };

  const activePath = highlightedPath || selectedPath;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Dynamic Hint Announcement Banner */}
      <AnimatePresence>
        {hintMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="w-full mb-3 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
              <span className="truncate">{hintMessage}</span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider shrink-0 ml-2 bg-amber-500/20 px-1.5 py-0.5 rounded">
              Long Word
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4x4 Grid Container */}
      <motion.div
        ref={containerRef}
        key={shakeKey}
        animate={shakeKey > 0 ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="relative w-full aspect-square p-2 sm:p-3 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-black/10 dark:border-white/15 shadow-inner touch-none backdrop-blur-sm"
      >
        {/* Floating status warning / error banner */}
        <AnimatePresence>
          {statusMessage.text && statusMessage.type !== 'idle' && statusMessage.type !== 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl shadow-lg text-xs font-semibold backdrop-blur-md border pointer-events-none whitespace-nowrap ${
                statusMessage.type === 'error'
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                  : 'bg-amber-950/90 text-amber-200 border-amber-500/40'
              }`}
            >
              {statusMessage.text}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Dynamic SVG Connection Line Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none w-full h-full z-10"
          style={{ overflow: 'visible' }}
        >
          {/* Connecting lines between selected tiles */}
          {activePath.length > 1 && tileCenters.length === 16 && (
            <>
              {/* Outer soft glow line */}
              <polyline
                points={activePath.map(i => `${tileCenters[i]?.x || 0},${tileCenters[i]?.y || 0}`).join(' ')}
                fill="none"
                stroke={highlightedPath ? '#3B82F6' : '#F59E0B'}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />
              {/* Crisp core line */}
              <polyline
                points={activePath.map(i => `${tileCenters[i]?.x || 0},${tileCenters[i]?.y || 0}`).join(' ')}
                fill="none"
                stroke={highlightedPath ? '#2563EB' : '#D97706'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Active laser line to the pointer while dragging */}
          {isDragging && pointerPos && activePath.length > 0 && activePath.length < 16 && tileCenters[activePath[activePath.length - 1]] && (
            <line
              x1={tileCenters[activePath[activePath.length - 1]].x}
              y1={tileCenters[activePath[activePath.length - 1]].y}
              x2={pointerPos.x}
              y2={pointerPos.y}
              stroke="#F59E0B"
              strokeWidth="5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity="0.7"
            />
          )}

          {/* Tile center dots */}
          {activePath.map((tileIdx, step) => {
            const center = tileCenters[tileIdx];
            if (!center) return null;
            return (
              <circle
                key={`dot-${tileIdx}`}
                cx={center.x}
                cy={center.y}
                r="7"
                fill="#FFFFFF"
                stroke={highlightedPath ? '#2563EB' : '#D97706'}
                strokeWidth="3.5"
              >
                <title>{`Step ${step + 1}`}</title>
              </circle>
            );
          })}
        </svg>

        {/* 4x4 Tiles Grid */}
        <div className="grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2.5 w-full h-full relative z-20">
          {tiles.map((tile, index) => {
            const stepOrder = activePath.indexOf(index);
            const isSelected = stepOrder !== -1;
            const isHint = hintTileIndex === index;
            const rarity = LETTER_RARITY_CONFIG[tile.letter]?.bonus || 0;
            const isRemoved = activeTileIndices ? !activeTileIndices.has(index) : false;
            const showForReplay = Boolean(highlightedPath && isSelected);

            if (isRemoved && !showForReplay) {
              return (
                <div
                  key={tile.id}
                  className="relative flex items-center justify-center rounded-xl sm:rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] pointer-events-none select-none transition-all duration-300 scale-95"
                  title="Tile cleared! Not in any outstanding word."
                >
                  <span className="text-black/15 dark:text-white/15 text-xs font-bold font-mono">
                    ✓
                  </span>
                </div>
              );
            }

            return (
              <div
                key={tile.id}
                ref={el => { tileRefs.current[index] = el; }}
                data-tile-index={index}
                onPointerDown={(e) => handleTilePointerDown(index, e)}
                onClick={() => handleTileClick(index)}
                className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md -translate-y-0.5 scale-102 ring-2 sm:ring-4 ring-amber-400/40 dark:ring-amber-500/30'
                    : isHint
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-2 border-amber-400 animate-pulse'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm hover:shadow hover:bg-slate-50 dark:hover:bg-slate-750 border border-black/5 dark:border-white/5 active:scale-95'
                }`}
              >
                {/* Rare letter point indicator badge in top right */}
                {rarity > 0 && !isSelected && (
                  <span
                    className={`absolute top-1 right-1 sm:top-1.5 sm:right-1.5 text-[9px] font-bold px-1 rounded-sm ${
                      rarity >= 30
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : rarity >= 20
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                    title={`Rarity bonus: +${rarity} pts`}
                  >
                    +{rarity}
                  </span>
                )}

                {/* Hint START indicator tag on top left */}
                {isHint && !isSelected && (
                  <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-amber-500 text-white text-[8px] font-black px-1 py-0.5 rounded shadow-xs flex items-center gap-0.5 animate-bounce">
                    <Lightbulb className="w-2.5 h-2.5" />
                    START
                  </span>
                )}

                {/* Step badge on selected tile */}
                {isSelected && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-amber-600 text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-sm">
                    {stepOrder + 1}
                  </span>
                )}

                {/* Tile Letter */}
                <span className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  {tile.letter}
                </span>

                {/* Subtle base value indicator */}
                <span className="absolute bottom-1 right-1.5 text-[9px] font-mono opacity-30 font-bold">
                  {rarity > 0 ? `+${rarity}` : '1'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Floating animated points celebration with full scoring breakdown */}
        <AnimatePresence>
          {floatingScore && (
            <motion.div
              key={floatingScore.id}
              initial={{ opacity: 0, y: 15, scale: 0.75 }}
              animate={{ opacity: 1, y: -45, scale: 1.05 }}
              exit={{ opacity: 0, y: -75 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none px-4 py-2.5 bg-slate-900/95 dark:bg-black/95 text-white rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md flex flex-col items-center"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-display font-extrabold text-xl tracking-wide text-emerald-400">
                  +{floatingScore.points} PTS
                </span>
                <span className="text-sm font-bold text-white tracking-wider">
                  {floatingScore.word}
                </span>
              </div>

              {/* Point Breakdown Subtitle */}
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300 mt-1">
                <span>Base: {floatingScore.breakdown.baseLengthPoints}</span>
                {floatingScore.breakdown.rareLetterBonus > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-purple-300 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" />
                      Rare: +{floatingScore.breakdown.rareLetterBonus}
                    </span>
                  </>
                )}
                {floatingScore.breakdown.speedBonus > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-amber-300 flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      Speed: +{floatingScore.breakdown.speedBonus}
                    </span>
                  </>
                )}
                {floatingScore.breakdown.streakBonus > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-300">
                      Streak: +{floatingScore.breakdown.streakBonus}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Board Cleared Celebration Modal Overlay */}
        <AnimatePresence>
          {activeTileIndices && activeTileIndices.size === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md rounded-2xl text-center text-white"
            >
              <Sparkles className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
              <h3 className="font-display font-black text-2xl text-amber-400 mb-1">
                Board Cleared!
              </h3>
              <p className="text-sm text-slate-300 mb-4 max-w-xs">
                You found all {totalWordsCount || 20} target words and cleared every tile!
              </p>
              <button
                onClick={onShuffleBoard}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Play Next Board
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Grid Utility Bar: Clear path, Submit Word, Active Tiles Progress, Hint button */}
      {/* Bottom Controls / Actions (only rendered when user is actively swiping or previewing) */}
      {(selectedPath.length > 0 || highlightedPath) && (
        <div className="flex items-center justify-center gap-2 w-full mt-2.5 px-0.5 text-xs">
          {selectedPath.length >= 4 && !highlightedPath && (
            <button
              onClick={() => evaluateWordPath(selectedPath)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer min-h-[36px] shadow-sm active:scale-95 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Submit ({selectedPath.length}L)</span>
            </button>
          )}

          {selectedPath.length > 0 && (
            <button
              onClick={() => {
                soundEffects.playClear();
                setSelectedPath([]);
                setStatusMessage({ text: 'Selection cleared', type: 'idle' });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer min-h-[36px]"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {highlightedPath && (
            <button
              onClick={onClearHighlight}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors cursor-pointer font-medium min-h-[36px]"
            >
              <span>Stop Preview</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
