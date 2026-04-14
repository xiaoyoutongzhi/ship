import type { CntrLocationDto, YardContainerModel } from "@/types/yard";
import { buildMockContainerFromLocation } from "./mockContainerDetails";

export function buildContainersFromLocations(
  locations: CntrLocationDto[],
  options?: { markFirstInOperation?: boolean }
): YardContainerModel[] {
  const markOp = options?.markFirstInOperation ?? true;
  return locations.map((loc, idx) =>
    buildMockContainerFromLocation(loc, {
      in_operation: markOp && idx === 0,
      // 作业顺序号为箱信息必填字段，按列表顺序连续生成
      work_seq: idx + 1
    })
  );
}

export function filterContainersByLanes(
  list: YardContainerModel[],
  lanes: Set<string>
) {
  if (!lanes.size) return list;
  return list.filter(c => lanes.has(c.yard_lane_no));
}
