import type { Context } from "konva/lib/Context";
import type { YardBlockModel } from "@/types/yard";
import type { YardGridMetrics } from "./layoutMetrics";
import {
  cellStrideX,
  cellStrideY,
  gridBodyHeight,
  gridBodyWidth
} from "./layoutMetrics";
import { tierToRowIndex } from "./cellSlots";

const GRID_AREA_FILL = "#eef6fc"; //格区填充颜色
const CELL_DASH_STROKE = "#8eb4df"; //格子虚线颜色
const CELL_DASH = [4, 3] as const; //格子虚线样式
const ROW_SEPARATOR = "#e5989f"; //行间红线颜色
const HEADER_GRID_LINE = "#d1dce8"; //顶部红线颜色
/** 行间红线相对格区左右内缩 */
const ROW_LINE_X_INSET = 0;
/** 格区底边红线略上移，与下边留出空隙 */
const ROW_LINE_BOTTOM_INSET = -3;
/** 虚线格相对格槽再内缩一层，与格边界留白 */
const CELL_VISUAL_INSET = 3;

function strokeLine(
  context: Context,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth = 1
) {
  context.save();
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.setLineDash([]);
  context.stroke();
  context.restore();
}

/**
 * 浅蓝格区 → 内缩白格+浅蓝虚线 → 行间浅红实线（左右及底部留白）。
 */
export function paintBayCellGridSlots(
  context: Context,
  block: YardBlockModel,
  m: YardGridMetrics
) {
  const sx = cellStrideX(m);
  const sy = cellStrideY(m);
  const label = m.labelColWidth;
  const sh = m.stackHeaderHeight;
  const gw = gridBodyWidth(block.stack_num, m);
  const gh = gridBodyHeight(block.tier_num, m);
  const gx0 = label;
  const gx1 = label + gw;
  const gy1 = sh + gh;
  const lineLeft = gx0 + ROW_LINE_X_INSET;
  const lineRight = gx1 - ROW_LINE_X_INSET;

  context.save();
  context.beginPath();
  context.roundRect(gx0, sh, gw, gh, 6);
  context.fillStyle = GRID_AREA_FILL;
  context.fill();
  context.restore();

  strokeLine(context, lineLeft, sh, lineRight, sh, HEADER_GRID_LINE, 1);

  const vi = CELL_VISUAL_INSET;
  for (let stack = 1; stack <= block.stack_num; stack++) {
    for (let tier = 1; tier <= block.tier_num; tier++) {
      const row = tierToRowIndex(tier, block.tier_num);
      const x = label + (stack - 1) * sx;
      const y = sh + row * sy;
      context.save();
      context.beginPath();
      context.roundRect(
        x + vi,
        y + vi,
        m.cellWidth - 2 * vi,
        m.cellHeight - 2 * vi,
        4
      );
      context.fillStyle = "#ffffff";
      context.fill();
      context.strokeStyle = CELL_DASH_STROKE;
      context.lineWidth = 1;
      context.setLineDash([...CELL_DASH]);
      context.stroke();
      context.restore();
    }
  }

  for (let r = 0; r < block.tier_num - 1; r++) {
    const y = sh + (r + 1) * sy - m.cellGapY / 2;
    strokeLine(context, lineLeft, y, lineRight, y, ROW_SEPARATOR, 1);
  }
  strokeLine(
    context,
    lineLeft,
    gy1 - ROW_LINE_BOTTOM_INSET,
    lineRight,
    gy1 - ROW_LINE_BOTTOM_INSET,
    ROW_SEPARATOR,
    1
  );
}
