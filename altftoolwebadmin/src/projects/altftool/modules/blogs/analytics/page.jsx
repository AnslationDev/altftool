"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Heart,
  Link2,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Tags,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import { fetchAllBlogs } from "../services/blogsService";
import { getBlogContentQuality } from "../components/BlogSeoChecklist";
import { getBlogSchemaHealth } from "../components/blogSeoHealth";

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function hasInternalLinks(html = "") {
  return /href=["'][^"']*\/blogs\//i.test(String(html || ""));
}

function calcReadTime(html = "") {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function parseTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getEngagement(blog = {}) {
  const views = Number(blog.views || 0);
  const likes = Number(blog.likesCount || 0);
  const comments = Number(blog.commentsCount || 0);
  const toolClicks = Number(blog.toolClickCount || 0);
  return views + likes * 12 + comments * 18 + toolClicks * 10;
}

function getMonthKey(date) {
  return date.toLocaleDateString("en", { month: "short", year: "2-digit" });
}

function getDaysSince(value, fallback) {
  const date = toDate(value || fallback);
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function getRefreshReasons(blog = {}) {
  const reasons = [];

  if (blog.status === "published" && blog.daysSinceUpdate !== null && blog.daysSinceUpdate >= 90) {
    reasons.push(`${blog.daysSinceUpdate} days since update`);
  }

  if (blog.qualityScore < 70) reasons.push(`quality ${blog.qualityScore}%`);
  if (!blog.hasInternalLinks) reasons.push("no internal blog links");
  if (!blog.hasFaq) reasons.push("no authored FAQ");
  if (!blog.hasTrustMetadata) reasons.push("missing trust metadata");
  if (!blog.hasSources) reasons.push("missing cited sources");
  if (!blog.hasReviewDate) reasons.push("missing review date");
  if (blog.helpfulRate !== null && blog.feedbackTotal >= 3 && blog.helpfulRate < 60) {
    reasons.push(`reader feedback ${blog.helpfulRate}% helpful`);
  }

  return reasons;
}

function getRefreshAction(blog = {}) {
  if (!blog.hasTrustMetadata) {
    return "Add author role, reviewer, and a short editorial note.";
  }
  if (!blog.hasInternalLinks) {
    return "Insert 3-5 contextual internal links and a topic path block.";
  }
  if (!blog.hasFaq) {
    return "Add an authored FAQ block for long-tail search coverage.";
  }
  if (!blog.hasSources) {
    return "Add cited sources and a short source review note.";
  }
  if (!blog.hasReviewDate) {
    return "Mark the post reviewed and confirm the source note.";
  }
  if (blog.qualityScore < 70) {
    return "Expand the intro, headings, examples, and scannable structure.";
  }
  if (blog.daysSinceUpdate !== null && blog.daysSinceUpdate >= 90) {
    return "Refresh facts, screenshots, dates, and recommendations.";
  }
  if (blog.helpfulRate !== null && blog.feedbackTotal >= 3 && blog.helpfulRate < 60) {
    return "Rewrite unclear sections using reader feedback as the first signal.";
  }
  return "Review SEO, links, freshness, and reader usefulness.";
}

function getRefreshTier(score = 0) {
  if (score >= 90) return "High";
  if (score >= 55) return "Medium";
  return "Quick win";
}

function getSeoAuditIssues(blog = {}) {
  const issues = [];
  const seenLabels = new Set();
  const pushIssue = (issue) => {
    if (!issue?.label || seenLabels.has(issue.label)) return;
    seenLabels.add(issue.label);
    issues.push(issue);
  };
  const failedChecks = (blog.qualityChecks || []).filter((check) => !check.done);

  failedChecks.slice(0, 4).forEach((check) => {
    pushIssue({
      key: check.label,
      label: check.label,
      detail: check.detail,
    });
  });

  (blog.schemaHealth?.issues || []).slice(0, 4).forEach((check) => {
    pushIssue({
      key: `schema-${check.key}`,
      label: check.label,
      detail: check.detail,
    });
  });

  if (!blog.hasTrustMetadata) {
    pushIssue({
      key: "Trust metadata",
      label: "Trust metadata",
      detail: "Add role, reviewer, or editorial note",
    });
  }

  if (blog.helpfulRate !== null && blog.feedbackTotal >= 3 && blog.helpfulRate < 60) {
    pushIssue({
      key: "Reader feedback",
      label: "Reader feedback",
      detail: `${blog.helpfulRate}% helpful`,
    });
  }

  return issues.slice(0, 6);
}

function getHelpfulRate(blog = {}) {
  const helpful = Number(blog.helpfulCount || 0);
  const notHelpful = Number(blog.notHelpfulCount || 0);
  const total = helpful + notHelpful;
  if (!total) return null;
  return Math.round((helpful / total) * 100);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatShortDate(date) {
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function buildRefreshSchedule(queue = []) {
  const today = new Date();
  const slots = [
    { label: "This week", caption: "Fix highest-impact SEO gaps", days: 0, items: queue.slice(0, 3) },
    { label: "Next 14 days", caption: "Add FAQ and internal links", days: 7, items: queue.slice(3, 6) },
    { label: "Backlog", caption: "Refresh when content calendar opens", days: 14, items: queue.slice(6, 9) },
  ];

  return slots.map((slot) => ({
    ...slot,
    dateLabel: formatShortDate(addDays(today, slot.days)),
  }));
}

function StatCard({ icon: Icon, label, value, caption, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {caption ? <p className="mt-3 text-xs leading-5 text-gray-500">{caption}</p> : null}
    </div>
  );
}

function RankedBlog({ blog, index, router, metric, metricLabel = "score" }) {
  return (
    <button
      type="button"
      onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
      className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-black text-gray-500">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
          {blog.heading || "Untitled blog"}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          {blog.category || "Uncategorized"} - {calcReadTime(blog.description)} min read
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-black text-gray-800">{metric}</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-400">{metricLabel}</p>
      </div>
    </button>
  );
}

function HorizontalBar({ label, value, max, caption }) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-semibold text-gray-600">{label}</span>
        <span className="shrink-0 text-gray-400">{caption || value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function RefreshActionButton({ icon: Icon, label, onClick, tone = "blue" }) {
  const toneMap = {
    blue: "border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-200",
    amber: "border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200",
    green: "border-green-100 bg-green-50 text-green-700 hover:border-green-200",
    slate: "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition ${toneMap[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export default function AltFToolBlogAnalyticsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rows = await fetchAllBlogs();
        if (!cancelled) setBlogs(rows);
      } catch (error) {
        console.error("Blog analytics fetch failed", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    const monthMap = new Map();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      monthMap.set(getMonthKey(date), 0);
    }

    const enriched = blogs.map((blog) => {
      const quality = getBlogContentQuality({
        formData: {
          ...blog,
          tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
        },
        imageAlt: blog.imageAlt || "",
        hasImage: Boolean(blog.image),
      });
      const schemaHealth = getBlogSchemaHealth(blog);

      return {
        ...blog,
        qualityScore: quality.score,
        qualityChecks: quality.checks,
        qualitySuggestions: quality.suggestions,
        schemaHealth,
        schemaScore: schemaHealth.score,
        schemaReady: schemaHealth.articleSchemaReady,
        richResultReady: schemaHealth.richResultReady,
        engagement: getEngagement(blog),
        toolClickCount: Number(blog.toolClickCount || 0),
        readTime: calcReadTime(blog.description || ""),
        daysSinceUpdate: getDaysSince(blog.updatedAt, blog.createdAt || blog.date),
        hasInternalLinks: hasInternalLinks(blog.description || ""),
        hasFaq: schemaHealth.flags.hasFaq,
        hasTrustMetadata: Boolean(blog.authorRole || blog.reviewedBy || blog.editorialNote),
        hasSources: schemaHealth.flags.sourceCount > 0,
        hasReviewDate: schemaHealth.flags.hasReviewDate,
        feedbackTotal: Number(blog.helpfulCount || 0) + Number(blog.notHelpfulCount || 0),
        helpfulRate: getHelpfulRate(blog),
      };
    });

    const withRefreshReasons = enriched.map((blog) => {
      const refreshReasons = getRefreshReasons(blog);
      const seoAuditIssues = getSeoAuditIssues(blog);
      const refreshScore =
        refreshReasons.length * 20 +
        Math.max(0, 70 - blog.qualityScore) +
        (blog.daysSinceUpdate ? Math.min(30, Math.floor(blog.daysSinceUpdate / 6)) : 0) +
        (blog.engagement > 0 ? Math.min(20, Math.floor(blog.engagement / 20)) : 0) +
        (blog.helpfulRate !== null && blog.helpfulRate < 60 ? 18 : 0);

      return {
        ...blog,
        refreshReasons,
        seoAuditIssues,
        refreshScore,
        refreshAction: getRefreshAction(blog),
        refreshTier: getRefreshTier(refreshScore),
      };
    });

    const published = withRefreshReasons.filter((blog) => blog.status === "published");
    const drafts = withRefreshReasons.filter((blog) => blog.status !== "published");
    const totalViews = withRefreshReasons.reduce((sum, blog) => sum + Number(blog.views || 0), 0);
    const totalLikes = withRefreshReasons.reduce((sum, blog) => sum + Number(blog.likesCount || 0), 0);
    const totalComments = withRefreshReasons.reduce((sum, blog) => sum + Number(blog.commentsCount || 0), 0);
    const totalToolClicks = withRefreshReasons.reduce((sum, blog) => sum + Number(blog.toolClickCount || 0), 0);
    const totalHelpful = withRefreshReasons.reduce((sum, blog) => sum + Number(blog.helpfulCount || 0), 0);
    const totalNotHelpful = withRefreshReasons.reduce((sum, blog) => sum + Number(blog.notHelpfulCount || 0), 0);
    const helpfulRate = totalHelpful + totalNotHelpful
      ? Math.round((totalHelpful / (totalHelpful + totalNotHelpful)) * 100)
      : 0;
    const avgQuality = withRefreshReasons.length
      ? Math.round(withRefreshReasons.reduce((sum, blog) => sum + blog.qualityScore, 0) / withRefreshReasons.length)
      : 0;
    const avgReadTime = withRefreshReasons.length
      ? Math.round(withRefreshReasons.reduce((sum, blog) => sum + blog.readTime, 0) / withRefreshReasons.length)
      : 0;
    const avgSchemaScore = withRefreshReasons.length
      ? Math.round(withRefreshReasons.reduce((sum, blog) => sum + blog.schemaScore, 0) / withRefreshReasons.length)
      : 0;

    withRefreshReasons.forEach((blog) => {
      const created = toDate(blog.createdAt || blog.date);
      if (!created) return;
      const key = getMonthKey(created);
      if (monthMap.has(key)) monthMap.set(key, monthMap.get(key) + 1);
    });

    const categoryMap = new Map();
    const tagMap = new Map();
    withRefreshReasons.forEach((blog) => {
      const category = blog.category || "Uncategorized";
      const categoryStats = categoryMap.get(category) || { posts: 0, views: 0 };
      categoryStats.posts += 1;
      categoryStats.views += Number(blog.views || 0);
      categoryMap.set(category, categoryStats);

      parseTags(blog.tags).forEach((tag) => {
        const tagStats = tagMap.get(tag) || { posts: 0, views: 0 };
        tagStats.posts += 1;
        tagStats.views += Number(blog.views || 0);
        tagMap.set(tag, tagStats);
      });
    });

    const staleDrafts = drafts
      .filter((blog) => {
        const updated = toDate(blog.updatedAt || blog.createdAt);
        if (!updated) return false;
        return now - updated > 1000 * 60 * 60 * 24 * 7;
      })
      .sort((a, b) => (toDate(a.updatedAt) || 0) - (toDate(b.updatedAt) || 0));

    const refreshQueue = published
      .filter((blog) => blog.refreshReasons.length > 0)
      .sort((a, b) => b.refreshScore - a.refreshScore)
      .slice(0, 9);
    const seoAuditQueue = [...withRefreshReasons]
      .filter((blog) => blog.seoAuditIssues.length > 0)
      .sort((a, b) => {
        const issueDiff = b.seoAuditIssues.length - a.seoAuditIssues.length;
        if (issueDiff !== 0) return issueDiff;
        return a.qualityScore - b.qualityScore;
      })
      .slice(0, 10);
    const issueCounts = new Map();
    seoAuditQueue.forEach((blog) => {
      blog.seoAuditIssues.forEach((issue) => {
        issueCounts.set(issue.label, (issueCounts.get(issue.label) || 0) + 1);
      });
    });
    const schemaQueue = [...published]
      .filter((blog) => !blog.richResultReady)
      .sort((a, b) => {
        if (a.schemaReady !== b.schemaReady) return a.schemaReady ? 1 : -1;
        return a.schemaScore - b.schemaScore;
      })
      .slice(0, 8);
    const schemaIssueCounts = new Map();
    published.forEach((blog) => {
      blog.schemaHealth.issues.forEach((issue) => {
        schemaIssueCounts.set(issue.label, (schemaIssueCounts.get(issue.label) || 0) + 1);
      });
    });

    return {
      total: withRefreshReasons.length,
      published: published.length,
      drafts: drafts.length,
      totalViews,
      totalLikes,
      totalComments,
      totalToolClicks,
      totalHelpful,
      totalNotHelpful,
      helpfulRate,
      avgQuality,
      avgReadTime,
      avgSchemaScore,
      lowQuality: withRefreshReasons.filter((blog) => blog.qualityScore < 70),
      noFaq: published.filter((blog) => !blog.hasFaq),
      noInternalLinks: published.filter((blog) => !blog.hasInternalLinks),
      missingTrust: withRefreshReasons.filter((blog) => !blog.hasTrustMetadata),
      missingSources: withRefreshReasons.filter((blog) => !blog.hasSources),
      missingReviewDate: withRefreshReasons.filter((blog) => !blog.hasReviewDate),
      schemaReady: published.filter((blog) => blog.schemaReady),
      richResultReady: published.filter((blog) => blog.richResultReady),
      schemaQueue,
      schemaIssueCounts: [...schemaIssueCounts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, 8),
      lowFeedback: published.filter((blog) => blog.helpfulRate !== null && blog.feedbackTotal >= 3 && blog.helpfulRate < 60),
      stalePublished: published.filter((blog) => blog.daysSinceUpdate !== null && blog.daysSinceUpdate >= 90),
      highPriorityRefresh: published.filter((blog) => blog.refreshReasons.length > 0 && blog.refreshScore >= 90),
      quickRefreshWins: published.filter((blog) => blog.refreshReasons.length > 0 && blog.refreshScore < 55),
      refreshQueue,
      seoAuditQueue,
      issueCounts: [...issueCounts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, 8),
      refreshSchedule: buildRefreshSchedule(refreshQueue),
      topBlogs: [...published].sort((a, b) => b.engagement - a.engagement).slice(0, 8),
      ctaBlogs: [...published]
        .filter((blog) => blog.toolClickCount > 0)
        .sort((a, b) => b.toolClickCount - a.toolClickCount || b.engagement - a.engagement)
        .slice(0, 8),
      lowQualityBlogs: [...withRefreshReasons].sort((a, b) => a.qualityScore - b.qualityScore).slice(0, 8),
      staleDrafts: staleDrafts.slice(0, 6),
      monthly: [...monthMap.entries()].map(([month, posts]) => ({ month, posts })),
      categories: [...categoryMap.entries()]
        .map(([category, stats]) => ({ category, ...stats }))
        .sort((a, b) => b.views - a.views || b.posts - a.posts)
        .slice(0, 8),
      tags: [...tagMap.entries()]
        .map(([tag, stats]) => ({ tag, ...stats }))
        .sort((a, b) => b.posts - a.posts || b.views - a.views)
        .slice(0, 10),
    };
  }, [blogs]);

  const maxMonthly = Math.max(1, ...analytics.monthly.map((item) => item.posts));
  const maxCategoryViews = Math.max(1, ...analytics.categories.map((item) => item.views));
  const maxTagPosts = Math.max(1, ...analytics.tags.map((item) => item.posts));
  const openRefreshAction = (blog, action = "seo") => {
    router.push(`/altftool/blogs/edit-blog/${blog.id}?refreshAction=${action}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100 lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
            aria-label="Back to blogs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">AltFTool blogs</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">Blog Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Performance, content quality, category health, and publishing risks.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/quality")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Quality
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/bulk-refresh")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4" />
            Bulk refresh
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/add-blogs")}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Add blog
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard icon={FileText} label="Total Posts" value={analytics.total.toLocaleString()} caption={`${analytics.published} published - ${analytics.drafts} drafts`} />
        <StatCard icon={Eye} label="Total Views" value={analytics.totalViews.toLocaleString()} caption={`${analytics.totalLikes.toLocaleString()} likes - ${analytics.totalComments.toLocaleString()} comments`} tone="green" />
        <StatCard icon={MousePointerClick} label="Tool Clicks" value={analytics.totalToolClicks.toLocaleString()} caption={`${analytics.ctaBlogs.length} blogs sending traffic`} tone="blue" />
        <StatCard icon={SearchCheck} label="Avg Quality" value={`${analytics.avgQuality}%`} caption={`${analytics.lowQuality.length} posts need attention`} tone={analytics.avgQuality >= 75 ? "green" : "amber"} />
        <StatCard icon={Clock3} label="Avg Read Time" value={`${analytics.avgReadTime} min`} caption="Based on published content length" tone="slate" />
        <StatCard icon={ThumbsUp} label="Helpful Rate" value={`${analytics.helpfulRate}%`} caption={`${analytics.totalHelpful} helpful - ${analytics.totalNotHelpful} needs work`} tone={analytics.helpfulRate >= 70 ? "green" : "amber"} />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4 text-green-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Schema health monitor</h2>
              <p className="mt-1 text-xs text-gray-400">
                Tracks BlogPosting basics, FAQ rich-result inputs, citation schema, and freshness signals.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-green-50 px-2.5 text-green-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {analytics.schemaReady.length}/{analytics.published} schema ready
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              {analytics.richResultReady.length}/{analytics.published} rich ready
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-amber-50 px-2.5 text-amber-700">
              <SearchCheck className="h-3.5 w-3.5" />
              {analytics.avgSchemaScore}% avg schema
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {analytics.schemaQueue.length ? (
              analytics.schemaQueue.slice(0, 6).map((blog) => (
                <div key={blog.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${blog.schemaReady ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                      {blog.schemaScore}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-800">
                        {blog.heading || "Untitled blog"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {blog.schemaHealth.issues.slice(0, 3).map((issue) => (
                          <span key={`${blog.id}-${issue.key}`} className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-500">
                            {issue.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RefreshActionButton
                      icon={Sparkles}
                      label="SEO pack"
                      tone="blue"
                      onClick={() => openRefreshAction(blog, "seo")}
                    />
                    {!blog.hasFaq && (
                      <RefreshActionButton
                        icon={SearchCheck}
                        label="FAQ"
                        tone="amber"
                        onClick={() => openRefreshAction(blog, "faq")}
                      />
                    )}
                    {!blog.hasSources && (
                      <RefreshActionButton
                        icon={BookOpenCheck}
                        label="Sources"
                        tone="green"
                        onClick={() => openRefreshAction(blog, "sources")}
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400 md:col-span-2">
                Published blogs have the schema inputs needed for rich result monitoring.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Schema gap types</h3>
            <div className="mt-4 space-y-3">
              {analytics.schemaIssueCounts.length ? (
                analytics.schemaIssueCounts.map((item) => (
                  <HorizontalBar
                    key={item.label}
                    label={item.label}
                    value={item.count}
                    max={Math.max(1, ...analytics.schemaIssueCounts.map((issue) => issue.count))}
                    caption={`${item.count} posts`}
                  />
                ))
              ) : (
                <p className="rounded-lg bg-white px-3 py-8 text-center text-xs text-gray-400">
                  No schema gaps found in published posts.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">SEO audit dashboard</h2>
              <p className="mt-1 text-xs text-gray-400">
                Ranked issues across metadata, schema, freshness, trust, links, FAQ, and reader signals.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-blue-700">
              <SearchCheck className="h-3.5 w-3.5" />
              {analytics.seoAuditQueue.length} audit items
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-50 px-2.5 text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {analytics.missingTrust.length} missing trust
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-green-50 px-2.5 text-green-700">
              <BookOpenCheck className="h-3.5 w-3.5" />
              {analytics.missingSources.length} missing sources
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-amber-50 px-2.5 text-amber-700">
              <ThumbsDown className="h-3.5 w-3.5" />
              {analytics.lowFeedback.length} low feedback
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="space-y-2.5">
            {analytics.seoAuditQueue.length ? (
              analytics.seoAuditQueue.slice(0, 6).map((blog) => (
                <button
                  key={blog.id}
                  type="button"
                  onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
                  className="group flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${blog.qualityScore >= 75 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {blog.qualityScore}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                      {blog.heading || "Untitled blog"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {blog.seoAuditIssues.slice(0, 4).map((issue) => (
                        <span key={`${blog.id}-${issue.label}`} className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-500">
                          {issue.label}: {issue.detail}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Edit3 className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                </button>
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">
                No SEO audit issues detected right now.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">Top issue types</h3>
            <div className="mt-4 space-y-3">
              {analytics.issueCounts.length ? (
                analytics.issueCounts.map((item) => (
                  <HorizontalBar
                    key={item.label}
                    label={item.label}
                    value={item.count}
                    max={Math.max(1, ...analytics.issueCounts.map((issue) => issue.count))}
                    caption={`${item.count} posts`}
                  />
                ))
              ) : (
                <p className="rounded-lg bg-white px-3 py-8 text-center text-xs text-gray-400">
                  Issue distribution will appear after audits find gaps.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Needs refresh workflow</h2>
              <p className="mt-1 text-xs text-gray-400">
                Prioritized published posts with stale content, missing FAQ schema source, weak quality, or no internal links.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-amber-50 px-2.5 text-amber-700">
              <CalendarClock className="h-3.5 w-3.5" />
              {analytics.stalePublished.length} stale
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-blue-700">
              <Link2 className="h-3.5 w-3.5" />
              {analytics.noInternalLinks.length} no links
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-purple-50 px-2.5 text-purple-700">
              <SearchCheck className="h-3.5 w-3.5" />
              {analytics.noFaq.length} no FAQ
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-red-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {analytics.highPriorityRefresh.length} high priority
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-50 px-2.5 text-slate-700">
              <CalendarClock className="h-3.5 w-3.5" />
              {analytics.missingReviewDate.length} no review date
            </span>
            <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-green-50 px-2.5 text-green-700">
              <Sparkles className="h-3.5 w-3.5" />
              {analytics.quickRefreshWins.length} quick wins
            </span>
          </div>
        </div>

        {analytics.refreshQueue.length ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {analytics.refreshQueue.map((blog) => (
              <div
                key={blog.id}
                className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-600 shadow-sm">
                  {blog.refreshScore}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="line-clamp-1 min-w-0 flex-1 text-sm font-semibold text-gray-800">
                      {blog.heading || "Untitled blog"}
                    </p>
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      blog.refreshTier === "High"
                        ? "bg-red-50 text-red-600"
                        : blog.refreshTier === "Medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                    }`}>
                      {blog.refreshTier}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                    {blog.refreshAction}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {blog.refreshReasons.slice(0, 3).map((reason) => (
                      <span key={reason} className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-500">
                        {reason}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <RefreshActionButton
                      icon={Sparkles}
                      label="SEO pack"
                      tone="blue"
                      onClick={() => openRefreshAction(blog, "seo")}
                    />
                    <RefreshActionButton
                      icon={SearchCheck}
                      label="FAQ"
                      tone="amber"
                      onClick={() => openRefreshAction(blog, "faq")}
                    />
                    <RefreshActionButton
                      icon={BookOpenCheck}
                      label="Sources"
                      tone="green"
                      onClick={() => openRefreshAction(blog, "sources")}
                    />
                    <RefreshActionButton
                      icon={Edit3}
                      label="Edit"
                      tone="slate"
                      onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">
            No published posts need refresh right now.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Refresh sprint calendar</h2>
              <p className="mt-1 text-xs text-gray-400">
                Suggested order for turning the refresh queue into weekly editing work.
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
            {analytics.refreshQueue.length} queued posts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {analytics.refreshSchedule.map((slot) => (
            <div key={slot.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-gray-900">{slot.label}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{slot.caption}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 shadow-sm">
                  {slot.dateLabel}
                </span>
              </div>

              {slot.items.length ? (
                <div className="space-y-2">
                  {slot.items.map((blog) => (
                    <button
                      key={blog.id}
                      type="button"
                      onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
                      className="group flex w-full items-center gap-2 rounded-lg border border-gray-100 bg-white p-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-black text-blue-600">
                        {blog.refreshScore}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-xs font-semibold text-gray-800 group-hover:text-blue-700">
                          {blog.heading || "Untitled blog"}
                        </span>
                        <span className="mt-0.5 line-clamp-1 text-[10px] text-gray-400">
                          {blog.refreshAction || blog.refreshReasons[0] || "Refresh recommended"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-white px-3 py-6 text-center text-xs text-gray-400">
                  Nothing scheduled here yet.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Publishing cadence</h2>
            </div>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <div className="grid grid-cols-6 items-end gap-3">
            {analytics.monthly.map((item) => (
              <div key={item.month} className="flex min-h-52 flex-col justify-end gap-2">
                <div className="flex flex-1 items-end rounded-xl bg-gray-50 px-2">
                  <div
                    className="w-full rounded-t-xl bg-blue-500"
                    style={{ height: `${Math.max(8, (item.posts / maxMonthly) * 100)}%` }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-700">{item.posts}</p>
                  <p className="text-[10px] text-gray-400">{item.month}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Top engagement</h2>
          </div>
          <div className="space-y-2.5">
            {analytics.topBlogs.length ? (
              analytics.topBlogs.slice(0, 5).map((blog, index) => (
                <RankedBlog
                  key={blog.id}
                  blog={blog}
                  index={index}
                  router={router}
                  metric={blog.engagement.toLocaleString()}
                />
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">No published blog engagement yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Tool CTA performance</h2>
              <p className="mt-1 text-xs text-gray-400">
                Blog posts that are moving readers into related AltFTool utilities.
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {analytics.totalToolClicks.toLocaleString()} tracked clicks
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {analytics.ctaBlogs.length ? (
            analytics.ctaBlogs.slice(0, 6).map((blog, index) => (
              <RankedBlog
                key={blog.id}
                blog={blog}
                index={index}
                router={router}
                metric={blog.toolClickCount.toLocaleString()}
                metricLabel="clicks"
              />
            ))
          ) : (
            <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400 lg:col-span-2">
              No tracked tool CTA clicks yet. Inline and related tool cards will appear here after readers open tools from blogs.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Quality attention queue</h2>
          </div>
          <div className="space-y-2.5">
            {analytics.lowQualityBlogs.map((blog) => (
              <button
                key={blog.id}
                type="button"
                onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-amber-200 hover:bg-amber-50"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${blog.qualityScore >= 75 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                  {blog.qualityScore}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-gray-800">{blog.heading || "Untitled blog"}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                    {blog.qualitySuggestions[0] || "Review this post before the next content refresh."}
                  </p>
                </div>
                <Edit3 className="h-4 w-4 shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Stale drafts</h2>
          </div>
          <div className="space-y-2.5">
            {analytics.staleDrafts.length ? (
              analytics.staleDrafts.map((blog) => (
                <button
                  key={blog.id}
                  type="button"
                  onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-amber-200 hover:bg-amber-50"
                >
                  <FileText className="h-4 w-4 shrink-0 text-amber-600" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-gray-800">{blog.heading || "Untitled draft"}</p>
                    <p className="mt-0.5 text-xs text-gray-400">Draft - {blog.category || "Uncategorized"}</p>
                  </div>
                  <Edit3 className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">No stale drafts older than 7 days.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Category performance</h2>
          </div>
          <div className="space-y-4">
            {analytics.categories.map((item) => (
              <HorizontalBar
                key={item.category}
                label={item.category}
                value={item.views}
                max={maxCategoryViews}
                caption={`${item.views.toLocaleString()} views - ${item.posts} posts`}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Tags className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">Tag coverage</h2>
          </div>
          <div className="space-y-4">
            {analytics.tags.length ? (
              analytics.tags.map((item) => (
                <HorizontalBar
                  key={item.tag}
                  label={item.tag}
                  value={item.posts}
                  max={maxTagPosts}
                  caption={`${item.posts} posts`}
                />
              ))
            ) : (
              <p className="rounded-xl bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">No tags saved yet. Add tags in the blog editor.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={Heart} label="Likes" value={analytics.totalLikes.toLocaleString()} tone="red" />
        <StatCard icon={MessageCircle} label="Comments" value={analytics.totalComments.toLocaleString()} tone="blue" />
        <StatCard icon={AlertTriangle} label="Refresh Queue" value={analytics.refreshQueue.length.toLocaleString()} caption="Published posts needing SEO or freshness work" tone="amber" />
      </div>
    </div>
  );
}
