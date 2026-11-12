export const GRID_SIZE = 16;

export const PIXEL_PALETTE = [
  '#0f172a',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#a16207',
  '#94a3b8',
];

export function createEmptyGrid(): string[] {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => '');
}

export function floodFillGrid(
  grid: string[],
  startIdx: number,
  replacementColor: string
): string[] {
  const targetColor = grid[startIdx] ?? '';
  if (targetColor === replacementColor) return grid;

  const next = [...grid];
  const stack = [startIdx];

  while (stack.length > 0) {
    const idx = stack.pop();
    if (idx === undefined) continue;
    if ((next[idx] ?? '') !== targetColor) continue;

    next[idx] = replacementColor;
    const x = idx % GRID_SIZE;
    const y = Math.floor(idx / GRID_SIZE);

    if (x > 0) stack.push(idx - 1);
    if (x + 1 < GRID_SIZE) stack.push(idx + 1);
    if (y > 0) stack.push(idx - GRID_SIZE);
    if (y + 1 < GRID_SIZE) stack.push(idx + GRID_SIZE);
  }

  return next;
}

export async function renderPixelGridToPngFile(
  grid: string[],
  spriteName: string
): Promise<File | null> {
  const scale = 16;
  const canvas = document.createElement('canvas');
  canvas.width = GRID_SIZE * scale;
  canvas.height = GRID_SIZE * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  grid.forEach((color, idx) => {
    if (!color) return;
    const x = (idx % GRID_SIZE) * scale;
    const y = Math.floor(idx / GRID_SIZE) * scale;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, scale, scale);
  });

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) return null;

  const cleanFileName =
    spriteName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-') || 'pixel-sprite';

  return new File([blob], `${cleanFileName}.png`, { type: 'image/png' });
}
