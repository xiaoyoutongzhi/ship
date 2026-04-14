<script setup lang="ts">
/**
 * 单栏街区 Konva 舞台：绘制贝格网、箱块；拖拽结束后吸附最近格槽并 `container-commit` 上报。
 */
import { computed, ref, watch } from "vue";
import { watchThrottled } from "@vueuse/core";
import type { Context } from "konva/lib/Context";
import type { Shape } from "konva/lib/Shape";
import {
  Stage,
  Layer,
  Group,
  Rect,
  Text,
  Line,
  Shape as KonvaShape
} from "vue-konva";
import type { YardBlockModel, YardContainerModel } from "@/types/yard";
import {
  YARD_GRID_METRICS,
  bayInnerHeight,
  bayInnerWidth,
  cellStrideX,
  cellStrideY,
  gridBodyHeight,
  gridBodyWidth
} from "@/utils/yard/layoutMetrics";
import { cellTopLeft, computeStageBounds } from "@/utils/yard/cellSlots";
import { paintBayCellGridSlots } from "@/utils/yard/drawBayCellGrid";
import { bayIndexSafe } from "@/utils/yard/bayIndex";
import { snapNearestFromBlocks } from "@/utils/yard/snapNearestFromBlocks";

/** 单条街区画布内边距（与数据结构里的 x_coord/y_coord 解耦） */
const CANVAS_PAD = 6;

const props = withDefaults(
  defineProps<{
    /** 当前横向滚动条内只渲染这一条街区（栏） */
    block: YardBlockModel;
    containers: YardContainerModel[];
    scalePercent: number;
  }>(),
  {
    scalePercent: 100
  }
);

/** 箱拖拽吸附完成后向父组件同步新贝/列/层（及栏号） */
const emit = defineEmits<{
  (
    e: "container-commit",
    payload: {
      id: string;
      yard_lane_no: string;
      bay_no: number;
      stack_num: number;
      tier_num: number;
    }
  ): void;
}>();

const m = YARD_GRID_METRICS;
const strideX = cellStrideX(m);
const strideY = cellStrideY(m);
/** 箱块比格槽小 2px：四边各留 1px，避免视觉过满 */
const pad = 1;
const boxW = m.cellWidth - pad * 2;
const boxH = m.cellHeight - pad * 2;

/** 将街区原点平移到画布内边距处，避免与数据结构里的全局坐标混用 */
const localBlock = computed<YardBlockModel>(() => ({
  ...props.block,
  x_coord: CANVAS_PAD,
  y_coord: CANVAS_PAD
}));

/** Konva Shape 的 sceneFunc：在贝矩形内绘制列层格线 */
function bayGridSceneFunc(context: Context, shape: Shape) {
  const block = shape.getAttr("_block") as YardBlockModel | undefined;
  if (!block) return;
  paintBayCellGridSlots(context, block, m);
}

/** 本舞台逻辑宽高（未乘 scale），用于 Stage 尺寸 */
const logicalBounds = computed(() => computeStageBounds([localBlock.value], m));

/** 缩放值节流后写入，减轻拖动滑块时的 Konva 重绘压力 */
const scaleForStage = ref(props.scalePercent);
watchThrottled(
  () => props.scalePercent,
  v => {
    scaleForStage.value = v;
  },
  { throttle: 48, immediate: true }
);

/** Stage 的 width/height 与 scaleX/scaleY */
const stageConfig = computed(() => {
  const s = scaleForStage.value / 100;
  const { width, height } = logicalBounds.value;
  return {
    width,
    height,
    scaleX: s,
    scaleY: s
  };
});

/** 箱列表布局指纹：任一箱位或箱号变化时用于触发 Konva 节点 key 更新 */
const containerLayoutSignature = computed(() =>
  props.containers
    .map(
      c =>
        `${c.id}:${c.yard_lane_no}:${c.bay_no}:${c.stack_num}:${c.tier_num}:${c.container_no}`
    )
    .join("|")
);

/** 与 layoutSignature 联动，强制刷新箱 Group 的 Vue key */
const bump = ref(0);
watch(containerLayoutSignature, () => {
  bump.value++;
});

/** 某一贝在舞台内的左上角偏移（相对本栏原点） */
function bayOrigin(block: YardBlockModel, bayIndex: number) {
  const bayW = bayInnerWidth(block.stack_num, m);
  return {
    x: block.x_coord + bayIndex * (bayW + m.bayGap),
    y: block.y_coord
  };
}

/** 箱 Group 左上角坐标（格槽左上角 + 内边距） */
function containerPosition(c: YardContainerModel) {
  const block = localBlock.value;
  const bayIdx = bayIndexSafe(block, c.bay_no);
  const { x, y } = cellTopLeft(block, bayIdx, c.stack_num, c.tier_num, m);
  return { x: x + pad, y: y + pad };
}

/** 贝位底部状态文案（演示用 mock，非真实业务） */
function mockBayStatus(bayNo: number) {
  if (bayNo % 13 === 0) return "空";
  const a = (bayNo % 7) + 1;
  const b = ((bayNo + 2) % 7) + 1;
  return `QC${a}, QC${b}`;
}

/** 拖拽结束：吸附最近合法格槽，向父组件提交新箱位并把节点移回格内 */
function onContainerDragEnd(c: YardContainerModel, evt: any) {
  const node = evt.target;
  const nx = node.x();
  const ny = node.y();
  const slot = snapNearestFromBlocks(nx, ny, boxW, boxH, [localBlock.value], m);
  if (!slot) return;
  emit("container-commit", {
    id: c.id,
    yard_lane_no: slot.yard_lane_no,
    bay_no: slot.bay_no,
    stack_num: slot.stack_num,
    tier_num: slot.tier_num
  });
  const block = localBlock.value;
  const bayIdx = bayIndexSafe(block, slot.bay_no);
  const pos = cellTopLeft(block, bayIdx, slot.stack_num, slot.tier_num, m);
  node.position({ x: pos.x + pad, y: pos.y + pad });
}

/** Vue `:key`，布局或 bump 变化时重建箱 Group，避免 Konva 状态残留 */
function containerGroupKey(c: YardContainerModel) {
  return `${c.id}-${c.yard_lane_no}-${c.bay_no}-${c.stack_num}-${c.tier_num}-${bump.value}`;
}

/** 箱描边色：作业中强调色，否则默认蓝 */
function containerStroke(c: YardContainerModel) {
  if (c.in_operation) return "#f59e0b";
  return "#3b82f6";
}

/** 箱号过长时中间省略，适配小格宽度 */
function shortNo(no: string) {
  if (no.length <= 12) return no;
  return `${no.slice(0, 4)}…${no.slice(-4)}`;
}

/** 箱号拆分为两行：字母前缀 + 数字后缀 */
function containerNoParts(no: string) {
  const cleaned = no.replace(/\s+/g, "");
  const matched = cleaned.match(/^([A-Za-z]{4})(\d+)$/);
  if (matched) {
    return { owner: matched[1].toUpperCase(), serial: matched[2] };
  }
  const compact = shortNo(cleaned);
  return { owner: compact, serial: "" };
}

/** 作业顺序号角标宽度：按位数自适应，避免文字挤压 */
function workSeqBadgeWidth(workSeq: string | number) {
  const len = String(workSeq).length;
  return Math.min(26, Math.max(16, 10 + len * 5));
}

/** 贝脚「药丸」背景宽度：随列宽变化并在区间内夹紧 */
function bayFooterPillWidth(stackNum: number) {
  const gw = gridBodyWidth(stackNum, m);
  return Math.min(88, Math.max(48, gw - 8));
}
</script>

<template>
  <Stage :config="stageConfig">
    <Layer :config="{ listening: true }">
      <Group
        v-for="(bayNo, bayIndex) in localBlock.bayNumbers"
        :key="`${localBlock.yard_lane_no}-${bayNo}`"
        :config="{ ...bayOrigin(localBlock, bayIndex) }"
      >
        <Rect
          :config="{
            x: 0,
            y: 0,
            width: bayInnerWidth(localBlock.stack_num, m),
            height: bayInnerHeight(localBlock.tier_num, m),
            stroke: '#bdd7ec',
            strokeWidth: 1,
            cornerRadius: 14,
            fill: '#eef8fc'
          }"
        />

        <Rect
          :config="{
            x: 0,
            y: 0,
            width: bayInnerWidth(localBlock.stack_num, m),
            height: m.stackHeaderHeight,
            fill: '#e8f4fc',
            cornerRadius: 14
          }"
        />
        <Line
          :config="{
            points: [
              0,
              m.stackHeaderHeight - 0.5,
              bayInnerWidth(localBlock.stack_num, m),
              m.stackHeaderHeight - 0.5
            ],
            stroke: '#cfdce8',
            strokeWidth: 1
          }"
        />

        <KonvaShape
          :config="{
            listening: false,
            perfectDrawEnabled: false,
            width: bayInnerWidth(localBlock.stack_num, m),
            height: bayInnerHeight(localBlock.tier_num, m),
            _block: localBlock,
            sceneFunc: bayGridSceneFunc
          }"
        />

        <Text
          :config="{
            x: 6,
            y: 6,
            width: m.labelColWidth,
            text: '层\\行',
            fontSize: 10,
            fontFamily: m.fontFamily,
            fill: '#64748b'
          }"
        />

        <Text
          v-for="s in localBlock.stack_num"
          :key="`h-${s}`"
          :config="{
            x: m.labelColWidth + (s - 1) * strideX,
            y: 6,
            width: m.cellWidth,
            align: 'center',
            text: String(s),
            fontSize: 11,
            fontFamily: m.fontFamily,
            fill: '#64748b'
          }"
        />

        <Text
          v-for="t in localBlock.tier_num"
          :key="`vlab-${t}`"
          :config="{
            x: 2,
            y: m.stackHeaderHeight + (t - 1) * strideY + m.cellHeight / 2 - 6,
            width: m.labelColWidth - 4,
            align: 'center',
            text: String(localBlock.tier_num - t + 1),
            fontSize: 11,
            fontFamily: m.fontFamily,
            fill: '#64748b'
          }"
        />

        <!-- 底部街区&贝号文字背景 -->
        <Rect
          :config="{
            x:
              m.labelColWidth +
              (gridBodyWidth(localBlock.stack_num, m) -
                bayFooterPillWidth(localBlock.stack_num)) /
                2,
            y: m.stackHeaderHeight + gridBodyHeight(localBlock.tier_num, m) + 8,
            width: bayFooterPillWidth(localBlock.stack_num),
            height: 26,
            fill: '#d6ecfc',
            cornerRadius: 13,
            stroke: '#a8cce8',
            strokeWidth: 1
          }"
        />

        <!-- 底部街区&贝号文字 -->
        <Text
          :config="{
            x: m.labelColWidth,
            y:
              m.stackHeaderHeight + gridBodyHeight(localBlock.tier_num, m) + 14,
            width: gridBodyWidth(localBlock.stack_num, m),
            align: 'center',
            text: `${localBlock.yard_lane_no}-${String(bayNo).padStart(2, '0')}`,
            fontSize: 12,
            fontStyle: 'bold',
            fontFamily: m.fontFamily,
            fill: '#475569'
          }"
        />

        <!-- 底部吊桥文字 -->
        <Text
          :config="{
            x: m.labelColWidth,
            y:
              m.stackHeaderHeight + gridBodyHeight(localBlock.tier_num, m) + 38,
            width: gridBodyWidth(localBlock.stack_num, m),
            align: 'center',
            text: mockBayStatus(bayNo),
            fontSize: 10,
            fontFamily: m.fontFamily,
            fill: '#e07a6e'
          }"
        />
      </Group>
    </Layer>

    <!-- 绘制箱子 -->
    <Layer>
      <Group
        v-for="c in containers"
        :key="containerGroupKey(c)"
        :config="{
          x: containerPosition(c).x,
          y: containerPosition(c).y,
          // draggable: true, //拖拽功能暂时关闭
          name: c.id
        }"
        @dragend="evt => onContainerDragEnd(c, evt)"
      >
        <!-- 箱子 -->
        <Rect
          :config="{
            x: 0,
            y: 0,
            width: boxW,
            height: boxH,
            cornerRadius: m.cornerRadius,
            stroke: containerStroke(c), //TODO: 根据状态判断颜色
            strokeWidth: c.in_operation ? 2 : 1,
            fill: '#ffffff'
          }"
        />
        <!-- 作业顺序号 -->
        <Rect
          v-if="c.work_seq != null"
          :config="{
            x: boxW - workSeqBadgeWidth(c.work_seq) - 4,
            y: 4,
            width: workSeqBadgeWidth(c.work_seq),
            height: 14,
            cornerRadius: 7,
            fill: 'rgba(245, 158, 11, 0.32)',
            stroke: '#f59e0b',
            strokeWidth: 1
          }"
        />

        <Text
          v-if="c.work_seq != null"
          :config="{
            x: boxW - workSeqBadgeWidth(c.work_seq) - 4,
            y: 4,
            width: workSeqBadgeWidth(c.work_seq),
            height: 14,
            align: 'center',
            verticalAlign: 'middle',
            text: String(c.work_seq),
            fontSize: 9,
            fontStyle: 'bold',
            fontFamily: m.fontFamily,
            fill: '#7c2d12'
          }"
        />
        <Text
          :config="{
            x: 4,
            y: 8,
            width: boxW - 8,
            text: containerNoParts(c.container_no).owner,
            fontSize: 8,
            fontStyle: 'bold',
            fontFamily: m.fontFamily,
            fill: '#0f172a'
          }"
        />
        <Text
          :config="{
            x: 4,
            y: 24,
            width: boxW - 8,
            text: containerNoParts(c.container_no).serial,
            fontSize: 8,
            fontStyle: 'bold',
            fontFamily: m.fontFamily,
            fill: '#334155'
          }"
        />
        <Rect
          :config="{
            x: 4,
            y: boxH - 18,
            width: Math.min(36, Math.max(26, boxW - 28)),
            height: 14,
            cornerRadius: 4,
            fill: '#3b82f6'
          }"
        />
        <Text
          :config="{
            x: 4,
            y: boxH - 17,
            width: Math.min(36, Math.max(26, boxW - 28)),
            height: 12,
            align: 'center',
            verticalAlign: 'middle',
            text: c.iso,
            fontSize: 8,
            // fontStyle: 'bold',
            fontFamily: m.fontFamily,
            fill: '#ffffff'
          }"
        />
        <Text
          :config="{
            x: boxW - 36,
            y: boxH - 16,
            width: 32,
            align: 'right',
            text: c.weight_ton,
            fontSize: 9,
            fontFamily: m.fontFamily,
            fill: '#ea580c'
          }"
        />
      </Group>
    </Layer>
  </Stage>
</template>
