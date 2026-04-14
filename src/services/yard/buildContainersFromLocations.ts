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
      work_seq: markOp && idx === 0 ? 3 : undefined
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
