# CommodityPriceAPI MCP Server

[![npm version](https://img.shields.io/npm/v/%40commoditypriceapi%2Fmcp?logo=npm&label=npm&color=CB3837)](https://www.npmjs.com/package/@commoditypriceapi/mcp)
[![GitHub](https://img.shields.io/badge/GitHub-Commodity--Price--API-181717?logo=github)](https://github.com/Commodity-Price-API/commoditypriceapi-mcp)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-5FA04E?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-16A34A)](https://github.com/Commodity-Price-API/commoditypriceapi-mcp/blob/main/LICENSE)

Official MCP server for [CommodityPriceAPI](https://commoditypriceapi.com). Exposes 8 MCP tools for real-time and historical commodity prices — gold, silver, oil, natural gas, wheat, coffee, and 140+ other commodities. Your AI assistant queries the market in plain English; the MCP server handles the API calls.

Works with Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Cline, Codex, and any other MCP-compatible client.

| Item | Value |
|------|-------|
| Package | `@commoditypriceapi/mcp` |
| Transport | `stdio` |
| Node.js | `>=18` |

## Quick Start

1. [Get a free CommodityPriceAPI key](https://commoditypriceapi.com/auth/signup) — free 7-day trial, 2,000 requests, no card required.

2. Cursor users can install in one click:

   [![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=commoditypriceapi&config=eyJjb21tYW5kIjoibnB4IC15IEBjb21tb2RpdHlwcmljZWFwaS9tY3AiLCJlbnYiOnsiQ09NTU9ESVRZUFJJQ0VBUElfS0VZIjoiIn19)

3. Everyone else: add this to your MCP client config (see [Install by Client](#install-by-client) for the exact file path):

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

4. Restart your client.

5. Test it: ask **"What's the current gold price?"**

## Table of Contents

- [Quick Start](#quick-start)
- [Install by Client](#install-by-client)
- [Verify It Works](#verify-it-works)
- [Tool Reference](#tool-reference)
- [Prompt Examples](#prompt-examples)
- [Example Answers and Tool Output](#example-answers-and-tool-output)
- [Error Codes](#error-codes)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Building from Source](#building-from-source)
- [Troubleshooting](#troubleshooting)
- [Pricing](#pricing)
- [Links](#links)
- [License](#license)

## Install by Client

### Requirements

- Node.js 18 or later
- `npx` available in your terminal
- A CommodityPriceAPI key — [sign up free](https://commoditypriceapi.com/auth/signup)

### Claude Desktop

Add to `claude_desktop_config.json` (Settings → Developer → Edit Config):

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

Restart Claude Desktop after saving.

### Claude Code

```bash
claude mcp add commoditypriceapi --env COMMODITYPRICEAPI_KEY=<YOUR_API_KEY> -- npx -y @commoditypriceapi/mcp
```

Start a new Claude Code session after adding the server.

### Cursor

One-click install:

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=commoditypriceapi&config=eyJjb21tYW5kIjoibnB4IC15IEBjb21tb2RpdHlwcmljZWFwaS9tY3AiLCJlbnYiOnsiQ09NTU9ESVRZUFJJQ0VBUElfS0VZIjoiIn19)

Or add to `.cursor/mcp.json` manually:

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

Restart Cursor after saving.

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

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

Restart Windsurf after saving.

### VS Code / GitHub Copilot

Add to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "commoditypriceapi": {
        "command": "npx",
        "args": ["-y", "@commoditypriceapi/mcp"],
        "env": {
          "COMMODITYPRICEAPI_KEY": "<YOUR_API_KEY>"
        }
      }
    }
  }
}
```

Restart VS Code after saving.

### Cline

Open MCP Servers panel → **Configure** → **Advanced MCP Settings**. Add to `cline_mcp_settings.json`:

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

Restart Cline after saving.

### Codex CLI

```bash
codex mcp add commoditypriceapi --env COMMODITYPRICEAPI_KEY=<YOUR_API_KEY> -- npx -y @commoditypriceapi/mcp
codex mcp list
```

Start a new Codex session after adding the server.

### Any Other MCP Client

Use this config:

```json
{
  "command": "npx",
  "args": ["-y", "@commoditypriceapi/mcp"],
  "env": {
    "COMMODITYPRICEAPI_KEY": "<YOUR_API_KEY>"
  }
}
```

## Verify It Works

Try these after setup:

| Prompt | Expected tool |
|--------|---------------|
| What's the current gold price? | `get_gold_price` |
| Get the latest silver and Brent crude prices. | `get_latest_rates` with `symbols=XAG,BRENTOIL-SPOT` |
| What was the gold price on January 2nd, 2020? | `get_historical_rates` |
| Show daily gold prices for the first week of August 2026. | `get_time_series` |
| How much did gold change between January and August 2026? | `get_fluctuation` |
| Which commodity symbols do you support? | `list_symbols` |
| How much of my API quota is left? | `get_usage` |

## Tool Reference

All 8 tools map 1:1 to CommodityPriceAPI v2 endpoints. Tools that take `symbols` accept a comma-separated list (e.g. `XAU,XAG,BRENTOIL-SPOT`). Use `list_symbols` to look up valid symbols — there are 148 across Metals, Energy, Agriculture, and more.

### get_latest_rates

`GET /v2/rates/latest` — latest rates for one or more symbols. Rates may lag up to 10 minutes depending on plan.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `symbols` | Yes | Comma-separated symbols, e.g. `XAU,XAG,BRENTOIL-SPOT` |
| `quote` | No | Target quote currency (e.g. `EUR`). Premium/Plus plans only; omit for each symbol's default currency. |

Note: if a symbol in a multi-symbol request is invalid, the API silently omits it from the response rather than returning an error. A missing symbol in the result means the symbol is wrong — check `list_symbols`.

### get_gold_price

`GET /v2/rates/latest/xau` — shortcut for the latest gold (XAU) rate, including bid/ask.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `quote` | No | Target quote currency. Premium/Plus plans only. |

### get_silver_price

`GET /v2/rates/latest/xag` — shortcut for the latest silver (XAG) rate.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `quote` | No | Target quote currency. Premium/Plus plans only. |

### get_historical_rates

`GET /v2/rates/historical` — open/high/low/close rates for one or more symbols on a specific past date, available back to 1990-01-01. If no rate exists for that exact date, the API returns the nearest available date.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `symbols` | Yes | Comma-separated symbols |
| `date` | Yes | `YYYY-MM-DD` |

### get_time_series

`GET /v2/rates/time-series` — daily historical rates for one or more symbols between two dates. Max span: 1 year.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `symbols` | Yes | Comma-separated symbols |
| `startDate` | Yes | `YYYY-MM-DD` |
| `endDate` | Yes | `YYYY-MM-DD` |

### get_fluctuation

`GET /v2/rates/fluctuation` — how each symbol changed between two dates: start rate, end rate, absolute change, and percent change.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `symbols` | Yes | Comma-separated symbols |
| `startDate` | Yes | `YYYY-MM-DD` |
| `endDate` | Yes | `YYYY-MM-DD` |

### list_symbols

`GET /v2/symbols` — all supported commodity symbols with name, category, quote currency, unit, and update interval. Takes no parameters. Call this before rate tools when unsure of a symbol.

### get_usage

`GET /v2/usage` — current plan, quota, and usage for the configured API key. Takes no parameters.

## Prompt Examples

### Live prices

- What's the current gold price?
- Get the latest prices for silver, copper, and WTI crude.
- What's gold trading at in euros?

### Historical data

- What was the price of wheat on January 2nd, 2026?
- Compare gold and silver prices over the last 30 days.
- Show me daily natural gas prices for Q1 2026.

### Price changes

- How much did Brent crude fluctuate this quarter?
- Did gold go up or down since the start of the year, and by how much?

### Discovery and account

- Which commodity symbols do you support for energy?
- How much of my API quota is left this month?

## Example Answers and Tool Output

The text answers show what a client might say; exact wording depends on the model. JSON blocks are raw tool output.

### Latest gold price

**Prompt:** What's the current gold price?

**Example answer:** Gold (XAU) is currently trading at $4,386.23 per troy ounce (bid $4,385.93 / ask $4,386.23).

```json
{
  "success": true,
  "timestamp": 1786617187,
  "rates": {
    "XAU": {
      "rate": 4386.23,
      "bid": 4385.93,
      "ask": 4386.23
    }
  },
  "metadata": {
    "XAU": {
      "unit": "T.oz",
      "quote": "USD"
    }
  }
}
```

### Historical rate

**Prompt:** What was the gold price on January 2nd, 2020?

**Example answer:** On 2020-01-02, gold opened at $1,518.26 and closed at $1,528.76 per troy ounce (high $1,531.31, low $1,517.15).

```json
{
  "success": true,
  "date": "2020-01-02",
  "rates": {
    "XAU": {
      "date": "2020-01-02",
      "open": 1518.26,
      "high": 1531.31,
      "low": 1517.15,
      "close": 1528.76
    }
  }
}
```

### Fluctuation

**Prompt:** How much did gold change between January 2nd and August 12th, 2026?

**Example answer:** Gold rose from $4,332.01 to $4,400.12 per troy ounce — up $68.11, or +1.57%.

```json
{
  "success": true,
  "startDate": "2026-01-02",
  "endDate": "2026-08-12",
  "rates": {
    "XAU": {
      "startRate": 4332.01,
      "endRate": 4400.12,
      "change": 68.11,
      "changePercent": 1.57
    }
  }
}
```

## Error Codes

Tool calls never crash the server. Upstream errors are returned as structured tool results with `error`, `code`, `message`, and a `guidance` field so the client can explain what went wrong instead of echoing a status code.

| Code | Meaning |
|------|---------|
| `401` | Missing or invalid API key — check `COMMODITYPRICEAPI_KEY` in your client config |
| `402` | Your trial or subscription doesn't cover this request (e.g. `quote` conversion on a non-Premium plan) |
| `403` | API key usage limit reached — upgrade or wait for quota reset |
| `404` | Symbol not found — call `list_symbols` for valid symbols |
| `429` | Rate limited — wait a minute and retry |
| `499` | Request to the upstream API timed out (see `COMMODITYPRICEAPI_REQUEST_TIMEOUT_MS`) |
| `502` | Server could not reach the upstream API |

Example error result for an invalid symbol:

```json
{
  "error": "SYMBOL_NOT_FOUND",
  "code": 404,
  "message": "The symbol is not supported, please visit the documentation for a list of supported symbols",
  "guidance": "Call list_symbols to see valid commodity symbols."
}
```

## How It Works

This is a stdio MCP server that wraps the CommodityPriceAPI v2 REST API.

At runtime:

1. Your MCP client starts the server process via `npx`.
2. The client reads the tool list.
3. When a prompt matches a tool, the client calls it.
4. The server validates inputs, calls the CommodityPriceAPI, and returns structured JSON.

The server sends your API key to CommodityPriceAPI via both the `x-api-key` header and the `apiKey` query parameter — the upstream API accepts either, so this covers all cases without extra config.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `COMMODITYPRICEAPI_KEY` | Yes | | Your CommodityPriceAPI key |
| `COMMODITYPRICEAPI_REQUEST_TIMEOUT_MS` | No | `15000` | Upstream request timeout in ms |

## Building from Source

```bash
git clone https://github.com/Commodity-Price-API/commoditypriceapi-mcp.git
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

## Troubleshooting

**Client uses an old tool list after updating:** Restart the client and confirm it loaded the latest npm version.

**401 errors:** Check that `COMMODITYPRICEAPI_KEY` is set in your MCP client config's `env` block.

**A symbol is missing from a multi-symbol response:** The upstream API silently drops invalid symbols instead of erroring. Call `list_symbols` to find the correct symbol — e.g. Brent crude is `BRENTOIL-SPOT`, not `BRENTOIL`.

**499 timeouts:** The upstream API did not respond in time. Increase `COMMODITYPRICEAPI_REQUEST_TIMEOUT_MS` (default: 15000 ms).

## Pricing

Free 7-day trial with 2,000 requests, no card required. For plan details, see the [CommodityPriceAPI pricing page](https://commoditypriceapi.com/pricing).

## Links

- [CommodityPriceAPI Website](https://commoditypriceapi.com)
- [API Documentation](https://commoditypriceapi.com/docs)
- [Supported Symbols](https://commoditypriceapi.com/symbols)
- [MCP Integration Guide](https://commoditypriceapi.com/integrations/mcp)
- [Pricing](https://commoditypriceapi.com/pricing)
- [Sign Up Free](https://commoditypriceapi.com/auth/signup)
- [GitHub Repository](https://github.com/Commodity-Price-API/commoditypriceapi-mcp)

## License

[MIT](LICENSE)
