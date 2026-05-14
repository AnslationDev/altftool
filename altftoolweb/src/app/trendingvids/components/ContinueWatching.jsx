"use client";

import { useState, useEffect, useCallback } from "react";
import { Video, Clock, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { loadAllProgress, formatTime } from "./VideoPlayer";
import VideoDialogModal from "./VideoDialogModal";
import { useTheme } from "@/contexts/ThemeContext";
import { HiOutlineLightBulb } from "react-icons/hi";
import { IoPlayOutline } from "react-icons/io5";
import { Play } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export const VIDEO_METADATA = {
  dQw4w9WgXcQ: {
    title: "Mastering Data Visualization in Modern Apps",
    category: "Data Analytics",
    categoryColor: "#2563EB",
    categoryBg: "#EEF2FF",
    description:
      "This Data visualiztion app for learns and master in data visualiztion .",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  },
  ScMzIvxBSi4: {
    title: "UX Principles for the AI Era",
    category: "Design Systems",
    categoryColor: "#7C3AED",
    categoryBg: "#F3EEFF",
    thumbnail: "https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg",
  },
  "09R8_2nJtjg": {
    title: "Advanced Timeline Management Workflows",
    category: "Editing",
    categoryColor: "#059669",
    categoryBg: "#ECFDF5",
    thumbnail: "https://img.youtube.com/vi/09R8_2nJtjg/hqdefault.jpg",
  },
  jNQXAC9IVRw: {
    title: "React Performance Patterns Deep Dive",
    category: "Engineering",
    categoryColor: "#D97706",
    categoryBg: "#FFFBEB",
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
  },
  M7lc1UVf_VE: {
    title: "Building Scalable Design Systems",
    category: "Design Systems",
    categoryColor: "#7C3AED",
    categoryBg: "#F3EEFF",
    thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg",
  },
};

function buildVideoList() {
  const allProgress = loadAllProgress();
  const Auto_Remove = 5 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return Object.entries(allProgress)
    .map(([videoId, progress]) => {
      const staticMeta = VIDEO_METADATA[videoId];

      const meta = {
        title: progress.title || `Video (${videoId})`,

        category: progress.category || "Video",

        description: progress.description || "no description ",

        thumbnail:
          progress.thumbnail ||
          staticMeta?.thumbnail ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };

      return {
        id: videoId,
        ...meta,
        currentTime: progress.currentTime || 0,
        duration: progress.duration || 0,
        percentage: progress.percentage || 0,
        watchedLabel: progress.watchedLabel || null,
        savedAt: progress.savedAt || 0,
      };
    })
    .filter((v) => v.currentTime > 0 && now - v.savedAt <= Auto_Remove)
    .sort((a, b) => b.savedAt - a.savedAt);
}

function ClearHistoryConfirmPopup({ count, onConfirm, onCancel }) {
  useEffect(() => {
    // ESC close
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handler);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handler);

      document.body.style.overflow = "auto";
    };
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white/70 flex items-center justify-center p-4 "
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-(--card) rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-(--border)">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-[16px] text-(--foreground) font-bold  mb-1.5">
              Clear Watch History?
            </h2>

            <p className="description text-[16px] leading-relaxed">
              This will permanently remove from your watch history. This cannot
              be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-(--secondary-border) text-[16px] font-semibold text-(--foreground) hover:bg-(--secondary-hover) transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-[16px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 size={13} />
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContinueWatching() {
  const [videos, setVideos] = useState(() =>
    typeof window === "undefined" ? [] : buildVideoList(),
  );

  const [activeVideoId, setActiveVideoId] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const refresh = useCallback(() => {
    const list = buildVideoList();

    setVideos(list);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      refresh();
      setLastUpdated(e.detail?.videoId || null);

      setTimeout(() => setLastUpdated(null), 2000);
    };
    window.addEventListener("yt_progress_updated", handler);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("yt_progress_updated", handler);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const handleModalClose = useCallback(() => {
    setActiveVideoId(null);
    setTimeout(refresh, 300);
  }, [refresh]);

  const handleResume = useCallback((videoId) => {
    setActiveVideoId(videoId);
  }, []);

  const handleClearOne = useCallback(
    (videoId, e) => {
      e.stopPropagation();
      try {
        const all = JSON.parse(localStorage.getItem("yt_progress") || "{}");
        delete all[videoId];
        localStorage.setItem("yt_progress", JSON.stringify(all));
      } catch {}
      refresh();
    },
    [refresh],
  );

  const handleClearAll = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    try {
      localStorage.removeItem("yt_progress");
    } catch {}
    setShowClearConfirm(false);
    refresh();
  }, [refresh]);

  const handleCancelClear = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  if (videos.length === 0) {
    return (
      <div className="section flex flex-col">
        <div className=" w-full ">
          <SectionHeader count={0} onClearAll={null} onRefresh={refresh} />

          <div
            className="
    section
    px-4 py-8 sm:px-8 lg:px-14
    flex flex-col lg:flex-row
    items-center
    w-full
    gap-8 lg:gap-16
  "
          >
            <div className="w-full lg:w-1/2 flex justify-center animate-slide-right">
              <ManagedImage
                src="/continue.jpg"
                alt="No videos"
                className="
        scale-100 sm:scale-110 lg:scale-145
        w-full
        max-w-md lg:max-w-xl
        h-auto
        animate-slide-right
        object-contain
      "
              />
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex flex-col w-full lg:w-1/2 items-center lg:items-start">
              {/* HEADER SECTION */}
              <div
                className="
        flex flex-col sm:flex-row
        gap-4 sm:gap-5
        max-w-lg w-full
        mb-6
        animate-slide-left
        items-center sm:items-start
        text-center sm:text-left
        lg:ml-24
      "
              >
                <div className="w-16 h-16 shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                  <Video size={30} className="text-(--primary)" />
                </div>

                <div className="flex flex-col gap-4 w-full">
                  <h2 className="section-title !m-0 text-center sm:text-left">
                    No videos yet
                  </h2>

                  <p className="section-subtitle text-center sm:text-left">
                    Start watching to build your personalized feed and continue
                    where you left off.
                  </p>

                  {/* BUTTON */}
                  <button
                    onClick={() =>
                      document
                        .getElementById("explore-videos")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="
            w-full sm:w-fit
            px-5 py-3
            rounded-full
            bg-(--primary)
            text-white
            cursor-pointer
            font-medium
            hover:bg-(--primary-hover)
            transition
            flex items-center justify-center gap-2
            whitespace-nowrap
            text-sm sm:text-base
          "
                  >
                    <IoPlayOutline size={22} />
                    Browse Trending
                  </button>
                </div>
              </div>

              {/* INFO BOX */}
              <div
                className="
        bg-blue-50
        rounded-xl
        p-4 sm:p-5
        flex flex-col sm:flex-row
        gap-5
        items-center sm:items-start
        w-full
        max-w-lg
        text-center sm:text-left
        lg:ml-24
      "
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <HiOutlineLightBulb size={28} className="text-(--primary)" />
                </div>

                <div>
                  <span className="font-semibold text-base sm:text-lg text-(--foreground)/70">
                    Your watched videos will appear here.
                  </span>

                  <p className="text-sm text-(--muted-foreground)">
                    The more you watch, the better we recommend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="section">
        <div className="">
          <SectionHeader
            count={videos.length}
            onClearAll={handleClearAll}
            onRefresh={refresh}
            className=""
          />

          <div className="overflow-hidden">
            <div className="flex gap-6 overflow-x-auto  scroll-smooth no-scrollbar  max-w-7xl  ">
              {videos.map((video, i) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={i}
                  isJustUpdated={lastUpdated === video.id}
                  onResume={handleResume}
                  onClear={handleClearOne}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeVideoId && (
        <VideoDialogModal videoId={activeVideoId} onClose={handleModalClose} />
      )}

      {showClearConfirm && (
        <ClearHistoryConfirmPopup
          count={videos.length}
          onConfirm={handleConfirmClear}
          onCancel={handleCancelClear}
        />
      )}
    </>
  );
}

function SectionHeader({ count, onClearAll }) {
  return (
    <div className="">
      <div className=" ">
        <div className="relative flex flex-col items-center text-center gap-4">
          <div>
            <h1 className="section-title">Continue Watching</h1>

            <p className="section-subtitle animate-slide-up">
              Pick up right where you left off and keep your progress going
            </p>
          </div>

          {onClearAll && count > 0 && (
            <button
              onClick={onClearAll}
              className="
        flex items-center gap-1.5 text-sm
        text-(--foreground) hover:text-red-400
        transition-colors px-3 py-1.5 rounded-lg
        hover:bg-red-50 border border-(--secondary-border)
        hover:border-red-100 cursor-pointer whitespace-nowrap
        md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2
      "
            >
              <RotateCcw size={14} />
              Clear history
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, isJustUpdated, onResume, onClear }) {
  const { theme } = useTheme();
  const [hoveredVideo, setHoveredVideo] = useState(false);
  const isCompleted = video.percentage >= 95;
  const pct = Math.min(100, video.percentage);

  return (
    <div
      className={`flex-shrink-0 w-[400px] animate-slide-right  bg-(--card)  border border-[var(--border)] rounded-[20px]  p-4     
    transition-all duration-300 ease-out
  hover:(--secondary-hover) ${theme === "dark" ? "bg-(--card)" : "bg-white"}
  
  hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]
    
    ${
      isJustUpdated
        ? "border-blue-300 shadow-blue-100 shadow-md"
        : "border-[#E2E8F0]"
    }`}
    >
      <div
        className="relative rounded-[16px] overflow-hidden cursor-pointer"
        onClick={() => onResume(video.id)}
        onMouseEnter={() => setHoveredVideo(video.id)}
        onMouseLeave={() => setHoveredVideo(null)}
      >
        {hoveredVideo === video.id ? (
          <iframe
            className="w-full h-[220px]"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&controls=0&start=${Math.floor(
              video.currentTime,
            )}&rel=0`}
            title={video.title}
            allow="autoplay"
          />
        ) : (
          <ManagedImage
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-[220px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        )}

        {video.duration > 0 && (
          <div className="absolute top-3 right-3 bg-[#E8F2FF]  text-[#203667] text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <Clock size={20} />
            {formatTime(video.duration)}
          </div>
        )}

        {isCompleted && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
            <CheckCircle2 size={11} />
            Completed
          </div>
        )}

        <div className="absolute bg-white bottom-3 left-3  right-3  h-[8px] rounded-full  overflow-hidden">
          <div
            className="h-full rounded-r-full w-full   transition-all duration-700"
            style={{
              width: `${pct}%`,
              backgroundColor: isCompleted ? "#10B981" : "#2563EB",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-md text-(--muted-foreground)">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <span
              className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: isCompleted ? "#10B981" : "#2563EB" }}
            />
          </div>
          {isCompleted ? "Completed ✓" : `${pct}% completed`}
        </div>
        <span className="bg-[#E8F2FF] text-[#203667] px-3 py-1 rounded-full text-md font-semibold">
          {video.category}
        </span>
      </div>

      <h3 className="text-[15px] font-semibold  text-(--foreground) mt-3 leading-snug line-clamp-2">
        {video.title}
      </h3>

      <div className="flex items-center justify-between mt-5">
        <span className="text-sm text-[#64748B]">
          {video.watchedLabel || "Just started"}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onResume(video.id)}
            className="flex items-center gap-2 text-white text-sm px-5 py-2 rounded-full transition-colors font-medium cursor-pointer"
            style={{ backgroundColor: isCompleted ? "#10B981" : "#2563EB" }}
          >
            <Play size={13} fill="currentColor" />
            {isCompleted ? "Rewatch" : "Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
