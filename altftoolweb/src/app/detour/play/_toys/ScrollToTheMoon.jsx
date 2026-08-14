"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Turns scrolling into distance and tells you what you have just passed.
 *
 * Distance is cumulative absolute delta rather than scroll position, so
 * scrolling back up still counts. That is the difference between a page you
 * scroll once and a page people fight with — and it means the far milestones
 * are actually reachable by someone determined.
 *
 * Scale is one pixel to one metre. It is arbitrary, but it puts Everest inside
 * a stubborn minute and the Kármán line inside a stubborn afternoon, which is
 * the right shape for the joke.
 */

const LANDMARKS = [
  { at: 1.8, name: "a person" },
  { at: 5.5, name: "a giraffe" },
  { at: 30, name: "a blue whale, nose to tail" },
  { at: 93, name: "the Statue of Liberty" },
  { at: 169, name: "the Washington Monument" },
  { at: 330, name: "the Eiffel Tower" },
  { at: 828, name: "the Burj Khalifa" },
  { at: 1_000, name: "a kilometre" },
  { at: 3_800, name: "the deepest point of the average ocean" },
  { at: 8_849, name: "the summit of Everest" },
  { at: 10_935, name: "the Mariana Trench, if you went down instead" },
  { at: 11_000, name: "cruising altitude" },
  { at: 41_419, name: "Felix Baumgartner's jump" },
  { at: 100_000, name: "the Kármán line — you are technically in space" },
  { at: 408_000, name: "the International Space Station" },
  { at: 2_000_000, name: "the outer edge of low Earth orbit" },
  { at: 35_786_000, name: "geostationary orbit" },
  { at: 384_400_000, name: "the Moon. Genuinely. Well done." },
];

function formatDistance(metres) {
  if (metres < 1_000) return `${metres.toFixed(1)} m`;
  if (metres < 1_000_000) return `${(metres / 1_000).toFixed(2)} km`;
  return `${(metres / 1_000).toLocaleString("en-GB", {
    maximumFractionDigits: 0,
  })} km`;
}

export default function ScrollToTheMoon() {
  const [distance, setDistance] = useState(0);
  const lastY = useRef(null);
  const totalRef = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    let frame = null;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = Math.abs(y - (lastY.current ?? y));
      lastY.current = y;
      totalRef.current += delta;

      // rAF-throttled: the listener itself must stay cheap or the page it is
      // measuring becomes the thing that makes scrolling feel bad.
      if (frame === null) {
        frame = requestAnimationFrame(() => {
          frame = null;
          setDistance(totalRef.current);
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const passed = LANDMARKS.filter((l) => distance >= l.at);
  const latest = passed[passed.length - 1];
  const next = LANDMARKS.find((l) => distance < l.at);
  const progress = next
    ? Math.min(100, ((distance - (latest?.at ?? 0)) / (next.at - (latest?.at ?? 0))) * 100)
    : 100;

  return (
    <>
      {/* Sticky readout. The page below it exists purely to be scrolled. */}
      <div className="sticky top-20 z-10 mx-auto max-w-lg rounded-2xl border border-border bg-card/95 p-6 text-center backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Distance scrolled
        </p>
        <p
          className="mt-2 font-mono text-4xl font-bold tabular-nums sm:text-5xl"
          style={{ color: "var(--dtr-accent)" }}
        >
          {formatDistance(distance)}
        </p>

        <p className="mt-4 min-h-10 text-balance text-sm" aria-live="polite">
          {latest ? (
            <>
              You have passed <strong className="font-semibold">{latest.name}</strong>.
            </>
          ) : (
            "Start scrolling."
          )}
        </p>

        {next ? (
          <div className="mt-4">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress to ${next.name}`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-150"
                style={{ width: `${progress}%`, background: "var(--dtr-accent)" }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Next: {next.name} at {formatDistance(next.at)}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            There is nothing left to pass. Go outside.
          </p>
        )}
      </div>

      {/* The runway. Tall, cheap to render, and marked so scrolling feels like
          movement rather than like nothing happening. */}
      <div className="relative mx-auto mt-10 w-full max-w-lg" aria-hidden="true">
        {Array.from({ length: 90 }, (_, index) => (
          <div
            key={index}
            className="flex h-24 items-center justify-center border-t border-dashed border-border/60"
          >
            <span className="font-mono text-[10px] text-muted-foreground/50">
              {(index + 1) * 100} m
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
