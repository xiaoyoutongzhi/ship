import type { CntrLocationDto, YardContainerModel } from "@/types/yard";

const prefixes = ["MRSU", "MSCU", "CMAU", "COSU", "FANU", "TEMU"] as const;

let seq = 1;

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildMockContainerFromLocation(
  loc: CntrLocationDto,
  extra?: Partial<Pick<YardContainerModel, "in_operation" | "work_seq">>
): YardContainerModel {
  const prefix = pick(prefixes);
  const body = String(1_000_000 + Math.floor(Math.random() * 8_000_000));
  const size_ft: 20 | 40 = Math.random() > 0.35 ? 20 : 40;
  const t = "GP";
  const iso = `${size_ft}${t}`;
  const weight = (Math.random() * 22 + 6).toFixed(1);
  const id = `cntr-${loc.yard_lane_no}-${loc.bay_start_num}-${loc.stack_num}-${loc.tier_num}-${seq++}`;

  return {
    id,
    terminal_code: loc.terminal_code,
    yard_lane_no: loc.yard_lane_no,
    bay_no: loc.bay_start_num,
    stack_num: loc.stack_num,
    tier_num: loc.tier_num,
    bay_start_num: loc.bay_start_num,
    bay_end_num: loc.bay_end_num,
    container_no: `${prefix}${body}`,
    size_ft,
    type_code: t,
    iso,
    weight_ton: weight,
    work_seq: Math.random() > 0.65 ? Math.floor(Math.random() * 9) + 1 : null,
    in_operation: false,
    ...extra
  };
}
