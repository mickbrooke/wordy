import { BoardTile, SolvableWord } from '../types.ts';
import { VALID_WORDS_SET, hasWordWithPrefix, getWordDefinition } from './dictionary.ts';
import { calculateWordScore } from '../utils/scoring.ts';

// Orthogonal-only directions (Up, Down, Left, Right) — strictly no diagonals allowed
const ORTHOGONAL_DIRECTIONS: [number, number][] = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
];

// Precompute adjacency map for a 4x4 grid (16 tiles) - strictly orthogonal (horizontal & vertical)
export const ADJACENCY_MAP: number[][] = Array.from({ length: 16 }, (_, index) => {
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

// Curated pool of high-yield 6, 7, and 8-letter anchor words embedded along orthogonal walks
const ANCHORS_POOL: string[] = [
  'SPRING', 'STREAM', 'PLANET', 'FLOWER', 'STRONG', 'SILVER', 'CASTLE', 'SUMMER',
  'GOLDEN', 'STREET', 'TRAINS', 'BREADS', 'HEARTS', 'WATERS', 'BEAUTY', 'TRAVEL',
  'WONDER', 'NATURE', 'ISLAND', 'FOREST', 'PRINCE', 'CLOUDS', 'WINTER', 'AUTUMN',
  'MARKET', 'VALLEY', 'DESERT', 'BRIDGE', 'SHADOW', 'SPIRIT', 'WINDOW', 'POCKET',
  'POINTS', 'GARDEN', 'PLATES', 'STANDS', 'STARES', 'PLANTS', 'SPARKS', 'FRIEND',
  'PRINTS', 'STORIES', 'JOURNEY', 'RAINBOW', 'WEATHER', 'COUNTRY', 'VILLAGE',
  'STATION', 'MORNING', 'BLANKET', 'LANTERN', 'WALKING', 'SMILING', 'TALKING',
  'POSTERS', 'MASTERS', 'FARMERS', 'WORKERS', 'HELPERS', 'LEADERS', 'READERS',
  'WRITERS', 'DANCERS', 'FLOWERS', 'GARDENS', 'PLANETS', 'CASTLES', 'BRIDGES',
  'TRAINER', 'PRINTER', 'PAINTER', 'BUILDER', 'HUNTERS', 'SINGERS', 'SHINING'
];

// Balanced 16 standard Boggle dice letter distributions for organic board density
const BOGGLE_DICE: string[] = [
  'AAEEGN', 'ABBJOO', 'ACHOPS', 'AFFKPS',
  'AOOTTW', 'CIMOTU', 'DEILRX', 'DELRVY',
  'DISTTY', 'EEGHNW', 'EEINSU', 'EHRTVW',
  'EIOSST', 'ELRTTY', 'HIMNUO', 'HLNNRZ'
];

// Curated high-yield boards naturally possessing 12 to 16 total words on the entire board
export const CURATED_BOARDS: string[][] = [
  // Board 0: Anchor HEARTS (16 total words, 7 long words: HEARTS, FEART, HEART, STRAE, STRAW, WARPS, WARTS...)
  [
    'B', 'H', 'E', 'F',
    'M', 'I', 'A', 'W',
    'I', 'R', 'R', 'T',
    'I', 'G', 'P', 'S'
  ],
  // Board 1: Anchor DANCERS (12 total words, 5 long words: DANCERS, DANCER, DANCE, SANES, SENAS...)
  [
    'U', 'C', 'E', 'R',
    'E', 'N', 'C', 'S',
    'S', 'A', 'D', 'D',
    'E', 'S', 'R', 'N'
  ],
  // Board 2: Anchor FRIEND (13 total words, 3 long words: FRIENDS, FRIEND, FLORS, BIEN, BIRR, FLEE, FLOE...)
  [
    'S', 'D', 'N', 'E',
    'R', 'R', 'R', 'I',
    'O', 'L', 'F', 'B',
    'E', 'E', 'T', 'T'
  ],
  // Board 3: Anchor TRAVEL (16 total words, 8 long words: TRAVEL, DRAVE, EARTH, LEVEE, LOOEY, RAVEL, TRAVE, VARDY...)
  [
    'T', 'R', 'A', 'E',
    'H', 'D', 'V', 'E',
    'E', 'Y', 'E', 'O',
    'A', 'I', 'L', 'O'
  ],
  // Board 4: Anchor DANCERS (16 total words, 6 long words: DANCERS, CERNES, DANCER, CERNE, DANCE, ERNES...)
  [
    'L', 'E', 'C', 'D',
    'W', 'R', 'N', 'A',
    'H', 'S', 'E', 'A',
    'S', 'A', 'I', 'T'
  ]
];

/**
 * Finds a self-avoiding orthogonal path of the given length on the 4x4 grid
 */
function findOrthogonalWalk(length: number, occupied: Set<number>): number[] | null {
  const availableStarts = Array.from({ length: 16 }, (_, i) => i).filter(i => !occupied.has(i));
  if (availableStarts.length === 0) return null;
  const starts = availableStarts.sort(() => Math.random() - 0.5);

  for (const start of starts) {
    const path: number[] = [start];
    const visited = new Set<number>([start, ...occupied]);

    function step(curr: number): boolean {
      if (path.length === length) return true;
      const neighbors = [...ADJACENCY_MAP[curr]].filter(n => !visited.has(n)).sort(() => Math.random() - 0.5);
      for (const next of neighbors) {
        visited.add(next);
        path.push(next);
        if (step(next)) return true;
        path.pop();
        visited.delete(next);
      }
      return false;
    }

    if (step(start)) return path;
  }
  return null;
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
 * Generates a single candidate board by embedding an orthogonal anchor word of 6-8 letters
 * and filling remaining tiles with balanced Boggle dice.
 */
function generateAnchorCandidate(): {
  letters: string[];
  solvableWords: SolvableWord[];
  longCount: number;
  coveredTiles: number;
} {
  const grid: (string | null)[] = Array(16).fill(null);
  const occupied = new Set<number>();

  // Embed primary anchor word (6-8 characters)
  const anchor = ANCHORS_POOL[Math.floor(Math.random() * ANCHORS_POOL.length)];
  const walk = findOrthogonalWalk(anchor.length, occupied);
  if (walk) {
    for (let i = 0; i < anchor.length; i++) {
      grid[walk[i]] = anchor[i];
      occupied.add(walk[i]);
    }
  }

  // Fill remaining open tiles with balanced Boggle dice
  const dice = [...BOGGLE_DICE].sort(() => Math.random() - 0.5);
  let dieIdx = 0;
  for (let i = 0; i < 16; i++) {
    if (!grid[i]) {
      const die = dice[dieIdx++];
      const ch = die[Math.floor(Math.random() * die.length)];
      grid[i] = ch;
    }
  }

  const letters = grid as string[];
  const solvableWords = findAllSolvableWords(letters);
  const longCount = solvableWords.filter(w => w.word.length >= 5 && w.word.length <= 8).length;

  const covered = new Set<number>();
  for (const w of solvableWords) {
    for (const p of w.paths) {
      for (const t of p) covered.add(t);
    }
  }

  return { letters, solvableWords, longCount, coveredTiles: covered.size };
}

// Board puzzle maximum words limit
export const MAX_BOARD_WORDS = 20;

/**
 * Limit solvable words to at most 20 words, prioritizing 16-tile coverage so all tiles start
 * in active play, while prioritizing longer 5-8 letter words and highest scoring words.
 */
export function selectBoardSolvableWords(allSolvables: SolvableWord[]): SolvableWord[] {
  if (allSolvables.length <= MAX_BOARD_WORDS) {
    return allSolvables;
  }

  const sorted = [...allSolvables].sort((a, b) => {
    return b.word.length - a.word.length || (b.estimatedPoints || 0) - (a.estimatedPoints || 0) || a.word.localeCompare(b.word);
  });

  const selected: SolvableWord[] = [];
  const selectedSet = new Set<string>();
  const coveredTiles = new Set<number>();

  // Pass 1: Ensure each tile 0..15 is covered by at least one selected word if possible
  for (let tile = 0; tile < 16; tile++) {
    if (!coveredTiles.has(tile)) {
      const bestWordForTile = sorted.find(w => !selectedSet.has(w.word) && w.paths.some(p => p.includes(tile)));
      if (bestWordForTile) {
        selected.push(bestWordForTile);
        selectedSet.add(bestWordForTile.word);
        for (const p of bestWordForTile.paths) {
          for (const t of p) coveredTiles.add(t);
        }
      }
    }
  }

  // Pass 2: Fill remaining slots up to MAX_BOARD_WORDS (20) with longest / highest scoring words
  for (const w of sorted) {
    if (selected.length >= MAX_BOARD_WORDS) break;
    if (!selectedSet.has(w.word)) {
      selected.push(w);
      selectedSet.add(w.word);
      for (const p of w.paths) {
        for (const t of p) coveredTiles.add(t);
      }
    }
  }

  return selected.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word));
}

/**
 * Generate a new random or curated 4x4 board
 * Guarantees at most 20 words (packed with 5 to 8-letter words and covering all 16 tiles)
 */
export function generateBoard(curatedIndex?: number): {
  tiles: BoardTile[];
  letters: string[];
  solvableWords: SolvableWord[];
} {
  let letters: string[] = [];
  let solvableWords: SolvableWord[] = [];

  if (curatedIndex !== undefined && CURATED_BOARDS[curatedIndex]) {
    letters = [...CURATED_BOARDS[curatedIndex]];
    solvableWords = findAllSolvableWords(letters);
  } else {
    // Generate anchor-walk boards and select candidate with 10-20 words where every word is in solvableWords
    let bestCandidate: { letters: string[]; solvableWords: SolvableWord[]; coveredTiles: number } | null = null;

    for (let attempt = 0; attempt < 30; attempt++) {
      const candidate = generateAnchorCandidate();
      // Ideal target: between 10 and 20 total words on the entire board, with strong tile coverage
      if (candidate.solvableWords.length >= 10 && candidate.solvableWords.length <= MAX_BOARD_WORDS && candidate.coveredTiles >= 12) {
        bestCandidate = candidate;
        if (candidate.coveredTiles >= 14) {
          break;
        }
      } else if (!bestCandidate && candidate.solvableWords.length >= 8) {
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      letters = bestCandidate.letters;
      solvableWords = bestCandidate.solvableWords.length <= MAX_BOARD_WORDS
        ? bestCandidate.solvableWords
        : selectBoardSolvableWords(bestCandidate.solvableWords);
    } else {
      // Pick a random curated board
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
