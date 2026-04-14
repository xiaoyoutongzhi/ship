/** 后端返回的街区结构（宽松字段） */
export interface YardStructureDto {
  terminal_code: string;
  yard_lane_no: string;
  stack_num: number;
  tier_num: number;
  bay_way: "D" | "U" | string;
  row_way: "D" | "U" | string;
  x_coord: number;
  y_coord: number;
  max_trucks: number;
  /** 显式贝位列表（奇数贝等由后端直接给出） */
  bays?: number[];
  bay_num?: number;
  min_bay_no?: number;
  max_bay_no?: number;
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

/** 画布渲染用的街区（已规范化贝位列表） */
export interface YardBlockModel extends YardStructureDto {
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
  work_seq: number | null;
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
