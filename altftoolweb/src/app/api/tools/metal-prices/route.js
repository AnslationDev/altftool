import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, proxyJson, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

const FALLBACK_USD_PER_OUNCE = {
  XAU: 2350,
  XAG: 29,
  XPT: 980,
  XPD: 1030,
};

const FALLBACK_USD_TO_CURRENCY = {
  AED: 3.67,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.9,
  CNY: 7.24,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 156,
  USD: 1,
};

function buildFallbackMetalPrices(currency, metals) {
  const currencyRate = FALLBACK_USD_TO_CURRENCY[currency] || FALLBACK_USD_TO_CURRENCY.USD;
  const rates = {};

  metals
    .split(",")
    .map((metal) => metal.trim().toUpperCase())
    .filter(Boolean)
    .forEach((metal) => {
      const usdPrice = FALLBACK_USD_PER_OUNCE[metal];
      if (!usdPrice) return;
      rates[metal] = 1 / (usdPrice * currencyRate);
    });

  return NextResponse.json({
    success: true,
    fallback: true,
    base: currency,
    rates,
    timestamp: Math.floor(Date.now() / 1000),
    message: "Using cached indicative metal prices because the live metal price API is not configured.",
  });
}

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 60,
      scope: "tools:metal-prices",
      windowMs: 60000,
    });
    if (limited) return limited;

    const currency = searchParam(req, "currency", "USD").toUpperCase();
    const metals = searchParam(req, "metals", "XAU,XAG,XPT,XPD");
    let apiKey = "";

    try {
      apiKey = requireServerEnv(SERVER_ENV.metalPrice);
    } catch {
      return buildFallbackMetalPrices(currency, metals);
    }

    const upstream = new URL("https://api.metalpriceapi.com/v1/latest");
    upstream.searchParams.set("api_key", apiKey);
    upstream.searchParams.set("base", currency);
    upstream.searchParams.set("currencies", metals);

    return proxyJson(NextResponse, upstream, { next: { revalidate: 300 } });
  } catch (error) {
    return routeError(NextResponse, error, "Failed to fetch metal prices.");
  }
}
