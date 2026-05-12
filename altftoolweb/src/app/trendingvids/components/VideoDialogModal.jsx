"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  getYoutubeVideoById,
  getYoutubeComments,
  getSuggestedVideos,
} from "../data/ytData";
import {
  Share2,
  ThumbsUp,
  Eye,
  X,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  MessageCircle,
  Link,
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ManagedImage from "@/components/ui/ManagedImage";
// ── NEW: needed to extract YouTube ID from a videoUrl string ──────────────────
import { extractYouTubeId } from "../services/firebaseTrendingVideos";

function fmt(n) {
  if (!n && n !== 0) return "0";
  const num = typeof n === "number" ? n : parseInt(n, 10);
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

function CommentItem({ c, index }) {
  const snippet = c?.snippet?.topLevelComment?.snippet;
  if (!snippet) return null;

  return (
    <div
      className="flex gap-2.5"
      style={{
        animation: "commentIn 0.35s ease both",
        animationDelay: `${index * 40}ms`,
      }}
    >
      <ManagedImage
        src={snippet.authorProfileImageUrl}
        alt={snippet.authorDisplayName}
        className="w-8 h-8 rounded-full flex-shrink-0 object-cover border border-gray-200"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[12px] font-semibold text-(--foreground)">
            {snippet.authorDisplayName}
          </p>
          <span className="text-[10px] text-(--muted-foreground)">
            {timeAgo(snippet.publishedAt)}
          </span>
        </div>
        <p className="text-[12.5px] text-(--muted-foreground) leading-relaxed">
          {snippet.textDisplay}
        </p>
        {snippet.likeCount > 0 && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
            <ThumbsUp size={10} />
            <span>{fmt(snippet.likeCount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-(--card) text-(--foreground) tracking-wide">
      {label}
    </span>
  );
}

function SuggestedCard({ s, onClick, active }) {
  return (
    <button
      className={`flex gap-3 w-full rounded-xl p-2.5 cursor-pointer text-left transition-all duration-150 mb-2 border ${active
        ? "bg-(--card) border-(--card-border)"
        : " border-transparent hover:bg-gray-500 hover:text-(--foreground)"
        }`}
      onClick={() => onClick(s.videoId)}
      title={s.title}
    >
      <div className="relative w-[90px] xl:w-[100px] h-[56px] xl:h-[60px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        <ManagedImage
          src={s.image}
          alt={s.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-1 right-1 bg-(--muted-card) text-(--foreground) text-[9px] font-bold px-1.5 py-0.5 rounded-md">
          {s.time ?? "—:——"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {s.category && (
          <div className="mb-1">
            <CategoryBadge label={s.category?.split(" ")[0] || "Video"} />
          </div>
        )}
        <p className="text-[12px] font-semibold text-(--foreground) line-clamp-2 leading-snug mb-1">
          {s.title}
        </p>
        <p className="text-[10.5px] text-(--muted-foreground)">
          {s.views ? `${fmt(s.views)} views · ` : ""}
          {timeAgo(s.date)}
        </p>
      </div>
    </button>
  );
}

// ── CHANGE: accepts directUrl so non-YouTube videos share correctly ───────────
function ShareModal({ videoTitle, videoId, directUrl, onClose }) {
  const url = directUrl || `https://www.youtube.com/watch?v=${videoId}`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: videoTitle || "Check this out", url })
        .then(onClose)
        .catch(() => { });
    }
  }, [onClose, url, videoTitle]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { }
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 cursor-pointer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-(--card) border border-(--card-border) rounded-2xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-(--foreground)">
            Share Video
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-(--card) flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-(--card) border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-(--foreground) truncate select-all">
            <Link size={12} className="flex-shrink-0 text-gray-400" />
            <span className="truncate select-all">{url}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`text-[12px] font-semibold px-3 rounded-lg transition-colors cursor-pointer ${copied
              ? "bg-green-500 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {hasNativeShare && (
          <button
            onClick={async () => {
              try {
                await navigator.share({
                  title: videoTitle || "Check this out",
                  url,
                });
                onClose();
              } catch (_) { }
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <Share2 size={15} />
            Share via…
          </button>
        )}
        {!hasNativeShare && (
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "Twitter",
                icon: <Twitter size={16} />,
                color: "bg-black text-white",
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle || "")}&url=${encodeURIComponent(url)}`,
              },
              {
                label: "WhatsApp",
                icon: <MessageCircle size={16} />,
                color: "bg-green-500 text-white",
                href: `https://wa.me/?text=${encodeURIComponent((videoTitle || "") + " " + url)}`,
              },
              {
                label: "Facebook",
                icon: <Facebook size={16} />,
                color: "bg-[#1877F2] text-white",
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
              },
              {
                label: "LinkedIn",
                icon: <Linkedin size={16} />,
                color: "bg-[#0A66C2] text-white",
                href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
              },
            ].map((p) => (
              <a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                title={p.label}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${p.color} transition-opacity hover:opacity-90`}
              >
                {p.icon}
                <span className="text-[9px] font-semibold">{p.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoDialogModal({ videoId: initialVideoId, onClose }) {
  // ── CHANGE: resolve prop — accepts a full video object OR a bare YouTube ID ─
  // ExploreVideos passes the whole video object; other callers may pass just an ID.
  const initialIsObject =
    initialVideoId !== null && typeof initialVideoId === "object";

  // Extract YouTube ID from object if possible
  const initialYtId = initialIsObject
    ? initialVideoId.videoId || extractYouTubeId(initialVideoId.videoUrl) || null
    : initialVideoId; // bare string case — used as-is

  // If it's an object but has NO YouTube ID, it's a direct/Firebase video
  const initialDirectVideo = initialIsObject && !initialYtId ? initialVideoId : null;

  // videoId tracks the currently playing YouTube ID (may change via suggestions)
  const [videoId, setVideoId] = useState(initialYtId);
  // directVideo holds the full object for non-YouTube playback
  const [directVideo, setDirectVideo] = useState(initialDirectVideo);

  const [video, setVideo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const [rightTab, setRightTab] = useState("suggestions");

  const modalRef = useRef(null);

  const handleLike = useCallback(() => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  }, [liked]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── CHANGE: skip YouTube API entirely for non-YouTube videos ─────────────
  useEffect(() => {
    // Direct/Firebase video — metadata is already in the object, nothing to fetch
    if (directVideo) {
      setLoading(false);
      setCommentsLoading(false);
      setSuggestionsLoading(false);
      return;
    }

    if (!videoId) return;

    // From here on: standard YouTube path, completely unchanged
    setLoading(true);
    setCommentsLoading(true);
    setSuggestionsLoading(true);

    async function loadData() {
      try {
        const videoData = await getYoutubeVideoById(videoId);
        setVideo(videoData);
        setLikes(parseInt(videoData?.statistics?.likeCount || "0", 10));
        setLoading(false);

        const [commentData, suggestionData] = await Promise.all([
          getYoutubeComments(videoId),
          getSuggestedVideos(videoData?.snippet?.title || "", {
            maxResults: 50,
          }),
        ]);

        setComments(commentData);
        setSuggestions(suggestionData);
      } catch (err) {
        console.error(err);
      } finally {
        setCommentsLoading(false);
        setSuggestionsLoading(false);
      }
    }

    loadData();
  }, [videoId, directVideo]);

  // ── Memoize derived values so VideoPlayer never receives new object refs ────
  // Without useMemo, snippet/stats/shareUrl are recreated on every render.
  // VideoPlayer receives thumbnail/title/category as new string refs → its own
  // useMemo for ytOpts fires → react-youtube sees new opts → remounts iframe → buffering.
  const snippet = useMemo(() => directVideo
    ? {
        title:        directVideo.title || directVideo.name || "",
        channelTitle: directVideo.channelName || "",
        publishedAt:  directVideo.date || null,
        thumbnails: {
          high:    { url: directVideo.thumbnail || directVideo.image || "" },
          default: { url: directVideo.thumbnail || directVideo.image || "" },
        },
        tags: [directVideo.category].filter(Boolean),
      }
    : video?.snippet,
  [directVideo, video]);

  const stats = useMemo(() => directVideo
    ? { viewCount: 0, likeCount: 0, commentCount: 0 }
    : video?.statistics,
  [directVideo, video]);

  const shareUrl = useMemo(() => directVideo
    ? directVideo.videoUrl || ""
    : `https://www.youtube.com/watch?v=${videoId}`,
  [directVideo, videoId]);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: snippet?.title || "Check this out", url: shareUrl });
        return;
      } catch (_) {
        return;
      }
    }
    setShowShareModal(true);
  }

  // When a suggestion card is clicked it always produces a YouTube ID,
  // so clear directVideo and set the new YouTube ID.
  function handleSuggestionClick(ytId) {
    setDirectVideo(null);
    setVideoId(ytId);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        style={{ animation: "backdropIn 0.25s ease" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className="
            relative bg-white rounded-2xl w-full shadow-2xl overflow-hidden
            flex flex-col
            xl:grid xl:grid-cols-[1fr_320px] xl:flex-none
            max-w-[1100px]
          "
          style={{
            height: "min(calc(100dvh - 16px), 820px)",
            animation: "modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <button
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-500 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-gray-200 hover:text-gray-800 hover:scale-110 active:scale-95"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="overflow-y-auto p-4 sm:p-6 bg-(--background) flex-1 min-h-0">
            {loading ? (
              <>
                <div className="aspect-video rounded-xl overflow-hidden mb-5">
                  <SkeletonBlock className="w-full h-full rounded-none" />
                </div>
                <SkeletonBlock className="h-5 w-4/5 mb-2" />
                <SkeletonBlock className="h-3.5 w-1/2 mb-4" />
                <SkeletonBlock className="h-16 w-full" />
              </>
            ) : (
              <>
                {/* ── CHANGE: player — YouTube vs direct video ────────────────────── */}
                {directVideo ? (
                  // Firebase Storage or any direct URL — plain HTML video player
                  <video
                    src={directVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full aspect-video rounded-xl bg-black object-contain"
                    poster={directVideo.thumbnail || directVideo.image}
                  />
                ) : (
                  // YouTube — existing VideoPlayer with resume support, unchanged
                  <VideoPlayer
                    videoId={videoId}
                    thumbnail={
                      snippet?.thumbnails?.high?.url ||
                      snippet?.thumbnails?.default?.url
                    }
                    title={snippet?.title}
                    category={snippet?.tags?.[0] || "Video"}
                  />
                )}

                <div className="mt-4 mb-3">
                  <h2 className="text-[16px] sm:text-[20px] font-bold text-(--foreground) leading-snug mb-2">
                    {snippet?.title ?? "No Title"}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] sm:text-[12.5px] text-(--foreground) flex-wrap">
                    <span className="font-semibold text-(--foreground)">
                      {snippet?.channelTitle ?? "Unknown"}
                    </span>
                    <span>•</span>
                    <span>
                      {snippet?.publishedAt
                        ? new Date(snippet.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "Recently"}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-(--foreground) flex items-center gap-1">
                      <Eye size={12} />
                      {fmt(stats?.viewCount)} views
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 mb-4" />

                {/* Actions */}
                <div className="flex items-center gap-4 mb-5">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors ${liked
                      ? "text-blue-600"
                      : "text-(--muted-foreground) hover:text-blue-600"
                      }`}
                  >
                    <ThumbsUp
                      size={18}
                      className={
                        liked
                          ? "scale-110 transition-transform fill-(--primary)"
                          : ""
                      }
                    />
                    <span>{fmt(likes)}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-(--muted-foreground) cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>

                <div className="xl:hidden">
                  <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-4 w-fit">
                    {["suggestions", "comments"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setRightTab(t)}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition cursor-pointer capitalize ${rightTab === t
                          ? "bg-white text-[#2563EB] shadow-sm"
                          : "text-gray-500"
                          }`}
                      >
                        {t === "suggestions" ? "Up Next" : "Comments"}
                      </button>
                    ))}
                  </div>

                  {rightTab === "suggestions" && (
                    <div className="flex flex-col">
                      {suggestionsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex gap-3 p-2.5 mb-2 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <SkeletonBlock className="w-[90px] h-[56px] rounded-lg flex-shrink-0" />
                            <div className="flex-1 pt-0.5 flex flex-col gap-2">
                              <SkeletonBlock className="h-3 w-[80%]" />
                              <SkeletonBlock className="h-3 w-[60%]" />
                            </div>
                          </div>
                        ))
                      ) : suggestions.length === 0 ? (
                        <p className="text-center py-6 text-gray-400 text-[13px]">
                          No suggestions.
                        </p>
                      ) : (
                        suggestions.map((s) => (
                          <SuggestedCard
                            key={s.videoId}
                            s={s}
                            onClick={handleSuggestionClick}
                            active={s.videoId === videoId}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {rightTab === "comments" && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-bold text-(--foreground)">
                          Comments
                        </h3>
                        <span className="text-[11px] text-(--muted-foreground) bg-gray-100 px-2 py-0.5 rounded-full">
                          {fmt(stats?.commentCount)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {commentsLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-2.5">
                              <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                              <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                                <SkeletonBlock className="h-3 w-1/3" />
                                <SkeletonBlock className="h-3 w-full" />
                              </div>
                            </div>
                          ))
                        ) : comments.length === 0 ? (
                          <p className="text-center py-6 text-gray-400 text-[13px]">
                            No comments.
                          </p>
                        ) : (
                          comments.map((c, i) => (
                            <CommentItem key={c.id} c={c} index={i} />
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden xl:block">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-[13px] font-bold text-(--foreground)">
                      Comments
                    </h3>
                    <span className="text-[11px] text-(--muted-foreground) bg-gray-100 px-2 py-0.5 rounded-full">
                      {fmt(stats?.commentCount)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                    {commentsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-2.5">
                          <SkeletonBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                            <SkeletonBlock className="h-3 w-1/3" />
                            <SkeletonBlock className="h-3 w-full" />
                            <SkeletonBlock className="h-3 w-4/5" />
                          </div>
                        </div>
                      ))
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8 text-(--muted-foreground) text-[13px]">
                        No comments available.
                      </div>
                    ) : (
                      comments.map((c, i) => (
                        <CommentItem key={c.id} c={c} index={i} />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden xl:flex border-l border-(--border) bg-(--card) flex-col overflow-hidden">
            <div className="px-4 pt-5 pb-3 text-[13px] font-bold text-(--foreground) border-b border-(--border) flex-shrink-0">
              Up Next
            </div>
            <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
              {suggestionsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-2.5 mb-2 bg-white rounded-xl border border-gray-100"
                  >
                    <SkeletonBlock className="w-[100px] h-[60px] rounded-lg flex-shrink-0" />
                    <div className="flex-1 pt-0.5 flex flex-col gap-2">
                      <SkeletonBlock className="h-3 w-[80%]" />
                      <SkeletonBlock className="h-3 w-[60%]" />
                      <SkeletonBlock className="h-2.5 w-[40%]" />
                    </div>
                  </div>
                ))
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-(--muted-foreground) text-[13px]">
                  No suggestions available.
                </div>
              ) : (
                suggestions.map((s) => (
                  <SuggestedCard
                    key={s.videoId}
                    s={s}
                    onClick={handleSuggestionClick}
                    active={s.videoId === videoId}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          videoTitle={snippet?.title}
          videoId={videoId}
          directUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
