"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  ArrowLeft,
  Eye,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  Flame,
  AlertTriangle,
  Pencil,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { fetchAllBlogs } from "../lead-blog-services/BlogPostService";


//   calculate read time

function calcReadTime(html = "") {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}


function getMonthLabel(date) {
  return date.toLocaleString("default", { month: "short", year: "2-digit" });
}


function QuickStat({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}


function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>
        {payload[0].value} post{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// main component

export default function BlogAnalyticsView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalViews: 0,
    avgReadTime: 0,
    scheduledCount: 0,
    topBlogs: [],
    trendingBlogs: [],
    staleDrafts: [],
    mostViewedBlog: null,
    monthlyChart: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const blogs = await fetchAllBlogs();
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

        /* ── basic stats ── */
        let totalViews = 0;
        let totalReadTime = 0;
        let scheduledCount = 0;
        const staleDrafts = [];
        const trendingBlogs = [];

        /*  monthly chart of last 6 months  */
        const monthMap = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthMap[getMonthLabel(d)] = 0;
        }

        blogs.forEach((blog) => {
          totalViews += blog.views || 0;
          totalReadTime += calcReadTime(blog.description || "");
          if (blog.status === "scheduled") scheduledCount++;
        // if(blog.status==="published") scheduledCount;
          /* createdAt  */
          const created = blog.createdAt?.toDate?.()
            ? blog.createdAt.toDate()
            : new Date(blog.createdAt);

          /* monthly posts */
          const label = getMonthLabel(created);
          if (label in monthMap) monthMap[label]++;

       
          if (
            blog.status === "published" &&
            (blog.views || 0) > 0 &&
            created >= sevenDaysAgo
          )
            trendingBlogs.push(blog);

          /* stale drafts */
          if (blog.status === "draft") {
            const updated = blog.updatedAt?.toDate?.()
              ? blog.updatedAt.toDate()
              : new Date(blog.updatedAt);
            if (updated < threeDaysAgo) staleDrafts.push(blog);
          }
   if (blog.status === "published") {
     const updated = blog.updatedAt?.toDate?.()
       ? blog.updatedAt.toDate()
       : new Date(blog.updatedAt);
     if (updated ) scheduledCount--;
   }

        });

        

        /* ─ top blogs by views ─ */
        const topBlogs = [...blogs]
          .filter((b) => b.status === "published")
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);

        /* ── most viewed ── */
        const mostViewedBlog = topBlogs[0] ?? null;

        /* ── avg read time ── */
        const avgReadTime = blogs.length
          ? Math.round(totalReadTime / blogs.length)
          : 0;

        /* ─ monthly chart array ─ */
        const monthlyChart = Object.entries(monthMap).map(([month, posts]) => ({
          month,
          posts,
        }));

        setData({
          totalViews,
          avgReadTime,
          scheduledCount,
          topBlogs,
          trendingBlogs,
          staleDrafts,
          mostViewedBlog,
          monthlyChart,
        });
      } catch (err) {
        console.error("Analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-72 bg-gray-100 rounded-2xl" />
          <div className="h-72 bg-gray-100 rounded-2xl" />
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blog Analytics</h1>
          <p className="text-sm text-gray-400">
            Full performance overview of all your blogs
          </p>
        </div>
      </div>

      {/* ─ Quick Stats Row ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickStat
          icon={<Eye className="w-5 h-5 text-cyan-600" />}
          label="Total Views (All Time)"
          value={data.totalViews.toLocaleString()}
          color="bg-cyan-50"
        />
        <QuickStat
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          label="Avg Read Time"
          value={`${data.avgReadTime} min`}
          color="bg-orange-50"
        />
        <QuickStat
          icon={<Calendar className="w-5 h-5 text-purple-500" />}
          label="Scheduled Posts"
          value={data.scheduledCount}
          color="bg-purple-50"
        />
      </div>

      {/* ── Chart + Most Viewed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Posts Per Month
            </h2>
            <span className="text-xs text-gray-400 ml-auto">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyChart} barCategoryGap="35%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Bar
                dataKey="posts"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Viewed Blog */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-6 flex flex-col justify-between text-white">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
              Most Viewed Blog
            </span>
          </div>
          {data.mostViewedBlog ? (
            <>
              <div className="flex-1">
                <p className="text-lg font-bold leading-snug line-clamp-3 mb-3">
                  {data.mostViewedBlog.heading}
                </p>
                <div className="flex items-center gap-3 text-sm text-blue-100">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {(data.mostViewedBlog.views || 0).toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {calcReadTime(data.mostViewedBlog.description || "")} min
                    read
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-2">
                  By {data.mostViewedBlog.author} ·{" "}
                  {data.mostViewedBlog.category}
                </p>
              </div>
              <button
                onClick={() =>
                  router.push(
                    `/leadtree/blogs/view-blogs/${data.mostViewedBlog.id}`,
                  )
                }
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 transition px-3 py-2 rounded-lg w-fit"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Blog
              </button>
            </>
          ) : (
            <p className="text-blue-200 text-sm">No published blogs yet</p>
          )}
        </div>
      </div>

      {/* ── Top Performing Blogs Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Top Performing Blogs
          </h2>
          <span className="text-xs text-gray-400 ml-auto">Ranked by views</span>
        </div>

        {data.topBlogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No published blogs yet
          </p>
        ) : (
          <div className="space-y-3">
            {data.topBlogs.map((blog, index) => (
              <div
                key={blog.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition group cursor-pointer"
                onClick={() =>
                  router.push(`/leadtree/blogs/view-blogs/${blog.id}`)
                }
              >
                {/* Rank */}
                <span
                  className={`text-lg font-black w-7 text-center shrink-0 ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                        ? "text-gray-400"
                        : index === 2
                          ? "text-orange-400"
                          : "text-gray-300"
                  }`}
                >
                  {index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                </span>

                {/* Blog info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition">
                    {blog.heading}
                  </p>
                  <p className="text-xs text-gray-400">
                    {blog.author} · {blog.category || "Uncategorized"}
                  </p>
                </div>

                {/* Views */}
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-cyan-500" />
                  {(blog.views || 0).toLocaleString()}
                </div>

                {/* Read time */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 w-16 justify-end">
                  <Clock className="w-3 h-3" />
                  {calcReadTime(blog.description || "")} min
                </div>

                {/* Edit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/leadtree/blogs/edit-blog/${blog.id}`);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Trending + Stale Drafts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trending Blogs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Flame className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Trending This Week
            </h2>
          </div>
          {data.trendingBlogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                No trending blogs this week
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Blogs need views to appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.trendingBlogs.slice(0, 5).map((blog) => (
                <div
                  key={blog.id}
                  onClick={() =>
                    router.push(`/leadtree/blogs/view-blogs/${blog.id}`)
                  }
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 transition cursor-pointer group"
                >
                  <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-red-600 transition">
                      {blog.heading}
                    </p>
                    <p className="text-xs text-gray-400">
                      {blog.category || "Uncategorized"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-500 shrink-0">
                    {(blog.views || 0).toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stale Drafts Health */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Draft Health
            </h2>
            {data.staleDrafts.length > 0 && (
              <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                {data.staleDrafts.length} stale
              </span>
            )}
          </div>
          {data.staleDrafts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                All drafts are up to date 🎉
              </p>
              <p className="text-xs text-gray-300 mt-1">
                No drafts older than 3 days
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.staleDrafts.slice(0, 5).map((blog) => {
                const updated = blog.updatedAt?.toDate?.()
                  ? blog.updatedAt.toDate()
                  : new Date(blog.updatedAt);
                const daysOld = Math.floor(
                  (new Date() - updated) / (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={blog.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 transition cursor-pointer group"
                    onClick={() =>
                      router.push(`/leadtree/blogs/edit-blog/${blog.id}`)
                    }
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-amber-700 transition">
                        {blog.heading}
                      </p>
                      <p className="text-xs text-gray-400">
                        Not updated for {daysOld} day{daysOld !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/leadtree/blogs/edit-blog/${blog.id}`);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
