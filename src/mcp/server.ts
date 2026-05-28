#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { lookup, type VehicleType } from "../phatnguoi.js";

const server = new McpServer({
  name: "phatnguoi",
  version: "1.0.0",
});

server.registerTool(
  "lookup_violations",
  {
    description: "Tra cuu vi pham giao thong theo bien so xe (khong captcha). Thu tu nguon: checkphatnguoi.vn → zm.io.vn → phatnguoi.vn.",
    inputSchema: {
      plate: z.string().describe("Bien so xe (VD: 51F12345, 30H47465)"),
      vehicle_type: z.string().optional().describe("Loai phuong tien: 1=O to (mac dinh), 2=Xe may, 3=Xe may dien"),
    },
  },
  async ({ plate, vehicle_type = "1" }) => {
    const result = await lookup(plate, vehicle_type as VehicleType);

    if (result.source === "") {
      return {
        content: [{ type: "text" as const, text: "Khong tra cuu duoc. Tat ca cac nguon deu loi." }],
      };
    }

    if (result.violations.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Khong tim thay vi pham cho bien so ${plate.toUpperCase()} (Nguon: ${result.source})`,
          },
        ],
      };
    }

    const lines: string[] = [
      `=== Ket qua tra cuu: ${plate.toUpperCase()} ===`,
      `Nguon: ${result.source}`,
      `So vi pham: ${result.violations.length}`,
      "",
    ];

    for (let i = 0; i < result.violations.length; i++) {
      const v = result.violations[i];
      lines.push(`--- Vi pham #${i + 1} ---`);
      if (v.licensePlate) lines.push(`  Bien so: ${v.licensePlate}`);
      if (v.plateColor) lines.push(`  Mau bien: ${v.plateColor}`);
      if (v.vehicleType) lines.push(`  Loai xe: ${v.vehicleType}`);
      if (v.violationTime) lines.push(`  Thoi gian: ${v.violationTime}`);
      if (v.violationLocation) lines.push(`  Dia diem: ${v.violationLocation}`);
      if (v.violationBehavior) lines.push(`  Hanh vi: ${v.violationBehavior}`);
      if (v.status) lines.push(`  Trang thai: ${v.status}`);
      if (v.detectionUnit) lines.push(`  Don vi: ${v.detectionUnit}`);
      if (v.resolutionPlaces.length > 0) {
        lines.push(`  Noi giai quyet:`);
        for (const p of v.resolutionPlaces) {
          lines.push(`    - ${p.name}${p.address ? ` (${p.address})` : ""}`);
        }
      }
      lines.push("");
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
