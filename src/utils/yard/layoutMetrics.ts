/** 纯布局常量：与 Konva 解耦，便于单测与复用 */
export const YARD_GRID_METRICS = {
  /** 左侧「层」号列 */
  labelColWidth: 30,
  /** 单格内容区（竖向长格） */
  cellWidth: 63,
  cellHeight: 80,
  /** 列缝 / 行缝（虚线走在缝中心，略加大更易对齐设计图） */
  cellGapX: 5,
  cellGapY: 5,
  stackHeaderHeight: 26,
  bayFooterHeight: 60,
  /** 相邻贝面板水平间距（设计图贝与贝之间留白） */
  bayGap: 24,
  cornerRadius: 6,
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
} as const;

export type YardGridMetrics = typeof YARD_GRID_METRICS;

export function cellStrideX(m: YardGridMetrics = YARD_GRID_METRICS) {
  return m.cellWidth + m.cellGapX;
}

export function cellStrideY(m: YardGridMetrics = YARD_GRID_METRICS) {
  return m.cellHeight + m.cellGapY;
}

export function gridBodyWidth(stackNum: number, m: YardGridMetrics = YARD_GRID_METRICS) {
  return stackNum * m.cellWidth + Math.max(0, stackNum - 1) * m.cellGapX;
}

export function gridBodyHeight(tierNum: number, m: YardGridMetrics = YARD_GRID_METRICS) {
  return tierNum * m.cellHeight + Math.max(0, tierNum - 1) * m.cellGapY;
}

export function bayInnerWidth(stackNum: number, m: YardGridMetrics = YARD_GRID_METRICS) {
  return m.labelColWidth + gridBodyWidth(stackNum, m);
}

export function bayInnerHeight(tierNum: number, m: YardGridMetrics = YARD_GRID_METRICS) {
  return m.stackHeaderHeight + gridBodyHeight(tierNum, m) + m.bayFooterHeight;
}
