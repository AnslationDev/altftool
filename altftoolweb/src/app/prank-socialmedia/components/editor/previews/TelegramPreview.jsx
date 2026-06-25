"use client";
import { ChevronLeft, Search, MoreVertical, Check, CheckCheck } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";

function TelegramPreview() {
  const { username, avatar, messages, theme } = useEditor();
  const dark = theme !== "light";
  
  // Telegram themed colors
  const bg = theme === "amoled" ? "#000" : dark ? "#0e1621" : "#deebd6"; // Nice classic green-tinged TG wallpaper color for light
  const fg = dark ? "#fff" : "#000";
  const headerBg = dark ? "#17212b" : "#527596";
  const headerFg = "#fff";
  
  const meBubble = dark ? "#2b5278" : "#effdde";
  const themBubble = dark ? "#182533" : "#ffffff";
  const meColor = fg;
  const themColor = fg;
  const mutedText = dark ? "#a5b5c1" : "#808080";

  return (
    <DeviceFrame
      header={
        <div
          className="flex items-center gap-3 px-3 py-2"
          style={{ background: headerBg, color: headerFg }}
        >
          <ChevronLeft className="h-5 w-5 cursor-pointer" />
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/20">
            {avatar ? (
              <img src={avatar} className="h-full w-full object-cover" alt="" />
            ) : (
              <span className="text-sm font-bold text-white">{username[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight truncate">{username}</p>
            <p className="text-[10px] opacity-80">online</p>
          </div>
          <Search className="h-4 w-4 cursor-pointer" />
          <MoreVertical className="h-4 w-4 cursor-pointer" />
        </div>
      }
    >
      <div
        className="space-y-2 px-3 py-3"
        style={{ background: bg, color: fg, minHeight: 560 }}
      >
        {messages.map((m) => {
          const mine = m.side === "me";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-lg px-3 py-1.5 text-[13px] leading-snug shadow-sm relative"
                style={{
                  background: mine ? meBubble : themBubble,
                  color: mine ? meColor : themColor,
                  borderRadius: "12px",
                  borderBottomRightRadius: mine ? "4px" : "12px",
                  borderBottomLeftRadius: mine ? "12px" : "4px",
                }}
              >
                <span>{m.text}</span>
                <span
                  className="float-right ml-2 mt-1.5 flex items-center gap-0.5 text-[9px]"
                  style={{ color: mine ? (dark ? "#7a9bbb" : "#5d9966") : mutedText }}
                >
                  {m.time}
                  {mine && (
                    m.status === "read" ? (
                      <CheckCheck className="h-3 w-3 text-sky-400" />
                    ) : m.status === "delivered" ? (
                      <CheckCheck className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </DeviceFrame>
  );
}

export { TelegramPreview };
