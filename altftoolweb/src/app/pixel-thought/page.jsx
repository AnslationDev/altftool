import PixelThoughtMeditation from './meditation/components/PixelThoughtMeditation'
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // GSC 7-day: 324 impressions, 1 click, position 6.9 — and 270 of those
    // impressions are people typing the Pixel Thoughts brand ("pixel thoughts"
    // 224 imp at 5.9, plus "pixel thought"/"pixelthoughts"/"pixelthought"),
    // all of which earned zero clicks. The old title read like a second copy of
    // the result they were already looking at, and the old description called
    // the page "Pixel Thought on AltFTool" as if the name were ours.
    //
    // Leading with "60-Second Meditation" targets the generic intent nothing on
    // this site currently owns, and "Pixel Thoughts Alternative" is an honest
    // label that keeps term relevance without claiming to be them. Rendered
    // title is exactly 60 chars with the layout's " | AltFTool" suffix.
    title: "60-Second Meditation — Pixel Thoughts Alternative",
    // Verified against meditation/hooks/useMeditationSession.js: the timer runs
    // 60,000 ms, the star shrinks then vanishes, and the typed thought lives in
    // React state only — no fetch, no localStorage, nothing persisted. That
    // last point is the real differentiator for a page where you type an
    // anxiety into a box, so it earns its place in the snippet.
    description:
      "Type the worry on your mind, watch it shrink into a star and vanish over 60 seconds. Free, no signup, and your words stay in the page — never stored, never sent to us.",
    path: "/pixel-thought",
  });
}

export default function PixelThoughtPage() {
  return <PixelThoughtMeditation />
}
