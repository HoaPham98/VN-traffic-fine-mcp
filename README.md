# VN-traffic-fine

Tra cuu phat nguoi - Vietnamese traffic violation lookup (MCP server + CLI).

## Cai dat

```sh
npm install @iamqh/vn-traffic-fine
```

Hoac dung npx truc tiep (khong can cai dat):

```sh
npx @iamqh/vn-traffic-fine 51F12345       # CLI
npx --package @iamqh/vn-traffic-fine vn-traffic-mcp  # MCP server
```

Yeu cau: Node.js 22+

## MCP Server

Dang ky voi Claude Code:

```json
{
  "mcpServers": {
    "vn-traffic": {
      "command": "npx",
      "args": ["--package", "@iamqh/vn-traffic-fine", "vn-traffic-mcp"]
    }
  }
}
```

## CLI

```sh
npx @iamqh/vn-traffic-fine 51F12345       # O to
npx @iamqh/vn-traffic-fine 30H47465 2    # Xe may
npx @iamqh/vn-traffic-fine 51F12345 1 -v # Verbose
```

Loai phuong tien: `1` = O to, `2` = Xe may, `3` = Xe may dien

## REST API

```sh
npm run dev      # development mode (watch)
npm run start    # production mode
```

`GET /api?licensePlate=<bien_so>&type=<loai>`
`POST /api/lookup` body: `{"plate": "...", "type": "1"}`
`GET /health`

```sh
curl "http://localhost:3000/api?licensePlate=30H47465&type=2"
```

## Cau truc

```
src/
  engines/       # API engines (checkphatnguoi, zm.io, phatnguoi)
  phatnguoi.ts # Orchestrator + types
  mcp/server.ts # MCP server
bin/cli.ts       # CLI entry
server.ts        # Express REST API
```

## Kiem tra TypeScript

```sh
npm run typeCheck
```
