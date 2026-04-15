import ProTable from "./src/ProTable.vue";
import { withInstall } from "@pureadmin/utils";

export const ReProTable = withInstall(ProTable);
export default ReProTable;
export type { ProTableColumn, ProTableProps } from "./types";
