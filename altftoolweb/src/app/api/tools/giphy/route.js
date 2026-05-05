import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { proxyJson, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
    const apiKey = requireServerEnv(SERVER_ENV.giphy);
    const query = searchParam(req, "q", "trending");
    const endpoint =
      query === "trending"
        ? "https://api.giphy.com/v1/gifs/trending"
        : "https://api.giphy.com/v1/gifs/search";

    const upstream = new URL(endpoint);
    upstream.searchParams.set("api_key", apiKey);
    upstream.searchParams.set("limit", "20");
    if (query !== "trending") upstream.searchParams.set("q", query);

    return proxyJson(NextResponse, upstream, { next: { revalidate: 300 } });
  } catch (error) {
    return routeError(NextResponse, error, "Failed to fetch GIFs.");
  }
}
