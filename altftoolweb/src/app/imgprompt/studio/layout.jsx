import { StudioShell } from "../components/studio/studio-shell";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AI Prompt Studio - Generate and Optimize Prompts",
  // 77 characters previously — over the 70 floor but using less than half a
  // mobile snippet. Every number here is counted from this section's own data:
  // NAV_ITEMS_BY_SLUG holds 60 entries (52 indexable), the categories seed
  // expands 131 entries, and models.js exports 12 (7 image + 5 video).
  description:
    "Draft and adapt prompts for images, video and stories using the tools, categories and model templates available in Imaginnex Studio.",
  path: "/imgprompt/studio",
  keywords: ["AI prompt generator", "prompt optimizer", "image prompts", "video prompts"],
  pageType: "ai-prompt-tool",
});

export default function StudioLayout({ children }) {
  return <StudioShell>{children}</StudioShell>;
}
