<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { ReProTable } from "@/components/ReProTable";
import type { ProTableColumn } from "@/components/ReProTable";
import {
  buildMockContainers,
  containerColumns,
  type ContainerRow
} from "./data";

defineOptions({ name: "SmartStowageContainerList" });

const allRows = ref<ContainerRow[]>(buildMockContainers());
const rows = ref<ContainerRow[]>([]);
const total = ref(0);
const loading = ref(false);
type FilterField =
  | "cntrNo"
  | "size"
  | "invertType"
  | "fullEmpty"
  | "shipPos"
  | "yardPos";

const filterField = ref<FilterField>("cntrNo");
const filterOptions: Array<{ label: string; value: FilterField }> = [
  { label: "箱号", value: "cntrNo" },
  { label: "尺寸", value: "size" },
  { label: "箱类型", value: "invertType" },
  { label: "空重", value: "fullEmpty" },
  { label: "船上位置", value: "shipPos" },
  { label: "堆场位置", value: "yardPos" }
];
const keywordDraft = ref("");
const keyword = ref("");

const page = ref(1);
const pageSize = ref(10);

const columns = containerColumns as ProTableColumn<ContainerRow>[];
const sortableRules: Record<string, boolean | "custom"> = {
  cntrNo: "custom",
  grossWeight: true,
  invertType: true
};
const sortState = ref<{
  prop?: keyof ContainerRow;
  order?: "ascending" | "descending" | null;
}>({});

function resolveSortable(column: ProTableColumn<ContainerRow>) {
  if (!("prop" in column)) return false;
  const c = column as Extract<ProTableColumn<ContainerRow>, { prop: string }>;
  const key = (c.sortableKey || c.prop) as string;
  return sortableRules[key] ?? false;
}

const selected = ref<ContainerRow[]>([]);

const stats = computed(() => {
  const list = rows.value;
  const discharge = list.filter(r => r.moveKind === "discharge").length;
  const load = list.filter(r => r.moveKind === "load").length;
  const yardMap = new Map<string, number>();
  for (const r of list) {
    const block = r.yardPos.split("-")[0] || r.yardPos;
    yardMap.set(block, (yardMap.get(block) ?? 0) + 1);
  }
  const yardText = [...yardMap.entries()]
    .map(([b, n]) => `${b}(${n})`)
    .join(" ");
  const shipSlots = list.filter(r => r.shipPos && r.shipPos !== "-").length;
  return {
    total: total.value,
    discharge,
    load,
    yardText: yardText || "暂无",
    shipText: shipSlots ? `${shipSlots} 个舱位` : "暂无"
  };
});

function applyFilter() {
  keyword.value = keywordDraft.value;
  page.value = 1;
  fetchTableData();
}

function resetFilter() {
  keywordDraft.value = "";
  keyword.value = "";
  filterField.value = "cntrNo";
  page.value = 1;
  fetchTableData();
}

function onSelectionChange(rows: ContainerRow[]) {
  selected.value = rows;
}

function refresh() {
  allRows.value = buildMockContainers();
  page.value = 1;
  selected.value = [];
  fetchTableData();
  ElMessage.success("已刷新");
}

function exportCsv() {
  ElMessage.info("导出示例：可在此对接下载接口");
}

function bayWeightOpt() {
  ElMessage.success("贝内重量优化（示例）");
}

function baySeqOpt() {
  ElMessage.success("贝内出箱顺序优化（示例）");
}

const selectedPreview = computed(() =>
  selected.value
    .slice(0, 6)
    .map(r => r.cntrNo)
    .join("、")
);

async function fetchTableData() {
  loading.value = true;
  try {
    // 这里模拟后端分页，请替换为真实接口:
    // await api({
    //   page: page.value,
    //   pageSize: pageSize.value,
    //   keyword: keyword.value,
    //   field: filterField.value,
    //   sortProp: sortState.value.prop,
    //   sortOrder: sortState.value.order
    // })
    const k = keyword.value.trim().toLowerCase();
    let filtered = !k
      ? allRows.value
      : allRows.value.filter(row => {
          const v = String(getFilterFieldValue(row, filterField.value)).toLowerCase();
          return v.includes(k);
        });
    if (sortState.value.prop && sortState.value.order) {
      const { prop, order } = sortState.value;
      const direction = order === "ascending" ? 1 : -1;
      filtered = [...filtered].sort((a, b) => {
        const av = a[prop];
        const bv = b[prop];
        if (typeof av === "number" && typeof bv === "number") {
          return (av - bv) * direction;
        }
        return String(av).localeCompare(String(bv)) * direction;
      });
    }
    total.value = filtered.length;
    const start = (page.value - 1) * pageSize.value;
    rows.value = filtered.slice(start, start + pageSize.value);
  } finally {
    loading.value = false;
  }
}

function onPageChange(payload: { page: number; pageSize: number }) {
  // 统一处理分页变化，避免在多个事件里重复写请求逻辑
  page.value = payload.page;
  pageSize.value = payload.pageSize;
  fetchTableData();
}

function onSortChange(payload: {
  prop?: keyof ContainerRow;
  order?: "ascending" | "descending" | null;
}) {
  sortState.value = { prop: payload.prop, order: payload.order };
  page.value = 1;
  fetchTableData();
}

function getFilterFieldValue(row: ContainerRow, field: FilterField) {
  if (field === "size") {
    return row.typeName.slice(0, 2);
  }
  return row[field];
}

onMounted(fetchTableData);
</script>

<template>
  <div class="cntr-page">
    <header class="cntr-page__hero">
      <div class="cntr-page__hero-left">
        <h1 class="cntr-page__title">智能配载 - 箱列表</h1>
        <p class="cntr-page__sub">集装箱清单 | 支持筛选、排序、批量优化操作</p>
      </div>
      <div class="cntr-page__hero-stats">
        <span class="cntr-page__metric">
          总箱个数：<em>{{ stats.total }}</em>
        </span>
        <span class="cntr-page__metric">
          卸船箱数：<em>{{ stats.discharge }}</em>
        </span>
        <span class="cntr-page__metric">
          装船箱数：<em>{{ stats.load }}</em>
        </span>
        <span class="cntr-page__metric cntr-page__metric--wide">
          堆场分布：
          <span class="cntr-page__chips">{{ stats.yardText }}</span>
        </span>
        <span class="cntr-page__metric">
          船上分布：
          <span class="cntr-page__chips">{{ stats.shipText }}</span>
        </span>
      </div>
    </header>

    <el-container class="cntr-page__body">
      <el-main class="cntr-page__main">
        <div class="cntr-page__toolbar">
          <div class="cntr-page__filters">
            <el-select v-model="filterField" style="width: 120px">
              <el-option
                v-for="item in filterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="keywordDraft"
              clearable
              style="width: 220px"
              placeholder="输入关键字"
              @keyup.enter="applyFilter"
            />
            <el-button type="primary" @click="applyFilter">应用筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </div>
          <div class="cntr-page__actions">
            <el-button text @click="refresh">
              <IconifyIconOnline icon="ep:refresh" class="mr-1" />
              刷新
            </el-button>
            <el-button type="primary" @click="bayWeightOpt"
              >贝内重量优化</el-button
            >
            <el-button type="primary" @click="baySeqOpt"
              >贝内出箱顺序优化</el-button
            >
            <el-button text @click="exportCsv">
              <IconifyIconOnline icon="ep:download" class="mr-1" />
              导出
            </el-button>
          </div>
        </div>

        <ReProTable
          v-model:page="page"
          v-model:page-size="pageSize"
          class="cntr-page__table"
          :columns="columns"
          :data="rows"
          :loading="loading"
          :total="total"
          :page-sizes="[10, 12, 15, 20, 50, 100]"
          :resolve-sortable="resolveSortable"
          row-key="id"
          show-selection
          show-index
          @selection-change="onSelectionChange"
          @page-change="onPageChange"
          @sort-change="onSortChange"
        >
          <template #special="{ row }">
            <span
              :class="[
                'cntr-page__special-tag',
                row.specialType === 'danger'
                  ? 'cntr-page__special-tag--danger'
                  : 'cntr-page__special-tag--normal'
              ]"
            >
              {{ row.specialType === "danger" ? "危" : "普" }}
            </span>
          </template>
        </ReProTable>
      </el-main>

      <el-aside width="300px" class="cntr-page__aside">
        <el-card shadow="never" class="cntr-page__card">
          <template #header>
            <span class="cntr-page__card-title">选中集装箱</span>
          </template>
          <p class="cntr-page__muted">已选中 {{ selected.length }} 个集装箱</p>
          <p v-if="selectedPreview" class="cntr-page__preview">
            {{ selectedPreview
            }}<template v-if="selected.length > 6"> …</template>
          </p>
          <p v-else class="cntr-page__muted">在左侧表格勾选行即可批量操作</p>
          <p class="cntr-page__hint">可执行批量优化操作</p>
        </el-card>

        <el-card shadow="never" class="cntr-page__card">
          <template #header>
            <span class="cntr-page__card-title">批量操作建议</span>
          </template>
          <div class="cntr-page__batch">
            <el-button class="cntr-page__batch-btn" @click="bayWeightOpt">
              贝内重量优化
            </el-button>
            <el-button
              class="cntr-page__batch-btn"
              style="margin-left: 0"
              @click="baySeqOpt"
            >
              贝内出箱顺序优化
            </el-button>
          </div>
        </el-card>
      </el-aside>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.mr-1 {
  margin-right: 4px;
  vertical-align: -2px;
}

.cntr-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100vh - 58px);
  min-height: 640px;
  margin: 0;
  padding: 12px 12px 10px;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

.cntr-page__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 20px;
  padding: 12px 18px;
  color: #fff;
  background: linear-gradient(90deg, #0f3b56 0%, #1c587c 58%, #226289 100%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 12px;
  box-shadow:
    0 8px 20px rgb(24 66 95 / 20%),
    inset 0 1px 0 rgb(255 255 255 / 10%);
}

.cntr-page__title {
  margin: 0 0 4px;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.15;
}

.cntr-page__sub {
  margin: 0;
  font-size: 12px;
  opacity: 0.78;
}

.cntr-page__hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  max-width: 860px;
}

.cntr-page__metric {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  color: rgb(240 248 255 / 92%);
  background: rgb(14 43 64 / 42%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 999px;
  white-space: nowrap;
}

.cntr-page__metric em {
  font-style: normal;
  font-weight: 700;
  color: #ffd27a;
}

.cntr-page__metric--wide {
  max-width: min(420px, 65vw);
}

.cntr-page__chips {
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (width <= 1200px) {
  .cntr-page__title {
    font-size: 24px;
  }

  .cntr-page__hero {
    padding: 12px 14px;
  }

  .cntr-page__metric--wide {
    max-width: 300px;
  }

  .cntr-page__body {
    flex-direction: column;
  }

  .cntr-page__main {
    padding-right: 0;
  }

  .cntr-page__aside {
    width: 100% !important;
    max-height: 38vh;
  }
}

.cntr-page__body {
  flex: 1;
  align-items: stretch;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  background: transparent;
}

.cntr-page__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
  padding: 0 8px 0 0;
  overflow: hidden;
  background: transparent;
}

.cntr-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgb(255 255 255 / 86%);
  border: 1px solid rgb(9 30 66 / 8%);
  border-radius: 12px;
  box-shadow: 0 4px 18px rgb(17 43 70 / 6%);
  backdrop-filter: blur(4px);
}

.cntr-page__filters,
.cntr-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.cntr-page__table {
  flex: 1;
  min-height: 0;
  padding: 10px 12px 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid rgb(9 30 66 / 8%);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(17 43 70 / 6%);
}

.cntr-page__table :deep(.re-pro-table) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cntr-page__table :deep(.re-pro-table__table) {
  flex: 1;
  min-height: 0;
}

.cntr-page__table :deep(.el-table__header-wrapper th) {
  height: 54px;
  padding: 12px 0;
}

.cntr-page__table :deep(.el-table__body-wrapper td) {
  height: 52px;
  padding: 10px 0;
}

.cntr-page__table :deep(.el-table__header-wrapper .cell) {
  line-height: 22px;
}

.cntr-page__table :deep(.el-table__body-wrapper .cell) {
  line-height: 20px;
}

.cntr-page__aside {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 0;
  overflow: auto;
  background: transparent;
}

.cntr-page__card {
  border: 1px solid rgb(9 30 66 / 8%);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgb(17 43 70 / 5%);
}

.cntr-page__card-title {
  font-weight: 600;
}

.cntr-page__muted {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.cntr-page__preview {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-all;
}

.cntr-page__hint {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.cntr-page__batch {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cntr-page__batch-btn {
  width: 100%;
  color: var(--el-color-primary);
  background: linear-gradient(
    180deg,
    var(--el-color-primary-light-9) 0%,
    #e9f4ff 100%
  );
  border-color: #cfe7ff;
}

.cntr-page__special-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 20px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.cntr-page__special-tag--normal {
  color: #4a5568;
  background: #eef2f7;
}

.cntr-page__special-tag--danger {
  color: #fff;
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.cntr-page__dash {
  color: var(--el-text-color-placeholder);
}
</style>
