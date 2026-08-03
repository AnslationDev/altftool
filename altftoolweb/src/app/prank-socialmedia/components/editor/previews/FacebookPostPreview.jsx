"use client";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Globe } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import ImageViewer from "../../ui/image-viewer";

function FacebookPostPreview() {
  const { username, avatar, verified, body, postImage, time, likes, shares, comments, theme } = useEditor();
  const dark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : dark ? "#242526" : "#fff";
  const fg = dark ? "#e4e6eb" : "#050505";
  const border = dark ? "#3e4042" : "#e5e5e5";
  const muted = dark ? "#b0b3b8" : "#65676b";
  const cardHover = dark ? "#3a3b3c" : "#f2f2f2";

  return (
    <div
      className="rounded-xl overflow-hidden shadow-soft max-w-full text-left"
      style={{ background: bg, color: fg, width: 520, border: `1px solid ${border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-secondary">
            {avatar ? (
              <ImageViewer src={avatar} alt="Avatar" className="h-full w-full object-cover" platform="Facebook" />
            ) : (
              <span className="text-base font-bold">{username[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {username}
              {verified && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-white text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: muted }}>
              <span>{time}</span>
              <span>·</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 cursor-pointer" style={{ color: muted }} />
      </div>

      {/* Post Body */}
      <p className="px-3.5 pb-3 text-[15px] leading-normal whitespace-pre-wrap">{body}</p>

      {/* Optional Post Image */}
      {postImage && (
        <div className="w-full overflow-hidden border-y bg-secondary" style={{ borderColor: border }}>
          <ImageViewer src={postImage} alt="Post image" platform="Facebook Post" className="w-full object-cover max-h-[400px]" />
        </div>
      )}

      {/* Stats (Reactions / Comments / Shares count) */}
      <div className="flex items-center justify-between px-3.5 py-2.5 text-[13px] border-b" style={{ borderColor: border, color: muted }}>
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877f2] text-white text-[9px]">👍</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f02849] text-white text-[9px]">❤️</span>
          </div>
          <span>{likes.toLocaleString()}</span>
        </div>
        <div className="flex gap-2.5">
          <span>{comments.length} comments</span>
          <span>{shares.toLocaleString()} shares</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between px-1.5 py-1 text-sm font-semibold border-b" style={{ borderColor: border, color: muted }}>
        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-opacity-10 cursor-pointer" style={{ color: muted }} onMouseEnter={(e) => e.target.style.backgroundColor = cardHover} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
          <ThumbsUp className="h-4 w-4" />
          <span>Like</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-opacity-10 cursor-pointer" style={{ color: muted }} onMouseEnter={(e) => e.target.style.backgroundColor = cardHover} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
          <MessageSquare className="h-4 w-4" />
          <span>Comment</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-opacity-10 cursor-pointer" style={{ color: muted }} onMouseEnter={(e) => e.target.style.backgroundColor = cardHover} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Simple Comments List */}
      {comments.length > 0 && (
        <div className="p-3.5 space-y-3">
            {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary">
                {c.avatar ? (
                  <ImageViewer src={c.avatar} alt="Comment avatar" className="h-full w-full object-cover" platform="Facebook Comment" />
                ) : (
                  <span className="text-xs font-bold">{c.username[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="inline-block rounded-2xl p-2.5 px-3 text-xs" style={{ background: dark ? "#3a3b3c" : "#f0f2f5" }}>
                  <p className="font-semibold mb-0.5">{c.username}</p>
                  <p className="leading-snug">{c.text}</p>
                </div>
                <div className="flex gap-3 mt-1 ml-2 text-[11px]" style={{ color: muted }}>
                  <span className="hover:underline cursor-pointer">Like</span>
                  <span className="hover:underline cursor-pointer">Reply</span>
                  <span>{c.time}</span>
                  {c.likes > 0 && (
                    <span className="flex items-center gap-0.5">👍 {c.likes}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { FacebookPostPreview };
