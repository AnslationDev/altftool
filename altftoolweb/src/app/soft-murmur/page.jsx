import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

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
      <PageView {...props} />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </>
  );
}
