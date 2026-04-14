import type { CntrLocationDto, YardContainerModel } from "@/types/yard";
import { buildMockContainerFromLocation } from "./mockContainerDetails";

export function buildContainersFromLocations(
  locations: CntrLocationDto[],
  options?: { markFirstInOperation?: boolean }
): YardContainerModel[] {
  const markOp = options?.markFirstInOperation ?? true;
  const baySeqMap = new Map<string, number>();
  return locations.map((loc, idx) =>
    {
      const key = `${loc.yard_lane_no}-${loc.bay_start_num}`;
      const next = (baySeqMap.get(key) ?? 0) + 1;
      baySeqMap.set(key, next);
      return buildMockContainerFromLocation(loc, {
        in_operation: markOp && idx === 0,
        // 作业顺序号按“每个贝”独立计数，从 1 开始
        work_seq: next
      });
    }
  );
}

export function filterContainersByLanes(
  list: YardContainerModel[],
  lanes: Set<string>
) {
  if (!lanes.size) return list;
  return list.filter(c => lanes.has(c.yard_lane_no));
}
