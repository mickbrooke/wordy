import words from 'an-array-of-english-words';

// Full standard English dictionary of words from 5 to 16 characters (official TWL / Webster / Scrabble list)
export const FIVE_LETTER_WORDS: string[] = [];
export const SIX_LETTER_WORDS: string[] = [];
export const SEVEN_LETTER_WORDS: string[] = [];
export const EIGHT_PLUS_LETTER_WORDS: string[] = [];

for (const w of words) {
  const len = w.length;
  if (len >= 5 && len <= 16) {
    const upper = w.toUpperCase();
    if (len === 5) {
      FIVE_LETTER_WORDS.push(upper);
    } else if (len === 6) {
      SIX_LETTER_WORDS.push(upper);
    } else if (len === 7) {
      SEVEN_LETTER_WORDS.push(upper);
    } else {
      EIGHT_PLUS_LETTER_WORDS.push(upper);
    }
  }
}
