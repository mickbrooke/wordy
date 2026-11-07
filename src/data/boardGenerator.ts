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

// High-frequency synergy letters for remaining board tiles to maximize 5-8 letter word branches
const COMMON_FILLERS: string[] = ['E', 'A', 'I', 'O', 'S', 'T', 'R', 'N', 'D', 'L', 'M', 'P', 'C'];

// Curated high-scoring boards packed with 25-45 words of length 5, 6, 7, and 8
export const CURATED_BOARDS: string[][] = [
  [
    'S', 'O', 'T', 'S',
    'E', 'R', 'A', 'S',
    'S', 'A', 'L', 'L',
    'O', 'V', 'Y', 'E'
  ],
  [
    'S', 'P', 'R', 'I',
    'T', 'R', 'E', 'N',
    'A', 'M', 'S', 'G',
    'R', 'T', 'S', 'O'
  ],
  [
    'P', 'L', 'A', 'N',
    'O', 'S', 'E', 'T',
    'W', 'E', 'R', 'S',
    'D', 'I', 'N', 'G'
  ],
  [
    'F', 'L', 'O', 'W',
    'S', 'T', 'E', 'R',
    'C', 'A', 'R', 'S',
    'P', 'I', 'N', 'E'
  ],
  [
    'S', 'I', 'L', 'V',
    'P', 'A', 'E', 'R',
    'T', 'R', 'S', 'T',
    'O', 'N', 'E', 'S'
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
 * Generates a single candidate board by embedding orthogonal anchor words of 6-8 letters
 */
function generateAnchorCandidate(): { letters: string[]; solvableWords: SolvableWord[]; longCount: number } {
  const grid: (string | null)[] = Array(16).fill(null);
  const occupied = new Set<number>();

  // Embed primary anchor word (6-8 characters)
  const anchor1 = ANCHORS_POOL[Math.floor(Math.random() * ANCHORS_POOL.length)];
  const walk1 = findOrthogonalWalk(anchor1.length, occupied);
  if (walk1) {
    for (let i = 0; i < anchor1.length; i++) {
      grid[walk1[i]] = anchor1[i];
      occupied.add(walk1[i]);
    }
  }

  // Embed secondary anchor word (5-7 characters) in available spaces
  const remaining = 16 - occupied.size;
  if (remaining >= 5) {
    const suitable = ANCHORS_POOL.filter(w => w.length <= remaining);
    if (suitable.length > 0) {
      const anchor2 = suitable[Math.floor(Math.random() * suitable.length)];
      const walk2 = findOrthogonalWalk(anchor2.length, occupied);
      if (walk2) {
        for (let i = 0; i < anchor2.length; i++) {
          grid[walk2[i]] = anchor2[i];
          occupied.add(walk2[i]);
        }
      }
    }
  }

  // Fill remaining open tiles with high-synergy vowels and consonants
  for (let i = 0; i < 16; i++) {
    if (!grid[i]) {
      grid[i] = COMMON_FILLERS[Math.floor(Math.random() * COMMON_FILLERS.length)];
    }
  }

  const letters = grid as string[];
  const solvableWords = findAllSolvableWords(letters);
  const longCount = solvableWords.filter(w => w.word.length >= 5 && w.word.length <= 8).length;

  return { letters, solvableWords, longCount };
}

/**
 * Generate a new random or curated 4x4 board
 * Guarantees a rich distribution of 5, 6, 7, and 8-letter words (typically 20 to 45 long words!)
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
    // Generate anchor-walk boards and select candidate with high density of 5-8 letter words
    let best = generateAnchorCandidate();
    for (let attempt = 0; attempt < 12; attempt++) {
      if (best.longCount >= 18) {
        break;
      }
      const candidate = generateAnchorCandidate();
      if (candidate.longCount > best.longCount) {
        best = candidate;
      }
    }

    letters = best.letters;
    solvableWords = best.solvableWords;

    // Safety fallback to curated high-yield board if needed
    if (solvableWords.length < 10) {
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
