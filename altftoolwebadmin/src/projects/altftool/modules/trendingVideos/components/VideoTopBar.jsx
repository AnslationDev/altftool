"use client";
import {useState} from "react";
// import AddVideoModal from "@/projects/altftool/modules/trending-videos/components/AddVideoModal"

import { Plus, Tag, ClockPlus, Video, Clock, Smartphone  } from "lucide-react";

import { StatGrid } from "@/ansets";

export default function VideoTopBar({
  total,
  avgDuration,
  recentCount,
  categories,
  shortsPercentage,
  onCreate,
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-5">

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Trending Videos</h1>
          {/* <p className="text-sm text-[var(--muted)] mt-0.5">Manage all browser extensions in one place</p> */}
        </div>
        <button onClick={onCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] text-sm font-semibold rounded-xl transition shadow-sm">
          <Plus className="w-4 h-4" />Add Video
        </button>
      </div>

      {/* KPI cards */}
      <StatGrid
        columns={4}
        className="xl:grid-cols-5"
        items={[
          { key: "total", label: "Total Videos", value: total, icon: Video },
          { key: "avgDuration", label: "Average Duration", value: avgDuration, icon: Clock },
          {
            key: "recentlyAdded",
            label: "Recently Added",
            value: recentCount,
            icon: ClockPlus,
            // Tone, not a hardcoded colour: the tile only calls out attention
            // when there is actually something recently added to see.
            tone: recentCount > 0 ? "warning" : "default",
          },
          { key: "categories", label: "Categories", value: categories, icon: Tag },
          { key: "shorts", label: "Shorts", value: shortsPercentage, icon: Smartphone },
        ]}
      />
    </div>
  );
}