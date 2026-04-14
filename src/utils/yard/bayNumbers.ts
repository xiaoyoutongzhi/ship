import type { YardBlockModel } from "@/types/yard";

/** 从宽松结构解析贝位序号列表 */
export function resolveBayNumbers(yard: YardBlockModel): number[] {
  if (yard.bays?.length) {
    return [...yard.bays].sort((a, b) => a - b);
  }
  const min = yard.min_bay_no ?? 1;
  const max = yard.max_bay_no ?? yard.bay_num ?? min;
  const out: number[] = [];
  for (let n = min; n <= max; n++) {
    if (n % 2 !== 0) out.push(n);
  }
  return out;
}
