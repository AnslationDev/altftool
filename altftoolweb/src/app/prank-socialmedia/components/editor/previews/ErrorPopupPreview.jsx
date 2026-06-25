"use client";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";

function ErrorPopupPreview() {
  const { errorTitle, errorMessage, errorOs, theme } = useEditor();
  const isWindows = errorOs === "windows";
  const dark = theme !== "light";

  // Background environment for the error dialog box
  const bgEnv = "radial-gradient(circle, #3e517a 0%, #1e2538 100%)";

  return (
    <div
      className="rounded-xl flex items-center justify-center p-12 text-center"
      style={{ background: bgEnv, minHeight: 400, width: 560 }}
    >
      {isWindows ? (
        /* Windows OS Error Dialog */
        <div className="w-[380px] bg-[#f0f0f0] border border-[#707070] text-black font-sans shadow-[4px_4px_10px_rgba(0,0,0,0.3)] text-left select-none">
          {/* Header */}
          <div className="bg-[#1883d7] text-white px-3 py-1.5 flex items-center justify-between text-xs font-semibold">
            <span>{errorTitle || "System Error"}</span>
            <button className="hover:bg-red-600 p-0.5 rounded transition">
              <X className="h-3 w-3" />
            </button>
          </div>
          {/* Content */}
          <div className="p-4 flex items-start gap-4">
            <div className="shrink-0 flex items-center justify-center h-10 w-10 bg-yellow-400 rounded-full">
              <span className="text-black font-bold text-xl">!</span>
            </div>
            <div className="flex-1 text-xs whitespace-pre-wrap leading-relaxed pr-2 text-neutral-800">
              {errorMessage}
            </div>
          </div>
          {/* Action Footer */}
          <div className="bg-[#f0f0f0] px-4 py-3 flex justify-end gap-2 border-t border-[#dfdfdf]">
            <button className="min-w-[75px] bg-[#e1e1e1] hover:bg-[#e5e5e5] border border-[#adadad] active:border-[#0078d7] text-xs py-1 rounded cursor-pointer">
              OK
            </button>
            <button className="min-w-[75px] bg-[#e1e1e1] hover:bg-[#e5e5e5] border border-[#adadad] active:border-[#0078d7] text-xs py-1 rounded cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* macOS OS Error Dialog */
        <div className="w-[280px] bg-[#f5f5f7]/95 dark:bg-[#1e1e1e]/95 backdrop-blur-2xl rounded-2xl p-5 shadow-2xl border border-white/10 text-neutral-900 dark:text-neutral-100 font-sans text-center select-none animate-fade-up">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-2xl bg-[#ff3b30]/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-8 w-8 fill-red-500 text-white" />
            </div>
          </div>
          
          <h3 className="text-sm font-bold leading-tight px-1">
            {errorTitle || "Operation Error"}
          </h3>
          <p className="mt-2 text-xs leading-normal opacity-80 px-2 whitespace-pre-wrap">
            {errorMessage}
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <button className="w-full py-2 bg-[#007aff] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-[#007aff]/90">
              Force Quit
            </button>
            <button className="w-full py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-opacity-80 text-xs font-medium rounded-lg cursor-pointer">
              Ignore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ErrorPopupPreview };
