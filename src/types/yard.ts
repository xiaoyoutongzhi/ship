/** 后端返回的街区结构（宽松字段） */
export interface YardStructureDto {
  yardLaneNo: string;
  terminalCode: string;
  bayNum?: number;
  minBayNo?: number;
  maxBayNo?: number;
  stackNum: number;
  tierNum: number;
  bayWay: "A" | "D" | string;
  rowWay: "A" | "D" | string;
  x: number;
  y: number;
  maxTrucks: number;
  /** 显式贝位列表（奇数贝等由后端直接给出） */
  bays?: number[];
}

/** 仅箱位（可与箱动态信息分接口） */
export interface CntrLocationDto {
  terminal_code: string;
  yard_lane_no: string;
  bay_start_num: number;
  bay_end_num: number;
  stack_num: number;
  tier_num: number;
}

/** 画布渲染用的街区（内部下划线字段，适配现有渲染逻辑） */
export interface YardBlockModel {
  terminal_code: string;
  yard_lane_no: string;
  bay_num?: number;
  min_bay_no?: number;
  max_bay_no?: number;
  stack_num: number;
  tier_num: number;
  bay_way: "A" | "D" | string;
  row_way: "A" | "D" | string;
  x_coord: number;
  y_coord: number;
  max_trucks: number;
  bays?: number[];
  bayNumbers: number[];
}

/** 与 Konva 交互的箱模型 */
export interface YardContainerModel {
  id: string;
  terminal_code: string;
  yard_lane_no: string;
  bay_no: number;
  stack_num: number;
  /** 物理层号：1 为底层 */
  tier_num: number;
  bay_start_num: number;
  bay_end_num: number;
  container_no: string;
  size_ft: 20 | 40;
  type_code: string;
  iso: string;
  weight_ton: string;
  work_seq: number;
  in_operation?: boolean;
}

export interface YardCellSlot {
  yard_lane_no: string;
  bay_no: number;
  stack_num: number;
  tier_num: number;
  centerX: number;
  centerY: number;
}
