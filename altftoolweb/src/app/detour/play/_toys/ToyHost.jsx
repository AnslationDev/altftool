"use client";

import dynamic from "next/dynamic";

/*
 * Loads one toy on demand.
 *
 * Every toy is client-only (canvas, pointer capture, WebAudio, scroll
 * measurement), so there is nothing useful to render on the server and
 * `ssr: false` avoids a hydration mismatch on the ones that randomise their
 * initial state. `next/dynamic` requires a client component for that flag,
 * which is the whole reason this file exists.
 *
 * The map is static so the bundler can split each toy into its own chunk —
 * a visitor to /detour/play/the-void does not download the circle scorer.
 */

const LOADING = (
  <div
    className="flex min-h-[52vh] items-center justify-center text-sm text-muted-foreground"
    role="status"
  >
    Loading…
  </div>
);

const TOY_COMPONENTS = {
  "perfect-circle": dynamic(() => import("./PerfectCircle"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "bubble-wrap": dynamic(() => import("./BubbleWrap"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "do-nothing": dynamic(() => import("./DoNothing"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "red-button": dynamic(() => import("./RedButton"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "useless-switch": dynamic(() => import("./UselessSwitch"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "scroll-to-the-moon": dynamic(() => import("./ScrollToTheMoon"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "emergency-compliment": dynamic(() => import("./EmergencyCompliment"), {
    ssr: false,
    loading: () => LOADING,
  }),
  "the-void": dynamic(() => import("./TheVoid"), {
    ssr: false,
    loading: () => LOADING,
  }),
};

export default function ToyHost({ slug }) {
  const Toy = TOY_COMPONENTS[slug];
  if (!Toy) return null;
  return <Toy />;
}
