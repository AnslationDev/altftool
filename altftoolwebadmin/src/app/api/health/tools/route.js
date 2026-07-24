import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import toolReadinessReport from "@/data/toolReadinessReport.json";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set([
  "all",
  "working",
  "api-required",
  "partial",
  "broken",
]);
const VALID_API_STATUSES = new Set([
  "all",
  "configured",
  "missing-config",
  "runtime-check",
  "not-required",
]);

function privateJson(payload, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Vary", "Authorization");
  return NextResponse.json(payload, { ...init, headers });
}

function boundedInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

export async function GET(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 120,
      windowMs: 60_000,
      scope: "admin:health:tools",
    });
    if (limited) return limited;

    await verifySuperAdminRequest(request);

    const url = new URL(request.url);
    const query = String(url.searchParams.get("q") || "")
      .trim()
      .toLowerCase()
      .slice(0, 120);
    const requestedStatus = String(url.searchParams.get("status") || "all");
    const status = VALID_STATUSES.has(requestedStatus)
      ? requestedStatus
      : "all";
    const requestedApiStatus = String(
      url.searchParams.get("apiStatus") || "all",
    );
    const apiStatus = VALID_API_STATUSES.has(requestedApiStatus)
      ? requestedApiStatus
      : "all";
    const page = boundedInteger(url.searchParams.get("page"), 1, 1, 10_000);
    const pageSize = boundedInteger(
      url.searchParams.get("pageSize"),
      40,
      10,
      100,
    );

    const filteredItems = (toolReadinessReport.items || []).filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const matchesApiStatus =
        apiStatus === "all" || item.apiReadiness?.status === apiStatus;
      const matchesQuery =
        !query ||
        item.slug?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.evidence?.envKeys?.some((key) =>
          key.toLowerCase().includes(query),
        ) ||
        item.apiReadiness?.providers?.some((provider) =>
          provider.name?.toLowerCase().includes(query),
        ) ||
        item.apiReadiness?.endpoints?.some((endpoint) =>
          endpoint.target?.toLowerCase().includes(query),
        );
      return matchesStatus && matchesApiStatus && matchesQuery;
    });
    const total = filteredItems.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * pageSize;

    return privateJson({
      generatedAt: toolReadinessReport.generatedAt,
      schemaVersion: toolReadinessReport.schemaVersion,
      summary: toolReadinessReport.summary,
      filters: {
        query,
        status,
        apiStatus,
      },
      pagination: {
        page: currentPage,
        pageSize,
        pages,
        total,
      },
      items: filteredItems.slice(start, start + pageSize),
    });
  } catch (error) {
    const message = error?.message || "Tool readiness could not be loaded.";
    const status = message === "Unauthorized" ? 401 : 500;
    console.error("TOOL_READINESS_API_ERROR:", error);
    return privateJson(
      { error: status === 401 ? "Unauthorized" : message },
      { status },
    );
  }
}
