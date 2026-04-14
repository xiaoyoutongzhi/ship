<script setup lang="ts">
/**
 * 堆场图例条：固定图例项 + 可选底部操作提示。
 */
defineProps<{
  /** 图例下方的补充说明（如交互提示） */
  tip?: string;
}>();
</script>

<template>
  <div class="yard-legend">
    <div class="yard-legend__items">
      <div class="item">
        <span class="swatch swatch--all" />
        <span>所有集装箱</span>
      </div>
      <div class="item">
        <span class="swatch swatch--empty" />
        <span>空箱位</span>
      </div>
      <div class="item">
        <span class="swatch swatch--ft40" />
        <span>40尺集装箱</span>
      </div>
      <div class="item">
        <span class="swatch swatch--work" />
        <span>运作中装卸作业的集装箱</span>
      </div>
      <div class="item">
        <span class="badge">1</span>
        <span>作业顺序号</span>
      </div>
    </div>
    <p v-if="tip" class="yard-legend__tip">{{ tip }}</p>
  </div>
</template>

<style scoped lang="scss">
.yard-legend {
  padding: 10px 18px;
  background: #f1f5f9;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #334155;
}
.yard-legend__items {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
  align-items: center;
}
.item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
}
.swatch--empty {
  border-style: dashed;
}
.swatch--all {
  border-color: #3b82f6;
}
.swatch--ft40 {
  width: 28px;
}
.swatch--work {
  border-color: #f59e0b;
  box-shadow: inset 0 0 0 1px #f59e0b;
}
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fbbf24;
  font-size: 10px;
  font-weight: 700;
  color: #111827;
}
.yard-legend__tip {
  margin: 8px 0 0;
  font-size: 11px;
  color: #64748b;
}
</style>
