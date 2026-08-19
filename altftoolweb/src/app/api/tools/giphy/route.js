import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, proxyJson, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 120,
      scope: "tools:giphy",
      windowMs: 60000,
    });
    if (limited) return limited;

    const apiKey = requireServerEnv(SERVER_ENV.giphy);
    // Presence of a non-empty `q` param — not its literal value — decides the
    // endpoint, so a real search for the word "trending" hits the search
    // endpoint like any other keyword instead of being misread as "no query".
    const query = searchParam(req, "q", "");
    const hasQuery = query.length > 0;
    const endpoint = hasQuery
      ? "https://api.giphy.com/v1/gifs/search"
      : "https://api.giphy.com/v1/gifs/trending";

    const upstream = new URL(endpoint);
    upstream.searchParams.set("api_key", apiKey);
    upstream.searchParams.set("limit", "20");
    if (hasQuery) upstream.searchParams.set("q", query);

    return proxyJson(NextResponse, upstream, { next: { revalidate: 300 } });
  } catch (error) {
    return routeError(NextResponse, error, "Failed to fetch GIFs.");
  }
}
