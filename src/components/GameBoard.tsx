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
  onRequestHint: () => void;
  hintTileIndex: number | null;
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
  hintTileIndex
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
  }>({ text: 'Swipe 4 letters (horizontal & vertical) to form a word', type: 'idle' });

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

  // Handle word evaluation and validation
  const evaluateWordPath = useCallback((path: number[]) => {
    if (path.length !== 4) {
      if (path.length > 0) {
        setStatusMessage({
          text: 'Word must be exactly 4 letters',
          type: 'warning',
          details: `${path.length}/4 letters drawn`
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
      const { totalPoints, baseLengthPoints, rareLetterBonus, speedBonus } = result.scoreBreakdown;
      let breakdownText = `+${totalPoints} pts (Base: ${baseLengthPoints}`;
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
          text: `"${word}" is not in the standard English dictionary`,
          type: 'error',
          details: 'Only valid standard 4-letter words are accepted'
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

        // Add next tile if adjacent, not already in path, and path length < 4
        if (!prev.includes(targetIndex) && areNeighbors(lastIndex, targetIndex)) {
          if (prev.length < 4) {
            const nextPath = [...prev, targetIndex];
            soundEffects.playSwipeStep(nextPath.length - 1);
            try {
              navigator.vibrate?.(12);
            } catch {
              // Ignore
            }

            // If 4 letters reached, complete swipe and evaluate!
            if (nextPath.length === 4) {
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

  // Pointer Up finishes swipe gesture
  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);

    // If path was 4, it may have already evaluated or evaluate now
    if (selectedPath.length === 4) {
      evaluateWordPath(selectedPath);
    } else if (selectedPath.length > 0) {
      // Shorter than 4 letters, reset
      soundEffects.playClear();
      setSelectedPath([]);
      setStatusMessage({ text: 'Swipe 4 letters (horizontal & vertical) to form a word', type: 'idle' });
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
        if (prev.length < 4) {
          const next = [...prev, index];
          soundEffects.playSwipeStep(next.length - 1);

          if (next.length === 4) {
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
  const currentLetters = activePath.map(i => tiles[i]?.letter || '').join('');

  // Calculate live rare letter bonus for the currently selected path
  const currentRareBonus = activePath.reduce((acc, idx) => {
    const letter = tiles[idx]?.letter;
    return acc + (LETTER_RARITY_CONFIG[letter]?.bonus || 0);
  }, 0);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Word Composition Ribbon & Live Scoring */}
      <div className="w-full mb-3.5">
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.35 }}
          className={`flex flex-col gap-1.5 px-4 py-2.5 rounded-xl border transition-colors ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/40'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 dark:border-rose-500/40'
              : statusMessage.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 dark:border-amber-500/40'
              : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Current 4-letter slots with rare letter indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const letter = currentLetters[slotIdx];
                const rarity = letter ? LETTER_RARITY_CONFIG[letter]?.bonus || 0 : 0;

                return (
                  <div key={slotIdx} className="flex flex-col items-center">
                    <div
                      className={`relative w-9 h-10 sm:w-10 sm:h-11 rounded-lg flex items-center justify-center font-display text-xl sm:text-2xl font-bold transition-all ${
                        letter
                          ? 'bg-amber-500 text-white shadow-sm scale-105'
                          : 'border-2 border-dashed border-black/15 dark:border-white/20 text-transparent'
                      }`}
                    >
                      {letter || '•'}
                      {letter && rarity > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-purple-600 text-[9px] font-extrabold text-white rounded-full shadow-xs">
                          +{rarity}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live point preview & letter count */}
            <div className="text-right pl-2">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="font-mono-nums">{activePath.length}/4</span>
                <span>letters</span>
                {activePath.length === 4 && (
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold font-mono-nums">
                    (100{currentRareBonus > 0 ? ` +${currentRareBonus} rare` : ''} pts)
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] truncate max-w-[150px] sm:max-w-[180px] ${
                  statusMessage.type === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : statusMessage.type === 'error'
                    ? 'text-rose-600 dark:text-rose-400 font-medium'
                    : statusMessage.type === 'warning'
                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {statusMessage.text}
              </p>
            </div>
          </div>

          {/* Secondary validation details line */}
          {statusMessage.details && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-1">
              <span>{statusMessage.details}</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Standard English Dictionary
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* 4x4 Grid Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square p-2.5 sm:p-3 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-black/10 dark:border-white/15 shadow-inner touch-none backdrop-blur-sm"
      >
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
          {isDragging && pointerPos && activePath.length > 0 && activePath.length < 4 && tileCenters[activePath[activePath.length - 1]] && (
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
        <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-2.5 w-full h-full relative z-20">
          {tiles.map((tile, index) => {
            const stepOrder = activePath.indexOf(index);
            const isSelected = stepOrder !== -1;
            const isHint = hintTileIndex === index;
            const rarity = LETTER_RARITY_CONFIG[tile.letter]?.bonus || 0;

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
      </div>

      {/* Grid Utility Bar: Clear path, Hint button, Replay state */}
      <div className="flex items-center justify-between w-full mt-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          {selectedPath.length > 0 && (
            <button
              onClick={() => {
                soundEffects.playClear();
                setSelectedPath([]);
                setStatusMessage({ text: 'Selection cleared', type: 'idle' });
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {highlightedPath && (
            <button
              onClick={onClearHighlight}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors cursor-pointer font-medium"
            >
              <span>Stop Preview</span>
            </button>
          )}
        </div>

        <button
          onClick={onRequestHint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium transition-colors cursor-pointer ml-auto"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Need a Hint?</span>
        </button>
      </div>
    </div>
  );
};
