import { NextResponse } from "next/server";
import { enforceRateLimit, requireSearchParam, searchParam } from "@altftool/core/http";
import { streamMallPromotions } from "@/lib/sale/promotion.service";

export const runtime = "nodejs";

/**
 * GET /api/malls/events?website=&name=
 *
 * Streams newline-delimited JSON chunks of a mall's real, currently-live
 * promotions/offers/events as streamMallPromotions() discovers them — one
 * JSON object per line, each shaped like its onChunk payload
 * ({ status, events, message?, done }), ending with a chunk where
 * done: true. This exact NDJSON-over-fetch-stream shape is what
 * useMallPromotions.js already parses (split on "\n", JSON.parse each line).
 */
export async function GET(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 30,
    scope: "sale:malls-events",
    windowMs: 60000,
  });
  if (limited) return limited;

  let website;
  try {
    website = requireSearchParam(req, "website");
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 400 });
  }
  const name = searchParam(req, "name");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const enqueue = (chunk) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(chunk)}\n`));
        } catch {
          closed = true; // client disconnected mid-stream
        }
      };

      try {
        await streamMallPromotions({ website, name }, enqueue);
      } catch {
        enqueue({
          status: "error",
          events: [],
          message: `Couldn't reach ${name || "the mall"}'s website right now.`,
          done: true,
        });
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
