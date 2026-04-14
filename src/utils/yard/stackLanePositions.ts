import type { YardStructureDto } from "@/types/yard";
import { YARD_GRID_METRICS, bayInnerHeight } from "./layoutMetrics";

const DEFAULT_LANE_VERTICAL_GAP = 28;

/**
 * 按数组顺序自上而下为各街区分配 y_coord，高度取自当前 layoutMetrics，
 * 避免后端/示例里写死的 y 与格高、层数变化后不一致造成街区画布重叠。
 */
export function assignVerticalLaneStack(
  dtos: YardStructureDto[],
  options?: { laneGap?: number; metrics?: typeof YARD_GRID_METRICS }
): YardStructureDto[] {
  if (!dtos.length) return [];
  const gap = options?.laneGap ?? DEFAULT_LANE_VERTICAL_GAP;
  const m = options?.metrics ?? YARD_GRID_METRICS;

  let nextY = dtos[0].y_coord ?? 40;
  return dtos.map((dto, i) => {
    const y_coord = i === 0 ? (dto.y_coord ?? 40) : nextY;
    const row = { ...dto, y_coord };
    nextY = y_coord + bayInnerHeight(dto.tier_num, m) + gap;
    return row;
  });
}
