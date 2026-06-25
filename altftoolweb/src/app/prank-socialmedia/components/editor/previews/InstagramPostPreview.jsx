"use client";
import { BadgeCheck, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";

function InstagramPostPreview() {
  const { username, avatar, verified, postImage, caption, location, likes, theme } = useEditor();
  const dark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : dark ? "#121212" : "#fff";
  const fg = dark ? "#fff" : "#000";
  const border = dark ? "#262626" : "#dbdbdb";
  const muted = dark ? "#a8a8a8" : "#737373";

  return (
    <div
      className="rounded-xl overflow-hidden shadow-soft max-w-full"
      style={{ background: bg, color: fg, width: 480, border: `1px solid ${border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-secondary">
            {avatar ? (
              <img src={avatar} className="h-full w-full object-cover" alt="" />
            ) : (
              <span className="text-sm font-bold">{username[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              {username}
              {verified && <BadgeCheck className="h-4 w-4 fill-sky-500 text-white" />}
            </div>
            {location && <div className="text-[11px]" style={{ color: muted }}>{location}</div>}
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 cursor-pointer" />
      </div>

      {/* Post Image */}
      <div className="aspect-square w-full bg-secondary flex items-center justify-center overflow-hidden border-y" style={{ borderColor: border }}>
        {postImage ? (
          <img src={postImage} className="h-full w-full object-cover" alt="Post" />
        ) : (
          <div className="text-sm text-muted-foreground p-4 text-center">No image uploaded. Use the sidebar to upload a post image.</div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 cursor-pointer hover:scale-110 transition" />
            <MessageCircle className="h-6 w-6 cursor-pointer hover:scale-110 transition" />
            <Send className="h-6 w-6 cursor-pointer hover:scale-110 transition" />
          </div>
          <Bookmark className="h-6 w-6 cursor-pointer hover:scale-110 transition" />
        </div>

        {/* Likes */}
        <div className="mt-2.5 text-sm font-semibold">
          {likes.toLocaleString()} likes
        </div>

        {/* Caption */}
        <div className="mt-1 text-sm leading-normal">
          <span className="font-semibold mr-1.5">{username}</span>
          <span className="whitespace-pre-line">{caption}</span>
        </div>
      </div>
    </div>
  );
}

export { InstagramPostPreview };
