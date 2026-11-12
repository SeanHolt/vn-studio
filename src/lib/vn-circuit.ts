import { CircuitTile } from "./vn-schema";

export type CircuitThemeId =
  | "SCIFI_CIRCUIT"
  | "STEAMPUNK_PIPES"
  | "ARCANE_RUNES";
export type GridDimension = 4 | 5 | 6 | 7;
export type RotationDeg = 0 | 90 | 180 | 270;

export const CIRCUIT_THEMES: Record<
  CircuitThemeId,
  {
    label: string;
    boardBg: string;
    tileBg: string;
    inactiveStroke: string;
    activeStroke: string;
  }
> = {
  SCIFI_CIRCUIT: {
    label: "Sci-Fi Neon Circuit",
    boardBg: "bg-slate-950 border-cyan-500/40",
    tileBg: "bg-slate-900 border-slate-800 hover:border-cyan-500/50",
    inactiveStroke: "#334155",
    activeStroke: "#22d3ee",
  },
  STEAMPUNK_PIPES: {
    label: "Steampunk Brass Pipes",
    boardBg: "bg-stone-950 border-amber-500/40",
    tileBg: "bg-stone-900 border-stone-800 hover:border-amber-500/50",
    inactiveStroke: "#57534e",
    activeStroke: "#f59e0b",
  },
  ARCANE_RUNES: {
    label: "Arcane Mana Channels",
    boardBg: "bg-indigo-950 border-purple-500/40",
    tileBg: "bg-slate-900/90 border-indigo-900 hover:border-purple-400/50",
    inactiveStroke: "#4c1d95",
    activeStroke: "#c084fc",
  },
};

export interface TilePorts {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export function getTilePorts(tile: CircuitTile): TilePorts {
  if (tile.kind === "BLOCKER") {
    return { top: false, right: false, bottom: false, left: false };
  }
  if (tile.kind === "CROSS") {
    return { top: true, right: true, bottom: true, left: true };
  }

  let base = [false, true, false, true];
  if (tile.kind === "CORNER") {
    base = [true, true, false, false];
  } else if (tile.kind === "TEE") {
    base = [true, true, false, true];
  }

  const steps = (tile.rotation / 90) % 4;
  const rotated = base.map((_, idx) => base[(idx - steps + 4) % 4] ?? false);

  return {
    top: rotated[0] ?? false,
    right: rotated[1] ?? false,
    bottom: rotated[2] ?? false,
    left: rotated[3] ?? false,
  };
}

export function rotateTileClockwise(tile: CircuitTile): CircuitTile {
  if (tile.kind === "BLOCKER") return tile;
  const nextRot = ((tile.rotation + 90) % 360) as RotationDeg;
  return { ...tile, rotation: nextRot };
}

export function computeEnergizedState(
  gridSize: GridDimension,
  sourceRow: number,
  targetRow: number,
  tiles: CircuitTile[],
): { energizedIndices: number[]; isSolved: boolean } {
  const safeSource = Math.min(gridSize - 1, Math.max(0, sourceRow));
  const safeTarget = Math.min(gridSize - 1, Math.max(0, targetRow));
  const startIdx = safeSource * gridSize;
  const goalIdx = safeTarget * gridSize + (gridSize - 1);

  const startTile = tiles[startIdx];
  if (!startTile || !getTilePorts(startTile).left) {
    return { energizedIndices: [], isSolved: false };
  }

  const visited = new Set([startIdx]);
  const queue = [startIdx];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr === undefined) continue;
    const currTile = tiles[curr];
    if (!currTile) continue;

    const ports = getTilePorts(currTile);
    const r = Math.floor(curr / gridSize);
    const c = curr % gridSize;

    if (ports.top && r > 0) {
      const nIdx = (r - 1) * gridSize + c;
      const nTile = tiles[nIdx];
      if (nTile && !visited.has(nIdx) && getTilePorts(nTile).bottom) {
        visited.add(nIdx);
        queue.push(nIdx);
      }
    }
    if (ports.bottom && r + 1 < gridSize) {
      const nIdx = (r + 1) * gridSize + c;
      const nTile = tiles[nIdx];
      if (nTile && !visited.has(nIdx) && getTilePorts(nTile).top) {
        visited.add(nIdx);
        queue.push(nIdx);
      }
    }
    if (ports.left && c > 0) {
      const nIdx = r * gridSize + (c - 1);
      const nTile = tiles[nIdx];
      if (nTile && !visited.has(nIdx) && getTilePorts(nTile).right) {
        visited.add(nIdx);
        queue.push(nIdx);
      }
    }
    if (ports.right && c + 1 < gridSize) {
      const nIdx = r * gridSize + (c + 1);
      const nTile = tiles[nIdx];
      if (nTile && !visited.has(nIdx) && getTilePorts(nTile).left) {
        visited.add(nIdx);
        queue.push(nIdx);
      }
    }
  }

  const goalTile = tiles[goalIdx];
  const isSolved =
    visited.has(goalIdx) && Boolean(goalTile && getTilePorts(goalTile).right);

  return { energizedIndices: Array.from(visited), isSolved };
}

export function generateSolvableBoard(
  gridSize: GridDimension,
  sourceRow: number,
  targetRow: number,
): CircuitTile[] {
  const safeSource = Math.min(gridSize - 1, Math.max(0, sourceRow));
  const safeTarget = Math.min(gridSize - 1, Math.max(0, targetRow));

  const pathCells: { r: number; c: number }[] = [];
  let r = safeSource;
  let c = 0;
  pathCells.push({ r, c });

  while (c < gridSize - 1) {
    const canMoveVert = r !== safeTarget && Math.random() < 0.45;
    if (canMoveVert) {
      r += r < safeTarget ? 1 : -1;
    } else {
      c += 1;
    }
    pathCells.push({ r, c });
  }

  while (r !== safeTarget) {
    r += r < safeTarget ? 1 : -1;
    pathCells.push({ r, c });
  }

  const pathSet = new Set(pathCells.map((p) => `${p.r},${p.c}`));
  const total = gridSize * gridSize;
  const rotations = Array.from(
    { length: 4 },
    (_, i) => (i * 90) as RotationDeg,
  );

  return Array.from({ length: total }, (_, idx) => {
    const row = Math.floor(idx / gridSize);
    const col = idx % gridSize;
    const randomRot = rotations[Math.floor(Math.random() * 4)] ?? 0;

    if (pathSet.has(`${row},${col}`)) {
      const pIdx = pathCells.findIndex((p) => p.r === row && p.c === col);
      const prev = pIdx === 0 ? { r: safeSource, c: -1 } : pathCells[pIdx - 1];
      const next =
        pIdx === pathCells.length - 1
          ? { r: safeTarget, c: gridSize }
          : pathCells[pIdx + 1];

      const straight = prev && next && (prev.r === next.r || prev.c === next.c);
      return {
        kind: straight ? "STRAIGHT" : "CORNER",
        rotation: randomRot,
      };
    }

    const roll = Math.random();
    if (roll < 0.18) return { kind: "BLOCKER", rotation: 0 };
    if (roll < 0.5) return { kind: "CORNER", rotation: randomRot };
    if (roll < 0.8) return { kind: "STRAIGHT", rotation: randomRot };
    return { kind: "TEE", rotation: randomRot };
  });
}
