# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MCP server (stdio transport) exposing CommodityPriceAPI v2 as 8 MCP tools. Published to npm as `@commoditypriceapi/mcp`, run by clients via `npx`. TypeScript, ESM (`"type": "module"`), Node >= 18, no test suite or linter configured.

## Commands

```bash
npm run build   # tsc → dist/, then chmod +x dist/cli.js
npm run dev     # tsc --watch
npm start       # node dist/cli.js (requires COMMODITYPRICEAPI_KEY env var)

# Manual testing with the MCP Inspector:
COMMODITYPRICEAPI_KEY=<KEY> npx @modelcontextprotocol/inspector node dist/cli.js
```

## Architecture

Three-layer flow, one file each in `src/`:

- `cli.ts` — bin entry point. Creates the server and connects it to `StdioServerTransport`. **stdout is reserved for the MCP protocol stream — all logging must go to stderr** (`console.error`).
- `server.ts` — `createServer()` registers all 8 tools on an `McpServer`, with zod input schemas. Every tool handler is a thin try/catch wrapper around `callCommodityApi()`: success → `textResult()` (pretty-printed JSON), failure → `errorResult()`.
- `client.ts` — `callCommodityApi(path, params)` is the single HTTP function all tools go through. Hardcodes `BASE_URL` (`https://api.commoditypriceapi.com/v2`), reads `COMMODITYPRICEAPI_KEY` at call time (not startup), sends the key via both `x-api-key` header and `apiKey` query param, applies an AbortController timeout (`COMMODITYPRICEAPI_REQUEST_TIMEOUT_MS`, default 15000). All failures — timeout (499), unreachable (502), non-JSON body, upstream error status — are normalized into `CommodityApiError { code, errorType, message, path }`.

`index.ts` is the library export (`createServer` only).

### Error-handling contract

Tool calls must never crash the server. `errorResult()` in `server.ts` converts `CommodityApiError` into a structured `isError` tool result with `error`, `code`, `message`, and a human-readable `guidance` string (`guidanceFor()` maps status codes 401/402/403/404/429 to actionable advice). Keep this contract when adding tools: wrap the handler body in try/catch and route errors through `errorResult()`.

### Adding a tool

Register it in `createServer()` (`server.ts`) following the existing pattern: `server.registerTool(name, { title, description, inputSchema }, handler)`. Reuse `symbolsParam`/`dateParam` zod schemas where applicable, and update the tools table in README.md.
