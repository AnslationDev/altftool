// altftoolweb/src/app/api/pages/inventory/route.js
//
// ALTF Engine Page Registry source-of-truth enumerator (Phase A).
// Walks every server-rendered page source (tools, blogs, news, static/policy)
// and returns normalized PageIndexEntry records. The admin app calls this
// (secret-gated) to build/refresh its registry + search index.

import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildPageIndexEntry } from "@altftool/core/seo";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { getAllBlogs } from "@/app/blogs/data";
import { loadSeoConfig } from "@/platform/seo/seoConfigSource";

export const dynamic = "force-dynamic";

const STATIC_HUBS = [
  ["/", "AltFTool — Free Online Tools & Utilities", "static", "Free online tools, utilities, and Chrome extensions to boost your productivity."],
  ["/tools", "All Tools", "tools", "Browse every free online tool on AltFTool by category."],
  ["/blogs", "Blog", "blogs", "Guides, tutorials, and tips for getting the most out of AltFTool's tools."],
  ["/news", "News", "news", "Latest tech and product news curated by AltFTool."],
];

const POLICY_PAGES = [
  ["/policypages/about", "About AltFTool"],
  ["/policypages/contact", "Contact Us"],
  ["/policypages/privacy", "Privacy Policy"],
  ["/policypages/termsandconditions", "Terms & Conditions"],
  ["/policypages/affiliate", "Affiliate Disclosure"],
  ["/policypages/cookie", "Cookie Policy"],
  ["/policypages/disclaimer", "Disclaimer"],
];

function readNews() {
  try {
    const file = path.join(process.cwd(), "public", "data", "newsdata.json");
    const json = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(json?.news) ? json.news : [];
  } catch {
    return [];
  }
}

export async function GET(request) {
  const secret =
    request.headers.get("x-inventory-secret") ||
    request.nextUrl.searchParams.get("secret");
  if (!process.env.ALTFT_REVALIDATE_SECRET || secret !== process.env.ALTFT_REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark which pages already have a central override.
  let overridePaths = new Set();
  try {
    const cfg = await loadSeoConfig();
    overridePaths = new Set(Object.keys(cfg?.pages || {}));
  } catch {
    /* inert */
  }

  const entries = [];
  const add = (o) =>
    entries.push(buildPageIndexEntry({ ...o, hasOverride: overridePaths.has(o.path) }));

  // 1. Static hubs + policy pages
  for (const [p, title, type, description] of STATIC_HUBS) add({ path: p, pageType: type, source: "static", title, description, h1: title });
  for (const [p, title] of POLICY_PAGES) add({ path: p, pageType: "policies", source: "static", title, h1: title });

  // 2. Tools (canonical /tools/all/<slug>)
  for (const [slug, tool] of Object.entries(toolMetaMap || {})) {
    if (!slug) continue;
    add({
      path: `/tools/all/${slug}`,
      pageType: "tools",
      source: "tool",
      title: tool?.name || slug.replace(/-/g, " "),
      description: tool?.description || "",
      h1: tool?.name || "",
      hasSchema: true,
    });
  }

  // 3. Blogs (static set; Firebase blogs can be appended in a later pass)
  for (const b of getAllBlogs() || []) {
    if (!b?.slug) continue;
    add({
      path: `/blogs/${b.slug}`,
      pageType: "blogs",
      source: "blog",
      title: b.seoTitle || b.heading || b.title || "",
      description: b.seoDescription || b.excerpt || "",
      h1: b.heading || b.title || "",
      hasSchema: true,
      updatedAt: b.updatedAt || b.date || null,
    });
  }

  // 4. News articles
  for (const a of readNews()) {
    if (!a?.slug) continue;
    add({
      path: `/news/${a.slug}`,
      pageType: "news",
      source: "news",
      title: a.headline || "",
      description: a.summary || "",
      h1: a.headline || "",
    });
  }

  return NextResponse.json({ count: entries.length, generatedAt: new Date().toISOString(), entries });
}
