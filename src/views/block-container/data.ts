
// - **接口地址**：`/yardStructure/upsert/list`
// - **请求方式**：`POST`
// - **提供方**：PORT
// - **返回格式**：JSON

// ### 请求头
// | 参数名 | 类型 | 必填 | 说明 |
// |--------|------|------|------|
// | Content-Type | String | 是 | application/json |

// ### 请求体（Body）
// 无需传递任何请求体参数，直接调用即可。
const data = {
  "code": 0, // 状态码：0-成功，非0-失败
  "msg": "success", // 响应提示信息
  "detailMsg": null, // 详细提示信息
  "data": [ // 堆场结构列表
    {
      "yardLaneNo": "A01", // 栏号
      "terminalCode": "YANTIAN", // 港区
      "bayNum": 40, // 贝数
      "minBayNo": 1, // 最小贝号
      "maxBayNo": 40, // 最大贝号
      "stackNum": 6, // 列数
      "tierNum": 5, // 层数
      "bayWay": "A", // 贝方向：A-从小到大，D-从大到小
      "rowWay": "A", // 列方向：A-从小到大，D-从大到小
      "x": 113.456, // 基点X轴坐标
      "y": 22.123, // 基点Y轴坐标
      "maxTrucks": 20, // 最大拖车数量
      "bays": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // 贝号列表
    },
    {
      "yardLaneNo": "B02", // 栏号
      "terminalCode": "YANTIAN", // 港区
      "bayNum": 30, // 贝数
      "minBayNo": 1, // 最小贝号
      "maxBayNo": 30, // 最大贝号
      "stackNum": 5, // 列数
      "tierNum": 4, // 层数
      "bayWay": "D", // 贝方向：A-从小到大，D-从大到小
      "rowWay": "D", // 列方向：A-从小到大，D-从大到小
      "x": 113.789, // 基点X轴坐标
      "y": 22.456, // 基点Y轴坐标
      "maxTrucks": 15, // 最大拖车数量
      "bays": [1, 3, 5, 7, 9, 11, 13, 15] // 贝号列表
    }
  ]
}