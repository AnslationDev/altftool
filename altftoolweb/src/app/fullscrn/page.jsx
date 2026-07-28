import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import {
  absoluteUrl,
  createHowToJsonLd,
  createPageMetadata,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import FullscrnClient from "./FullscrnClient";
import FullscrnGuide from "./components/FullscrnGuide";

const PATH = "/fullscrn";

// The old title ("Fullscreen Text Display") matched no query anybody types.
// People look for "big text", "big text on screen" and "fullscreen text",
// and a large share of the demand for this exact tool is the clock/countdown
// side of it — so both intents are in the title and in `keywords`, which this
// route never passed at all.
const TITLE = "Big Text Fullscreen Display – Text, Clock and Timer";
const DESCRIPTION =
  "Show text fullscreen in big letters with your own font size and colours, or display a live clock, stopwatch, countdown or image. Press Cmd/Ctrl + Enter.";
const KEYWORDS = [
  "big text",
  "big text display",
  "fullscreen text",
  "fullscreen text display",
  "large text on screen",
  "big letters on screen",
  "fullscreen clock",
  "fullscreen countdown timer",
  "fullscreen stopwatch",
  "presentation text tool",
];

// Written out on the page by components/FullscrnGuide.jsx, so the HowTo node
// only ever describes steps a reader can actually see.
const HOW_TO_STEPS = [
  "Open the Text tab and type or paste the words you want to show.",
  "Set the font size, alignment, text colour and background colour in the settings panel on the right.",
  "Press Go Fullscreen, or press Cmd + Enter on macOS or Ctrl + Enter on Windows and Linux.",
  "Press Esc to leave fullscreen and return to the editor with your text intact.",
];

export async function generateMetadata() {
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: PATH,
    keywords: KEYWORDS,
  });
}

/**
 * SoftwareApplication node.
 *
 * `featureList` mirrors the capability table in FullscrnGuide.jsx and is read
 * from the implementation, not marketing copy. No rating, review count or
 * install figure is emitted because this route measures none of those.
 */
function createFullscrnJsonLd() {
  const url = absoluteUrl(PATH);

  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name: "Big Text Fullscreen Display",
    description: DESCRIPTION,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements:
      "Requires a modern web browser with JavaScript and the Fullscreen API",
    isAccessibleForFree: true,
    inLanguage: "en",
    featureList: [
      "Typed text shown fullscreen in large letters",
      "Adjustable font size, left/centre/right alignment, text colour and background colour",
      "A picture from your device shown fullscreen, read locally and never uploaded",
      "Live clock with time zone and 12- or 24-hour format",
      "Stopwatch and countdown timer shown fullscreen",
      "Cmd + Enter or Ctrl + Enter to go fullscreen, Esc to exit",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export default function Page() {
  const relatedItems = getRelatedContentForPreset(
    {
      href: PATH,
      title: TITLE,
      description: DESCRIPTION,
      tags: ["fullscreen text", "big text", "presentation tool", "fullscreen clock"],
      section: "experiences",
    },
    "utility",
  );
  return (
    <main>
      <JsonLd
        id="fullscrn-schema"
        data={[
          createFullscrnJsonLd(),
          createHowToJsonLd({
            path: PATH,
            name: "How to display text fullscreen",
            description:
              "Type text into the AltFTool fullscreen display, style it, and send it to the whole screen.",
            steps: HOW_TO_STEPS,
          }),
        ]}
      />
      <FullscrnClient />
      <FullscrnGuide />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </main>
  );
}
