export interface TileCoord {
  row: number;
  col: number;
  index: number;
}

export interface BoardTile {
  id: number;
  letter: string;
  row: number;
  col: number;
}

export interface RareLetterDetail {
  letter: string;
  bonus: number;
  label: string;
}

export interface ScoreBreakdown {
  totalPoints: number;
  baseLengthPoints: number;
  wordLength: number;
  rareLetterBonus: number;
  rareLetters: RareLetterDetail[];
  speedBonus: number;
  speedTier: 'Lightning' | 'Quick' | 'Swift' | null;
  secondsTaken: number;
  streakBonus: number;
  streak: number;
}

export interface SolvableWord {
  word: string;
  paths: number[][]; // Each path is an array of tile indices [0-15]
  definition?: string;
  estimatedPoints?: number;
}

export interface FoundWordEntry {
  word: string;
  timestamp: number;
  points: number;
  scoreBreakdown: ScoreBreakdown;
  definition?: string;
  path: number[]; // Tile indices used when found
}

export type WordValidationStatus =
  | 'VALID'
  | 'INVALID_LENGTH'
  | 'NOT_IN_DICTIONARY'
  | 'ALREADY_FOUND';

export interface WordValidationResult {
  isValid: boolean;
  word: string;
  status: WordValidationStatus;
  message: string;
  definition?: string;
  scoreBreakdown?: ScoreBreakdown;
}

export type GameMode = 'relaxed' | 'timed' | 'target';

export type GameTheme = 'slate' | 'ivory' | 'emerald';

export interface GameStats {
  totalWordsFound: number;
  puzzlesPlayed: number;
  highScore: number;
  bestCombo: number;
}
