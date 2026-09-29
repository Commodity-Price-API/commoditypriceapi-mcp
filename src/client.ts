const BASE_URL = "https://api.commoditypriceapi.com/v3";

/**
 * v3 attaches this map, keyed by the symbol the caller typed, in three cases:
 *
 * - 206 Partial Content: some requested symbols could not be returned. Each
 *   entry carries a human-readable `message` and, where available, "did you
 *   mean" `suggestions`.
 * - 404 SYMBOL_NOT_FOUND: none of the requested symbols resolved; same shape.
 * - 200 with `resolvedTo`: the symbol was not a catalogue code but had exactly
 *   one match (e.g. GOLD -> XAU, or a retired code such as PL -> XPT), so v3
 *   answered with that symbol's rate. The rate lives under `resolvedTo` in
 *   `rates`; the entry is informational and never downgrades the status.
 */
export type UnresolvedSymbol = {
  message: string;
  suggestions?: string[];
  resolvedTo?: string;
};
export type UnresolvedSymbols = Record<string, UnresolvedSymbol>;

export class CommodityApiError extends Error {
  code: number;
  errorType: string;
  path?: string;
  unresolved?: UnresolvedSymbols;

  constructor(
    code: number,
    errorType: string,
    message: string,
    path?: string,
    unresolved?: UnresolvedSymbols
  ) {
    super(message);
    this.name = "CommodityApiError";
    this.code = code;
    this.errorType = errorType;
    this.path = path;
    this.unresolved = unresolved;
  }
}

function getApiKey(): string {
  const key = process.env.COMMODITYPRICEAPI_KEY;
  if (!key) {
    throw new Error(
      "COMMODITYPRICEAPI_KEY is not set. Add it to your MCP client config's env block."
    );
  }
  return key;
}

/**
 * Calls a CommodityPriceAPI v3 endpoint.
 * Sends the API key via both the x-api-key header AND the apiKey query
 * param, since the upstream API accepts either.
 *
 * v3 answers 206 (still `response.ok`) with an `unresolved` map appended to
 * the body when some requested symbols could not be returned, and 200 with an
 * `unresolved` map when a symbol was auto-resolved to its single match
 * (`resolvedTo`). The body is passed through as-is so tool results include
 * those notes and suggestions.
 */
export async function callCommodityApi<T = unknown>(
  path: string,
  params: Record<string, string | undefined> = {}
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(BASE_URL + path);
  url.searchParams.set("apiKey", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const timeoutMs = Number(process.env.COMMODITYPRICEAPI_REQUEST_TIMEOUT_MS ?? 15000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        accept: "application/json",
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new CommodityApiError(
        499,
        "REQUEST_TIMEOUT",
        `Request to CommodityPriceAPI timed out after ${timeoutMs}ms.`
      );
    }
    throw new CommodityApiError(
      502,
      "UPSTREAM_UNREACHABLE",
      `Could not reach CommodityPriceAPI: ${(err as Error).message}`
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let body: any;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new CommodityApiError(
      response.status,
      "INVALID_RESPONSE",
      `CommodityPriceAPI returned a non-JSON response: ${text.slice(0, 500)}`
    );
  }

  if (!response.ok) {
    throw new CommodityApiError(
      response.status,
      body.error ?? "UNKNOWN_ERROR",
      body.message ?? `CommodityPriceAPI request failed with status ${response.status}.`,
      body.path,
      body.unresolved
    );
  }

  return body as T;
}
