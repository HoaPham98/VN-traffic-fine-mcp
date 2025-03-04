import { parse, type HTMLElement } from "node-html-parser";
import type { Violation } from "../types.js";

const BASE_URL = "https://api.phatnguoi.vn/web/tra-cuu";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
};

export interface EngineResult {
  violations: Violation[];
  source: string;
}

function cell(el: HTMLElement, row: number, col: number): string {
  return el.querySelector(`tr:nth-child(${row}) > td:nth-child(${col})`)?.text?.trim() ?? "";
}

export async function phatNguoi(
  plate: string,
  vehicleType: "1" | "2" | "3",
  verbose = false
): Promise<EngineResult | null> {
  if (verbose) process.stdout.write("  [phatnguoi.vn] ");

  try {
    const url = `${BASE_URL}/${plate.toUpperCase().replace(/[-.\s]/g, "")}/${vehicleType}`;
    const res = await fetch(url, {
      method: "GET",
      headers: HEADERS,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const doc = parse(html);

    const bodies = doc.querySelectorAll("tbody");

    if (bodies.length === 0) {
      if (verbose) console.log("no violations");
      return { violations: [], source: "phatnguoi.vn" };
    }

    const violations: Violation[] = bodies.map((body) => ({
      licensePlate: cell(body, 1, 2),
      plateColor: cell(body, 2, 2),
      vehicleType: cell(body, 3, 2),
      violationTime: cell(body, 4, 2),
      violationLocation: cell(body, 5, 2),
      violationBehavior: cell(body, 6, 2),
      status: cell(body, 7, 2),
      detectionUnit: cell(body, 8, 2),
      resolutionPlaces: [],
    }));

    if (verbose) console.log(`${violations.length} violations`);
    return { violations, source: "phatnguoi.vn" };
  } catch (err) {
    if (verbose) console.log(`FAIL (${(err as Error).message})`);
    return null;
  }
}
