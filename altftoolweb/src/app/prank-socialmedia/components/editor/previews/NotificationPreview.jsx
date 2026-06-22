"use client";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";
function NotificationPreview() {
  const { username, body, time, avatar, device } = useEditor();
  const isIos = device === "iphone";
  return <DeviceFrame>
      <div className="relative flex flex-col items-center px-4 pt-10" style={{ minHeight: 560 }}>
        <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 opacity-90" />
        <div className="relative mt-2 text-center text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
          <p className="text-7xl font-thin tracking-tighter">{time}</p>
          <p className="mt-1 text-sm">Thursday, May 21</p>
        </div>
        <div className="relative mt-10 w-full">
          <div className={`${isIos ? "rounded-2xl" : "rounded-xl"} bg-white/70 p-3 shadow-xl backdrop-blur-2xl`}>
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                {avatar ? <img src={avatar} className="h-full w-full object-cover" alt="" /> : username[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-neutral-900">{username}</p>
                  <p className="text-[10px] text-neutral-500">now</p>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-neutral-700">{body}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeviceFrame>;
}
export {
  NotificationPreview
};
