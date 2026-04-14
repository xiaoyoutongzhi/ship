import type { YardCellSlot } from "@/types/yard";

export function snapNearestCell(
  boxLeft: number,
  boxTop: number,
  boxWidth: number,
  boxHeight: number,
  slots: YardCellSlot[]
): YardCellSlot | null {
  if (!slots.length) return null;
  const cx = boxLeft + boxWidth / 2;
  const cy = boxTop + boxHeight / 2;
  let best: YardCellSlot | null = null;
  let bestD = Infinity;
  for (const s of slots) {
    const d = (cx - s.centerX) ** 2 + (cy - s.centerY) ** 2;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}
