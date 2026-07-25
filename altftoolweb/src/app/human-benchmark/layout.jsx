import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AltF Reflex Lab | Reaction, Memory and Typing Tests",
  description: "Practice reaction time, memory, typing, aim, and visual sequence challenges with private local score history.",
  path: "/human-benchmark",
  keywords: ["reaction time test", "memory test", "typing test", "human benchmark"],
  pageType: "interactive-experience",
});

export default function ReflexLabLayout({ children }) {
  const relatedItems = getRelatedContentForPreset(
    {
      href: "/human-benchmark",
      title: "AltF Reflex Lab | Reaction, Memory and Typing Tests",
      description:
        "Practice reaction time, memory, typing, aim, and visual sequence challenges with private local score history.",
      tags: ["reaction time test", "memory test", "typing test", "human benchmark"],
      section: "experiences",
    },
    "utility",
  );
  return (
    <>
      {children}
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </>
  );
}
