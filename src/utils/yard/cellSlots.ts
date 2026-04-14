import type { YardBlockModel, YardCellSlot } from "@/types/yard";
import {
  YARD_GRID_METRICS,
  bayInnerHeight,
  bayInnerWidth,
  cellStrideX,
  cellStrideY
} from "./layoutMetrics";

/** 将层号（1=底层）映射为网格自上而下第几行（0-based） */
export function tierToRowIndex(tierNum: number, tierCount: number) {
  return tierCount - tierNum;
}

/** 生成某街区下全部可吸附格子的中心点（画布绝对坐标） */
export function buildCellSlotsForBlock(
  block: YardBlockModel,
  metrics = YARD_GRID_METRICS
): YardCellSlot[] {
  const slots: YardCellSlot[] = [];
  const bayW = bayInnerWidth(block.stack_num, metrics);

  block.bayNumbers.forEach((bayNo, bayIndex) => {
    const bayOriginX = block.x_coord + bayIndex * (bayW + metrics.bayGap);
    const bayOriginY = block.y_coord;

    for (let stack = 1; stack <= block.stack_num; stack++) {
      for (let tier = 1; tier <= block.tier_num; tier++) {
        const row = tierToRowIndex(tier, block.tier_num);
        const cellX =
          bayOriginX + metrics.labelColWidth + (stack - 1) * cellStrideX(metrics);
        const cellY = bayOriginY + metrics.stackHeaderHeight + row * cellStrideY(metrics);
        slots.push({
          yard_lane_no: block.yard_lane_no,
          bay_no: bayNo,
          stack_num: stack,
          tier_num: tier,
          centerX: cellX + metrics.cellWidth / 2,
          centerY: cellY + metrics.cellHeight / 2
        });
      }
    }
  });

  return slots;
}

export function cellTopLeft(
  block: YardBlockModel,
  bayIndex: number,
  stack: number,
  tier: number,
  metrics = YARD_GRID_METRICS
) {
  const bayW = bayInnerWidth(block.stack_num, metrics);
  const bayOriginX = block.x_coord + bayIndex * (bayW + metrics.bayGap);
  const bayOriginY = block.y_coord;
  const row = tierToRowIndex(tier, block.tier_num);
  const x = bayOriginX + metrics.labelColWidth + (stack - 1) * cellStrideX(metrics);
  const y = bayOriginY + metrics.stackHeaderHeight + row * cellStrideY(metrics);
  return { x, y };
}

export function blockBoundingSize(block: YardBlockModel, metrics = YARD_GRID_METRICS) {
  const bayW = bayInnerWidth(block.stack_num, metrics);
  const bayH = bayInnerHeight(block.tier_num, metrics);
  const width =
    block.bayNumbers.length * bayW + Math.max(0, block.bayNumbers.length - 1) * metrics.bayGap;
  return { width, height: bayH };
}

export function computeStageBounds(blocks: YardBlockModel[], metrics = YARD_GRID_METRICS) {
  let maxR = 0;
  let maxB = 0;
  blocks.forEach(b => {
    const { width, height } = blockBoundingSize(b, metrics);
    maxR = Math.max(maxR, b.x_coord + width);
    maxB = Math.max(maxB, b.y_coord + height);
  });
  return {
    width: Math.ceil(maxR + 80),
    height: Math.ceil(maxB + 80)
  };
}
