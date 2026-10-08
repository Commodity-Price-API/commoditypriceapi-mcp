import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callCommodityApi, CommodityApiError } from "./client.js";

const symbolsParam = z
  .string()
  .describe(
    "Comma-separated commodity symbols, e.g. 'XAU,XAG,XPT,BRENTOIL-SPOT'. Precious metals use ISO 4217 codes (XAU gold, XAG silver, XPT platinum, XPD palladium); copper is XCU. See the list_symbols tool for valid values. " +
      "The response may include an 'unresolved' map keyed by the symbol you typed. Three cases: " +
      "(1) HTTP 200 with an entry carrying 'resolvedTo' — the symbol was not a catalogue code but had exactly one match (e.g. GOLD -> XAU, retired PL -> XPT), so its rate was returned under the 'resolvedTo' symbol in 'rates'; this is informational, not a failure. " +
      "(2) HTTP 206 — some symbols could not be returned; each entry has a message and, where available, 'did you mean' suggestions, while the valid rates are still in 'rates'. " +
      "(3) If none resolve, the error result carries the same 'unresolved' map."
  );

const dateParam = z.string().describe("Date in YYYY-MM-DD format.");

const quoteParam = z
  .string()
  .optional()
  .describe(
    "Target quote currency code (e.g. 'USD', 'EUR'). Premium/Plus plans only; omit to use each symbol's default currency."
  );

const includeParam = z
  .enum(["gram", "carat", "tola"])
  .optional()
  .describe(
    "Add a per-unit breakdown alongside the per-troy-ounce rate: 'gram' adds a per-gram rate, 'tola' adds a per-tola rate, 'carat' adds per-gram rates at each purity from 24k down to 8k. Omit for the ounce rate only."
  );

const metadataParam = z
  .boolean()
  .optional()
  .describe(
    "Whether to include the 'metadata' map (per-symbol unit and quote currency) in the response. Defaults to true. Set false to omit it and get a smaller payload."
  );

/** v3 only honours an explicit `metadata=false`; anything else is the default (true). */
function metadataFlag(metadata: boolean | undefined): string | undefined {
  return metadata === false ? "false" : undefined;
}

function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorResult(err: unknown) {
  if (err instanceof CommodityApiError) {
    return {
      isError: true,
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: err.errorType,
              code: err.code,
              message: err.message,
              ...(err.unresolved ? { unresolved: err.unresolved } : {}),
              guidance: guidanceFor(err.code, err.errorType),
            },
            null,
            2
          ),
        },
      ],
    };
  }
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          { error: "UNEXPECTED_ERROR", message: (err as Error).message },
          null,
          2
        ),
      },
    ],
  };
}

function guidanceFor(code: number, errorType: string): string {
  switch (code) {
    case 401:
      return "Check that COMMODITYPRICEAPI_KEY is set correctly in your MCP client config.";
    case 402:
      return "Your trial or subscription doesn't cover this request. Check your plan on the CommodityPriceAPI dashboard.";
    case 403:
      return "You've hit your API key's usage limit. Upgrade your plan or wait for the quota to reset.";
    case 404:
      if (errorType === "SYMBOL_NOT_FOUND") {
        return "None of the requested symbols are valid. Check the 'unresolved' map above for suggested symbols, or call list_symbols to see all valid commodity symbols.";
      }
      return "The requested resource was not found.";
    case 429:
      return "You're being rate limited. Wait a minute and try again.";
    default:
      return "CommodityPriceAPI returned an error outside the documented cases; treat the message above as authoritative.";
  }
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "commoditypriceapi-mcp",
    version: "1.2.1",
  });

  server.registerTool(
    "get_usage",
    {
      title: "Get API usage",
      description:
        "Returns the current plan, quota, and usage for the configured CommodityPriceAPI key.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await callCommodityApi("/usage");
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "list_symbols",
    {
      title: "List supported commodity symbols",
      description:
        "Returns all commodity symbols supported by CommodityPriceAPI, including category, default currency, and unit. Use this to look up a symbol before calling rate tools. Precious metals use ISO 4217 codes (XAU, XAG, XPT, XPD); copper is XCU.",
      inputSchema: {},
    },
    async () => {
      try {
        const data = await callCommodityApi("/symbols");
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_latest_rates",
    {
      title: "Get latest commodity rates",
      description:
        "Returns the latest rates for one or more commodity symbols (e.g. gold, silver, crude oil). Rates may lag up to 10 minutes depending on plan. Use 'quote' to convert to a specific currency (Premium/Plus plans only). Common names with a single match (e.g. GOLD) are auto-resolved to the real symbol and flagged in 'unresolved' with 'resolvedTo'. Set 'metadata' to false to omit the per-symbol unit/quote map.",
      inputSchema: {
        symbols: symbolsParam,
        quote: quoteParam,
        metadata: metadataParam,
      },
    },
    async ({ symbols, quote, metadata }) => {
      try {
        const data = await callCommodityApi("/rates/latest", {
          symbols,
          quote,
          metadata: metadataFlag(metadata),
        });
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_gold_price",
    {
      title: "Get latest gold (XAU) price",
      description:
        "Shortcut for the latest gold (XAU) rate, with bid/ask, without needing to pass a symbols list. Use 'include' to add a per-gram, per-tola, or per-carat breakdown. Set 'metadata' to false to omit the unit/quote map.",
      inputSchema: {
        quote: quoteParam,
        include: includeParam,
        metadata: metadataParam,
      },
    },
    async ({ quote, include, metadata }) => {
      try {
        const data = await callCommodityApi("/rates/latest/xau", {
          quote,
          include,
          metadata: metadataFlag(metadata),
        });
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_silver_price",
    {
      title: "Get latest silver (XAG) price",
      description:
        "Shortcut for the latest silver (XAG) rate, with bid/ask, without needing to pass a symbols list. Use 'include' to add a per-gram, per-tola, or per-carat breakdown. Set 'metadata' to false to omit the unit/quote map.",
      inputSchema: {
        quote: quoteParam,
        include: includeParam,
        metadata: metadataParam,
      },
    },
    async ({ quote, include, metadata }) => {
      try {
        const data = await callCommodityApi("/rates/latest/xag", {
          quote,
          include,
          metadata: metadataFlag(metadata),
        });
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_historical_rates",
    {
      title: "Get historical commodity rates",
      description:
        "Returns open/high/low/close rates for one or more symbols on a specific past date (available back to 1990-01-01). If no rate exists for that exact date, the API returns the nearest available date.",
      inputSchema: {
        symbols: symbolsParam,
        date: dateParam,
      },
    },
    async ({ symbols, date }) => {
      try {
        const data = await callCommodityApi("/rates/historical", { symbols, date });
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_time_series",
    {
      title: "Get commodity time series",
      description:
        "Returns daily historical rates for one or more symbols between two dates. The date range cannot exceed 1 year.",
      inputSchema: {
        symbols: symbolsParam,
        startDate: dateParam,
        endDate: dateParam,
      },
    },
    async ({ symbols, startDate, endDate }) => {
      try {
        const data = await callCommodityApi("/rates/time-series", {
          symbols,
          startDate,
          endDate,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_fluctuation",
    {
      title: "Get commodity price fluctuation",
      description:
        "Returns how one or more commodity symbols changed between a start and end date: start rate, end rate, absolute change, and percent change.",
      inputSchema: {
        symbols: symbolsParam,
        startDate: dateParam,
        endDate: dateParam,
      },
    },
    async ({ symbols, startDate, endDate }) => {
      try {
        const data = await callCommodityApi("/rates/fluctuation", {
          symbols,
          startDate,
          endDate,
        });
        return textResult(data);
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  return server;
}
