// altftoolweb/src/app/api/vitals/route.js
//
// Core Web Vitals collector. Default-inert: it accepts the beacon and drops it
// (cheap, no storage) unless a sink is configured. Set ALTFT_WEB_VITALS_LOG=1
// to emit server logs, or wire a real sink (Firestore / analytics) where noted.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOOD = { LCP: 2500, INP: 200, CLS: 0.1, FCP: 1800, TTFB: 800 };

export async function POST(request) {
  let data = {};
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }

  if (process.env.ALTFT_WEB_VITALS_LOG === "1" && data?.name) {
    const threshold = GOOD[data.name];
    const flag = threshold && data.value > threshold ? "⚠" : "✓";
    console.log(`[web-vitals] ${flag} ${data.name}=${data.value} (${data.rating || "n/a"}) ${data.path || ""}`);
    // To persist: write `data` to Firestore (e.g. webVitals collection) here.
  }

  return NextResponse.json({ ok: true });
}
