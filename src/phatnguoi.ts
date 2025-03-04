import type { Violation } from "./types.js";
import { checkPhatNguoi, zmIo, phatNguoi } from "./engines/index.js";

export type VehicleType = "1" | "2" | "3";

export const VEHICLE_TYPES: Record<VehicleType, string> = {
  "1": "O to",
  "2": "Xe may",
  "3": "Xe may dien",
};

export interface LookupResult {
  violations: Violation[];
  source: string;
}

const ENGINES = [
  { name: "checkphatnguoi.vn", fn: checkPhatNguoi },
  { name: "zm.io.vn", fn: zmIo },
  { name: "phatnguoi.vn", fn: phatNguoi },
] as const;

export async function lookup(
  plate: string,
  vehicleType: VehicleType = "1",
  verbose = false
): Promise<LookupResult> {
  for (const { name, fn } of ENGINES) {
    const result = await fn(plate, vehicleType, verbose);
    if (result !== null) {
      return result;
    }
  }
  return { violations: [], source: "" };
}
