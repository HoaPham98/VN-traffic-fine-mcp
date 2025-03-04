import type { Violation } from "../types.js";

const BASE_URL = "https://api.zm.io.vn/v1/csgt/tracuu";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
};

export interface EngineResult {
  violations: Violation[];
  source: string;
}

export async function zmIo(
  plate: string,
  vehicleType: "1" | "2" | "3",
  verbose = false
): Promise<EngineResult | null> {
  if (verbose) process.stdout.write("  [zm.io.vn] ");

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("licensePlate", plate.toUpperCase().replace(/[-.\s]/g, ""));
    url.searchParams.set("vehicleType", vehicleType);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: HEADERS,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    const payload = data.data as Record<string, unknown> | undefined;

    if (!payload) {
      if (verbose) console.log("empty response");
      return null;
    }

    const items = (payload.json as unknown[]) ?? [];

    if (items.length === 0) {
      if (verbose) console.log("no violations");
      return { violations: [], source: "zm.io.vn" };
    }

    const violations: Violation[] = items.map((it) => {
      const i = it as Record<string, unknown>;
      return {
        licensePlate: String(i.bienkiemsoat ?? ""),
        plateColor: String(i.maubien ?? ""),
        vehicleType: String(i.loaiphuongtien ?? ""),
        violationTime: String(i.thoigianvipham ?? ""),
        violationLocation: String(i.diadiemvipham ?? ""),
        violationBehavior: String(i.hanhvivipham ?? ""),
        status: String(i.trangthai ?? ""),
        detectionUnit: String(i.donviphathienvipham ?? ""),
        resolutionPlaces: i.noigiaiquyetvuviec
          ? [{ name: String(i.noigiaiquyetvuviec) }]
          : [],
      };
    });

    if (verbose) console.log(`${violations.length} violations`);
    return { violations, source: "zm.io.vn" };
  } catch (err) {
    if (verbose) console.log(`FAIL (${(err as Error).message})`);
    return null;
  }
}
