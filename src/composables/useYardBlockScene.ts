import { computed, ref } from "vue";
import type { YardBlockModel, YardContainerModel } from "@/types/yard";
import { toYardBlockModel } from "@/utils/yard/buildBlockModel";
import { assignVerticalLaneStack } from "@/utils/yard/stackLanePositions";
import type { YardStructureDto } from "@/types/yard";
import type { CntrLocationDto } from "@/types/yard";
import { buildContainersFromLocations } from "@/services/yard/buildContainersFromLocations";

/**
 * 街区堆场页面用组合式函数：把 DTO 转为可绘制的街区/箱模型，维护栏筛选与缩放，并接收拖拽后的箱位提交。
 *
 * @param structure 堆场静态结构（多栏）
 * @param locations 箱位/箱信息列表
 */
export function useYardBlockScene(
  structure: YardStructureDto[],
  locations: CntrLocationDto[]
) {
  /** 各栏街区模型（含贝位、层列等），由结构 DTO 派生 */
  const blocks = ref<YardBlockModel[]>(
    assignVerticalLaneStack(structure).map(toYardBlockModel)
  );

  /** 全量箱模型，由位置 DTO 派生 */
  const containers = ref<YardContainerModel[]>(
    buildContainersFromLocations(locations, { markFirstInOperation: true })
  );
  /** 当前在页面上展示的栏号；默认全选 */
  const selectedLanes = ref<Set<string>>(
    new Set(blocks.value.map(block => block.yard_lane_no))
  );
  /** 贝面缩放百分比（60–140 等与工具栏一致） */
  const scalePercent = ref(100);

  /** 仅包含已勾选栏的街区，用于纵向渲染多行画布 */
  const visibleBlocks = computed(() =>
    blocks.value.filter(block => selectedLanes.value.has(block.yard_lane_no))
  );

  /** 仅包含已勾选栏上的箱，再按栏号分给各 Konva 舞台 */
  const visibleContainers = computed(() =>
    containers.value.filter(container => selectedLanes.value.has(container.yard_lane_no))
  );

  /** 工具栏「街区」芯片选项：所有栏号去重排序 */
  const laneOptions = computed(() =>
    [...new Set(blocks.value.map(block => block.yard_lane_no))].sort()
  );

  /** 箱总数（不按栏筛选），用于页头统计文案 */
  const totalContainers = computed(() => containers.value.length);

  /** 点选某栏：在选中集合中增删；禁止全部取消（至少保留一栏可见） */
  function toggleLane(lane: string) {
    const next = new Set(selectedLanes.value);
    if (next.has(lane)) next.delete(lane);
    else next.add(lane);
    if (next.size === 0) next.add(lane);
    selectedLanes.value = next;
  }

  /**
   * 子舞台拖拽结束并吸附到格槽后调用：把该箱的栏号、贝、列、层写回本地状态。
   * （当前为前端 mock，后续可接保存接口。）
   */
  function commitContainerPosition(payload: {
    id: string;
    yard_lane_no: string;
    bay_no: number;
    stack_num: number;
    tier_num: number;
  }) {
    const row = containers.value.find(c => c.id === payload.id);
    if (!row) return;
    row.yard_lane_no = payload.yard_lane_no;
    row.bay_no = payload.bay_no;
    row.bay_start_num = payload.bay_no;
    row.bay_end_num = payload.bay_no;
    row.stack_num = payload.stack_num;
    row.tier_num = payload.tier_num;
  }

  return {
    blocks,
    containers,
    selectedLanes,
    scalePercent,
    visibleBlocks,
    visibleContainers,
    laneOptions,
    totalContainers,
    toggleLane,
    commitContainerPosition
  };
}
