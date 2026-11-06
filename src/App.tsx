/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { GameBoard } from './components/GameBoard.tsx';
import { WordListPanel } from './components/WordListPanel.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { WordDetailModal } from './components/WordDetailModal.tsx';
import { generateBoard } from './data/boardGenerator.ts';
import { validateWordSubmission, getWordDefinition } from './data/dictionary.ts';
import { calculateWordScore } from './utils/scoring.ts';
import { soundEffects } from './utils/audio.ts';
import { fireWordConfetti, fireMilestoneConfetti } from './utils/confetti.ts';
import {
  FoundWordEntry,
  GameMode,
  GameTheme,
  BoardTile,
  SolvableWord,
  WordValidationResult,
  ScoreBreakdown
} from './types.ts';
import { RotateCcw, Trophy, Zap, Star } from 'lucide-react';

export default function App() {
  // Board state
  const [board, setBoard] = useState<{
    tiles: BoardTile[];
    letters: string[];
    solvableWords: SolvableWord[];
  }>(() => generateBoard());

  // Game gameplay state
  const [foundWords, setFoundWords] = useState<FoundWordEntry[]>([]);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lastWordTime, setLastWordTime] = useState<number>(0);

  // Audio & Visual Theme
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEffects.isEnabled());
  const [theme, setTheme] = useState<GameTheme>('slate');

  // Mode & Timer
  const [mode, setMode] = useState<GameMode>('relaxed');
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimedGameOver, setIsTimedGameOver] = useState<boolean>(false);

  // Inspector & Interactive highlights
  const [highlightedPath, setHighlightedPath] = useState<number[] | null>(null);
  const [hintTileIndex, setHintTileIndex] = useState<number[] | null>(null);
  const [activeWordDetail, setActiveWordDetail] = useState<{
    word: string;
    definition?: string;
    scoreBreakdown?: ScoreBreakdown;
  } | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize dark theme class with document element
  useEffect(() => {
    if (theme === 'slate' || theme === 'emerald') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Timed mode countdown
  useEffect(() => {
    if (mode === 'timed' && isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsTimedGameOver(true);
            fireMilestoneConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, isTimerRunning, timeRemaining]);

  // Handle start or reset of game board
  const startNewGame = useCallback(() => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setFoundWords([]);
    setScore(0);
    setStreak(0);
    setLastWordTime(0);
    setHighlightedPath(null);
    setHintTileIndex(null);
    setIsTimedGameOver(false);

    if (mode === 'timed') {
      setTimeRemaining(120);
      setIsTimerRunning(true);
    }
  }, [mode]);

  // Change game mode
  const handleChangeMode = (newMode: GameMode) => {
    setMode(newMode);
    if (newMode === 'timed') {
      setTimeRemaining(120);
      setIsTimerRunning(true);
      setIsTimedGameOver(false);
    } else {
      setIsTimerRunning(false);
      setIsTimedGameOver(false);
    }
  };

  // Evaluate word when drawn - Validates using standard English dictionary & calculates scoring
  const handleWordCompleted = useCallback(
    (word: string, path: number[]): WordValidationResult => {
      const upper = word.toUpperCase();
      const foundWordsSet = new Set(foundWords.map(entry => entry.word));

      // 1. Validate submission against standard English 4-letter dictionary
      const validation = validateWordSubmission(upper, foundWordsSet);

      if (!validation.isValid) {
        if (validation.status === 'ALREADY_FOUND') {
          soundEffects.playAlreadyFound();
        } else {
          soundEffects.playInvalidWord();
          setStreak(0); // Reset combo on invalid word attempt
        }
        return validation;
      }

      // 2. Word is valid and not already collected! Calculate rich scoring
      const now = Date.now();
      const secondsSinceLastWord = lastWordTime > 0 ? (now - lastWordTime) / 1000 : 0;

      // Update combo streak: if found within 12 seconds of last word
      let currentStreak = streak;
      if (lastWordTime > 0 && secondsSinceLastWord <= 12) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }

      // Calculate points based on word length, rare letters, speed, and streak
      const scoreBreakdown = calculateWordScore(upper, secondsSinceLastWord, currentStreak);
      const pointsEarned = scoreBreakdown.totalPoints;

      const newEntry: FoundWordEntry = {
        word: upper,
        timestamp: now,
        points: pointsEarned,
        scoreBreakdown,
        definition: validation.definition || getWordDefinition(upper),
        path: [...path]
      };

      // ONLY valid words are added to the list!
      setFoundWords(prev => [newEntry, ...prev]);
      setScore(prev => prev + pointsEarned);
      setStreak(currentStreak);
      setLastWordTime(now);

      // Audio & Confetti feedback
      soundEffects.playWordSuccess();
      fireWordConfetti();

      // Milestone celebrations
      const updatedCount = foundWords.length + 1;
      if (
        updatedCount === 5 ||
        updatedCount === 10 ||
        updatedCount === 20 ||
        updatedCount === board.solvableWords.length
      ) {
        setTimeout(() => fireMilestoneConfetti(), 300);
      }

      // Start timer on first word in timed mode if not already started
      if (mode === 'timed' && !isTimerRunning && timeRemaining > 0 && !isTimedGameOver) {
        setIsTimerRunning(true);
      }

      return {
        ...validation,
        scoreBreakdown
      };
    },
    [foundWords, lastWordTime, streak, board.solvableWords.length, mode, isTimerRunning, timeRemaining, isTimedGameOver]
  );

  // Request a hint for an undiscovered word
  const handleRequestHint = useCallback(() => {
    const foundSet = new Set(foundWords.map(w => w.word));
    const undiscovered = board.solvableWords.filter(w => !foundSet.has(w.word));

    if (undiscovered.length === 0) {
      return;
    }

    // Pick a random undiscovered word
    const targetWord = undiscovered[Math.floor(Math.random() * undiscovered.length)];
    if (targetWord.paths.length > 0) {
      const targetPath = targetWord.paths[0];
      // Highlight the first tile of that word
      setHintTileIndex([targetPath[0]]);
      soundEffects.playSwipeStep(0);

      // Auto clear hint indicator after 3.5s
      setTimeout(() => {
        setHintTileIndex(null);
      }, 3500);
    }
  }, [foundWords, board.solvableWords]);

  // Toggle audio
  const handleToggleSound = () => {
    const enabled = soundEffects.toggleSound();
    setSoundEnabled(enabled);
  };

  // Select a word from the list to preview on the board
  const handleSelectWordForReplay = (path: number[]) => {
    setHighlightedPath(prev => {
      // Toggle off if clicking the same one again
      if (prev && prev.length === path.length && prev.every((v, i) => v === path[i])) {
        return null;
      }
      return path;
    });
  };

  // Open definition modal with scoring breakdown
  const handleOpenDefinition = (
    word: string,
    definition?: string,
    scoreBreakdown?: ScoreBreakdown
  ) => {
    setActiveWordDetail({
      word,
      definition: definition || getWordDefinition(word),
      scoreBreakdown
    });
  };

  // Background styling according to theme
  const themeClasses: Record<GameTheme, string> = {
    slate: 'bg-slate-950 text-slate-100',
    emerald: 'bg-[#06241a] text-emerald-50',
    ivory: 'bg-stone-100 text-stone-900'
  };

  return (
    <div className={`min-h-screen flex flex-col font-body transition-colors duration-200 ${themeClasses[theme]}`}>
      {/* Top Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNewGame={startNewGame}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        theme={theme}
        onChangeTheme={setTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-5 flex flex-col">
        {/* Game HUD (Score, Mode, Timer, Streak) */}
        <div className="mb-4">
          <GameHUD
            mode={mode}
            onChangeMode={handleChangeMode}
            wordsFoundCount={foundWords.length}
            totalSolvableCount={board.solvableWords.length}
            score={score}
            streak={streak}
            timeRemaining={timeRemaining}
            isTimerRunning={isTimerRunning}
            onRestartTimer={() => {
              setTimeRemaining(120);
              setIsTimerRunning(true);
              setIsTimedGameOver(false);
            }}
          />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left / Center Column: 4x4 Swipe Grid */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-3 sm:p-6 bg-white/50 dark:bg-slate-900/60 rounded-3xl border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm">
            <GameBoard
              tiles={board.tiles}
              onWordCompleted={handleWordCompleted}
              highlightedPath={highlightedPath}
              onClearHighlight={() => setHighlightedPath(null)}
              onRequestHint={handleRequestHint}
              hintTileIndex={hintTileIndex ? hintTileIndex[0] : null}
              onShuffleBoard={startNewGame}
            />
          </div>

          {/* Right Column: Discovered Words List */}
          <div className="lg:col-span-5 h-full">
            <WordListPanel
              foundWords={foundWords}
              solvableWords={board.solvableWords}
              onSelectWordForReplay={handleSelectWordForReplay}
              onOpenDefinition={handleOpenDefinition}
              activeReplayPath={highlightedPath}
              score={score}
            />
          </div>
        </div>
      </main>

      {/* Word Definition & Scoring Breakdown Modal */}
      <WordDetailModal
        word={activeWordDetail?.word || null}
        definition={activeWordDetail?.definition}
        scoreBreakdown={activeWordDetail?.scoreBreakdown}
        onClose={() => setActiveWordDetail(null)}
      />

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      {/* Timed Mode Game Over Modal */}
      {isTimedGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-1">
              Time&apos;s Up!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              2-Minute Blitz Round Complete
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-black/5 dark:border-white/5 space-y-2 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Words Discovered:</span>
                <strong className="font-mono-nums text-slate-900 dark:text-white text-base">
                  {foundWords.length}
                </strong>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Score:</span>
                <strong className="font-mono-nums text-amber-600 dark:text-amber-400 text-lg font-bold">
                  {score} pts
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTimedGameOver(false)}
                className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
              >
                Inspect Words
              </button>
              <button
                onClick={startNewGame}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
