import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_DOWNLOAD_BYTES = 500_000;
const DEFAULT_DOWNLOAD_BYTES = 350_000;
const MAX_UPLOAD_BYTES = 128_000;

function noStoreHeaders(extra = {}) {
  return { "Cache-Control": "no-store", ...extra };
}

export function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, { limit: 30, scope: "netcheck:get", windowMs: 60_000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "ping";
  if (mode === "ping") {
    return jsonResponse(NextResponse, { ok: true, serverTime: new Date().toISOString() }, { headers: noStoreHeaders() });
  }
  if (mode !== "download") {
    return jsonResponse(NextResponse, { error: "Unsupported test mode." }, { status: 400, headers: noStoreHeaders() });
  }

  const requestedBytes = Number(searchParams.get("bytes"));
  const bytes = Number.isFinite(requestedBytes)
    ? Math.min(MAX_DOWNLOAD_BYTES, Math.max(1_024, Math.round(requestedBytes)))
    : DEFAULT_DOWNLOAD_BYTES;
  return new Response(randomBytes(bytes), {
    status: 200,
    headers: noStoreHeaders({
      "Content-Type": "application/octet-stream",
      "Content-Length": String(bytes),
      "Content-Encoding": "identity",
    }),
  });
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, { limit: 12, scope: "netcheck:upload", windowMs: 60_000 });
  if (limited) return limited;
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_UPLOAD_BYTES) {
    return jsonResponse(NextResponse, { error: "Upload test payload is too large." }, { status: 413, headers: noStoreHeaders() });
  }
  const payload = await request.arrayBuffer();
  if (payload.byteLength > MAX_UPLOAD_BYTES) {
    return jsonResponse(NextResponse, { error: "Upload test payload is too large." }, { status: 413, headers: noStoreHeaders() });
  }
  return jsonResponse(NextResponse, { ok: true, bytesReceived: payload.byteLength, serverTime: new Date().toISOString() }, { headers: noStoreHeaders() });
}
