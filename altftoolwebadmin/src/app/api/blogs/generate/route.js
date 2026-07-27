// ALTF Engine — Blog lane endpoint (admin/manual).
// POST { count? } — generate up to `count` drafts from the topic queue now.
// Same engine as the cron orchestrator; admin-token or cron-secret auth.

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { CRON_SECRET_ENV, isAutomationEnabled } from "@/lib/automation/constants";
import { readAutomationSettings } from "@/lib/automation/settings";
import { runBlogLane } from "@/lib/automation/blogLane";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request) {
  if (!isAutomationEnabled()) return NextResponse.json({ skipped: true, reason: "automation flag off" });

  // Each run writes drafts and spends LLM budget — mirror the sibling
  // /api/seo/generate lane, which is rate limited for every caller.
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 6,
    windowMs: 60_000,
    scope: "blog-generate",
  });
  if (limited) return limited;

  let startedBy = "";
  const secret = process.env[CRON_SECRET_ENV];
  const provided = request.headers.get("x-cron-secret") || "";
  if (secret && provided === secret) {
    startedBy = "cron";
  } else {
    let admin;
    try {
      ({ admin } = await verifyActiveAdmin(request));
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // The blog lane persists drafts under projects/altftool, so it is
    // authorized against altftool's blogs module rather than "is some active
    // admin" (superadmin bypasses inside hasModuleAccess).
    if (!hasModuleAccess({ adminData: admin, projectId: "altftool", moduleKey: "blogs", action: "write" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    startedBy = admin.email || admin.uid;
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }
  const count = Math.min(Math.max(Number(body.count) || 0, 0), 10);

  try {
    const settings = await readAutomationSettings();
    const result = await runBlogLane({
      settings,
      trigger: startedBy === "cron" ? "cron" : "manual",
      startedBy,
      maxCount: count,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
