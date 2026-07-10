// ALTF Engine — SEO lane endpoint (admin/manual).
// POST { paths?, count? } — generate proposals for selected pages (or let the
// priority scorer pick). Writes seoProposals only; never touches seo/runtime.

import { NextResponse } from "next/server";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { enforceRateLimit } from "@altftool/core/http";
import { CRON_SECRET_ENV, isAutomationEnabled } from "@/lib/automation/constants";
import { readAutomationSettings } from "@/lib/automation/settings";
import { generateSeoPreviewForPath, runSeoLane } from "@/lib/automation/seoLane";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request) {
  if (!isAutomationEnabled()) return NextResponse.json({ skipped: true, reason: "automation flag off" });

  const limited = enforceRateLimit(NextResponse, request, {
    limit: 6,
    windowMs: 60_000,
    scope: "seo-generate",
  });
  if (limited) return limited;

  let startedBy = "";
  const secret = process.env[CRON_SECRET_ENV];
  const provided = request.headers.get("x-cron-secret") || "";
  if (secret && provided === secret) {
    startedBy = "cron";
  } else {
    try {
      const { admin } = await verifyActiveAdmin(request);
      startedBy = admin.email || admin.uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }
  const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === "string").slice(0, 25) : [];
  const count = Math.min(Math.max(Number(body.count) || 0, 0), 25);

  // PREVIEW mode (Pages editor "Generate with AI"): generate the full entry
  // for ONE path and return it — nothing is persisted; the admin reviews the
  // filled form and saves through the audited /api/seo/config path. Works
  // even while the scheduled SEO lane is disabled (explicit admin action).
  if (body.preview === true) {
    const path = typeof body.path === "string" ? body.path : paths[0];
    if (!path) return NextResponse.json({ error: "Provide a path to generate for." }, { status: 400 });
    try {
      const settings = await readAutomationSettings();
      const preview = await generateSeoPreviewForPath({ path, settings });
      return NextResponse.json({ ok: true, preview, saved: false });
    } catch (error) {
      return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
    }
  }

  try {
    const settings = await readAutomationSettings();
    const result = await runSeoLane({
      settings,
      trigger: startedBy === "cron" ? "cron" : "manual",
      startedBy,
      paths,
      maxCount: count,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
