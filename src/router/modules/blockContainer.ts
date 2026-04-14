/** 与 welcome 一致：仅导出子路由，由唯一的 path:\"/\" 布局（home.ts）承载，避免重复根路由导致页面无法打开 */
export default {
  path: "/block-container",
  name: "Container",
  component: () => import("@/views/block-container/index.vue"),
  meta: {
    icon: "ep/memo",
    title: "街区集装箱",
    rank: 3
  }
} satisfies RouteConfigsTable;
