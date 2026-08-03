"use client";
import { BadgeCheck, MessageCircle, Repeat2, Heart, BarChart2, Share, MoreHorizontal } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import ImageViewer from "../../ui/image-viewer";
function TwitterPreview() {
  const { username, handle, avatar, verified, body, time, likes, views, theme } = useEditor();
  const dark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : dark ? "#15202b" : "#fff";
  const fg = dark ? "#e7e9ea" : "#0f1419";
  const muted = dark ? "#71767b" : "#536471";
  const border = dark ? "#2f3336" : "#eff3f4";
  return <div className="rounded-3xl p-1 shadow-soft" style={{ background: bg, color: fg, width: 520, border: `1px solid ${border}` }}>
      <div className="px-5 pt-5">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-secondary">
            {avatar ? <ImageViewer src={avatar} alt="Avatar" className="h-full w-full object-cover" platform="Twitter" /> : <span className="font-bold">{username[0]}</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[15px] font-bold">
              {username}
              {verified && <BadgeCheck className="h-4 w-4 fill-sky-500 text-white" />}
            </div>
            <div className="text-sm" style={{ color: muted }}>@{handle}</div>
          </div>
          <MoreHorizontal className="h-5 w-5" style={{ color: muted }} />
        </div>
        <p className="mt-3 whitespace-pre-wrap text-[17px] leading-snug">{body}</p>
        <div className="mt-3 text-sm" style={{ color: muted }}>{time} · <span className="font-semibold" style={{ color: fg }}>{views.toLocaleString()}</span> Views</div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t px-8 py-3 text-sm" style={{ borderColor: border, color: muted }}>
        <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{Math.round(likes / 20)}</span>
        <span className="inline-flex items-center gap-1.5"><Repeat2 className="h-4 w-4" />{Math.round(likes / 8)}</span>
        <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" />{likes.toLocaleString()}</span>
        <span className="inline-flex items-center gap-1.5"><BarChart2 className="h-4 w-4" />{views.toLocaleString()}</span>
        <Share className="h-4 w-4" />
      </div>
    </div>;
}
export {
  TwitterPreview
};
