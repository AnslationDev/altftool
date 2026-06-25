"use client";
import { Signal, Wifi, BatteryFull } from "lucide-react";
import { useEditor } from "../../lib/editor-store";
function DeviceFrame({ children, header }) {
  const { device, theme, time } = useEditor();
  const isDark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : isDark ? "#0b1220" : "#fff";
  const fg = isDark ? "#fff" : "#111";
  const radius = device === "iphone" ? "rounded-[44px]" : "rounded-[28px]";
  return <div className={`relative ${radius} bg-neutral-900 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]`} style={{ width: 340 }}>
      <div className={`${radius} overflow-hidden`} style={{ background: bg, color: fg }}>
        {device === "iphone" && <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />}
        <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold" style={{ color: fg }}>
          <span>{time}</span>
          <div className="flex items-center gap-1 opacity-80">
            <Signal className="h-3 w-3" /><Wifi className="h-3 w-3" /><BatteryFull className="h-3 w-3" />
          </div>
        </div>
        {header}
        <div style={{ minHeight: 560 }}>{children}</div>
      </div>
    </div>;
}
export {
  DeviceFrame
};
