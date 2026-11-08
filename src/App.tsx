/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { BottomToolbar } from './components/BottomToolbar.tsx';
import { GameBoard } from './components/GameBoard.tsx';
import { WordListPanel } from './components/WordListPanel.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { WordDetailModal } from './components/WordDetailModal.tsx';
import { generateBoard } from './data/boardGenerator.ts';
import { validateWordSubmission, getWordDefinition } from './data/dictionary.ts';
import { calculateWordScore } from './utils/scoring.ts';
import { soundEffects } from './utils/audio.ts';
import { fireWordConfetti, fireMilestoneConfetti } from './utils/confetti.ts';
import {
  FoundWordEntry,
  GameTheme,
  BoardTile,
  SolvableWord,
  WordValidationResult,
  ScoreBreakdown
} from './types.ts';

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

  // Inspector & Interactive highlights
  const [highlightedPath, setHighlightedPath] = useState<number[] | null>(null);
  const [activeWordDetail, setActiveWordDetail] = useState<{
    word: string;
    definition?: string;
    scoreBreakdown?: ScoreBreakdown;
  } | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Synchronize dark theme class with document element
  useEffect(() => {
    if (theme === 'slate' || theme === 'emerald') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle start or reset of game board
  const startNewGame = useCallback(() => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    setFoundWords([]);
    setScore(0);
    setStreak(0);
    setLastWordTime(0);
    setHighlightedPath(null);
  }, []);

  const outstandingWords = useMemo(() => {
    const foundSet = new Set(foundWords.map(w => w.word));
    return board.solvableWords.filter(w => !foundSet.has(w.word));
  }, [board.solvableWords, foundWords]);

  // Compute active tile indices: at start of the game, ALL 16 letters are included.
  // As words are found, tiles remove when they are no longer in any outstanding words.
  const activeTileIndices = useMemo(() => {
    // At the start of the game (before any words are found), ALL 16 letters are guaranteed to be active
    if (foundWords.length === 0) {
      return new Set<number>(Array.from({ length: 16 }, (_, i) => i));
    }
    const set = new Set<number>();
    for (const word of outstandingWords) {
      for (const path of word.paths) {
        for (const tileIndex of path) {
          set.add(tileIndex);
        }
      }
    }
    return set;
  }, [outstandingWords, foundWords.length]);

  // Evaluate word when drawn - Validates using standard English dictionary & calculates scoring
  const handleWordCompleted = useCallback(
    (word: string, path: number[]): WordValidationResult => {
      const upper = word.toUpperCase();
      const foundWordsSet = new Set(foundWords.map(entry => entry.word));

      // 1. Validate submission against standard English dictionary (valid words ALWAYS work!)
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

      // Ensure the board's solvableWords includes this valid word so it counts and checks off
      setBoard(prev => {
        if (prev.solvableWords.some(w => w.word === upper)) {
          return prev;
        }
        return {
          ...prev,
          solvableWords: [
            ...prev.solvableWords,
            {
              word: upper,
              paths: [[...path]],
              definition: validation.definition || getWordDefinition(upper),
              estimatedPoints: pointsEarned,
            },
          ].sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word)),
        };
      });

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

      return {
        ...validation,
        scoreBreakdown
      };
    },
    [foundWords, lastWordTime, streak, board.solvableWords.length]
  );


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

  const [isCopied, setIsCopied] = useState(false);

  // Share Game with friends via Web Share API or Clipboard copy
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: 'QuadraWord - 4x4 Word Swipe Game',
      text: `Can you beat my score of ${score} pts on QuadraWord? Swipe letters to create words up to 16 letters long!`,
      url: shareUrl,
    };

    if (navigator.share && typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share aborted, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      window.prompt('Copy this link to share QuadraWord:', shareUrl);
    }
  };

  // Background styling according to theme
  const themeClasses: Record<GameTheme, string> = {
    slate: 'bg-slate-950 text-slate-100',
    emerald: 'bg-[#06241a] text-emerald-50',
    ivory: 'bg-stone-100 text-stone-900'
  };

  return (
    <div className={`min-h-screen flex flex-col font-body transition-colors duration-200 ${themeClasses[theme]}`}>
      {/* Minimal Top Brand Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-6 py-2 sm:py-4 pb-20 sm:pb-20 flex flex-col">
        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-6 items-start flex-1">
          {/* Left / Center Column: 4x4 Swipe Grid */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-2 xs:p-2.5 sm:p-5 bg-white/50 dark:bg-slate-900/60 rounded-xl sm:rounded-3xl border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm w-full">
            <GameBoard
              tiles={board.tiles}
              onWordCompleted={handleWordCompleted}
              highlightedPath={highlightedPath}
              onClearHighlight={() => setHighlightedPath(null)}
              activeTileIndices={activeTileIndices}
              outstandingWordsCount={outstandingWords.length}
              totalWordsCount={board.solvableWords.length}
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

      {/* Ergonomic Bottom Toolbar: New Board, Help, Theme, Sound, Share */}
      <BottomToolbar
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNewGame={startNewGame}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onShare={handleShare}
        isCopied={isCopied}
        theme={theme}
        onChangeTheme={setTheme}
      />

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
    </div>
  );
}
