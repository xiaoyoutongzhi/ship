import type { YardBlockModel, YardStructureDto } from "@/types/yard";
import { resolveBayNumbers } from "./bayNumbers";

export function toYardBlockModel(dto: YardStructureDto): YardBlockModel {
  const row: YardBlockModel = {
    terminal_code: dto.terminalCode,
    yard_lane_no: dto.yardLaneNo,
    stack_num: dto.stackNum,
    tier_num: dto.tierNum,
    bay_way: dto.bayWay,
    row_way: dto.rowWay,
    x_coord: dto.x,
    y_coord: dto.y,
    max_trucks: dto.maxTrucks,
    bay_num: dto.bayNum,
    min_bay_no: dto.minBayNo,
    max_bay_no: dto.maxBayNo,
    bays: dto.bays,
    bayNumbers: []
  };
  row.bayNumbers = resolveBayNumbers(row);
  return row;
}
