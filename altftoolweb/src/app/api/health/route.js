import { NextResponse } from "next/server";
import { jsonResponse } from "@altftool/core/http";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchFirebaseBlogsPage } from "@/app/blogs/data/firebaseBlogs";
import localBlogData from "@/app/blogs/data/blogs.json";
import buySmartStores from "@/app/buysmart/data/stores.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function commitSha() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    null
  );
}

function publicUrl(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function scoreChecks(checks) {
  return clampScore((checks.filter((check) => check.ok).length / checks.length) * 100);
}

function withTimeout(promise, timeoutMs = 3500) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

async function buildFirebaseReadiness() {
  const checks = [
    {
      key: "clientConfig",
      label: "Public Firebase client config",
      ok: isFirebaseConfigured,
      detail: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
    },
  ];
  let liveBlogs = 0;

  try {
    const posts = await withTimeout(fetchFirebaseBlogsPage({ pageSize: 1 }), 4000);
    liveBlogs = posts.length;
    checks.push({
      key: "liveBlogs",
      label: "Live Firebase blogs",
      ok: liveBlogs > 0,
      detail: `${liveBlogs} sampled`,
    });
  } catch (error) {
    checks.push({
      key: "liveBlogs",
      label: "Live Firebase blogs",
      ok: false,
      detail: error?.message || "Firebase blog probe failed.",
    });
  }

  return {
    score: scoreChecks(checks),
    configured: isFirebaseConfigured,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36",
    liveBlogs,
    checks,
  };
}

function buildToolReadiness() {
  const slugs = Object.keys(toolMetaMap);
  const registeredPriorityTools = TOP_PRIORITY_TOOL_SLUGS.filter((slug) => toolMetaMap[slug]);
  const checks = [
    {
      key: "registry",
      label: "Tool registry",
      ok: slugs.length >= 150,
      detail: `${slugs.length} tools registered`,
    },
    {
      key: "priorityTools",
      label: "Priority tools",
      ok: registeredPriorityTools.length === TOP_PRIORITY_TOOL_SLUGS.length,
      detail: `${registeredPriorityTools.length}/${TOP_PRIORITY_TOOL_SLUGS.length} registered`,
    },
  ];

  return {
    score: scoreChecks(checks),
    total: slugs.length,
    priorityTotal: TOP_PRIORITY_TOOL_SLUGS.length,
    priorityRegistered: registeredPriorityTools.length,
    checks,
  };
}

function buildContentReadiness() {
  const localBlogs = Array.isArray(localBlogData.blogs) ? localBlogData.blogs.length : 0;
  const checks = [
    {
      key: "localBlogs",
      label: "Static blog fallback",
      ok: localBlogs > 0,
      detail: `${localBlogs} posts`,
    },
    {
      key: "buySmartStores",
      label: "BuySmart fallback stores",
      ok: buySmartStores.length > 0,
      detail: `${buySmartStores.length} stores`,
    },
  ];

  return {
    score: scoreChecks(checks),
    localBlogs,
    buySmartStores: buySmartStores.length,
    checks,
  };
}

function buildSeoReadiness(siteUrl) {
  const checks = [
    {
      key: "sitemap",
      label: "Sitemap endpoint",
      ok: true,
      detail: `${siteUrl}/sitemap.xml`,
    },
    {
      key: "robots",
      label: "Robots endpoint",
      ok: true,
      detail: `${siteUrl}/robots.txt`,
    },
    {
      key: "rss",
      label: "RSS endpoint",
      ok: true,
      detail: `${siteUrl}/rss.xml`,
    },
  ];

  return {
    score: scoreChecks(checks),
    checks,
  };
}

export async function GET(request) {
  const siteUrl = publicUrl(request);
  const [firebase, tools] = await Promise.all([
    buildFirebaseReadiness(),
    Promise.resolve(buildToolReadiness()),
  ]);
  const content = buildContentReadiness();
  const seo = buildSeoReadiness(siteUrl);
  const overallScore = clampScore(
    firebase.score * 0.35 +
      tools.score * 0.3 +
      content.score * 0.2 +
      seo.score * 0.15,
  );
  const status = overallScore >= 90 ? "healthy" : overallScore >= 75 ? "watch" : "attention";

  return jsonResponse(NextResponse, {
    generatedAt: new Date().toISOString(),
    service: "altftool-web",
    overall: {
      score: overallScore,
      status,
      label:
        status === "healthy"
          ? "Public web ready"
          : status === "watch"
            ? "Public web needs review"
            : "Public web needs attention",
    },
    release: {
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : siteUrl,
      commitSha: commitSha(),
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    firebase,
    tools,
    content,
    seo,
  }, {
    cache: {
      sMaxage: 60,
      staleWhileRevalidate: 120,
    },
  });
}
