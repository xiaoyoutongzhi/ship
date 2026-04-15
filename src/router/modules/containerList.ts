/** 智能配载 - 箱列表（产品示意页） */
export default {
  path: "/smart-stowage/container-list",
  name: "SmartStowageContainerList",
  component: () => import("@/views/smart-stowage/container-list/index.vue"),
  meta: {
    icon: "ep/box",
    title: "箱列表",
    rank: 4
  }
} satisfies RouteConfigsTable;
