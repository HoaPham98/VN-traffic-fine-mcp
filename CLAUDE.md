# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vietnamese traffic violation lookup — queries 3 APIs (checkphatnguoi.vn → zm.io.vn → phatnguoi.vn) to find violations by license plate. No captcha required. Published as npm package `@iamqh/vn-traffic-fine`.

## Commands

```sh
npm run dev       # watch mode (tsx)
npm run start     # production (dist/server.js)
npm run build     # tsc
npm run mcp      # MCP server (dist/src/mcp/server.js)
npm run cli -- <plate> [type] [-v]
npm run typeCheck # tsc --noEmit
```

## Architecture

```
src/engines/         # One file per API source (JSON/HTML parsing)
src/phatnguoi.ts     # Orchestrator + main lookup export (engines, VehicleType, LookupResult)
src/mcp/server.ts    # MCP server (registerTool, StdioServerTransport)
bin/cli.ts           # CLI entry point
server.ts            # Express REST API
```

Engines return `{ violations: Violation[], source: string } | null`. The orchestrator returns the first non-null result. If all fail, returns `{ violations: [], source: "" }`.

## API Endpoints

- `GET /api?licensePlate=X&type=1` — query params
- `POST /api/lookup` — JSON body `{ plate, type }`
- `GET /health`

Vehicle type: `"1"` = car, `"2"` = motorcycle, `"3"` = electric bike.

## Key Types

`Violation` has: `licensePlate`, `plateColor`, `vehicleType`, `violationTime`, `violationLocation`, `violationBehavior`, `status`, `detectionUnit`, `resolutionPlaces: ResolutionPlace[]`.
