"use client";
import { Phone, Video, ChevronLeft, Check, CheckCheck } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";
function WhatsAppPreview() {
  const { username, avatar, messages, theme } = useEditor();
  const dark = theme !== "light";
  const headerBg = dark ? "#1f2c33" : "#075e54";
  const bodyBg = dark ? theme === "amoled" ? "#000" : "#0b141a" : "#ece5dd";
  const meBubble = dark ? "#005c4b" : "#dcf8c6";
  const themBubble = dark ? "#202c33" : "#ffffff";
  const meColor = dark ? "#e9edef" : "#111";
  const themColor = dark ? "#e9edef" : "#111";
  return <DeviceFrame
    header={<div className="flex items-center gap-2 px-3 py-2 text-white" style={{ background: headerBg }}>
          <ChevronLeft className="h-5 w-5" />
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white/20">
            {avatar ? <img src={avatar} className="h-full w-full object-cover" alt="" /> : <span className="text-xs font-bold">{username[0]}</span>}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">{username}</p>
            <p className="text-[10px] opacity-80">online</p>
          </div>
          <Video className="h-5 w-5" /><Phone className="h-4 w-4" />
        </div>}
  >
      <div className="space-y-1.5 px-3 py-3" style={{ background: bodyBg, minHeight: 560 }}>
        {messages.map((m) => {
    const mine = m.side === "me";
    return <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
      className="max-w-[78%] rounded-lg px-2.5 py-1.5 text-[13px] leading-snug shadow-sm"
      style={{
        background: mine ? meBubble : themBubble,
        color: mine ? meColor : themColor,
        borderTopRightRadius: mine ? 2 : void 0,
        borderTopLeftRadius: mine ? void 0 : 2
      }}
    >
                <span>{m.text}</span>
                <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] opacity-60">
                  {m.time}
                  {mine && (m.status === "read" ? <CheckCheck className="h-3 w-3 text-sky-400" /> : m.status === "delivered" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                </span>
              </div>
            </div>;
  })}
      </div>
    </DeviceFrame>;
}
export {
  WhatsAppPreview
};
