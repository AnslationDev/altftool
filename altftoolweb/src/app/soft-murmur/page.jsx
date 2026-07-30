import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { ambientSounds } from "./data/ambientSounds";
import { softMurmurFaqs } from "./data/faqs";
import PageView from "./PageView";

const PATH = "/soft-murmur";

// Both nodes read the arrays the mixer itself renders. Every sound in
// `ambientSounds` gets a row in the mixer drawer (unavailable ones are drawn
// and labelled "Unavailable"), and each row carries the matching
// `#sound-<id>` anchor these URLs point at.
const soundItems = ambientSounds.map((sound) => ({
  name: sound.name,
  path: `${PATH}#sound-${sound.id}`,
}));

export async function generateMetadata() {
  return createPageMetadata({
    title: "Soft Murmur – Ambient Sound Mixer",
    description:
      "Mix ambient background sounds like rain, waves, wind, and white noise to create your own calming soundscape for focus, relaxation, and sleep.",
    path: "/soft-murmur",
  });
}

export default function Page(props) {
  const relatedItems = getRelatedContentForPreset(
    {
      href: "/soft-murmur",
      title: "Soft Murmur – Ambient Sound Mixer",
      description:
        "Mix ambient background sounds like rain, waves, wind, and white noise to create your own calming soundscape for focus, relaxation, and sleep.",
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
          createFaqJsonLd({ path: PATH, questions: softMurmurFaqs }),
          createItemListJsonLd({
            path: PATH,
            name: "Ambient sounds in the AltFTool Ambient Sound Mixer",
            items: soundItems,
          }),
        ]}
      />
      <PageView {...props} />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </>
  );
}
