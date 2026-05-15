"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  SearchCheck,
  Tags,
  TrendingUp,
} from "lucide-react";
import { fetchAllBlogs } from "../services/blogsService";
import { getBlogContentQuality } from "../components/BlogSeoChecklist";

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
  return views + likes * 12 + comments * 18;
}

function getMonthKey(date) {
  return date.toLocaleDateString("en", { month: "short", year: "2-digit" });
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

function RankedBlog({ blog, index, router, metric }) {
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
        <p className="text-[10px] uppercase tracking-wider text-gray-400">score</p>
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

      return {
        ...blog,
        qualityScore: quality.score,
        qualitySuggestions: quality.suggestions,
        engagement: getEngagement(blog),
        readTime: calcReadTime(blog.description || ""),
      };
    });

    const published = enriched.filter((blog) => blog.status === "published");
    const drafts = enriched.filter((blog) => blog.status !== "published");
    const totalViews = enriched.reduce((sum, blog) => sum + Number(blog.views || 0), 0);
    const totalLikes = enriched.reduce((sum, blog) => sum + Number(blog.likesCount || 0), 0);
    const totalComments = enriched.reduce((sum, blog) => sum + Number(blog.commentsCount || 0), 0);
    const avgQuality = enriched.length
      ? Math.round(enriched.reduce((sum, blog) => sum + blog.qualityScore, 0) / enriched.length)
      : 0;
    const avgReadTime = enriched.length
      ? Math.round(enriched.reduce((sum, blog) => sum + blog.readTime, 0) / enriched.length)
      : 0;

    enriched.forEach((blog) => {
      const created = toDate(blog.createdAt || blog.date);
      if (!created) return;
      const key = getMonthKey(created);
      if (monthMap.has(key)) monthMap.set(key, monthMap.get(key) + 1);
    });

    const categoryMap = new Map();
    const tagMap = new Map();
    enriched.forEach((blog) => {
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

    return {
      total: enriched.length,
      published: published.length,
      drafts: drafts.length,
      totalViews,
      totalLikes,
      totalComments,
      avgQuality,
      avgReadTime,
      lowQuality: enriched.filter((blog) => blog.qualityScore < 70),
      topBlogs: [...published].sort((a, b) => b.engagement - a.engagement).slice(0, 8),
      lowQualityBlogs: [...enriched].sort((a, b) => a.qualityScore - b.qualityScore).slice(0, 8),
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
        <button
          type="button"
          onClick={() => router.push("/altftool/blogs/add-blogs")}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          Add blog
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total Posts" value={analytics.total.toLocaleString()} caption={`${analytics.published} published - ${analytics.drafts} drafts`} />
        <StatCard icon={Eye} label="Total Views" value={analytics.totalViews.toLocaleString()} caption={`${analytics.totalLikes.toLocaleString()} likes - ${analytics.totalComments.toLocaleString()} comments`} tone="green" />
        <StatCard icon={SearchCheck} label="Avg Quality" value={`${analytics.avgQuality}%`} caption={`${analytics.lowQuality.length} posts need attention`} tone={analytics.avgQuality >= 75 ? "green" : "amber"} />
        <StatCard icon={Clock3} label="Avg Read Time" value={`${analytics.avgReadTime} min`} caption="Based on published content length" tone="slate" />
      </div>

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
        <StatCard icon={AlertTriangle} label="Quality Queue" value={analytics.lowQuality.length.toLocaleString()} caption="Posts below 70 quality score" tone="amber" />
      </div>
    </div>
  );
}
