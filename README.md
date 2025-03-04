# Tra cuu phat nguoi

REST API + MCP server + CLI tra cuu vi pham giao thong theo bien so xe (khong can captcha).

## Cai dat

```sh
npm install
```

Yeu cau: Node.js 22+

## Chay

```sh
npm run dev      # development mode (watch)
npm run start    # production mode
```

## API

`GET /api?licensePlate=<bien_so>&type=<loai>`
`POST /api/lookup` body: `{"plate": "...", "type": "1"}`

Loai phuong tien: `1` = O to, `2` = Xe may, `3` = Xe may dien

```sh
curl "http://localhost:3000/api?licensePlate=30H47465&type=2"
```

`GET /health`

## MCP Server

```sh
npm run mcp
```

Dang ky tool `lookup_violations` voi Claude Code:

```json
{
  "mcpServers": {
    "phatnguoi": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "/path/to/phatnguoi-api"
    }
  }
}
```

Hoac dung `@modelcontextprotocol/sdk` de connect tu code:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// ...
```

## CLI

```sh
npm run cli -- 51F12345       # O to
npm run cli -- 30H47465 2     # Xe may
npm run cli -- 51F12345 1 -v  # Verbose
```

## Cau truc

```
src/
  engines/           # API engines (checkphatnguoi, zm.io, phatnguoi)
  phatnguoi.ts      # Orchestrator
  apiCaller.ts       # HTTP adapter
  types.ts
  mcp/
    server.ts        # MCP server
server.ts             # Express REST API
bin/
  cli.ts             # CLI entry
```

## Kiem tra TypeScript

```sh
npm run typeCheck
```
