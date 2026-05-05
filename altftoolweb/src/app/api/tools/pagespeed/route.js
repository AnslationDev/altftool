import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, proxyJson, requireHttpUrl, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 20,
      scope: "tools:pagespeed",
      windowMs: 60000,
    });
    if (limited) return limited;

    const apiKey = requireServerEnv(SERVER_ENV.pagespeed);
    const targetUrl = requireHttpUrl(searchParam(req, "url"));

    const upstream = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    upstream.searchParams.set("url", targetUrl);
    upstream.searchParams.set("key", apiKey);

    return proxyJson(NextResponse, upstream, { next: { revalidate: 300 } });
  } catch (error) {
    return routeError(NextResponse, error, "Error analyzing website.");
  }
}
