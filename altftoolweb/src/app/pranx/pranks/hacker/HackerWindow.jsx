
"use client";

export function HackerWindow({
  title,
  className = "",
  children,
  compact = false,
  active = false,
  maximized = false,
  panel,
  onActivate,
  onMinimize,
  onMaximize,
}) {
  return (
    <section
      data-panel={panel}
      data-maximized={maximized ? "true" : "false"}
      onMouseDown={onActivate}
      style={maximized ? { left: 0, top: 0, right: 0, bottom: 44, width: "100%", height: "calc(100% - 44px)", minWidth: 0, zIndex: 60 } : undefined}
      className={`absolute overflow-hidden border-2 border-[#00ff19] bg-black/88 text-[#00ff19] shadow-[0_0_28px_rgba(0,255,25,0.26)] transition ${active ? "z-30 scale-[1.01] ring-4 ring-[#00ff19]/35" : "z-10"} ${maximized ? "scale-100 ring-0" : ""} ${className}`}
    >
      <div
        onDoubleClick={(event) => {
          event.stopPropagation();
          onMaximize?.();
        }}
        className={`flex cursor-default items-center justify-between border-b-2 border-[#00ff19] bg-[#00f715] px-3 font-black text-black ${compact ? "h-8 text-sm" : "h-10 text-base md:text-lg"}`}
      >
        <span className="truncate pr-3 font-mono">{title}</span>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMinimize?.();
            }}
            className="grid h-6 w-8 place-items-center rounded-sm bg-[#00d80f] font-mono text-lg leading-none text-black hover:bg-black hover:text-[#00ff19]"
            aria-label={`Minimize ${title}`}
          >
            -
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMaximize?.();
            }}
            className="grid h-6 w-8 place-items-center rounded-sm bg-[#00d80f] font-mono text-lg leading-none text-black hover:bg-black hover:text-[#00ff19]"
            aria-label={`${maximized ? "Restore" : "Maximize"} ${title}`}
          >
            {maximized ? "❐" : "□"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMinimize?.();
            }}
            className="grid h-6 w-8 place-items-center rounded-sm bg-[#00d80f] font-mono text-lg leading-none text-black hover:bg-black hover:text-[#00ff19]"
            aria-label={`Close ${title}`}
          >
            ×
          </button>
        </div>
      </div>
      <div className={compact ? "h-[calc(100%-2rem)] overflow-hidden" : "h-[calc(100%-2.5rem)] overflow-hidden"}>
        {children}
      </div>
    </section>
  );
}

export function HackerDesktopIcon({ icon: Icon, label, className = "", active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-28 flex-col items-center gap-2 text-center font-mono text-xs font-black leading-tight text-[#00ff19] drop-shadow-[0_0_7px_rgba(0,255,25,0.72)] transition hover:scale-105 md:text-sm ${className}`}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-md bg-[#00f715] text-black shadow-[0_0_18px_rgba(0,255,25,0.7)] ${active ? "ring-4 ring-white/70" : ""}`}>
        <Icon className="h-8 w-8" strokeWidth={3} />
      </span>
      <span>{label}</span>
    </button>
  );
}
