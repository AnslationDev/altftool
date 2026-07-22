"use client";

import { useEffect, useRef, useState } from "react";

// Auto-fit: if a game's layout is wider than the available area, scale the
// WHOLE game down uniformly (CSS zoom) until it fits — nothing gets cut and
// the game's own files are never modified. On wide screens the scale is
// exactly 1 (pixel-identical). We measure the true painted extent of the
// game's elements, so even content a game clips internally is detected.
//
// Also detects height-bound games (e.g. carrom, minesweeper) and reports a
// boostPx height so the frame can render them at up to their full native
// size instead of leaving empty strips. The default-frame-height and boost
// caps are configurable so different hosts (the main site's GamePlayer vs.
// the full-viewport /embed page) can use different ceilings without any
// change to the measurement logic itself — every consumer gets the exact
// same, already-tested fit behavior.
//
// Spread hostRef/fitRef onto the host and inner wrapper elements; apply the
// returned zoom as a CSS `zoom` style on the inner wrapper and boostPx as an
// optional height override on the host.
export function useAutoFitGame({
  defaultHeightRatio = 0.72,
  defaultHeightCap = 700,
  boostHeightRatio = 0.88,
  boostHeightCap = 820,
} = {}) {
  const hostRef = useRef(null);
  const fitRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [boostPx, setBoostPx] = useState(null);
  const zoomRef = useRef(1);

  useEffect(() => {
    const host = hostRef.current;
    const inner = fitRef.current;
    if (!host || !inner) return;

    let timer = 0;
    let lastRun = 0;

    const measure = () => {
      const hostRect = host.getBoundingClientRect();
      const availW = hostRect.width;
      const availH = hostRect.height;
      if (!availW || !availH) return;

      // Probe at zoom 1 so every measurement happens in one identical, natural
      // scale — stretchy h-full backgrounds can never inflate the numbers and
      // the computed scale stays perfectly stable (no downward drift).
      // The style flip + restore happens synchronously, so nothing flickers.
      const applied = inner.style.zoom;
      inner.style.zoom = "1";

      let left = Infinity;
      let right = -Infinity;
      let top = Infinity;
      let bottom = -Infinity;
      const els = inner.querySelectorAll("*");
      for (let i = 0; i < els.length; i++) {
        const r = els[i].getBoundingClientRect();
        if (!r.width || !r.height) continue;
        // ignore viewport-pinned overlays (position: fixed) — they are not part
        // of the game's layout (only checked for unusually large elements)
        if (
          (r.width > availW * 1.02 || r.height > availH * 1.02) &&
          getComputedStyle(els[i]).position === "fixed"
        ) {
          continue;
        }
        if (r.left < left) left = r.left;
        if (r.right > right) right = r.right;
        if (r.top < top) top = r.top;
        if (r.bottom > bottom) bottom = r.bottom;
      }

      inner.style.zoom = applied; // restore before the browser paints

      if (right <= left || bottom <= top) return;
      const naturalW = Math.min(right - left, 2600);
      const naturalH = Math.min(bottom - top, 2600);

      // If the game is taller than the default frame while width still has
      // room (height-bound), the frame takes EXACTLY the game's height (up to
      // a cap) — the game then renders at full size, flush top and bottom,
      // with no empty strips inside. Width-bound games (chess) and games that
      // already fit are completely unaffected. Decided from intrinsic sizes +
      // constants only, so it never oscillates.
      const defaultH = Math.min(window.innerHeight * defaultHeightRatio, defaultHeightCap);
      const heightBound = availW / naturalW > defaultH / naturalH;
      const wantBoost = heightBound && naturalH > defaultH + 8;
      setBoostPx(
        wantBoost
          ? Math.round(Math.min(naturalH + 8, window.innerHeight * boostHeightRatio, boostHeightCap))
          : null
      );

      // fit BOTH ways: nothing may stick out sideways or below
      let z = Math.min(1, availW / naturalW, availH / naturalH);
      // fine 0.01 steps so games stay as large as possible, with a 1% safety margin
      z = z >= 1 ? 1 : Math.max(0.35, Math.floor(z * 100) / 100 - 0.01);
      if (z !== zoomRef.current) {
        zoomRef.current = z;
        setZoom(z);
      }
    };

    const schedule = () => {
      const now = Date.now();
      if (now - lastRun < 300) {
        clearTimeout(timer);
        timer = setTimeout(measure, 320);
        return;
      }
      lastRun = now;
      measure();
    };

    measure();
    const settle = setTimeout(measure, 400); // second pass after layout settles
    const ro = new ResizeObserver(schedule);
    ro.observe(host);
    const mo = new MutationObserver(schedule); // e.g. minesweeper grid appears after menu
    mo.observe(inner, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      clearTimeout(timer);
      clearTimeout(settle);
    };
    // Intentionally empty: the ratio/cap args are static config passed by the
    // caller, not reactive props — matches the original inline effect, which
    // also ran once per mount of the host/fit elements.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { hostRef, fitRef, zoom, boostPx };
}
