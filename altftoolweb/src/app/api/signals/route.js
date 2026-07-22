import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";
import { SIGNAL_CATALOG, SIGNAL_DATA_AS_OF } from "@altftool/core/signals";

const SORTS = new Set(["opportunity", "volume", "name"]);

export function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 60,
    scope: "signals:catalog",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 100).toLowerCase();
  const category = (searchParams.get("category") || "").trim();
  const momentum = (searchParams.get("momentum") || "").trim();
  const requestedSort = (searchParams.get("sort") || "opportunity").trim();
  const sort = SORTS.has(requestedSort) ? requestedSort : "opportunity";

  const results = SIGNAL_CATALOG.filter((signal) => {
    const searchable = [signal.name, signal.query, signal.summary, signal.category].join(" ").toLowerCase();
    return (!query || searchable.includes(query)) && (!category || signal.category === category) && (!momentum || signal.momentum === momentum);
  }).sort((a, b) => {
    if (sort === "volume") return (b.searchVolume || 0) - (a.searchVolume || 0);
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.opportunityScore - a.opportunityScore;
  });

  return jsonResponse(NextResponse, {
    dataAsOf: SIGNAL_DATA_AS_OF,
    count: results.length,
    results,
  }, { cache: { sMaxage: 3600, staleWhileRevalidate: 86400 } });
}
