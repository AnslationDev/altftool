"use client";
import { ChevronLeft, MessageSquare, Camera, Compass, Smile, MoreHorizontal } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";

function SnapchatPreview() {
  const { username, avatar, postImage, time, theme, messages } = useEditor();
  const latestMessage = messages[messages.length - 1];
  const dark = theme !== "light";
  const bg = "#000"; // Snapchat stories/camera is always full black or camera feed
  const fg = "#fff";

  return (
    <DeviceFrame
      header={
        <div
          className="flex items-center justify-between px-3 py-2 text-white"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5 cursor-pointer" />
            <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-yellow-400">
              {avatar ? (
                <img src={avatar} className="h-full w-full object-cover" alt="" />
              ) : (
                <span className="text-xs font-bold text-black">{username[0]}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{username}</p>
              <p className="text-[9px] opacity-70">{time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MoreHorizontal className="h-4 w-4 cursor-pointer" />
          </div>
        </div>
      }
    >
      <div
        className="relative flex flex-col justify-between"
        style={{ background: bg, color: fg, minHeight: 560 }}
      >
        {/* Story Content Background */}
        {postImage ? (
          <img src={postImage} className="absolute inset-0 h-full w-full object-cover" alt="" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-neutral-500 bg-neutral-950">
            <p className="text-sm font-semibold">Snapchat Story/Camera Mockup</p>
            <p className="text-xs mt-1">Upload a &quot;Post image&quot; in the sidebar to show a custom Snap picture.</p>
          </div>
        )}

        {/* Overlay content (e.g. caption / snap details) */}
        <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-20">
          <div className="w-full bg-black/50 backdrop-blur-md rounded-xl p-3 text-center text-sm border border-white/10 shadow-lg">
            {latestMessage ? latestMessage.text : "Tap to edit this message! 👻"}
          </div>
        </div>

        {/* Snapchat Custom Bottom Bar */}
        <div className="absolute bottom-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-lg rounded-full px-3 py-1.5 flex-1 max-w-[70%]">
            <MessageSquare className="h-4 w-4 text-white opacity-80" />
            <span className="text-xs text-white/80 font-medium">Send a Chat</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-lg rounded-full cursor-pointer hover:bg-white/30">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <div className="p-2 bg-white/20 backdrop-blur-lg rounded-full cursor-pointer hover:bg-white/30">
              <Smile className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </DeviceFrame>
  );
}

export { SnapchatPreview };
