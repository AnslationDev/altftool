
"use client";

import { Maximize2 } from "lucide-react";
import { openFullscreen } from "../../lib/fullscreen";
import { panelClass, secondaryButton } from "../../components/uiClasses";

export function CanvasTool({ canvasRef, title, children, className = "" }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
      <section className={panelClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={() => openFullscreen(canvasRef)} className={secondaryButton}><Maximize2 className="h-4 w-4" />Fullscreen</button>
        </div>
        <canvas ref={canvasRef} className={`h-[62vh] min-h-[430px] w-full rounded-2xl border border-white/10 bg-black ${className}`} />
      </section>
      <aside className={`${panelClass} h-fit`}>
        <h3 className="mb-4 text-lg font-black">Controls</h3>
        <div className="grid gap-4">{children}</div>
      </aside>
    </div>
  );
}

export function Range({ label, value, setValue, min, max }) {
  return (
    <label className="block">
      <span className="mb-2 flex justify-between text-sm font-black text-slate-200"><span>{label}</span><span>{value}</span></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => setValue(Number(event.target.value))} className="w-full accent-indigo-400" />
    </label>
  );
}
