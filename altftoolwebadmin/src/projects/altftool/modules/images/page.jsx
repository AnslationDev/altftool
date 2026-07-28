"use client";

import { useState } from "react";
import { ImageIcon, VideoIcon } from "lucide-react";
import ImagesLibrary from "./components/ImagesLibrary";
import VideosLibrary from "./components/VideosLibrary";

export default function MediaLibraryPage() {
  const [activeLibrary, setActiveLibrary] = useState("images");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
            Media Library
          </span>

          <div className="flex items-center bg-[var(--surface-soft)] rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveLibrary("images")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeLibrary === "images" ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              <ImageIcon className="w-4 h-4" />
              Images
            </button>

            <button
              onClick={() => setActiveLibrary("videos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeLibrary === "videos" ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
            >
              <VideoIcon className="w-4 h-4" />
              Videos
            </button>
          </div>
        </div>
      </div>

      <div className={activeLibrary === "images" ? "block" : "hidden"}>
        <ImagesLibrary />
      </div>
      <div className={activeLibrary === "videos" ? "block" : "hidden"}>
        <VideosLibrary />
      </div>
    </div>
  );
}
