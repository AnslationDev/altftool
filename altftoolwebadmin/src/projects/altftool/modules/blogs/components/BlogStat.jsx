"use client";

import { useMemo } from "react";
import { Eye, FileText, Heart, MessageCircle, PenLine, Send } from "lucide-react";

/**
 * Presentational stats strip. Consumes the already-loaded `blogs` array from
 * the parent (no duplicate Firestore fetch). Falls back to zeroes while the
 * parent is still loading.
 */
export default function BlogStat({ blogs = [], loading = false }) {
  const stats = useMemo(() => {
    return blogs.reduce(
      (acc, data) => {
        if (data.status === "published") acc.publishedPosts += 1;
        else acc.draftPosts += 1;
        acc.totalViews += data.views || 0;
        acc.totalLikes += data.likesCount || 0;
        acc.totalComments += data.commentsCount || 0;
        return acc;
      },
      {
        totalPosts: blogs.length,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
      },
    );
  }, [blogs]);

  const statsData = [
    { title: "Total Posts", value: stats.totalPosts, icon: FileText, tone: "text-primary bg-primary-soft" },
    { title: "Published", value: stats.publishedPosts, icon: Send, tone: "text-success bg-success-soft" },
    { title: "Drafts", value: stats.draftPosts, icon: PenLine, tone: "text-warning bg-warning-soft" },
    { title: "Total Views", value: stats.totalViews, icon: Eye, tone: "text-info bg-info-soft" },
    { title: "Total Likes", value: stats.totalLikes, icon: Heart, tone: "text-danger bg-danger-soft" },
    { title: "Comments", value: stats.totalComments, icon: MessageCircle, tone: "text-secondary bg-secondary-soft" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-muted">{stat.title}</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {loading ? "—" : stat.value.toLocaleString()}
              </p>
            </div>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
