import PixelThoughtMeditation from './meditation/components/PixelThoughtMeditation'
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // Pixel Thoughts is somebody else's live product (pixelthoughts.co, with
    // shipping iOS and Android apps), and its own tagline is "A 60-second
    // meditation tool to help clear your mind" — which this page's H1 and
    // sub-line reproduced word for word. This was not an "alternative" to
    // them; it was a copy carrying their name. So the brand name is now gone
    // from the title, the description and the H1, not softened to
    // "Pixel Thoughts Alternative" to keep the impressions.
    //
    // The page stays indexable because the generic intent underneath the brand
    // query is real and this page genuinely serves it: a 60-second, type-one-
    // worry-and-watch-it-go meditation. That intent is what the copy now
    // targets. The honest cost is the ~270 brand impressions behind
    // "pixel thoughts" (224 imp at position 5.9) — all of which earned zero
    // clicks, so there is close to nothing to lose and no borrowed-name risk.
    //
    // 38 chars authored, 49 rendered with the layout's " | AltFTool" suffix.
    title: "60-Second Meditation to Let a Worry Go",
    // Every claim verified against meditation/hooks/useMeditationSession.js:
    // the timer is 60,000 ms, the star shrinks then vanishes, and the typed
    // thought lives in React state only — no fetch, no localStorage, nothing
    // persisted. That last point is the real differentiator for a page that
    // asks you to type an anxiety into a box, so it earns snippet space.
    //
    // 145 chars. The previous string was 166 and trimMetaDescription's 160-char
    // cap silently cut it at the first sentence boundary past index 80, so the
    // live snippet lost the whole "free, no signup, never stored" half — the
    // only part that gave a reason to click. Keep this under 160.
    description:
      "Type the worry that's on your mind, watch it shrink into a star and disappear over 60 seconds. Free, no signup, nothing you type leaves the page.",
    path: "/pixel-thought",
  });
}

export default function PixelThoughtPage() {
  return <PixelThoughtMeditation />
}
