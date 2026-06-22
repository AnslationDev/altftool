"use client";
import { Battery, ShieldAlert } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";
import { DeviceFrame } from "../DeviceFrame";

function LowBatteryPreview() {
  const { batteryLevel, os, theme } = useEditor();
  const isIos = os === "ios";
  const dark = theme !== "light";

  // Low Battery Screen background (make it look like a locked screen or wallpaper context)
  const bgGradient = "linear-gradient(to bottom, #1f1c2c, #928dab)";

  return (
    <DeviceFrame>
      <div
        className="relative flex items-center justify-center p-6 text-center select-none"
        style={{ background: bgGradient, minHeight: 560 }}
      >
        {/* iOS style dialog */}
        {isIos ? (
          <div className="w-full max-w-[260px] rounded-[18px] bg-white/75 dark:bg-black/60 backdrop-blur-2xl p-5 shadow-2xl border border-white/20 text-neutral-900 dark:text-neutral-100 animate-fade-up">
            <h3 className="text-base font-bold tracking-tight">Low Battery</h3>
            <p className="mt-1 text-xs leading-normal opacity-85">
              {batteryLevel}% of battery remaining.
            </p>
            
            <div className="mt-4 flex flex-col border-t border-neutral-300 dark:border-neutral-700 -mx-5 -mb-5">
              <button className="py-3 text-sm font-semibold text-[#007aff] hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-b-none border-b border-neutral-300 dark:border-neutral-700 cursor-pointer">
                Low Power Mode
              </button>
              <button className="py-3 text-sm text-[#007aff] hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-b-[18px] cursor-pointer">
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          /* Android / Pixel Style Dialog */
          <div className="w-full max-w-[280px] rounded-[28px] bg-[#f7f9fc] dark:bg-[#1e2022] p-6 shadow-2xl text-left text-neutral-900 dark:text-neutral-100 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Battery className="h-5 w-5 text-red-600 dark:text-red-400 rotate-90" />
              </div>
              <h3 className="text-lg font-medium leading-none">Battery is low</h3>
            </div>
            
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              Only {batteryLevel}% battery left. Turn on Battery Saver to extend battery life.
            </p>

            <div className="mt-6 flex justify-end gap-3 text-xs font-semibold">
              <button className="px-4 py-2 text-[#00639b] dark:text-[#a8c7fa] hover:bg-[#00639b]/5 rounded-full cursor-pointer">
                No thanks
              </button>
              <button className="px-4 py-2 bg-[#00639b] text-white dark:bg-[#a8c7fa] dark:text-black rounded-full shadow hover:bg-opacity-95 cursor-pointer">
                Turn on
              </button>
            </div>
          </div>
        )}
      </div>
    </DeviceFrame>
  );
}

export { LowBatteryPreview };
