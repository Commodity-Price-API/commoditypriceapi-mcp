# CommodityPriceAPI MCP Server

Official MCP server for [CommodityPriceAPI](https://commoditypriceapi.com). Exposes 8 MCP tools for real-time and historical commodity rates — gold, silver, oil, and 130+ other commodities — to any MCP-compatible client (Claude Desktop, Cursor, Windsurf, VS Code, Cline, etc).

| Item      | Value                    |
| --------- | ------------------------ |
| Package   | `@commoditypriceapi/mcp` |
| Transport | `stdio`                  |
| Node.js   | `>=18`                   |

## Quick Start

1. [Get a free CommodityPriceAPI key](https://commoditypriceapi.com/auth/signup)
2. Add this to your MCP client config:

```json
{
  "mcpServers": {
    "commoditypriceapi": {
      "command": "npx",
      "args": ["-y", "@commoditypriceapi/mcp"],
      "env": {
        "COMMODITYPRICEAPI_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

3. Restart your client.
4. Test it: ask **"What's the current gold price?"**

## Install by Client

### Claude Desktop

Add the block above to `claude_desktop_config.json`, then restart Claude Desktop.

### Cursor / Windsurf / Cline / VS Code

Add the same `commoditypriceapi` block to that client's MCP server config file and restart the client.

### Any other MCP client

```json
{
  "command": "npx",
  "args": ["-y", "@commoditypriceapi/mcp"],
  "env": {
    "COMMODITYPRICEAPI_KEY": "<YOUR_API_KEY>"
  }
}
```

## Tools

| Tool                   | Endpoint                    | What it does                                                    |
| ---------------------- | ---------------------------- | ----------------------------------------------------------------|
| `get_usage`            | `GET /v2/usage`              | Current plan, quota, and usage                                  |
| `list_symbols`         | `GET /v2/symbols`            | All supported commodity symbols with category/currency/unit     |
| `get_latest_rates`     | `GET /v2/rates/latest`       | Latest rates for one or more symbols                            |
| `get_gold_price`       | `GET /v2/rates/latest/xau`   | Shortcut for the latest gold rate                                |
| `get_silver_price`     | `GET /v2/rates/latest/xag`   | Shortcut for the latest silver rate                              |
| `get_historical_rates` | `GET /v2/rates/historical`   | OHLC rates for one or more symbols on a specific past date       |
| `get_time_series`      | `GET /v2/rates/time-series`  | Daily rates between two dates (max 1 year span)                  |
| `get_fluctuation`      | `GET /v2/rates/fluctuation`  | Start/end rate, change, and % change over a date range           |

All tools that take `symbols` accept a comma-separated list (e.g. `XAU,XAG,BRENTOIL`). Use `list_symbols` to look up valid symbols.

## Authentication

The server sends your API key to CommodityPriceAPI via **both** the `x-api-key` header and the `apiKey` query parameter — the upstream API accepts either, so this covers all cases without extra config.

| Variable                 | Required | Description                       |
| ------------------------ | -------- | ---------------------------------- |
| `COMMODITYPRICEAPI_KEY`  | Yes      | Your CommodityPriceAPI key         |
| `COMMODITYPRICEAPI_REQUEST_TIMEOUT_MS` | No | Upstream request timeout in ms (default `15000`) |

## Error Handling

Tool calls never crash the server. Upstream errors (invalid symbol, missing date, quota exceeded, etc.) are returned as structured tool results with `error`, `code`, `message`, and a `guidance` field so the client can explain what went wrong instead of just echoing a status code.

## Building from Source

```bash
git clone https://github.com/commoditypriceapi/commoditypriceapi-mcp.git
cd commoditypriceapi-mcp
npm install
npm run build
```

Run it directly:

```bash
COMMODITYPRICEAPI_KEY=<YOUR_KEY> node dist/cli.js
```

Inspect with the MCP Inspector:

```bash
COMMODITYPRICEAPI_KEY=<YOUR_KEY> npx @modelcontextprotocol/inspector node dist/cli.js
```

## License

MIT
