"use client";
import { ThumbsUp, ThumbsDown, MessageSquare, BadgeCheck } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import ImageViewer from "../../ui/image-viewer";

function YoutubeCommentPreview() {
  const {
    username,
    avatar,
    verified,
    videoTitle,
    channelName,
    videoThumbnail,
    commentText,
    commentLikes,
    commentTime,
    comments, // Can treat the store's comments array as replies to this YouTube comment
    theme
  } = useEditor();

  const dark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : dark ? "#0f0f0f" : "#fff";
  const fg = dark ? "#f1f1f1" : "#0f0f0f";
  const border = dark ? "#272727" : "#e5e5e5";
  const muted = dark ? "#aaa" : "#606060";

  return (
    <div
      className="rounded-xl overflow-hidden shadow-soft text-left"
      style={{ background: bg, color: fg, width: 520, border: `1px solid ${border}` }}
    >
      {/* Video Context Header (shows what video it's under) */}
      <div className="flex gap-3 p-3 border-b" style={{ borderColor: border }}>
        <div className="h-14 w-24 bg-neutral-800 rounded overflow-hidden shrink-0 flex items-center justify-center">
          {videoThumbnail ? (
            <ImageViewer src={videoThumbnail} alt="Video thumbnail" platform="YouTube Video" className="h-full w-full object-cover" />
          ) : (
            <div className="text-[10px] text-neutral-400 font-semibold p-1 text-center">No Thumbnail</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-snug truncate">{videoTitle}</p>
          <p className="text-[11px] mt-0.5" style={{ color: muted }}>{channelName}</p>
          <span className="inline-block mt-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">VIDEO</span>
        </div>
      </div>

      {/* Main Comment */}
      <div className="p-4 flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary">
                {avatar ? (
                  <ImageViewer src={avatar} alt="Avatar" className="h-full w-full object-cover" platform="YouTube" />
                ) : (
            <span className="text-sm font-bold">{username[0]}</span>
          )}
        </div>
        <div className="flex-1">
          {/* Header Info */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold">{username}</span>
            {verified && <BadgeCheck className="h-3.5 w-3.5 fill-neutral-500 text-white" />}
            <span style={{ color: muted }}>{commentTime}</span>
          </div>

          {/* Comment Body */}
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{commentText}</p>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: muted }}>
            <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              {commentLikes > 0 && commentLikes.toLocaleString()}
            </span>
            <span className="cursor-pointer hover:text-foreground">
              <ThumbsDown className="h-3.5 w-3.5" />
            </span>
            <span className="cursor-pointer font-semibold hover:text-foreground">Reply</span>
          </div>

          {/* Replies Section */}
          {comments.length > 0 && (
            <div className="mt-4 border-l-2 pl-4 space-y-4" style={{ borderColor: border }}>
              {comments.map((reply) => (
                <div key={reply.id} className="flex gap-2.5">
                  <div className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary">
                    {reply.avatar ? (
                      <ImageViewer src={reply.avatar} alt="Reply avatar" className="h-full w-full object-cover" platform="YouTube Reply" />
                    ) : (
                      <span className="text-[10px] font-bold">{reply.username[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold">{reply.username}</span>
                      <span style={{ color: muted }}>{reply.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-normal">{reply.text}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px]" style={{ color: muted }}>
                      <span className="flex items-center gap-0.5 cursor-pointer">
                        <ThumbsUp className="h-3 w-3" />
                        {reply.likes > 0 && reply.likes}
                      </span>
                      <span className="cursor-pointer"><ThumbsDown className="h-3 w-3" /></span>
                      <span className="cursor-pointer font-semibold">Reply</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { YoutubeCommentPreview };
