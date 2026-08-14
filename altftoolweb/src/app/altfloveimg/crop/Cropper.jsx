"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Interactive crop overlay. Emits crop rect in *source pixel* coordinates.
 * rect state is kept in displayed pixels for smooth dragging.
 */
export default function Cropper({ src, naturalW, naturalH, ratio, onChange }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const [disp, setDisp] = useState({ w: 0, h: 0 });
  const [rect, setRect] = useState(null); // {x,y,w,h} in displayed px
  const drag = useRef(null);

  const measure = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDisp({ w: r.width, h: r.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, src]);

  // initialize / reset crop box whenever display size or ratio changes
  useEffect(() => {
    if (!disp.w || !disp.h) return;
    let w = disp.w * 0.8;
    let h = disp.h * 0.8;
    if (ratio) {
      // fit a ratio box inside 80% area
      if (w / h > ratio) w = h * ratio;
      else h = w / ratio;
    }
    setRect({ x: (disp.w - w) / 2, y: (disp.h - h) / 2, w, h });
  }, [disp.w, disp.h, ratio]);

  // report source-space crop whenever rect changes
  useEffect(() => {
    if (!rect || !disp.w) return;
    const scale = naturalW / disp.w;
    onChange?.({
      x: Math.round(rect.x * scale),
      y: Math.round(rect.y * scale),
      width: Math.round(rect.w * scale),
      height: Math.round(rect.h * scale),
    });
  }, [rect, disp.w, naturalW, onChange]);

  const clampRect = useCallback(
    (r) => {
      const minW = 20;
      let { x, y, w, h } = r;
      w = Math.max(minW, w);
      h = Math.max(minW, h);
      if (ratio) h = w / ratio;
      x = Math.max(0, Math.min(x, disp.w - w));
      y = Math.max(0, Math.min(y, disp.h - h));
      if (x + w > disp.w) w = disp.w - x;
      if (y + h > disp.h) h = disp.h - y;
      if (ratio) {
        // keep ratio after clamp
        if (w / h > ratio) w = h * ratio;
        else h = w / ratio;
      }
      return { x, y, w, h };
    },
    [disp, ratio]
  );

  // Keyboard equivalent of the pointer-drag move/resize above: each arrow-key
  // press nudges the box (or the given handle) by STEP px, Shift for a
  // larger step, so the crop region is fully operable without a pointer.
  const nudge = useCallback(
    (mode, dx, dy) => {
      setRect((prev) => {
        if (!prev) return prev;
        let r = { ...prev };
        if (mode === "move") {
          r.x = Math.max(0, Math.min(prev.x + dx, disp.w - r.w));
          r.y = Math.max(0, Math.min(prev.y + dy, disp.h - r.h));
          return r;
        }
        if (mode.includes("e")) r.w = prev.w + dx;
        if (mode.includes("s")) r.h = prev.h + dy;
        if (mode.includes("w")) { r.w = prev.w - dx; r.x = prev.x + dx; }
        if (mode.includes("n")) { r.h = prev.h - dy; r.y = prev.y + dy; }
        if (ratio) {
          r.h = r.w / ratio;
          if (mode.includes("n")) r.y = prev.y + (prev.h - r.h);
        }
        return clampRect(r);
      });
    },
    [disp, ratio, clampRect]
  );

  const onKeyDownMode = (e, mode) => {
    const step = e.shiftKey ? 24 : 8;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;
    e.preventDefault();
    nudge(mode, dx, dy);
  };

  const onPointerDown = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    drag.current = { mode, startX, startY, base: { ...rect } };
    const move = (ev) => {
      const dx = ev.clientX - drag.current.startX;
      const dy = ev.clientY - drag.current.startY;
      const b = drag.current.base;
      let r = { ...b };
      if (mode === "move") {
        r.x = b.x + dx;
        r.y = b.y + dy;
        r.x = Math.max(0, Math.min(r.x, disp.w - r.w));
        r.y = Math.max(0, Math.min(r.y, disp.h - r.h));
        setRect(r);
        return;
      }
      // resize handles
      if (mode.includes("e")) r.w = b.w + dx;
      if (mode.includes("s")) r.h = b.h + dy;
      if (mode.includes("w")) { r.w = b.w - dx; r.x = b.x + dx; }
      if (mode.includes("n")) { r.h = b.h - dy; r.y = b.y + dy; }
      if (ratio) {
        // derive height from width for ratio, anchor sensibly
        r.h = r.w / ratio;
        if (mode.includes("n")) r.y = b.y + (b.h - r.h);
      }
      setRect(clampRect(r));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  const handleStyle = (pos) => {
    const map = {
      nw: { left: -6, top: -6, cursor: "nwse-resize" },
      n: { left: "50%", top: -6, marginLeft: -6, cursor: "ns-resize" },
      ne: { right: -6, top: -6, cursor: "nesw-resize" },
      e: { right: -6, top: "50%", marginTop: -6, cursor: "ew-resize" },
      se: { right: -6, bottom: -6, cursor: "nwse-resize" },
      s: { left: "50%", bottom: -6, marginLeft: -6, cursor: "ns-resize" },
      sw: { left: -6, bottom: -6, cursor: "nesw-resize" },
      w: { left: -6, top: "50%", marginTop: -6, cursor: "ew-resize" },
    };
    return map[pos];
  };

  return (
    <div ref={wrapRef} className="relative inline-block select-none" style={{ lineHeight: 0 }}>
      <img
        ref={imgRef}
        src={src}
        alt="crop"
        onLoad={measure}
        draggable={false}
        className="block max-h-[460px] max-w-full"
      />
      {rect && (
        <>
          {/* dim overlay */}
          <div className="pointer-events-none absolute inset-0" style={{
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.45)`,
            display: "none",
          }} />
          <div
            className="absolute"
            style={{
              left: rect.x, top: rect.y, width: rect.w, height: rect.h,
              outline: "9999px solid rgba(0,0,0,0.45)",
              cursor: "move",
            }}
            onPointerDown={(e) => onPointerDown(e, "move")}
            tabIndex={0}
            role="button"
            aria-label="Crop area. Drag to move, or use arrow keys (hold Shift for larger steps)."
            onKeyDown={(e) => onKeyDownMode(e, "move")}
          >
            <div className="absolute inset-0 border-2" style={{ borderColor: "var(--ali-teal)" }}>
              {/* rule-of-thirds */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/40" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/40" />
                <div className="absolute top-1/3 left-0 w-full h-px bg-white/40" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-white/40" />
              </div>
            </div>
            {handles.map((pos) => (
              <span
                key={pos}
                onPointerDown={(e) => onPointerDown(e, pos)}
                className="absolute h-3 w-3 rounded-full border-2 bg-white"
                style={{ borderColor: "var(--ali-teal)", ...handleStyle(pos) }}
                tabIndex={0}
                role="button"
                aria-label={`Resize crop area from the ${pos} handle. Use arrow keys (hold Shift for larger steps).`}
                onKeyDown={(e) => onKeyDownMode(e, pos)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
