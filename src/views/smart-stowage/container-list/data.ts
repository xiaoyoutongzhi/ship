export type ContainerRow = {
  id: string;
  specialType: "normal" | "danger";
  invertType: string;
  entryStatus: string;
  cntrNo: string;
  importBay: string;
  exportBay: string;
  owner: string;
  typeName: string;
  fullEmpty: string;
  vesselAlias: string;
  dischargePort: string;
  grossWeight: number;
  setTemp: string;
  dgClass: string;
  shipPos: string;
  yardPos: string;
  /** 卸船 / 装船 */
  moveKind: "discharge" | "load";
};

export const containerColumns = [
  {
    prop: "specialType",
    label: "特种箱",
    width: 88,
    align: "center" as const,
    slot: "special"
  },
  {
    prop: "invertType",
    label: "倒箱类型",
    minWidth: 120,
    sortable: true,
    sortableKey: "invertType"
  },
  { prop: "entryStatus", label: "进港状态", minWidth: 100 },
  {
    prop: "cntrNo",
    label: "箱号",
    minWidth: 130,
    sortable: "custom",
    sortableKey: "cntrNo",
    showOverflowTooltip: true
  },
  { prop: "importBay", label: "进口卸船舱位", minWidth: 130 },
  { prop: "exportBay", label: "出口装船舱位", minWidth: 120 },
  { prop: "owner", label: "箱主", width: 88 },
  { prop: "typeName", label: "箱型名", width: 88 },
  { prop: "fullEmpty", label: "空重", width: 88 },
  { prop: "vesselAlias", label: "出口船别名", minWidth: 130, showOverflowTooltip: true },
  { prop: "dischargePort", label: "卸货港", width: 100 },
  {
    prop: "grossWeight",
    label: "总重(t)",
    width: 100,
    sortable: "custom",
    sortableKey: "grossWeight",
    align: "right" as const
  },
  { prop: "setTemp", label: "设定温度", width: 100 },
  { prop: "dgClass", label: "危险品等级", width: 110 },
  { prop: "shipPos", label: "船上位置", minWidth: 110 },
  { prop: "yardPos", label: "堆场位置", minWidth: 110 }
];

export function buildMockContainers(): ContainerRow[] {
  const owners = ["M5K", "MSC", "CMA", "ONE"];
  const types = ["20GP", "40HC", "40GP", "45HC"];
  const rows: ContainerRow[] = [];
  const bases = [
    "SUDU1394762",
    "MSCU9823411",
    "ONEY8839201",
    "CMAU4451022",
    "TEMU5567120",
    "OOLU7788123",
    "FFAU3344556"
  ];
  for (let i = 0; i < 22; i++) {
    const base = bases[i % bases.length];
    const no = `${base}${i > 7 ? i : ""}`;
    const moveKind: ContainerRow["moveKind"] = i % 3 === 0 ? "discharge" : "load";
    rows.push({
      id: `c-${i + 1}`,
      moveKind,
      specialType: i % 6 === 0 ? "danger" : "normal",
      invertType: i % 4 === 0 ? "翻倒" : "-",
      entryStatus: i % 2 === 0 ? "已进港" : "在途",
      cntrNo: no,
      importBay: moveKind === "discharge" ? `Bay ${String(3 + (i % 4)).padStart(2, "0")}D` : "-",
      exportBay: moveKind === "load" ? `M${(i % 6) + 1}K` : "-",
      owner: owners[i % owners.length],
      typeName: types[i % types.length],
      fullEmpty: i % 7 === 0 ? "空箱" : "重箱",
      vesselAlias: "MTMSJ-1247W",
      dischargePort: "KRUSN",
      grossWeight: Math.round((18 + (i % 10) * 1.1) * 10) / 10,
      setTemp: i % 6 === 0 ? "-18°C" : "-",
      dgClass: i % 8 === 0 ? "2.1" : "-",
      shipPos: moveKind === "discharge" ? `D${(i % 5) + 1}-${(i % 8) + 1}` : "-",
      yardPos: ["B02", "C03", "A04", "B05", "C06"][i % 5] + `-${(i % 3) + 1}`
    });
  }
  return rows;
}
