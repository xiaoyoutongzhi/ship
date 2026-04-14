<script setup lang="ts">
/**
 * 堆场街区页工具条：栏筛选、吊桥演示多选、搜索占位、贝面缩放与全屏。
 * 吊桥与箱号/贝号筛选为 UI 占位，除缩放与全屏外未与父级数据联动。
 */
import { ref } from "vue";

const props = defineProps<{
  /** 可选栏号列表（来自场景中的全部栏） */
  laneOptions: string[];
  /** 当前选中的栏，与父级 `selectedLanes` 同步 */
  selectedLanes: Set<string>;
  /** 贝面缩放百分比 */
  scalePercent: number;
  /** 可选：自定义吊桥编号列表，缺省为 QC1–QC7 */
  cranes?: string[];
}>();

const emit = defineEmits<{
  (e: "toggle-lane", lane: string): void;
  (e: "update:scalePercent", v: number): void;
  (e: "fullscreen"): void;
}>();

/** 箱号搜索（占位，未接过滤逻辑） */
const containerNo = ref("");
/** 贝号搜索（占位，未接过滤逻辑） */
const bayNo = ref("");

const craneList = props.cranes?.length
  ? props.cranes
  : ["QC1", "QC2", "QC3", "QC4", "QC5", "QC6", "QC7"];
/** 当前高亮的吊桥芯片，仅本地 UI 状态 */
const activeCranes = ref<Set<string>>(new Set(craneList));

/** 切换吊桥芯片选中；不允许全部取消 */
function toggleCrane(q: string) {
  const n = new Set(activeCranes.value);
  if (n.has(q)) n.delete(q);
  else n.add(q);
  if (n.size === 0) n.add(q);
  activeCranes.value = n;
}

/** 某栏街区芯片是否处于选中（与父级勾选一致） */
function isLaneActive(lane: string) {
  return props.selectedLanes.has(lane);
}
</script>

<template>
  <div class="yard-toolbar">
    <div class="yard-toolbar__row">
      <div class="yard-toolbar__group">
        <span class="yard-toolbar__label">街区</span>
        <div class="yard-toolbar__chips">
          <button
            v-for="lane in laneOptions"
            :key="lane"
            type="button"
            class="chip"
            :class="{ 'chip--active': isLaneActive(lane) }"
            @click="emit('toggle-lane', lane)"
          >
            {{ lane }}
          </button>
        </div>
      </div>

      <div class="yard-toolbar__group">
        <span class="yard-toolbar__label">吊桥</span>
        <div class="yard-toolbar__chips">
          <button
            v-for="q in craneList"
            :key="q"
            type="button"
            class="chip"
            :class="{ 'chip--active': activeCranes.has(q) }"
            @click="toggleCrane(q)"
          >
            {{ q }}
          </button>
        </div>
      </div>
    </div>

    <div class="yard-toolbar__row yard-toolbar__row--secondary">
      <el-input
        v-model="containerNo"
        clearable
        placeholder="箱号搜索"
        class="yard-toolbar__input"
      />
      <el-input
        v-model="bayNo"
        clearable
        placeholder="贝号"
        class="yard-toolbar__input yard-toolbar__input--narrow"
      />
      <el-select placeholder="筛选条件" class="yard-toolbar__select" disabled>
        <el-option label="（示例）" value="demo" />
      </el-select>
      <div class="yard-toolbar__zoom">
        <span class="yard-toolbar__label">贝面缩放</span>
        <input
          type="range"
          min="60"
          max="140"
          step="5"
          :value="scalePercent"
          @input="
            emit(
              'update:scalePercent',
              Number(($event.target as HTMLInputElement).value)
            )
          "
        />
        <span class="yard-toolbar__zoom-value">{{ scalePercent }}%</span>
      </div>
      <el-button type="primary" plain @click="emit('fullscreen')"
        >全屏</el-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">
.yard-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 18px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.yard-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
}
.yard-toolbar__row--secondary {
  align-items: center;
}
.yard-toolbar__group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.yard-toolbar__label {
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
}
.yard-toolbar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border: none;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  background: #e2e8f0;
  color: #0f172a;
}
.chip--active {
  background: #2c7cb6;
  color: #fff;
}
.yard-toolbar__input {
  width: 200px;
}
.yard-toolbar__input--narrow {
  width: 120px;
}
.yard-toolbar__select {
  width: 140px;
}
.yard-toolbar__zoom {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.yard-toolbar__zoom-value {
  width: 44px;
  font-size: 12px;
  color: #334155;
}
</style>
