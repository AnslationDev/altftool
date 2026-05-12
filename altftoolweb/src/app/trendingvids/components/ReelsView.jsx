"use client";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Heart, Bookmark, MessageCircle, Play, Send } from "lucide-react";
import { useYoutubeShorts } from "../hooks/useYoutubeShorts";
import { useLikeComment, useKeyboardControls } from "../hooks/control";

export default function ReelsView() {
  const { videos, loading, loadMore, hasMore } = useYoutubeShorts(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [commentOpen, setCommentOpen] = useState(null);

  const containerRef = useRef(null);
  const lastVideoRef = useRef(null);
  const iframeRefs = useRef(new Map());
  const videoRefs = useRef(new Map());

  const initialCounts = useMemo(
    () =>
      Object.fromEntries(
        videos.map((v) => [
          v.id,
          { likes: v.likeCount ?? 0, liked: false, saved: false, comments: [] },
        ]),
      ),
    [videos],
  );

  const {
    state: engagement,
    toggleLike,
    toggleSave,
    addComment,
  } = useLikeComment(initialCounts);

  const scrollTo = useCallback(
    (idx) => {
      const target = Math.max(0, Math.min(idx, videos.length - 1));
      containerRef.current?.scrollTo({
        top: target * containerRef.current.clientHeight,
        behavior: "smooth",
      });
      setActiveIndex(target);
      setPaused(false);
    },
    [videos.length],
  );

  const postCommand = useCallback((index, command) => {
    const iframe = iframeRefs.current.get(index);
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*",
      );
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const idx = Math.round(container.scrollTop / container.clientHeight);
        setActiveIndex((prev) => {
          if (prev !== idx) setPaused(false);
          return idx;
        });
        ticking = false;
      });
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [videos.length]);

  useEffect(() => {
    postCommand(activeIndex, paused ? "pauseVideo" : "playVideo");
  }, [paused, activeIndex, postCommand]);

  useEffect(() => {
    postCommand(activeIndex, muted ? "mute" : "unMute");
    const videoEl = videoRefs.current.get(activeIndex);
    if (videoEl) videoEl.muted = muted;
  }, [muted, activeIndex, postCommand]);

  const toggleMute = useCallback((e) => {
    e?.stopPropagation();
    setMuted((m) => !m);
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;

      postCommand(activeIndex, next ? "pauseVideo" : "playVideo");

      const videoEl = videoRefs.current.get(activeIndex);
      if (videoEl) next ? videoEl.pause() : videoEl.play().catch(() => {});
      return next;
    });
  }, [activeIndex, postCommand]);

  useEffect(() => {
    iframeRefs.current.forEach((iframe, idx) => {
      if (idx !== activeIndex) {
        iframe?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*",
        );
        iframe?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "mute", args: [] }),
          "*",
        );
      }
    });

    videoRefs.current.forEach((videoEl, idx) => {
      if (idx !== activeIndex && videoEl) {
        videoEl.pause();
        videoEl.muted = true;
      }
    });

    postCommand(activeIndex, "playVideo");

    if (!muted) postCommand(activeIndex, "unMute");

    const activeVideo = videoRefs.current.get(activeIndex);
    if (activeVideo) {
      activeVideo.muted = muted;
      activeVideo.play().catch(() => {});
    }

  }, [activeIndex, muted, postCommand]);

  const lastReelObserver = useCallback(
    (node) => {
      if (loading) return;
      if (lastVideoRef.current) lastVideoRef.current.disconnect();
      lastVideoRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });
      if (node) lastVideoRef.current.observe(node);
    },
    [loading, hasMore, loadMore],
  );

  useKeyboardControls({
    onNext: () => scrollTo(activeIndex + 1),
    onPrev: () => scrollTo(activeIndex - 1),
    onTogglePause: togglePause,
    onToggleMute: toggleMute,
  });

  if (loading && videos.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-(--foreground) ">
        Loading...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="no-scrollbar  reels-container bg-black"
      style={{
        height: "100dvh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
      }}
    >
      {videos.map((v, i) => {
        const isLast = i === videos.length - 1;
        const isActive = i === activeIndex;
        const eng = engagement[v.id] ?? {
          likes: 0,
          liked: false,
          saved: false,
          comments: [],
        };

        const shouldLoad = Math.abs(i - activeIndex) <= 1;

        return (
          <div
            key={v.id}
            ref={isLast ? lastReelObserver : null}
            className="reel-slide"
            style={{
              height: "100dvh",
              scrollSnapAlign: "start",
            }}
          >
            <div className="relative w-full h-full" onClick={togglePause}>
              {shouldLoad ? (
                v.videoUrl && !v.id.match(/^[a-zA-Z0-9_-]{11}$/) ? (
                  // Non-YouTube: direct video file from Firebase Storage
                  <div className="absolute inset-0 flex items-center justify-center">
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current.set(i, el);
                        else videoRefs.current.delete(i);
                      }}
                      src={v.videoUrl}
                      autoPlay={isActive && !paused}
                      muted={muted}
                      loop
                      playsInline
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  // YouTube short
                  <iframe
                    ref={(el) => {
                      if (el) {
                        iframeRefs.current.set(i, el);
                      } else {
                        iframeRefs.current.delete(i); // add this
                      }
                    }}
                    src={`https://www.youtube.com/embed/${v.id}?autoplay=${isActive ? 1 : 0}&enablejsapi=1&mute=${muted ? 1 : 0}&loop=1&playlist=${v.id}&playsinline=1&rel=0&controls=0&origin=${window.location.origin}`}
                    className="absolute inset-0 w-full h-full border-0 rounded-md"
                    allow="autoplay; encrypted-media"
                    title={v.title || v.id}
                    loading="lazy"
                    style={{ pointerEvents: "none" }}
                  />
                )
              ) : null}

              {/* Pause overlay */}
              {paused && isActive && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-(--background) flex items-center justify-center">
                    <Play size={28} className="bg-(--card) " />
                  </div>
                </div>
              )}

              {/* Bottom info */}
              <div
                className="absolute z-20 text-(--foreground) "
                style={{ bottom: 80, left: 14, right: 72 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center
               text-md font-bold flex-shrink-0 border-2 bg-(--card) border-(--border) text-(--foreground)"
                  >
                    {v.channelTitle?.[0]?.toUpperCase() ?? "N"}
                  </div>

                  <span
                    className="text-white text-md font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)",
                      maxWidth: "160px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* {v.category} */}
                    {v.channelTitle}
                  </span>
                </div>
                <p
                  className="  font-bold pt-2 text-md text-white leading-snug line-clamp-2
    w-full
    max-w-[320px] 
    md:max-w-[420px]
    lg:max-w-[520px]"
                >
                  {v.channelDescription}
                </p>
              </div>

              {/* Action buttons */}
              <div
                className="absolute z-20 flex flex-col items-center gap-5 "
                style={{ bottom: 160, right: 12 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ActionButton
                  icon={
                    <Heart
                      size={22}
                      color={eng.liked ? "#ff4d4d" : "white"}
                      fill={eng.liked ? "#ff4d4d" : "transparent"}
                    />
                  }
                  label={eng.likes > 0 ? eng.likes.toLocaleString() : "Like"}
                  active={eng.liked}
                  onClick={() => toggleLike(v.id)}
                />

                <ActionButton
                  icon={
                    <Bookmark
                      size={22}
                      color={eng.saved ? "#facc15" : "white"}
                      fill={eng.saved ? "#facc15" : "transparent"}
                    />
                  }
                  label={eng.saved ? "Saved" : "Save"}
                  active={eng.saved}
                  onClick={() => toggleSave(v.id)}
                />

                <ActionButton
                  icon={<MessageCircle size={22} color="white" />}
                  label={
                    eng.comments.length
                      ? eng.comments.length.toString()
                      : "Comment"
                  }
                  onClick={() => setCommentOpen(v.id)}
                />
              </div>
            </div>
          </div>
        );
      })}

      {commentOpen && (
        <CommentSheet
          videoId={commentOpen}
          comments={engagement[commentOpen]?.comments ?? []}
          onAdd={addComment}
          onClose={() => setCommentOpen(null)}
        />
      )}

      {loading && videos.length > 0 && (
        <div
          className="flex items-center justify-center text-muted-foreground text-sm snap-start"
          style={{ height: "100dvh" }}
        >
          Loading more reels…
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick, active = false }) {
  return (
    <button
      className="flex flex-col items-center gap-1  border-0 cursor-pointer p-0"
      onClick={onClick}
      style={{
        transform: active ? "scale(1.12)" : "scale(1)",
        transition: "transform 0.15s ease",
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center 
                       transition-colors"
      >
        {icon}
      </div>
      <span className="text-white text-md font-semibold">{label}</span>
    </button>
  );
}

function CommentSheet({ videoId, comments, onAdd, onClose }) {
  const [text, setText] = useState("");
  const handleSend = () => {
    if (!text.trim()) return;
    onAdd(videoId, text.trim());
    setText("");
  };
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl
                 bg-(--background) shadow-2xl "
      // style={{ maxHeight: "60dvh" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full  " />
      </div>
      <div className="flex items-center justify-between px-4 pb-2">
        <span className="font-semibold text-sm">
          {comments.length} comments
        </span>
        <button
          onClick={onClose}
          className="text-(--foreground) text-xl leading-none"
        >
          &times;
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-4 space-y-3 pb-2">
        {comments.length === 0 && (
          <p className="text-base sm:text-xl text-(--foreground) text-center py-6">
            No comments yet. Be first!
          </p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            <div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500
                            flex items-center justify-center text-(--foreground) text-xs flex-shrink-0"
            >
              U
            </div>
            <div>
              <p className="text-xs text-(--muted-foreground)">{c.time}</p>
              <p className="text-sm">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-(--border)">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Add a comment…"
          className="flex-1 text-sm rounded-full px-4 py-2
                     bg-(--background) outline-none"
        />
        <button
          onClick={handleSend}
          className="text-sm font-semibold text-(--primary) disabled:opacity-40"
          disabled={!text.trim()}
        >
          <Send />
        </button>
      </div>
    </div>
  );
}

function KeyboardHint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none
                    flex gap-3 items-center px-4 py-2 rounded-full
                    text-xs backdrop-blur-sm"
      style={{ transition: "opacity 0.4s", opacity: visible ? 1 : 0 }}
    >
      <span>↑↓ scroll</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span>Space pause</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span>M mute</span>
    </div>
  );
}
