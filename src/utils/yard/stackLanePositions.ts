import type { YardBlockModel } from "@/types/yard";
import { YARD_GRID_METRICS, bayInnerHeight } from "./layoutMetrics";

const DEFAULT_LANE_VERTICAL_GAP = 28;

/**
 * 按数组顺序自上而下为各街区分配 y_coord，高度取自当前 layoutMetrics，
 * 避免后端/示例里写死的 y 与格高、层数变化后不一致造成街区画布重叠。
 */
export function assignVerticalLaneStack(
  rows: YardBlockModel[],
  options?: { laneGap?: number; metrics?: typeof YARD_GRID_METRICS }
): YardBlockModel[] {
  if (!rows.length) return [];
  const gap = options?.laneGap ?? DEFAULT_LANE_VERTICAL_GAP;
  const m = options?.metrics ?? YARD_GRID_METRICS;

  let nextY = rows[0].y_coord ?? 40;
  return rows.map((row, i) => {
    const y_coord = i === 0 ? (row.y_coord ?? 40) : nextY;
    const next = { ...row, y_coord };
    nextY = y_coord + bayInnerHeight(row.tier_num, m) + gap;
    return next;
  });
}
