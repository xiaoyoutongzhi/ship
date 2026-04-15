/** 列配置：声明式驱动 `el-table-column` */
export type ProTableColumn<T extends Record<string, any> = Record<string, any>> =
  | ({
      type: "selection";
      width?: string | number;
      fixed?: boolean | "left" | "right";
      reserveSelection?: boolean;
      selectable?: (row: T, index: number) => boolean;
    } & { label?: string; prop?: never })
  | ({
      type: "index";
      label?: string;
      width?: string | number;
      minWidth?: string | number;
      fixed?: boolean | "left" | "right";
      align?: "left" | "center" | "right";
      index?: (index: number) => number;
    } & { prop?: never })
  | {
      prop: keyof T & string;
      label: string;
      width?: string | number;
      minWidth?: string | number;
      fixed?: boolean | "left" | "right";
      align?: "left" | "center" | "right";
      sortable?: boolean | "custom";
      /** 排序规则标识，可配合 `resolveSortable` 做动态控制 */
      sortableKey?: string;
      showOverflowTooltip?: boolean;
      /** 自定义单元格插槽名，与 `#slotName` 对应 */
      slot?: string;
      /** 表头插槽名 */
      headerSlot?: string;
      formatter?: (
        row: T,
        column: ProTableColumn<T>,
        cellValue: unknown,
        index: number
      ) => string | number;
      /** 空值展示，默认 `-` */
      emptyText?: string;
    };

export interface ProTableProps<T extends Record<string, any> = Record<string, any>> {
  columns: ProTableColumn<T>[];
  data: T[];
  rowKey?: string | ((row: T) => string);
  loading?: boolean;
  stripe?: boolean;
  border?: boolean;
  height?: string | number;
  maxHeight?: string | number;
  /** 是否展示多选列（也可在 columns 里写 `type: 'selection'`） */
  showSelection?: boolean;
  /** 是否展示序号列 */
  showIndex?: boolean;
  indexLabel?: string;
  /** 序号列是否固定（默认不固定） */
  indexFixed?: boolean | "left" | "right";
  /** 总条数（服务端分页或前端分页后传入总数） */
  total?: number;
  /** 是否展示底部分页 */
  showPagination?: boolean;
  /** 当前页（后端分页） */
  page?: number;
  /** 每页条数（后端分页） */
  pageSize?: number;
  pageSizes?: number[];
  paginationAlign?: "left" | "center" | "right";
  /** 表格尺寸 */
  size?: "large" | "default" | "small";
  /**
   * 统一排序规则口子：按列返回 `sortable`（优先级高于 column.sortable）
   * 常用于后端声明式字段权限、不同场景的排序开关策略
   */
  resolveSortable?: (
    column: ProTableColumn<T>
  ) => boolean | "custom" | undefined;
}
