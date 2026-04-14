import type { YardStructureDto } from "@/types/yard";

/** 堆场街区结构（与后端对齐的宽松结构示例） */
const yardStructureData: YardStructureDto[] = [
  {
    terminalCode: "DCT",
    yardLaneNo: "A01",
    stackNum: 6,
    tierNum: 5,
    bayWay: "A",
    rowWay: "A",
    x: 40,
    y: 40,
    maxTrucks: 14,
    bays: [1, 3, 5, 7, 9, 11, 13, 15]
  },
  {
    terminalCode: "DCT",
    yardLaneNo: "A03",
    stackNum: 6,
    tierNum: 5,
    bayWay: "A",
    rowWay: "A",
    x: 40,
    y: 420,
    maxTrucks: 14,
    bays: [1, 3, 5, 7, 9, 11, 13, 15]
  }
];

export default yardStructureData;
