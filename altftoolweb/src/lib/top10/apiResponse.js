import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { isProviderNotConfigured } from "@/lib/providers/_shared/configuration";

const TOP10_RATE_LIMIT = 60;
const TOP10_RATE_WINDOW_MS = 60_000;

export { top10Choice, top10Page, top10Text, top10Type } from "./requestParams";

export function enforceTop10RateLimit(request) {
  return enforceRateLimit(NextResponse, request, {
    limit: TOP10_RATE_LIMIT,
    scope: "top10",
    windowMs: TOP10_RATE_WINDOW_MS,
  });
}

/**
 * The single failure response every /api/top10/* route returns, so all of
 * them tell the truth the same way.
 *
 * Two distinct outcomes, deliberately not collapsed into one:
 *
 *  - The provider has no credentials on this deployment. That is a
 *    permanent, known state, not an error a retry can fix, so the route
 *    answers 200 with an empty payload plus `unavailable: true` and a
 *    plain-language reason. CategoryMediaSection renders that as an honest
 *    "no live data right now" note. It must not become a 5xx (nothing is
 *    broken) and must never be padded with substitute rows — an empty
 *    section is the correct, honest output.
 *
 *  - Anything else (upstream down, rate-limited, timeout, bad payload) is a
 *    real fetch failure and keeps the 502 + `error` it always had.
 *
 * `emptyPayload` is that route's own zero-value shape — the same response
 * keys it returns on success, with empty arrays — so the client reads a
 * consistent object either way.
 */
export function top10ProviderFailure(emptyPayload, error) {
  if (isProviderNotConfigured(error)) {
    return NextResponse.json(
      { ...emptyPayload, unavailable: true, unavailableMessage: error.message },
      // Not cached: the moment the key is configured, the next request
      // should get real data rather than a stored "unavailable".
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  console.error("[top10] Provider request failed", {
    name: error?.name || "Error",
    code: error?.code || "unknown",
    status: error?.status || null,
  });
  return NextResponse.json(
    { ...emptyPayload, error: "The live data provider is temporarily unavailable. Please try again later." },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}
