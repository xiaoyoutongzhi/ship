import type { YardBlockModel, YardCellSlot } from "@/types/yard";
import type { YardGridMetrics } from "./layoutMetrics";
import { bayInnerWidth, cellStrideX, cellStrideY } from "./layoutMetrics";

/**
 * 在全部街区/贝位中找最近箱位（数学投影，O(总贝数)，避免构建数千 slot 再 O(n) 扫描）。
 */
export function snapNearestFromBlocks(
  boxLeft: number,
  boxTop: number,
  boxWidth: number,
  boxHeight: number,
  blocks: YardBlockModel[],
  m: YardGridMetrics
): YardCellSlot | null {
  if (!blocks.length) return null;
  const cx = boxLeft + boxWidth / 2;
  const cy = boxTop + boxHeight / 2;
  const sx = cellStrideX(m);
  const sy = cellStrideY(m);
  const label = m.labelColWidth;
  const sh = m.stackHeaderHeight;

  let best: YardCellSlot | null = null;
  let bestD = Infinity;

  for (const block of blocks) {
    const bayW = bayInnerWidth(block.stack_num, m);

    block.bayNumbers.forEach((bayNo, bayIndex) => {
      const ox = block.x_coord + bayIndex * (bayW + m.bayGap);
      const oy = block.y_coord;
      const gx = cx - ox - label;
      const gy = cy - oy - sh;

      let stack = Math.round((gx - m.cellWidth / 2) / sx) + 1;
      stack = Math.max(1, Math.min(block.stack_num, stack));
      let row = Math.round((gy - m.cellHeight / 2) / sy);
      row = Math.max(0, Math.min(block.tier_num - 1, row));
      const tier = block.tier_num - row;

      const centerX = ox + label + (stack - 1) * sx + m.cellWidth / 2;
      const centerY = oy + sh + row * sy + m.cellHeight / 2;
      const d = (cx - centerX) ** 2 + (cy - centerY) ** 2;
      if (d < bestD) {
        bestD = d;
        best = {
          yard_lane_no: block.yard_lane_no,
          bay_no: bayNo,
          stack_num: stack,
          tier_num: tier,
          centerX,
          centerY
        };
      }
    });
  }

  return best;
}
