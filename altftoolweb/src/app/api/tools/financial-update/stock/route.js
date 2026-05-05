import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, fetchJson, jsonResponse, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 60,
      scope: "tools:stock",
      windowMs: 60000,
    });
    if (limited) return limited;

    const apiKey = requireServerEnv(SERVER_ENV.alphaVantage);
    const symbol = searchParam(req, "symbol").toUpperCase();
    if (!symbol) {
      return NextResponse.json(
        { error: "Stock symbol is required." },
        { status: 400 }
      );
    }

    const upstream = new URL("https://www.alphavantage.co/query");
    upstream.searchParams.set("function", "TIME_SERIES_DAILY");
    upstream.searchParams.set("symbol", symbol);
    upstream.searchParams.set("apikey", apiKey);

    const result = await fetchJson(upstream, {
      next: { revalidate: 300 },
      timeoutMs: 10000,
    });
    const json = result.data;

    if (!result.ok) {
      return jsonResponse(
        NextResponse,
        { error: "Stock provider is unavailable right now." },
        { status: result.status || 502 }
      );
    }

    if (json.Note) {
      return NextResponse.json(
        { error: "API limit reached. Please wait a minute." },
        { status: 429 }
      );
    }

    if (json["Error Message"]) {
      return NextResponse.json({ error: "Invalid stock symbol." }, { status: 400 });
    }

    const series = json["Time Series (Daily)"];
    if (!series) {
      return NextResponse.json(
        { error: "No stock data available." },
        { status: 404 }
      );
    }

    const points = Object.entries(series)
      .slice(0, 30)
      .reverse()
      .map(([date, value]) => ({
        date,
        price: Number(value["4. close"]),
        volume: Number(value["5. volume"]),
        high: Number(value["2. high"]),
        low: Number(value["3. low"]),
      }));

    return jsonResponse(NextResponse, { points }, {
      cache: { sMaxage: 300, staleWhileRevalidate: 600 },
    });
  } catch (error) {
    return routeError(NextResponse, error, "Failed to fetch stock data.");
  }
}
