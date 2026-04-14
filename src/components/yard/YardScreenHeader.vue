<script setup lang="ts">
/**
 * 堆场全屏页顶栏：主副标题与右侧统计文案。
 */
defineProps<{
  /** 页面主标题 */
  title: string;
  /** 副标题，可选 */
  subtitle?: string;
  /** 右侧统计区完整字符串（如箱数量） */
  statText: string;
}>();
</script>

<template>
  <header class="yard-screen-header">
    <div>
      <h2 class="yard-screen-header__title">{{ title }}</h2>
      <p v-if="subtitle" class="yard-screen-header__sub">{{ subtitle }}</p>
    </div>
    <div class="yard-screen-header__stat">{{ statText }}</div>
  </header>
</template>

<style scoped lang="scss">
.yard-screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  background: #0f3a52;
  color: #fff;
}
.yard-screen-header__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.yard-screen-header__sub {
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.85;
}
.yard-screen-header__stat {
  font-size: 13px;
  white-space: nowrap;
}
</style>
