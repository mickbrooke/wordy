import { BoardTile, SolvableWord } from '../types.ts';
import { VALID_WORDS_SET, hasWordWithPrefix, getWordDefinition } from './dictionary.ts';

// Standard 16 Boggle-style dice for balanced, high-yield English letter grids
const BOGGLE_DICE: string[][] = [
  ['A', 'A', 'E', 'E', 'G', 'N'],
  ['A', 'B', 'B', 'J', 'O', 'O'],
  ['A', 'C', 'H', 'O', 'P', 'S'],
  ['A', 'F', 'F', 'K', 'P', 'S'],
  ['A', 'O', 'O', 'T', 'T', 'W'],
  ['C', 'I', 'M', 'O', 'T', 'U'],
  ['D', 'E', 'I', 'L', 'R', 'X'],
  ['D', 'E', 'L', 'R', 'V', 'Y'],
  ['D', 'I', 'S', 'T', 'T', 'Y'],
  ['E', 'E', 'G', 'H', 'N', 'W'],
  ['E', 'E', 'I', 'N', 'S', 'U'],
  ['E', 'H', 'R', 'T', 'V', 'W'],
  ['E', 'I', 'O', 'S', 'S', 'T'],
  ['E', 'L', 'R', 'T', 'T', 'Y'],
  ['H', 'I', 'M', 'N', 'U', 'K'],
  ['H', 'L', 'N', 'N', 'R', 'Z'],
];

// Curated high-scoring seeds with lots of fun 4-letter words
const CURATED_BOARDS: string[][] = [
  [
    'S', 'T', 'A', 'R',
    'P', 'O', 'E', 'T',
    'L', 'I', 'N', 'E',
    'D', 'E', 'A', 'R'
  ],
  [
    'C', 'A', 'R', 'D',
    'O', 'P', 'E', 'N',
    'O', 'S', 'T', 'E',
    'L', 'I', 'F', 'E'
  ],
  [
    'W', 'I', 'S', 'H',
    'O', 'R', 'D', 'E',
    'R', 'O', 'A', 'D',
    'K', 'I', 'N', 'G'
  ],
  [
    'B', 'O', 'A', 'T',
    'L', 'O', 'V', 'E',
    'U', 'C', 'K', 'S',
    'E', 'A', 'S', 'Y'
  ],
  [
    'F', 'I', 'R', 'E',
    'L', 'A', 'M', 'P',
    'O', 'N', 'E', 'S',
    'W', 'A', 'L', 'K'
  ]
];

import { calculateWordScore } from '../utils/scoring.ts';

// Orthogonal-only directions (Up, Down, Left, Right) — strictly no diagonals allowed
const ORTHOGONAL_DIRECTIONS: [number, number][] = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
];

// Precompute adjacency map for a 4x4 grid (16 tiles) - strictly orthogonal (horizontal & vertical)
const ADJACENCY_MAP: number[][] = Array.from({ length: 16 }, (_, index) => {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const neighbors: number[] = [];

  for (const [dr, dc] of ORTHOGONAL_DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
      neighbors.push(nr * 4 + nc);
    }
  }
  return neighbors;
});

export function areNeighbors(
  index1: number | undefined | null,
  index2: number | undefined | null
): boolean {
  if (
    typeof index1 !== 'number' ||
    typeof index2 !== 'number' ||
    Number.isNaN(index1) ||
    Number.isNaN(index2) ||
    index1 < 0 ||
    index1 >= 16 ||
    index2 < 0 ||
    index2 >= 16
  ) {
    return false;
  }
  const neighbors = ADJACENCY_MAP[index1];
  return Boolean(neighbors && neighbors.includes(index2));
}

/**
 * Depth-First-Search with prefix-pruning to find all legal words (4 to 16 characters)
 * on the current board using strictly horizontal and vertical paths (no diagonals)
 */
export function findAllSolvableWords(letters: string[]): SolvableWord[] {
  const wordPathsMap = new Map<string, number[][]>();

  function dfs(currIndex: number, currentWord: string, visitedPath: number[]) {
    // Prefix pruning: If no word in dictionary starts with currentWord, stop immediately!
    if (!hasWordWithPrefix(currentWord)) {
      return;
    }

    // If word is valid length (4 to 16 letters) and in dictionary, add to solvable map
    if (visitedPath.length >= 4 && visitedPath.length <= 16) {
      if (VALID_WORDS_SET.has(currentWord)) {
        if (!wordPathsMap.has(currentWord)) {
          wordPathsMap.set(currentWord, []);
        }
        wordPathsMap.get(currentWord)!.push([...visitedPath]);
      }
    }

    // Stop exploring once full 16-tile board length reached
    if (visitedPath.length === 16) {
      return;
    }

    const neighbors = ADJACENCY_MAP[currIndex];
    for (const neighbor of neighbors) {
      if (!visitedPath.includes(neighbor)) {
        visitedPath.push(neighbor);
        dfs(neighbor, currentWord + letters[neighbor], visitedPath);
        visitedPath.pop();
      }
    }
  }

  for (let i = 0; i < 16; i++) {
    dfs(i, letters[i], [i]);
  }

  const results: SolvableWord[] = [];
  wordPathsMap.forEach((paths, word) => {
    const baseScore = calculateWordScore(word, 0, 1).totalPoints;
    results.push({
      word,
      paths,
      definition: getWordDefinition(word),
      estimatedPoints: baseScore
    });
  });

  // Sort by length descending, then alphabetically
  return results.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word));
}

/**
 * Generate a new random or curated 4x4 board
 * Guarantees at least 15 solvable 4-letter words
 */
export function generateBoard(curatedIndex?: number): {
  tiles: BoardTile[];
  letters: string[];
  solvableWords: SolvableWord[];
} {
  let letters: string[] = [];
  let solvableWords: SolvableWord[] = [];
  let attempts = 0;

  if (curatedIndex !== undefined && CURATED_BOARDS[curatedIndex]) {
    letters = [...CURATED_BOARDS[curatedIndex]];
    solvableWords = findAllSolvableWords(letters);
  } else {
    // Generate board using dice shuffle and check word density
    while (attempts < 80) {
      attempts++;
      // Shuffle dice order
      const diceCopy = [...BOGGLE_DICE].sort(() => Math.random() - 0.5);
      // Pick random face from each die
      letters = diceCopy.map(die => die[Math.floor(Math.random() * die.length)]);

      solvableWords = findAllSolvableWords(letters);

      // Target rich boards with at least 8 orthogonal words
      if (solvableWords.length >= 8) {
        break;
      }
    }

    // Fallback if random attempts were low
    if (solvableWords.length < 8) {
      const fallback = CURATED_BOARDS[Math.floor(Math.random() * CURATED_BOARDS.length)];
      letters = [...fallback];
      solvableWords = findAllSolvableWords(letters);
    }
  }

  const tiles: BoardTile[] = letters.map((letter, index) => ({
    id: index,
    letter,
    row: Math.floor(index / 4),
    col: index % 4
  }));

  return { tiles, letters, solvableWords };
}
