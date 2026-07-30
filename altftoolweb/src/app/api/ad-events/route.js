// altftoolweb/src/app/api/ad-events/route.js
//
// Ad impression/click collector. Default-inert: it accepts the beacon and
// drops it (cheap, no storage) unless a sink is configured. Set
// ALTFT_AD_EVENTS_LOG=1 to emit server logs, or wire a real sink
// (Firestore / analytics) where noted. Mirrors the /api/vitals pattern.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(["impression", "click"]);
const VALID_PLACEMENTS = new Set([
  "tool_detail_rail",
  "tool_detail_rail_left",
  "tool_detail_rail_right",
  "tool_detail_native",
  "tool_detail_inline",
  "tool_detail_banner",
]);

export async function POST(request) {
  let data = {};
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }

  const valid = VALID_TYPES.has(data?.type) && VALID_PLACEMENTS.has(data?.placement);

  if (valid && process.env.ALTFT_AD_EVENTS_LOG === "1") {
    console.log({
      event: "ad-events",
      type: data.type,
      placement: data.placement,
      adId: data.adId || "n/a",
      toolSlug: data.toolSlug || "n/a",
      path: data.path || "",
    });
    // To persist: write `data` to Firestore (e.g. projects/altftool/adEvents) here.
  }

  return NextResponse.json({ ok: true });
}
