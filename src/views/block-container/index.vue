<script setup lang="ts">
/**
 * 街区集装箱视图：堆场结构 + 箱位数据驱动，支持按栏筛选、贝面缩放、箱拖拽吸附后写回状态。
 */
import { computed } from "vue";
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
console.log(visibleBlocks.value);

/** 工具栏缩放滑块变更时同步到场景 */
function onScalePercent(v: number) {
  scene.scalePercent.value = v;
}

/** 传给子组件的缩放百分比（与 scene 同源，便于模板绑定） */
const scalePercentForUi = computed(() => scene.scalePercent.value);

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
      subtitle="街区"
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
    <div class="yard-page__canvas">
      <div
        v-for="lane in visibleBlocks"
        :key="lane.yard_lane_no"
        class="yard-lane-row"
      >
        <div class="yard-lane-row__scroll">
          <YardKonvaStage
            :block="lane"
            :containers="
              visibleContainers.filter(
                c => c.yard_lane_no === lane.yard_lane_no
              )
            "
            :scale-percent="scalePercentForUi"
            @container-commit="commitContainerPosition"
          />
        </div>
      </div>
    </div>

    <!-- 底栏：图例与操作说明 -->
    <YardLegendBar
      tip="提示：每条街区横向独立滚动查看贝位；拖拽松开后吸附本栏最近箱位格；可使用浏览器全屏。"
    />
  </div>
</template>

<style scoped lang="scss">
.yard-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
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
  padding: 12px;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.yard-lane-row {
  flex: 0 0 auto;
  min-width: 0;
}
.yard-lane-row__scroll {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
  line-height: 0;
}
</style>
