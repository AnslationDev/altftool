import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import {
  absoluteUrl,
  createFaqJsonLd,
  createPageMetadata,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import PageView from "./PageView";
import { ambientSounds, presetMixes } from "./data/ambientSounds";
import { softMurmurSchemaFaqs } from "./data/pageFaqs";

const PATH = "/soft-murmur";

// The route slug stays /soft-murmur, but nobody searches for "soft murmur" —
// they search for an ambient sound mixer, rain sounds or white noise. The title
// therefore leads with the query and keeps the product name as an alternate
// name in the JSON-LD below.
//
// This block used to live (unused) in layout.jsx: a page segment's metadata
// overrides its layout's, so the layout copy never reached a single <head>.
// Keep the canonical metadata here, in the deepest segment.
const TITLE = "Ambient Sound Mixer for Focus, Sleep and Study";
const DESCRIPTION =
  "Mix rain, thunder, waves, wind, fire, birds, coffee-shop noise, a singing bowl and white noise into one ambient soundscape for focus, sleep and study.";
const KEYWORDS = [
  "ambient sound mixer",
  "relaxing sounds",
  "rain sounds",
  "white noise",
  "sleep sounds",
  "focus sounds",
  "study sounds",
  "meditation sounds",
  "nature sound mixer",
  "background noise generator",
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
 * SoftwareApplication node for the mixer.
 *
 * Every claim in `featureList` is read from this route's own code: the sound
 * and preset counts come from data/ambientSounds.js, flow mode and the
 * 15-second fade from hooks/useAmbientAudio.js, saving from
 * hooks/useLocalMixes.js and sharing from components/ShareMixModal.jsx. There
 * are no ratings, review counts or install numbers here because none exist.
 */
function createMixerJsonLd() {
  const url = absoluteUrl(PATH);

  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name: "Ambient Sound Mixer",
    alternateName: "Soft Murmur",
    description: DESCRIPTION,
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    browserRequirements:
      "Requires a modern web browser with JavaScript and Web Audio support",
    isAccessibleForFree: true,
    inLanguage: "en",
    featureList: [
      `${ambientSounds.length} ambient sounds with an individual volume slider each: ${ambientSounds
        .map((sound) => sound.name)
        .join(", ")}`,
      `${presetMixes.length} one-tap preset mixes`,
      "Flow mode, which slowly varies the volume of every active sound while it plays",
      "Sleep timer with an optional fade to silence over the final 15 seconds",
      "Mixes saved in this browser only, with no account",
      "Share a mix as a link that reloads the same sounds and volumes",
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

export default function Page(props) {
  const relatedItems = getRelatedContentForPreset(
    {
      href: PATH,
      title: TITLE,
      description: DESCRIPTION,
      tags: ["ambient sound mixer", "white noise", "focus", "relaxation", "sleep"],
      section: "experiences",
    },
    "utility",
  );
  return (
    <>
      <JsonLd
        id="soft-murmur-schema"
        data={[
          createMixerJsonLd(),
          // Every question below is rendered by components/FAQSection.jsx.
          createFaqJsonLd({ path: PATH, questions: softMurmurSchemaFaqs }),
        ]}
      />
      <PageView {...props} />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </>
  );
}
