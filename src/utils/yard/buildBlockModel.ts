import type { YardBlockModel, YardStructureDto } from "@/types/yard";
import { resolveBayNumbers } from "./bayNumbers";

export function toYardBlockModel(dto: YardStructureDto): YardBlockModel {
  return {
    ...dto,
    bayNumbers: resolveBayNumbers(dto)
  };
}
