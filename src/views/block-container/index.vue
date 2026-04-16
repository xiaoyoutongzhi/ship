<script setup lang="ts">
/**
 * 街区集装箱视图：堆场结构 + 箱位数据驱动，支持按栏筛选、贝面缩放、箱拖拽吸附后写回状态。
 */
import { computed } from "vue";
import { useVirtualList } from "@vueuse/core";
import yardStructureData from "@/api/mock/yardStructureData";
import { cntrLocationsMock } from "@/api/mock/cntrLocationsMock";
import { useYardBlockScene } from "@/composables/useYardBlockScene";
import YardScreenHeader from "@/components/yard/YardScreenHeader.vue";
import YardToolbar from "@/components/yard/YardToolbar.vue";
import YardLegendBar from "@/components/yard/YardLegendBar.vue";
import YardKonvaStage from "@/components/yard/YardKonvaStage.vue";

defineOptions({
  name: "BlockContainer"
});

/** 街区场景状态（栏、箱、缩放、可见性等） */
const scene = useYardBlockScene(yardStructureData, cntrLocationsMock);

const {
  /** 当前勾选的栏号集合，用于过滤画布与箱列表 */
  selectedLanes,
  /** 按勾选栏过滤后的街区块，用于纵向列表渲染 */
  visibleBlocks,
  /** 按勾选栏过滤后的箱，按栏再分给各 Konva 舞台 */
  visibleContainers,
  /** 工具栏「街区」多选的数据源 */
  laneOptions,
  /** 头部统计：箱总数 */
  totalContainers,
  /** 切换某栏在画布上的显示/隐藏（至少保留一栏） */
  toggleLane,
  /** 拖拽松开后由子组件上报，写回对应箱的贝/列/层 */
  commitContainerPosition
} = scene;

/** 工具栏缩放滑块变更时同步到场景 */
function onScalePercent(v: number) {
  scene.scalePercent.value = v;
}

/** 传给子组件的缩放百分比（与 scene 同源，便于模板绑定） */
const scalePercentForUi = computed(() => scene.scalePercent.value);

/**
 * 预估每条街区行高（含外层边距和底部文案）。当前数据层数基本一致，
 * 用固定行高可直接启用虚拟列表，避免上万条时一次性渲染所有 Konva 舞台。
 */
const LANE_ROW_HEIGHT = 258;
const VIRTUAL_OVERSCAN = 3;

/** 将可见箱按栏号分组，避免模板中对全量数据重复 filter */
const containersByLane = computed(() => {
  const grouped = new Map<string, typeof visibleContainers.value>();
  for (const lane of visibleBlocks.value) {
    grouped.set(lane.yard_lane_no, []);
  }
  for (const container of visibleContainers.value) {
    const laneContainers = grouped.get(container.yard_lane_no);
    if (laneContainers) laneContainers.push(container);
  }
  return grouped;
});

/** 纵向街区行虚拟滚动：只渲染视口附近少量 lane，降低 DOM/Konva 节点数 */
const {
  list: virtualLanes,
  containerProps: virtualContainerProps,
  wrapperProps: virtualWrapperProps
} = useVirtualList(visibleBlocks, {
  itemHeight: LANE_ROW_HEIGHT,
  overscan: VIRTUAL_OVERSCAN
});

/** 进入或退出浏览器全屏，扩大可视贝面区域 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
</script>

<template>
  <div class="yard-page">
    <!-- 顶栏：标题与箱量统计 -->
    <YardScreenHeader
      title="堆场街区视图"
      subtitle="行: 01-06 | 层: 01-05 (顶层在上) | 同一贝最多2个岸桥"
      :stat-text="`${totalContainers} 个集装箱`"
    />

    <!-- 工具条：栏筛选、缩放、全屏等 -->
    <YardToolbar
      :lane-options="laneOptions"
      :selected-lanes="selectedLanes"
      :scale-percent="scalePercentForUi"
      @toggle-lane="toggleLane"
      @update:scale-percent="onScalePercent"
      @fullscreen="toggleFullscreen"
    />

    <!-- 中间区域：每栏一行横向滚动 + Konva 贝面 -->
    <div class="yard-page__canvas" v-bind="virtualContainerProps">
      <div v-bind="virtualWrapperProps">
        <div
          v-for="item in virtualLanes"
          :key="item.data.yard_lane_no"
          class="yard-lane-row"
        >
          <YardKonvaStage
            :block="item.data"
            :containers="containersByLane.get(item.data.yard_lane_no) ?? []"
            :scale-percent="scalePercentForUi"
            @container-commit="commitContainerPosition"
          />
        </div>
      </div>
    </div>

    <!-- 底栏：图例与操作说明 -->
    <!-- 提示：每条街区横向独立滚动查看贝位；拖拽松开后吸附本栏最近箱位格；可使用浏览器全屏。 -->
    <YardLegendBar
      tip="提示：每条街区横向独立滚动查看贝位；可使用浏览器全屏。"
    />
  </div>
</template>

<style scoped lang="scss">
.yard-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 58px);
  min-height: 520px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
.yard-page__canvas {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 10px 12px 8px;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.yard-lane-row {
  flex: 0 0 auto;
  min-width: 0;
  min-height: 250px;
  padding: 4px 0;
}

.yard-page__canvas::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.yard-page__canvas::-webkit-scrollbar-track {
  background: #e6edf4;
  border-radius: 999px;
}

.yard-page__canvas::-webkit-scrollbar-thumb {
  background: #b7c6d8;
  border-radius: 999px;
}

.yard-page__canvas::-webkit-scrollbar-thumb:hover {
  background: #9fb2c9;
}
</style>
