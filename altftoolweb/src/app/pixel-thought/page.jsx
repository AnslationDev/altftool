import PixelThoughtMeditation from './meditation/components/PixelThoughtMeditation'
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

const PATH = "/pixel-thought";
// The entity name is the first clause of the title only. "Pixel Thoughts
// Alternative" is a positioning label aimed at the brand query the metadata
// comment below documents — it is not the name of this application, and a
// SoftwareApplication called "… Alternative" would be a claim about someone
// else's product rather than a name for ours.
const NAME = "60-Second Meditation";
const DESCRIPTION =
  "Type the worry on your mind, watch it shrink into a star and vanish over 60 seconds. Free, no signup, and your words stay in the page — never stored, never sent to us.";

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
    title: `${NAME} — Pixel Thoughts Alternative`,
    // Verified against meditation/hooks/useMeditationSession.js: the timer runs
    // 60,000 ms, the star shrinks then vanishes, and the typed thought lives in
    // React state only — no fetch, no localStorage, nothing persisted. That
    // last point is the real differentiator for a page where you type an
    // anxiety into a box, so it earns its place in the snippet.
    description: DESCRIPTION,
    path: PATH,
  });
}

export default function PixelThoughtPage() {
  return (
    <>
      {/*
        WebApplication (via createToolJsonLd) + BreadcrumbList. This is one
        interactive exercise on one URL, not a listing and not a game: the
        meditation hook runs a fixed 60,000 ms timer with no score, objective or
        win state (meditation/hooks/useMeditationSession.js), so VideoGame would
        be the wrong entity.

        No HowTo node. The interaction is one input and one wait — a HowTo would
        be manufactured steps for something the page does not present as a
        procedure.
      */}
      <JsonLd
        id="pixel-thought-schema"
        data={[
          createToolJsonLd({
            slug: "pixel-thought",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Mindfulness", "Wellbeing", "Focus"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: NAME, path: PATH },
          ]),
        ]}
      />
      <PixelThoughtMeditation />
    </>
  )
}
