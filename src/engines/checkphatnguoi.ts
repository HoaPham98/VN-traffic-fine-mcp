import type { Violation } from "../types.js";

const BASE_URL = "https://api.checkphatnguoi.vn/phatnguoi";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
  "Content-Type": "application/json",
};

export interface EngineResult {
  violations: Violation[];
  source: string;
}

export async function checkPhatNguoi(
  plate: string,
  vehicleType: "1" | "2" | "3",
  verbose = false
): Promise<EngineResult | null> {
  if (verbose) process.stdout.write("  [checkphatnguoi.vn] ");

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ bienso: plate.toUpperCase().replace(/[-.\s]/g, "") }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { status?: number; data?: unknown[] };

    if (data.status === 2 || !data.data || data.data.length === 0) {
      if (verbose) console.log("no violations");
      return { violations: [], source: "checkphatnguoi.vn" };
    }

    if (data.status !== 1) {
      if (verbose) console.log(`unknown status=${data.status}`);
      return null;
    }

    const loaiLower = (v: Record<string, unknown>) =>
      String(v["Loại phương tiện"] ?? "").toLowerCase();

    const filtered = (data.data as Record<string, unknown>[]).filter((v) => {
      const loai = loaiLower(v);
      if (vehicleType === "1") return loai.includes("ô tô");
      if (vehicleType === "2") return loai.includes("xe máy") && !loai.includes("điện");
      if (vehicleType === "3") return loai.includes("điện");
      return true;
    });

    const violations: Violation[] = filtered.map((item) => ({
      licensePlate: String(item["Biển kiểm soát"] ?? ""),
      plateColor: String(item["Màu biển"] ?? ""),
      vehicleType: String(item["Loại phương tiện"] ?? ""),
      violationTime: String(item["Thời gian vi phạm"] ?? ""),
      violationLocation: String(item["Địa điểm vi phạm"] ?? ""),
      violationBehavior: String(item["Hành vi vi phạm"] ?? ""),
      status: String(item["Trạng thái"] ?? ""),
      detectionUnit: String(item["Đơn vị phát hiện vi phạm"] ?? ""),
      resolutionPlaces: (Array.isArray(item["Nơi giải quyết vụ việc"])
        ? item["Nơi giải quyết vụ việc"]
        : []
      ).map((p) => ({ name: String(p) })),
    }));

    if (verbose) console.log(`${violations.length} violations`);
    return { violations, source: "checkphatnguoi.vn" };
  } catch (err) {
    if (verbose) console.log(`FAIL (${(err as Error).message})`);
    return null;
  }
}
