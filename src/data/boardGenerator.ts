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
  'GOLDEN', 'STREET', 'TRAINS', 'BREAD',  'HEARTS', 'WATERS', 'BEAUTY', 'TRAVEL',
  'WONDER', 'NATURE', 'ISLAND', 'FOREST', 'PRINCE', 'CLOUDS', 'WINTER', 'AUTUMN',
  'MARKET', 'VALLEY', 'DESERT', 'BRIDGE', 'SHADOW', 'SPIRIT', 'WINDOW', 'POCKET',
  'POINTS', 'GARDEN', 'PLATES', 'STANDS', 'STARE',  'PLANTS', 'SPARKS', 'FRIEND',
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

// Curated high-yield boards consisting purely of COMMON words (13 to 17 words) and covering ALL 16 tiles
export const CURATED_BOARDS: string[][] = [
  // Board 0: 17 common words (GARDENER, GARDEN, GARNER, EARNED, DEAR, DRAG, EARN, GAPS, GEAR, GEMS, HARE, HEAP, HEAR, HEARD, MEGA, PAGE, RAGE)
  [
    'R', 'E', 'N', 'E',
    'A', 'H', 'R', 'D',
    'E', 'G', 'A', 'E',
    'M', 'S', 'P', 'H'
  ],
  // Board 1: 13 common words (PLANET, PLANE, PLAN, TENOR, PRONE, PROOF, ROOF, SEEN, SOON, TEEN, TEES, LANE, NEAL)
  [
    'N', 'E', 'A', 'L',
    'T', 'E', 'N', 'P',
    'E', 'E', 'O', 'R',
    'T', 'S', 'O', 'F'
  ],
  // Board 2: 17 common words (STATION, STABLE, TABLET, TABLETS, TABLE, INTENT, INTEL, STEIN, TENT, STAT, STAB, LETS, LENT, NETS, BATS, ABLE, NITE)
  [
    'N', 'T', 'S', 'S',
    'I', 'E', 'L', 'T',
    'T', 'N', 'B', 'A',
    'E', 'O', 'I', 'T'
  ],
  // Board 3: 15 common words (ESTATE, STATION, STATE, STEEL, TEASE, YEAST, ANTI, ANTE, EASE, EAST, LEST, STAT, TATE, TEAS, TEES)
  [
    'I', 'Y', 'L', 'T',
    'T', 'E', 'E', 'E',
    'N', 'A', 'S', 'T',
    'O', 'I', 'T', 'A'
  ],
  // Board 4: 16 common words (ISLAND, AISLE, TENTS, TENT, TONE, TONS, NOTE, NEAT, SONS, TENS, LENS, LENT, LEAD, LAND, ISLE, INNS)
  [
    'N', 'I', 'A', 'N',
    'N', 'S', 'L', 'D',
    'T', 'N', 'E', 'A',
    'S', 'O', 'T', 'T'
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
 * Generates a single candidate board by embedding orthogonal anchor words
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

  // Embed secondary anchor word (5-7 characters) in remaining available spaces
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
 * Guarantees that at the start of the game, ALL 16 letters are included in active play,
 * with at most 20 words and rich 5 to 8-letter words.
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
    // Generate anchor-walk boards and select candidate with ALL 16 tiles covered and <= 20 words
    let bestCandidate: { letters: string[]; solvableWords: SolvableWord[]; coveredTiles: number } | null = null;

    for (let attempt = 0; attempt < 60; attempt++) {
      const candidate = generateAnchorCandidate();
      // Ideal target: ALL 16 tiles covered and between 10 and 20 total words on the entire board
      if (candidate.coveredTiles === 16 && candidate.solvableWords.length >= 10 && candidate.solvableWords.length <= MAX_BOARD_WORDS) {
        bestCandidate = candidate;
        break;
      } else if (candidate.coveredTiles === 16 && !bestCandidate) {
        // Covers all 16 tiles, words can be clamped with selectBoardSolvableWords preserving all 16 tiles
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      letters = bestCandidate.letters;
      solvableWords = bestCandidate.solvableWords.length <= MAX_BOARD_WORDS
        ? bestCandidate.solvableWords
        : selectBoardSolvableWords(bestCandidate.solvableWords);
    } else {
      // Pick a random curated board (all 5 curated boards cover 100% of the 16 tiles with 13-18 words)
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
