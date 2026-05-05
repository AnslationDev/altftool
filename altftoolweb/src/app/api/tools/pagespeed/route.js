import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { proxyJson, requireHttpUrl, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
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
