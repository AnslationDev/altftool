"use client";
import { ChevronLeft, Phone, Video, Info, Circle } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";
import ImageViewer from "../../ui/image-viewer";

function MessengerPreview() {
  const { username, avatar, messages, theme } = useEditor();
  const dark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : dark ? "#0a0a0a" : "#fff";
  const fg = dark ? "#fff" : "#111";
  const headerBg = bg;
  const border = dark ? "#222" : "#eee";
  const themBubble = dark ? "#242526" : "#e4e6eb";
  const themColor = fg;
  const meBubble = "linear-gradient(135deg, #0084ff, #a334fa)";
  const meColor = "#fff";

  return (
    <DeviceFrame
      header={
        <div
          className="flex items-center gap-2 border-b px-3 py-2"
          style={{ background: headerBg, color: fg, borderColor: border }}
        >
          <ChevronLeft className="h-5 w-5 cursor-pointer" />
            <div className="relative">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-secondary">
              {avatar ? (
                <ImageViewer src={avatar} alt="Avatar" className="h-full w-full object-cover" platform="Messenger" />
              ) : (
                <span className="text-xs font-bold">{username[0]}</span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">{username}</p>
            <p className="text-[10px] opacity-60">Active now</p>
          </div>
          <Phone className="h-4 w-4 cursor-pointer text-[#0084ff]" />
          <Video className="h-4 w-4 cursor-pointer text-[#0084ff]" />
          <Info className="h-4 w-4 cursor-pointer text-[#0084ff]" />
        </div>
      }
    >
      <div
        className="space-y-2 px-3 py-4 flex flex-col justify-end"
        style={{ background: bg, color: fg, minHeight: 560 }}
      >
        {messages.map((m) => {
          const mine = m.side === "me";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug"
                style={{
                  background: mine ? meBubble : themBubble,
                  color: mine ? meColor : themColor,
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
    </DeviceFrame>
  );
}

export { MessengerPreview };
