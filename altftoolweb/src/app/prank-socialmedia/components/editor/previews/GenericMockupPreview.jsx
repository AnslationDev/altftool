"use client";

import { Check, Heart, MessageCircle, MoreHorizontal, Repeat2, Send } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";

function GenericMockupPreview({ template }) {
  const {
    username,
    handle,
    avatar,
    verified,
    time,
    title,
    description,
    body,
    postImage,
    likes,
    views,
    theme,
  } = useEditor();
  const Icon = template.icon;
  const dark = theme === "dark" || theme === "amoled";
  const shell = dark ? "bg-slate-950 text-white" : "bg-white text-slate-950";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const panel = dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";

  return (
    <div className={`w-[390px] overflow-hidden rounded-[2rem] border shadow-2xl ${dark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
      <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-slate-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${template.accent} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black">{template.name}</p>
            <p className={`text-xs ${muted}`}>Live mockup editor</p>
          </div>
        </div>
        <MoreHorizontal className={`h-5 w-5 ${muted}`} />
      </div>

      <div className={`p-5 ${shell}`}>
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br ${template.accent} text-sm font-black text-white`}>
            {avatar ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${avatar})` }} /> : username.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-black">{username}</p>
              {verified && <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-500 text-white"><Check className="h-2.5 w-2.5" /></span>}
            </div>
            <p className={`truncate text-xs ${muted}`}>@{handle} - {time}</p>
          </div>
        </div>

        <div className={`mt-5 rounded-3xl border p-4 ${panel}`}>
          <h2 className="text-lg font-black leading-tight">{title || template.name}</h2>
          <p className={`mt-2 text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
            {description || body || template.short}
          </p>
          {postImage ? (
            <div className="mt-4 h-44 w-full rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${postImage})` }} />
          ) : (
            <div className={`mt-4 grid h-44 place-items-center rounded-2xl bg-gradient-to-br ${template.accent} text-white`}>
              <div className="text-center">
                <Icon className="mx-auto h-12 w-12" />
                <p className="mt-3 text-sm font-bold">{template.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-3 ${panel}`}>
          <span className="flex items-center gap-2 text-xs font-bold"><Heart className="h-4 w-4 text-rose-500" />{likes.toLocaleString()}</span>
          <span className="flex items-center gap-2 text-xs font-bold"><MessageCircle className="h-4 w-4 text-blue-500" />284</span>
          <span className="flex items-center gap-2 text-xs font-bold"><Repeat2 className="h-4 w-4 text-emerald-500" />96</span>
          <span className="flex items-center gap-2 text-xs font-bold"><Send className="h-4 w-4 text-violet-500" />{views.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export { GenericMockupPreview };
