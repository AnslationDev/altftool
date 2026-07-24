import { StudioShell } from "../components/studio/studio-shell";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AI Prompt Studio - Generate and Optimize Prompts",
  description: "Generate, score and optimize AI prompts across 30+ tools and 100+ categories.",
  path: "/imgprompt/studio",
  keywords: ["AI prompt generator", "prompt optimizer", "image prompts", "video prompts"],
  pageType: "ai-prompt-tool",
});

export default function StudioLayout({ children }) {
  return <StudioShell>{children}</StudioShell>;
}
