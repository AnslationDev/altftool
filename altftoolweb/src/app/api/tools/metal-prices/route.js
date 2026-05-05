import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { proxyJson, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
    const apiKey = requireServerEnv(SERVER_ENV.metalPrice);
    const currency = searchParam(req, "currency", "USD").toUpperCase();
    const metals = searchParam(req, "metals", "XAU,XAG,XPT,XPD");

    const upstream = new URL("https://api.metalpriceapi.com/v1/latest");
    upstream.searchParams.set("api_key", apiKey);
    upstream.searchParams.set("base", currency);
    upstream.searchParams.set("currencies", metals);

    return proxyJson(NextResponse, upstream, { next: { revalidate: 300 } });
  } catch (error) {
    return routeError(NextResponse, error, "Failed to fetch metal prices.");
  }
}
