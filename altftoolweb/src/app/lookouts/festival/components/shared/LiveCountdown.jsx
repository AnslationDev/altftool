"use client";

import useCountdown from "../../hooks/useCountdown";

// Renders just the countdown-item pills (no wrapping flex container) so
// callers can drop a bookmark button into the same `.countdown` row
// alongside it, matching the design's single-row layout.
//
// Every value here is derived from the current clock, so the HTML rendered on
// the server is necessarily a few hundred ms (or more, with ISR) staler than
// the client's first render — the seconds pill effectively never matches.
// `suppressHydrationWarning` keeps the server's snapshot as the first paint
// instead of erroring on the diff; useCountdown re-reads the clock on mount,
// so the displayed values are corrected immediately after hydration.
export function LiveCountdown({ targetIso }) {
  const { days, hours, minutes, seconds } = useCountdown(targetIso);

  return (
    <>
      <div className="countdown-item">
        <span suppressHydrationWarning>{String(days).padStart(2, "0")}</span>
        <label>Days</label>
      </div>
      <div className="countdown-item">
        <span suppressHydrationWarning>{String(hours).padStart(2, "0")}</span>
        <label>Hrs</label>
      </div>
      <div className="countdown-item">
        <span suppressHydrationWarning>{String(minutes).padStart(2, "0")}</span>
        <label>Min</label>
      </div>
      <div className="countdown-item countdown-item--seconds">
        <span suppressHydrationWarning>{String(seconds).padStart(2, "0")}</span>
        <label>Sec</label>
      </div>
    </>
  );
}

export function CompactCountdown({ targetIso }) {
  const { days, isPast } = useCountdown(targetIso);

  return (
    <div className="festival-card-days">
      <span suppressHydrationWarning>{isPast ? "0" : days}</span>
      <label>days</label>
    </div>
  );
}
