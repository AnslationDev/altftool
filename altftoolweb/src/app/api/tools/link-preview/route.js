import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { proxyJson, requireHttpUrl, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
    const apiKey = requireServerEnv(SERVER_ENV.linkPreview);
    const url = requireHttpUrl(searchParam(req, "url"), "Valid URL is required.");

    const upstream = new URL("https://api.linkpreview.net/");
    upstream.searchParams.set("key", apiKey);
    upstream.searchParams.set("q", url);

    return proxyJson(NextResponse, upstream, { next: { revalidate: 3600 } });
  } catch (error) {
    return routeError(NextResponse, error, "Failed to fetch link preview.");
  }
}
