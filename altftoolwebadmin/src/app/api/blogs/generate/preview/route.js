// ALTF Engine — Blog lane PREVIEW endpoint (admin-only).
// POST { topic, keywords?, brief? } — generates a full draft + quality audit
// WITHOUT saving anything. Used to tune prompts/settings before queueing.

import { NextResponse } from "next/server";
import { evaluateBlogContent } from "@altftool/core/blogContentHealth";
import { enforceRateLimit } from "@altftool/core/http";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";
import { adminDb } from "@/lib/firebaseAdmin";
import { slugify } from "@/projects/altftool/modules/blogs/lib/slug";
import { isAutomationEnabled, CATEGORIES_COLLECTION, fsPath } from "@/lib/automation/constants";
import { readAutomationSettings } from "@/lib/automation/settings";
import { generateJson } from "@/lib/automation/openaiClient";
import {
  BLOG_JSON_SCHEMA,
  assembleBlogDoc,
  buildBlogSystemPrompt,
  buildBlogUserPrompt,
} from "@/lib/automation/blogPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request) {
  if (!isAutomationEnabled()) return NextResponse.json({ skipped: true, reason: "automation flag off" });

  const limited = enforceRateLimit(NextResponse, request, {
    limit: 5,
    windowMs: 60_000,
    scope: "blog-generate-preview",
  });
  if (limited) return limited;

  let adminUser;
  try {
    ({ admin: adminUser } = await verifyActiveAdmin(request));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Preview runs the same generator against the same altftool blog settings
  // and spends the same LLM budget as POST /api/blogs/generate, so it takes
  // the identical gate rather than "is some active admin" (superadmin
  // bypasses inside hasModuleAccess).
  if (!hasModuleAccess({ adminData: adminUser, projectId: "altftool", moduleKey: "blogs", action: "write" })) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* required body */
  }
  const topic = String(body?.topic || "").trim();
  if (topic.length < 8) {
    return NextResponse.json({ error: "Provide a topic of at least 8 characters." }, { status: 400 });
  }

  try {
    const settings = await readAutomationSettings();
    const catSnap = await adminDb.collection(fsPath(CATEGORIES_COLLECTION)).get();
    const categories = catSnap.docs.map((d) => d.data()?.name).filter(Boolean);
    if (!categories.some((n) => String(n).toLowerCase() === "tools")) categories.push("Tools");

    const result = await generateJson({
      provider: settings.blog.provider,
      model: settings.blog.model,
      temperature: settings.blog.temperature,
      system: buildBlogSystemPrompt(settings),
      user: buildBlogUserPrompt(
        {
          topic,
          keywords: Array.isArray(body.keywords) ? body.keywords : [],
          brief: String(body.brief || ""),
          categories,
        },
        settings,
      ),
      jsonSchema: BLOG_JSON_SCHEMA,
      maxTokens: 8192,
    });

    const doc = assembleBlogDoc({
      generated: result.data,
      slug: slugify(result.data.heading || topic),
      settings,
      topicId: "",
      model: result.model,
    });
    const audit = evaluateBlogContent(doc);

    return NextResponse.json({
      ok: true,
      preview: doc,
      audit: { score: audit.score, status: audit.status, missing: audit.missing, words: audit.words },
      usage: { tokens: result.usage?.total_tokens || 0, costUsd: result.costUsd },
      requestedBy: adminUser.email || adminUser.uid,
      saved: false,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
