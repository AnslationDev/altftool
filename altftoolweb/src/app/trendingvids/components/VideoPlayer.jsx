"use client";

import { Play } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import YouTube from "react-youtube";
import ManagedImage from "@/components/ui/ManagedImage";

const STORAGE_KEY = "yt_progress";

export function loadProgress(videoId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[videoId] || null;
  } catch {
    return null;
  }
}

export function loadAllProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function saveProgress(videoId, currentTime, duration, meta = {}) {
  if (!videoId || !duration || duration === 0 || currentTime < 1) return;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[videoId] = {
      currentTime:  Math.floor(currentTime),
      duration:     Math.floor(duration),
      percentage:   Math.min(99, Math.round((currentTime / duration) * 100)),
      watchedLabel: formatTime(currentTime) + " watched",
      savedAt:      Date.now(),
      title:        meta.title,
      category:     meta.category,
      thumbnail:    meta.thumbnail,
      description:  meta.description,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(
      new CustomEvent("yt_progress_updated", {
        detail: { videoId, ...all[videoId] },
      })
    );
  } catch {}
}

export default function VideoPlayer({ videoId, thumbnail, category, title }) {
  const [play, setPlay]               = useState(false);
  const [hovered, setHovered]         = useState(false);
  const [resumeTime, setResumeTime]   = useState(0);
  const [showResumeBar, setShowResumeBar] = useState(false);

  const playerRef    = useRef(null);
  const saveTimerRef = useRef(null);
  // ── FIX: hold meta in a ref so the save interval never needs to re-close ──
  // If meta is captured in a closure inside setInterval, stale values are used.
  // A ref update is synchronous and never triggers a re-render.
  const metaRef = useRef({ title, category, thumbnail });
  useEffect(() => {
    metaRef.current = { title, category, thumbnail };
  }, [title, category, thumbnail]);

  const stopAutoSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const resetForVideo = setTimeout(() => {
      setPlay(false);
      setShowResumeBar(false);
      const saved = loadProgress(videoId);
      if (saved && saved.currentTime > 5) {
        setResumeTime(saved.currentTime);
        setShowResumeBar(true);
      } else {
        setResumeTime(0);
      }
    }, 0);

    return () => {
      clearTimeout(resetForVideo);
      stopAutoSave();
    };
  }, [stopAutoSave, videoId]);

  const startAutoSave = useCallback(() => {
    stopAutoSave();
    // ── FIX: interval reads from refs only — never closes over changing state ─
    // Previous version closed over title/category/thumbnail props which changed
    // on every parent render, causing the interval to be torn down and rebuilt
    // repeatedly, which in turn caused the YouTube iframe to remount.
    saveTimerRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime?.();
        const d = p.getDuration?.();
        if (t > 0 && d > 0) {
          saveProgress(videoId, t, d, metaRef.current);
        }
      } catch {}
    }, 5000); // ── FIX: 5 s instead of 1 s — no functional difference for UX
              //         but eliminates 4 extra iframe postMessage calls per second
              //         that were causing visible stuttering on slower connections
  }, [videoId, stopAutoSave]); // videoId only — meta comes from ref

  // ── FIX: cleanup on unmount — save final position and clear interval ───────
  useEffect(() => {
    return () => {
      stopAutoSave();
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime?.();
        const d = p.getDuration?.();
        if (t > 0 && d > 0) saveProgress(videoId, t, d, metaRef.current);
      } catch {}
    };
  }, [videoId, stopAutoSave]);

  // ── FIX: memoize ytOpts so the YouTube component never sees a new object ───
  // react-youtube compares opts by reference. Without useMemo, a new object is
  // created on every render → react-youtube destroys and rebuilds the iframe
  // → buffering resets to 0 every time the parent re-renders (e.g. modal state).
  const ytOpts = useMemo(() => ({
    width:  "100%",
    height: "100%",
    playerVars: {
      autoplay:       1,
      start:          Math.floor(resumeTime),
      rel:            0,
      modestbranding: 1,
      playsinline:    1,
    },
  }), [resumeTime]); // only rebuild when resume point actually changes

  const onReady = useCallback((e) => {
    playerRef.current = e.target;
    startAutoSave();
  }, [startAutoSave]);

  const onStateChange = useCallback((e) => {
    const YT = window.YT?.PlayerState;
    if (!YT) return;
    if (e.data === YT.PAUSED || e.data === YT.ENDED) {
      try {
        const t = e.target.getCurrentTime();
        const d = e.target.getDuration();
        saveProgress(videoId, t, d, metaRef.current);
        if (e.data === YT.ENDED) stopAutoSave();
      } catch {}
    }
  }, [videoId, stopAutoSave]);

  const handlePlayClick   = useCallback(() => { setShowResumeBar(false); setPlay(true); }, []);
  const handleResumeClick = useCallback(() => { setShowResumeBar(false); setPlay(true); }, []);
  const handleStartFresh  = useCallback(() => { setResumeTime(0); setShowResumeBar(false); setPlay(true); }, []);

  const savedPct = loadProgress(videoId)?.percentage || 0;

  return (
    <div
      className="relative w-full aspect-video bg-(--background) rounded-xl overflow-hidden shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!play ? (
        <>
          <ManagedImage
            src={thumbnail}
            alt="thumbnail"
            className="w-full h-full object-cover block"
          />

          <div
            className={`absolute inset-0 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-75"}`}
          />

          {showResumeBar && (
            <div className="absolute bottom-2 left-0 right-0 px-4 py-2 flex items-center justify-between gap-3">
              <button
                onClick={handleResumeClick}
                className="text-[11px] bg-(--primary) hover:bg-blue-700 text-white px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Play size={12} />
                Start from {formatTime(resumeTime)}
              </button>
            </div>
          )}

          {!showResumeBar && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center border-none cursor-pointer"
              aria-label="Play"
            >
              <span
                className={`flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-lg transition-all duration-200 ${hovered ? "scale-110 shadow-xl" : ""}`}
              >
                <Play className="text-(--primary) fill-blue-600" />
              </span>
            </button>
          )}

          {savedPct > 0 && (
            <div className="absolute bottom-2 left-0 w-full h-[3px] bg-white/20">
              <div
                className="h-full bg-(--primary) transition-all duration-500"
                style={{ width: `${savedPct}%` }}
              />
            </div>
          )}
        </>
      ) : (
        // ── FIX: key is intentionally omitted / kept stable ──────────────────
        // Do NOT put videoId as key here. Keying on videoId forces React to
        // unmount+remount the entire YouTube component whenever videoId changes
        // in the parent, which destroys the buffer. Let react-youtube handle
        // videoId changes internally via its own props diffing instead.
        <YouTube
          videoId={videoId}
          opts={ytOpts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full border-0"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
