"use client";

import React, { useEffect, useState, useRef } from "react";
import { Calendar, User, MessageCircle, ArrowRight, Clock, BookOpen, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ManagedImage from "@/components/ui/ManagedImage";

// ─── Utility helpers ───────────────────────────────────────────────────────────

function getCategoryStyle(category = "") {
  const map = {
    Extensions:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    border: "border-blue-200"   },
    Design:       { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400",  border: "border-violet-200" },
    Performance:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-200"  },
    Tutorials:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200"},
    default:       { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400",    border: "border-blue-200"   },
  };
  return map[category] || map.default;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function readTime(excerpt = "") {
  const words = excerpt.split(" ").length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function getInitials(name = "Admin") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-blue-500",
];

function AvatarCircle({ name = "Admin", index = 0 }) {
  const gradient = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <span className="text-(--foreground) text-[10px] font-bold tracking-tight">{getInitials(name)}</span>
    </div>
  );
}

// ─── Category Badge ─────────────────────────────────────────────────────────────

function CategoryBadge({ category, size = "md" }) {
  if (!category) return null;
  const s = getCategoryStyle(category);
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${s.bg} ${s.text} ${s.border} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {category}
    </span>
  );
}

// ─── Skeleton loaders ────────────────────────────────────────────────────────────

function SkeletonPost() {
  return (
    <div className="py-10 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-1/2 h-64 rounded-2xl bg-gray-100" />
        <div className="sm:w-1/2 flex flex-col justify-center gap-3">
          <div className="h-5 bg-gray-100 rounded-full w-24" />
          <div className="h-7 bg-gray-100 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-100 rounded-full w-2/3" />
          <div className="h-4 bg-gray-100 rounded-full w-full" />
          <div className="h-4 bg-gray-100 rounded-full w-5/6" />
          <div className="h-4 bg-gray-100 rounded-full w-1/3 mt-2" />
        </div>
      </div>
    </div>
  );
}

// ─── Progress bar on scroll ──────────────────────────────────────────────────────

function ReadingProgressBar({ containerRef }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const pct = scrollHeight - clientHeight > 0
        ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
        : 0;
      setProgress(pct);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return (
    <div className="h-0.5 w-full bg-(--background) rounded-full overflow-hidden mb-6">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Blog Card ───────────────────────────────────────────────────────────────────

function BlogCard({ blog, index }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isEven = index % 2 === 0;

  return (
    <article className="group py-10 first:pt-4">
      <div className={`flex flex-col ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"} gap-6 md:gap-10`}>

        {/* Image */}
        <div className="sm:w-[46%] flex-shrink-0">
          <a href={`/blogs/${blog.slug}`} className="block relative overflow-hidden rounded-2xl aspect-[16/10] bg-(--card)">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
            )}
            <ManagedImage
              src={blog.image}
              alt={blog.heading}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ease-in-out
                group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Read time chip on image */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Clock size={10} />
              {readTime(blog.excerpt)}
            </div>
          </a>
        </div>

        {/* Content */}
        <div className="sm:w-[54%] flex flex-col justify-center py-1">
          <div className="flex items-center gap-3 mb-3.5">
            <CategoryBadge category={blog.category} />
            <span className="text-[11px] text-gray-400 font-medium">#{String(index + 1).padStart(2, "0")}</span>
          </div>

          <a href={`/blogs/${blog.slug}`} className="block">
            <h2 className="text-xl sm:text-2xl font-bold text-(--foreground) leading-snug mb-3.5 hover:text-(--primary) transition-colors duration-200 group-hover:text-(--primary)">
              {blog.heading}
            </h2>
          </a>

          <p className="text-[14px] text-(--muted-foreground) leading-relaxed mb-5 line-clamp-3">
            {blog.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-2">
              <AvatarCircle name={blog.author || "Admin"} index={index} />
              <span className="text-[13px] font-medium text-(--foreground)">{blog.author || "Admin"}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-(--border)" />
            <div className="flex items-center gap-1.5 text-[13px] text-(--muted-foreground)">
              <Calendar size={12} />
              <span>{formatDate(blog.date)}</span>
            </div>
          </div>

          {/* CTA */}
          <a
            href={`/blogs/${blog.slug}`}
            className="group/btn inline-flex items-center gap-2 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors w-fit"
          >
            <span>Read article</span>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 group-hover/btn:bg-blue-600 transition-colors duration-200">
              <ArrowRight size={11} className="text-blue-600 group-hover/btn:text-white transition-colors duration-200" />
            </span>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-10" />
    </article>
  );
}

// ─── Recent Posts Sidebar Widget ─────────────────────────────────────────────────

function RecentPostsWidget({ posts }) {
  return (
    <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-(--border) bg-(--muted)/60">
        <div className="flex items-center gap-2">
          <TrendingUp size={13} className="text-blue-500" />
          <h4 className="text-[11px] font-bold text-(--foreground) uppercase tracking-widest">Recent Posts</h4>
        </div>
        <Link href="/blogs" className="text-[11px] text-blue-500 hover:text-(--primary) font-semibold flex items-center gap-1 transition-colors">
          View all <ArrowRight size={10} />
        </Link>
      </div>

      <ul>
        {posts.map((post, idx) => (
          <li key={post.id} className="border-b border-(--border) last:border-0">
            <Link
              href={`/blogs/${post.slug}`}
              className="flex gap-3.5 px-5 py-3.5 hover:bg-(--muted)/80 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative w-[56px] h-[48px] flex-shrink-0 rounded-xl overflow-hidden bg-(---card)">
                {post.image ? (
                  <ManagedImage src={post.image} alt={post.heading} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
                    <BookOpen size={16} className="text-violet-400" />
                  </div>
                )}
                {/* Number badge */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-black/60 backdrop-blur-sm rounded flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">{idx + 1}</span>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <CategoryBadge category={post.category} size="sm" />
                <p className="text-[13px] font-semibold text-(--foreground) leading-snug line-clamp-2 mt-1 group-hover:text-(--primary) transition-colors">
                  {post.heading}
                </p>
                <p className="text-[11px] text-(--muted-foreground) mt-1 flex items-center gap-1.5">
                  <span>{post.author || "Admin"}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-(--border) inline-block" />
                  <span>{formatDate(post.date)}</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Recent Comments Sidebar Widget ─────────────────────────────────────────────

function RecentCommentsWidget({ comments, loading }) {
  return (
    <div className="bg-(--card) rounded-2xl border border-(--border) shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-(--border) bg-(--muted)/60">
        <MessageCircle size={13} className="text-(--primary)" />
        <h4 className="text-[11px] font-bold text-(--foreground) uppercase tracking-widest">Recent Comments</h4>
      </div>

      <div className="p-5">
        {loading ? (
          <ul className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <li key={i} className="space-y-1.5">
                <div className="h-3 bg-(--muted) rounded-full w-full" />
                <div className="h-3 bg-(--muted) rounded-full w-2/3" />
                <div className="h-2.5 bg-(--muted) rounded-full w-1/2" />
              </li>
            ))}
          </ul>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle size={24} className="text-(--muted-foreground) mx-auto mb-2" />
            <p className="text-[13px] text-(--muted-foreground)">No comments yet</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {comments.map((c, idx) => (
              <li key={c.id} className="group">
                <div className="flex gap-3 items-start">
                  <AvatarCircle name={c.author || "User"} index={idx} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-(--foreground) leading-relaxed line-clamp-2">{c.text}</p>
                    <Link
                      href={`/blogs/${c.blog.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] text-(--muted-foreground) hover:text-(--primary) transition-colors mt-1"
                    >
                      <BookOpen size={9} />
                      <span className="line-clamp-1">{c.blog.heading}</span>
                    </Link>
                  </div>
                </div>
                {idx < comments.length - 1 && (
                  <div className="h-px bg-(--border) mt-4" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────────

export default function BlogPageTwoColumn({ blogs = [] }) {
  const [recentComments, setRecentComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const scrollRef = useRef(null);

  const recentPosts = [...blogs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  useEffect(() => {
    if (!blogs || blogs.length === 0) return;

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const allComments = [];
        await Promise.all(
          blogs.map(async (blog) => {
            const commentsRef = collection(db, "blogs", blog.id, "comments");
            const q = query(commentsRef, orderBy("createdAt", "desc"), limit(2));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
              allComments.push({ id: doc.id, ...doc.data(), blog });
            });
          })
        );
        allComments.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() ?? new Date(0);
          const dateB = b.createdAt?.toDate?.() ?? new Date(0);
          return dateB - dateA;
        });
        setRecentComments(allComments.slice(0, 4));
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [blogs]);

  if (!blogs || blogs.length === 0) {
    return (
      <div className="w-full max-w-full px-0">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="flex-1 divide-y divide-gray-100">
            {[...Array(3)].map((_, i) => <SkeletonPost key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-0 font-sans">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:items-start lg:h-[calc(100vh-80px)]">

        {/* ── LEFT: scrollable feed ── */}
        <div
          ref={scrollRef}
          className="flex-1 lg:overflow-y-auto lg:h-full lg:pr-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        >
          {/* Sticky reading progress */}
          <div className="sticky top-0 z-10 bg-(--background) backdrop-blur-md pt-1 pb-0 -mx-1 px-1">
            <ReadingProgressBar containerRef={scrollRef} />
          </div>

          {blogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} />
          ))}
        </div>

        {/* ── RIGHT: sticky sidebar ── */}
        <aside className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 lg:h-full lg:overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pb-6">
          {/* <StatsWidget blogs={blogs} /> */}
          <RecentPostsWidget posts={recentPosts} />
          <RecentCommentsWidget comments={recentComments} loading={loadingComments} />
        </aside>
      </div>
    </div>
  );
}
