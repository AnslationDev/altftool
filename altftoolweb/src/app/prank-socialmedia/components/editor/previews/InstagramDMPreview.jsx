"use client";
import { ChevronLeft, Video, Phone, Info, BadgeCheck } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";
function InstagramDMPreview() {
  const { username, handle, avatar, verified, messages, theme } = useEditor();
  const dark = theme !== "light";
  const bg = dark ? theme === "amoled" ? "#000" : "#0a0a0a" : "#fff";
  const fg = dark ? "#fff" : "#111";
  const themBubble = dark ? "#262626" : "#efefef";
  return <DeviceFrame
    header={<div className="flex items-center gap-2 border-b px-3 py-2" style={{ background: bg, color: fg, borderColor: dark ? "#222" : "#eee" }}>
          <ChevronLeft className="h-5 w-5" />
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-orange-400">
            {avatar ? <img src={avatar} className="h-full w-full object-cover" alt="" /> : <span className="text-xs font-bold text-white">{username[0]}</span>}
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-1 text-sm font-semibold">{handle}{verified && <BadgeCheck className="h-3.5 w-3.5 fill-sky-500 text-white" />}</p>
            <p className="text-[10px] opacity-60">Active now</p>
          </div>
          <Phone className="h-4 w-4" /><Video className="h-4 w-4" /><Info className="h-4 w-4" />
        </div>}
  >
      <div className="space-y-2 px-3 py-4" style={{ background: bg, color: fg, minHeight: 560 }}>
        {messages.map((m) => {
    const mine = m.side === "me";
    return <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
      className="max-w-[75%] rounded-3xl px-3.5 py-2 text-[13px]"
      style={{
        background: mine ? "linear-gradient(135deg,#7c3aed,#ec4899)" : themBubble,
        color: mine ? "#fff" : fg
      }}
    >
                {m.text}
              </div>
            </div>;
  })}
      </div>
    </DeviceFrame>;
}
export {
  InstagramDMPreview
};
