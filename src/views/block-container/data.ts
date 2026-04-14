// 1. 堆场贝结构，紧凑型数据结构【使用紧凑型数据结构完成堆场静态初始化。】

const data: any = [
  {
    terminal_code: "DCT",
    yard_lane_no: "A01", //栏号(街区)
    stack_num: 6, //列数
    tier_num: 5, //层数
    bay_way: "D", //贝方向
    row_way: "D", //列方向
    x_coord: 663, //基点X轴坐标
    y_coord: 40, //基点Y轴坐标
    max_trucks: 14, //最大拖车数量
    bays: [1, 3, 5, 7, 9, 11, 13, 15]
  },
  {
    yard_lane_no: "A03",
    terminal_code: "DCT",
    bay_num: 42,
    min_bay_no: 1,
    max_bay_no: 83,
    stack_num: 7,
    tier_num: 6,
    bay_way: "D",
    row_way: "D",
    x_coord: 663,
    y_coord: 71,
    max_trucks: 14
  }
];

// // 2.堆场贝结构，宽松型数据结构。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const data1: any = [
  {
    yard_lane_no: "A01",
    terminal_code: "DCT",
    bay_num: 42,
    min_bay_no: 1,
    max_bay_no: 83,
    stack_num: 6,
    tier_num: 5,
    bay_way: "D",
    row_way: "D",
    x_coord: 663,
    y_coord: 40,
    max_trucks: 14
  }
];
export default data;
