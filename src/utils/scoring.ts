import { ScoreBreakdown, RareLetterDetail } from '../types.ts';

// Letter rarity point values and tier labels
export const LETTER_RARITY_CONFIG: Record<string, { bonus: number; label: string }> = {
  Q: { bonus: 40, label: 'Ultra Rare' },
  Z: { bonus: 40, label: 'Ultra Rare' },
  J: { bonus: 30, label: 'Very Rare' },
  X: { bonus: 30, label: 'Very Rare' },
  K: { bonus: 20, label: 'Rare' },
  V: { bonus: 15, label: 'Uncommon' },
  W: { bonus: 15, label: 'Uncommon' },
  Y: { bonus: 15, label: 'Uncommon' },
  B: { bonus: 10, label: 'Moderate' },
  C: { bonus: 10, label: 'Moderate' },
  F: { bonus: 10, label: 'Moderate' },
  G: { bonus: 10, label: 'Moderate' },
  H: { bonus: 10, label: 'Moderate' },
  M: { bonus: 10, label: 'Moderate' },
  P: { bonus: 10, label: 'Moderate' },
  D: { bonus: 5, label: 'Standard' },
  L: { bonus: 5, label: 'Standard' },
  U: { bonus: 5, label: 'Standard' },
  // Common vowels & consonants: 0 bonus
  A: { bonus: 0, label: 'Common' },
  E: { bonus: 0, label: 'Common' },
  I: { bonus: 0, label: 'Common' },
  N: { bonus: 0, label: 'Common' },
  O: { bonus: 0, label: 'Common' },
  R: { bonus: 0, label: 'Common' },
  S: { bonus: 0, label: 'Common' },
  T: { bonus: 0, label: 'Common' },
};

/**
 * Calculate base points strictly based on word length
 */
export function getBaseLengthPoints(length: number): number {
  switch (length) {
    case 3:
      return 60;
    case 4:
      return 100;
    case 5:
      return 220;
    case 6:
      return 400;
    default:
      return length * 25;
  }
}

/**
 * Calculate full score breakdown including word length, rare letters, speed, and combo streak
 */
export function calculateWordScore(
  word: string,
  secondsSinceLastWord: number,
  streak: number
): ScoreBreakdown {
  const upper = word.toUpperCase();
  const wordLength = upper.length;

  // 1. Base points based on word length
  const baseLengthPoints = getBaseLengthPoints(wordLength);

  // 2. Bonus points for rarer letters
  const rareLetters: RareLetterDetail[] = [];
  let rareLetterBonus = 0;

  for (const char of upper) {
    const config = LETTER_RARITY_CONFIG[char] || { bonus: 0, label: 'Standard' };
    if (config.bonus > 0) {
      rareLetterBonus += config.bonus;
      rareLetters.push({
        letter: char,
        bonus: config.bonus,
        label: config.label,
      });
    }
  }

  // 3. Bonus points for finding words quickly
  let speedBonus = 0;
  let speedTier: 'Lightning' | 'Quick' | 'Swift' | null = null;

  if (secondsSinceLastWord > 0) {
    if (secondsSinceLastWord <= 3.0) {
      speedBonus = 50;
      speedTier = 'Lightning';
    } else if (secondsSinceLastWord <= 6.0) {
      speedBonus = 30;
      speedTier = 'Quick';
    } else if (secondsSinceLastWord <= 10.0) {
      speedBonus = 15;
      speedTier = 'Swift';
    }
  }

  // 4. Streak combo bonus
  let streakBonus = 0;
  if (streak >= 5) {
    streakBonus = 80;
  } else if (streak === 4) {
    streakBonus = 50;
  } else if (streak === 3) {
    streakBonus = 30;
  } else if (streak === 2) {
    streakBonus = 15;
  }

  const totalPoints = baseLengthPoints + rareLetterBonus + speedBonus + streakBonus;

  return {
    totalPoints,
    baseLengthPoints,
    wordLength,
    rareLetterBonus,
    rareLetters,
    speedBonus,
    speedTier,
    secondsTaken: Math.round(secondsSinceLastWord * 10) / 10,
    streakBonus,
    streak,
  };
}
