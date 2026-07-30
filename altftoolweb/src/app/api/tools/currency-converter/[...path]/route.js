import { NextResponse } from "next/server";
import { enforceRateLimit, fetchJson } from "@altftool/core/http";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const DATE_PATH_PATTERN = /^\d{4}-\d{2}-\d{2}(\.\.\d{4}-\d{2}-\d{2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export async function GET(request, { params }) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "tools:currency-converter",
    windowMs: 60000,
  });
  if (limited) return limited;

  const resolvedParams = await params;
  const path = (resolvedParams?.path || []).join("/");
  const { searchParams } = new URL(request.url);
  const from = String(searchParams.get("from") || "").toUpperCase();
  const to = String(searchParams.get("to") || "").toUpperCase();

  if (!DATE_PATH_PATTERN.test(path) || !CURRENCY_PATTERN.test(from) || !CURRENCY_PATTERN.test(to)) {
    return Response.json({ error: "Invalid currency history request." }, { status: 400 });
  }

  const upstreamUrl = new URL(`${FRANKFURTER_BASE_URL}/${path}`);
  upstreamUrl.searchParams.set("from", from);
  upstreamUrl.searchParams.set("to", to);

  try {
    const result = await fetchJson(upstreamUrl, {
      next: { revalidate: 60 * 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!result.ok) {
      return Response.json(
        { error: result.data?.message || result.data?.error || "Currency history request failed." },
        { status: result.status },
      );
    }

    return Response.json(result.data, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json({ error: "Currency history service is unavailable." }, { status: 502 });
  }
}
