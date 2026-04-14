import type { YardStructureDto } from "@/types/yard";

/** 堆场街区结构（与后端对齐的宽松结构示例） */
const yardStructureData: YardStructureDto[] = [
  {
    terminal_code: "DCT",
    yard_lane_no: "A01",
    stack_num: 6,
    tier_num: 5,
    bay_way: "D",
    row_way: "D",
    x_coord: 40,
    y_coord: 40,
    max_trucks: 14,
    bays: [1, 3, 5, 7, 9, 11, 13, 15]
  },
  {
    terminal_code: "DCT",
    yard_lane_no: "A03",
    stack_num: 6,
    tier_num: 5,
    bay_way: "D",
    row_way: "D",
    x_coord: 40,
    y_coord: 420,
    max_trucks: 14,
    bays: [1, 3, 5, 7, 9, 11, 13, 15]
  },
  
];

export default yardStructureData;
