import type { YardBlockModel } from "@/types/yard";

export function bayIndexOrThrow(block: YardBlockModel, bayNo: number) {
  const idx = block.bayNumbers.indexOf(bayNo);
  if (idx < 0) {
    throw new Error(`Bay ${bayNo} not found in lane ${block.yard_lane_no}`);
  }
  return idx;
}

export function bayIndexSafe(block: YardBlockModel, bayNo: number) {
  const idx = block.bayNumbers.indexOf(bayNo);
  return idx < 0 ? 0 : idx;
}
