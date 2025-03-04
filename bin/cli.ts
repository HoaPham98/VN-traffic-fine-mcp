#!/usr/bin/env node

import { lookup, type VehicleType } from "../src/phatnguoi.js";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Tra cuu phat nguoi - CLI

Dung: phatnguoi <bien_so> [loai] [tuy_chon]

Vi du:
  phatnguoi 51F12345       # O to
  phatnguoi 30H47465 2     # Xe may
  phatnguoi 51F12345 1 -v  # Verbose

Loai phuong tien:
  1  O to (mac dinh)
  2  Xe may
  3  Xe may dien

Tuy chon:
  -v, --verbose   Hien thi trang thai tung API
  -h, --help      Hien thi tro giup
`);
  process.exit(0);
}

const plate = args[0];
const vehicleType = (args.find((a) => !a.startsWith("-")) ?? "1") as VehicleType;
const verbose = args.includes("-v") || args.includes("--verbose");

console.log(`\nTra cuu phat nguoi  [${new Date().toLocaleString("vi-VN")}]`);
console.log(`-> Tra cuu: ${plate.toUpperCase()} | Loai: ${vehicleType}`);

const start = Date.now();
const result = await lookup(plate, vehicleType, verbose);
const elapsed = Date.now() - start;

console.log(`\n${"=".repeat(70)}`);
console.log(`  Bien so : ${plate.toUpperCase()}`);
console.log(`  Nguon   : ${result.source || "none"}`);
console.log(`  Thoi gian: ${elapsed}ms`);
console.log(`${"=".repeat(70)}`);

if (result.source === "") {
  console.log("  [!] Tat ca API deu loi - khong tra cuu duoc.");
} else if (result.violations.length === 0) {
  console.log("  [OK] Khong tim thay vi pham.");
} else {
  console.log(`  [!!] Phat hien ${result.violations.length} vi pham:`);
  for (let i = 0; i < result.violations.length; i++) {
    const v = result.violations[i];
    console.log(`\n  Vi pham #${i + 1}  ${"-".repeat(50)}`);
    if (v.licensePlate) console.log(`  Bien so xe         : ${v.licensePlate}`);
    if (v.plateColor) console.log(`  Mau bien            : ${v.plateColor}`);
    if (v.vehicleType) console.log(`  Loai phuong tien    : ${v.vehicleType}`);
    if (v.violationTime) console.log(`  Thoi gian           : ${v.violationTime}`);
    if (v.violationLocation) console.log(`  Dia diem            : ${v.violationLocation}`);
    if (v.violationBehavior) console.log(`  Hanh vi vi pham     : ${v.violationBehavior}`);
    if (v.status) console.log(`  Trang thai          : ${v.status}`);
    if (v.detectionUnit) console.log(`  Don vi phat hien    : ${v.detectionUnit}`);
    if (v.resolutionPlaces.length > 0) {
      console.log(`  Noi giai quyet      :`);
      for (const p of v.resolutionPlaces) {
        console.log(`      - ${p.name}${p.address ? ` (${p.address})` : ""}`);
      }
    }
  }
}

console.log();
