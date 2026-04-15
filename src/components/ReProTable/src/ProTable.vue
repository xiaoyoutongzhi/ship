<script setup lang="ts">
import { computed } from "vue";
import type { ProTableColumn } from "../types";

defineOptions({ name: "ReProTable" });

type Row = Record<string, any>;

const props = withDefaults(
  defineProps<{
    columns: ProTableColumn<Row>[];
    data: Row[];
    rowKey?: string | ((row: Row) => string);
    loading?: boolean;
    stripe?: boolean;
    border?: boolean;
    height?: string | number;
    maxHeight?: string | number;
    showSelection?: boolean;
    showIndex?: boolean;
    indexLabel?: string;
    indexFixed?: boolean | "left" | "right";
    total?: number;
    showPagination?: boolean;
    pageSizes?: number[];
    paginationAlign?: "left" | "center" | "right";
    size?: "large" | "default" | "small";
    resolveSortable?: (
      column: ProTableColumn<Row>
    ) => boolean | "custom" | undefined;
  }>(),
  {
    rowKey: "id",
    loading: false,
    stripe: true,
    border: true,
    showSelection: false,
    showIndex: false,
    indexLabel: "序号",
    indexFixed: false,
    total: 0,
    showPagination: true,
    pageSizes: () => [10, 20, 50, 100],
    paginationAlign: "right",
    size: "default"
  }
);

const emit = defineEmits<{
  (e: "selection-change", rows: Row[]): void;
  (e: "sort-change", ...args: unknown[]): void;
  (e: "page-change", payload: { page: number; pageSize: number }): void;
  (e: "page-size-change", pageSize: number): void;
}>();

// 后端分页场景：由父组件持有 page/pageSize，表格只负责回传变化
const page = defineModel<number>("page", { default: 1 });
const pageSize = defineModel<number>("pageSize", { default: 20 });

const resolvedColumns = computed(() => {
  const list: ProTableColumn<Row>[] = [];
  if (props.showSelection) {
    list.push({ type: "selection", width: 48, fixed: "left" });
  }
  if (props.showIndex) {
    list.push({
      type: "index",
      label: props.indexLabel,
      width: 72,
      align: "center",
      fixed: props.indexFixed
    });
  }
  for (const c of props.columns) {
    list.push(c);
  }
  return list;
});

function formatCell(
  row: Row,
  col: ProTableColumn<Row>,
  index: number
): string | number {
  if ("type" in col && (col.type === "selection" || col.type === "index")) {
    return "";
  }
  const c = col as Extract<ProTableColumn<Row>, { prop: keyof Row & string }>;
  const raw = row[c.prop];
  if (c.formatter) {
    return c.formatter(row, col, raw, index) as string | number;
  }
  if (raw === null || raw === undefined || raw === "") {
    return c.emptyText ?? "-";
  }
  return raw as string | number;
}

function onSortChange(...args: unknown[]) {
  emit("sort-change", ...args);
}

function onSelectionChange(rows: Row[]) {
  emit("selection-change", rows);
}

function getSortable(column: ProTableColumn<Row>) {
  // 统一排序策略入口：优先使用外部规则，其次列自身 sortable
  return props.resolveSortable?.(column) ?? (column as any).sortable;
}

function onCurrentChange(value: number) {
  page.value = value;
  // 统一只抛一个 page-change，父组件据此发起后端请求
  emit("page-change", { page: value, pageSize: pageSize.value });
}

function onPageSizeChange(value: number) {
  pageSize.value = value;
  // 常见后端约定：切换每页条数后回到第一页
  if (page.value !== 1) page.value = 1;
  emit("page-size-change", value);
  emit("page-change", { page: page.value, pageSize: value });
}
</script>

<template>
  <div class="re-pro-table">
    <el-table
      v-loading="loading"
      class="re-pro-table__table"
      :data="data"
      :row-key="rowKey"
      :stripe="stripe"
      :border="border"
      :height="height"
      :max-height="maxHeight"
      :size="size"
      @sort-change="onSortChange"
      @selection-change="onSelectionChange"
    >
      <template v-for="(col, idx) in resolvedColumns" :key="idx">
        <el-table-column
          v-if="'type' in col && col.type === 'selection'"
          type="selection"
          :width="col.width"
          :fixed="col.fixed"
          :reserve-selection="col.reserveSelection"
          :selectable="col.selectable"
        />
        <el-table-column
          v-else-if="'type' in col && col.type === 'index'"
          type="index"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :align="col.align"
          :index="col.index"
        />
        <el-table-column
          v-else
          :prop="(col as any).prop"
          :label="(col as any).label"
          :width="(col as any).width"
          :min-width="(col as any).minWidth"
          :fixed="(col as any).fixed"
          :align="(col as any).align"
          :sortable="getSortable(col as any)"
          :show-overflow-tooltip="(col as any).showOverflowTooltip"
        >
          <template v-if="(col as any).headerSlot" #header>
            <slot :name="(col as any).headerSlot" />
          </template>
          <template #default="scope">
            <slot
              v-if="(col as any).slot"
              :name="(col as any).slot"
              :row="scope.row"
              :column="col"
              :$index="scope.$index"
            />
            <span v-else>{{
              formatCell(scope.row, col as any, scope.$index)
            }}</span>
          </template>
        </el-table-column>
      </template>
      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" :image-size="80" />
        </slot>
      </template>
    </el-table>

    <div
      v-if="showPagination"
      class="re-pro-table__pager"
      :class="`is-align-${paginationAlign}`"
    >
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="onCurrentChange"
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.re-pro-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.re-pro-table__table {
  width: 100%;
}

.re-pro-table__pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;

  &.is-align-left {
    justify-content: flex-start;
  }

  &.is-align-center {
    justify-content: center;
  }

  &.is-align-right {
    justify-content: flex-end;
  }
}
</style>
