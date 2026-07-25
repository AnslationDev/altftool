import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import FullscrnClient from "./FullscrnClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Fullscreen Text Display",
    description:
      "Type text and display it fullscreen with custom font size, colors, and alignment. A simple distraction-free fullscreen text and presentation tool.",
    path: "/fullscrn",
  });
}

export default function Page() {
  const relatedItems = getRelatedContentForPreset(
    {
      href: "/fullscrn",
      title: "Fullscreen Text Display",
      description:
        "Type text and display it fullscreen with custom font size, colors, and alignment. A simple distraction-free fullscreen text and presentation tool.",
      tags: ["fullscreen text", "presentation tool", "text display"],
      section: "experiences",
    },
    "utility",
  );
  return (
    <main>
      <FullscrnClient />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </main>
  );
}