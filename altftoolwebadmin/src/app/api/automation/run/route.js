// ALTF Engine — Content Automation orchestrator.
//
// GET  (Vercel cron)  — runs all enabled lanes, paced by daily limits.
// POST (admin/manual) — body { lanes?: ["trending","blog","seo"], count?, paths? }.
//
// Auth: cron secret (Authorization: Bearer <AUTOMATION_CRON_SECRET> or
// x-cron-secret header) OR an active admin Firebase token.
// Inert unless ALTFT_CONTENT_AUTOMATION_ENABLED === "true" (master.md).

import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { CRON_SECRET_ENV, LANES, PROJECT_ID, isAutomationEnabled } from "@/lib/automation/constants";
import { readAutomationSettings } from "@/lib/automation/settings";
import { runBlogLane } from "@/lib/automation/blogLane";
import { runSeoLane } from "@/lib/automation/seoLane";
import { runTrendingLane } from "@/lib/automation/trending";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Same project-scoped modules the single-lane siblings (/api/blogs/generate,
// /api/seo/generate) authorize against — trending only ever files blogTopics
// suggestions (see TrendingPanel, which always calls this with
// lanes:["trending"]), so it rides on the "blogs" module like the blog lane.
const LANE_MODULES = {
  trending: "blogs",
  blog: "blogs",
  seo: "seo",
};

function cronSecretOk(request) {
  // Accept AUTOMATION_CRON_SECRET and Vercel's built-in CRON_SECRET (Vercel
  // sends the latter as "Authorization: Bearer <CRON_SECRET>" on cron calls).
  const secrets = [process.env[CRON_SECRET_ENV], process.env.CRON_SECRET].filter(Boolean);
  if (!secrets.length) return false;
  const header = request.headers.get("x-cron-secret") || "";
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return secrets.some((secret) => header === secret || bearer === secret);
}

/**
 * Unlike the single-lane siblings, this orchestrator can run any subset of
 * lanes in one call — so an admin token must be checked against EVERY module
 * a requested lane touches (mirrors hasModuleAccess used by
 * /api/blogs/generate and /api/seo/generate), not just "is any active admin".
 */
async function authorize(request, lanes) {
  if (cronSecretOk(request)) return { via: "cron", startedBy: "cron" };

  const { admin } = await verifyActiveAdmin(request);

  const requiredModules = new Set(lanes.map((lane) => LANE_MODULES[lane]).filter(Boolean));
  for (const moduleKey of requiredModules) {
    if (!hasModuleAccess({ adminData: admin, projectId: PROJECT_ID, moduleKey, action: "write" })) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }
  }

  return { via: "admin", startedBy: admin.email || admin.uid };
}

async function execute({ lanes, startedBy, trigger, count = 0, paths = [] }) {
  const settings = await readAutomationSettings();
  const results = {};

  if (lanes.includes("trending")) {
    results.trending = await runTrendingLane({ settings, trigger, startedBy });
  }
  if (lanes.includes("blog")) {
    results.blog = await runBlogLane({ settings, trigger, startedBy, maxCount: count });
  }
  if (lanes.includes("seo")) {
    results.seo = await runSeoLane({ settings, trigger, startedBy, maxCount: count, paths });
  }
  return results;
}

export async function GET(request) {
  if (!isAutomationEnabled()) return NextResponse.json({ skipped: true, reason: "automation flag off" });

  // Mirrors /api/blogs/generate and /api/seo/generate: every caller (cron
  // included) is rate limited, not just admin-token requests.
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 6,
    windowMs: 60_000,
    scope: "automation-run",
  });
  if (limited) return limited;

  let auth;
  try {
    auth = await authorize(request, LANES);
  } catch (error) {
    const status = error?.status === 403 ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
  }

  try {
    const results = await execute({ lanes: LANES, startedBy: auth.startedBy, trigger: "cron" });
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!isAutomationEnabled()) return NextResponse.json({ skipped: true, reason: "automation flag off" });

  const limited = enforceRateLimit(NextResponse, request, {
    limit: 6,
    windowMs: 60_000,
    scope: "automation-run",
  });
  if (limited) return limited;

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }

  const lanes = Array.isArray(body.lanes) && body.lanes.length
    ? body.lanes.filter((lane) => LANES.includes(lane))
    : LANES;
  const count = Math.min(Math.max(Number(body.count) || 0, 0), 10);
  const paths = Array.isArray(body.paths) ? body.paths.slice(0, 25) : [];

  let auth;
  try {
    auth = await authorize(request, lanes);
  } catch (error) {
    const status = error?.status === 403 ? 403 : 401;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
  }

  try {
    const results = await execute({
      lanes,
      startedBy: auth.startedBy,
      trigger: auth.via === "cron" ? "cron" : "manual",
      count,
      paths,
    });
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
