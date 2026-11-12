export type SlidingGridSize = 3 | 4 | 5;
export type RuneThemeId = 'ARCANE' | 'NUMBERS' | 'CYBER';

const ARCANE_SYMBOLS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ',
  'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ',
  'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ',
];

const CYBER_SYMBOLS = [
  '01', '02', '03', '04', '05', '06', '07', '08',
  '09', '0A', '0B', '0C', '0D', '0E', '0F', '10',
  '11', '12', '13', '14', '15', '16', '17', '18',
];

export function getRuneLabel(tileId: number, theme: RuneThemeId): string {
  if (theme === 'ARCANE') {
    return ARCANE_SYMBOLS[tileId] ?? String(tileId + 1);
  }
  if (theme === 'CYBER') {
    return CYBER_SYMBOLS[tileId] ?? String(tileId + 1);
  }
  return String(tileId + 1);
}

export function getAdjacentIndices(
  emptyIdx: number,
  gridSize: SlidingGridSize
): number[] {
  const row = Math.floor(emptyIdx / gridSize);
  const col = emptyIdx % gridSize;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(emptyIdx - gridSize);
  if (row + 1 < gridSize) neighbors.push(emptyIdx + gridSize);
  if (col > 0) neighbors.push(emptyIdx - 1);
  if (col + 1 < gridSize) neighbors.push(emptyIdx + 1);

  return neighbors;
}

export function createShuffledBoard(gridSize: SlidingGridSize): number[] {
  const total = gridSize * gridSize;
  const emptyValue = total - 1;
  const board = Array.from({ length: total }, (_, idx) => idx);

  let emptyIdx = emptyValue;
  let lastEmptyIdx = -1;
  const shuffleSteps = gridSize * gridSize * 12;

  for (let step = 0; step < shuffleSteps; step += 1) {
    const candidates = getAdjacentIndices(emptyIdx, gridSize).filter(
      (n) => n !== lastEmptyIdx
    );
    const pick =
      candidates[Math.floor(Math.random() * candidates.length)] ?? emptyIdx;

    const temp = board[pick] ?? 0;
    board[pick] = emptyValue;
    board[emptyIdx] = temp;

    lastEmptyIdx = emptyIdx;
    emptyIdx = pick;
  }

  const alreadySolved = board.every((val, idx) => val === idx);
  if (alreadySolved && total >= 4) {
    const first = board[0] ?? 0;
    const second = board[1] ?? 1;
    board[0] = second;
    board[1] = first;
  }

  return board;
}

export function isSlidingBoardSolved(board: number[]): boolean {
  return board.every((val, idx) => val === idx);
}
