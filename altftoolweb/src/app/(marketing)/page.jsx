import HeroSection from "./components/HeroSection";
import IntentSelector from "./components/IntentSelector";
import AiAssistantBox from "@/platform/assistant/AiAssistantBox";
import CategoriesSection from "./components/CategoriesSection";
import FAQSection from "./components/FAQSection";
import TrendingSection from "./components/TrendingSection";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool - Online Tools, Workflows, Apps & Practical Guides",
    description:
      "Search AltFTool for browser utilities, product workspaces, automation templates, apps, business services, deals, guides, and interactive labs.",
    path: "/",
    keywords: [
      "online tools",
      "browser tools",
      "workflow templates",
      "productivity apps",
      "business services",
      "AltFTool",
    ],
  });
}

export default function Page() {
  return (
    <main className="bg-background text-foreground">
      <HeroSection />
      <IntentSelector />
      <div className="border-b border-border bg-background pt-10 sm:pt-12">
        <AiAssistantBox />
      </div>
      <div className="render-deferred">
        <TrendingSection />
      </div>
      <div className="render-deferred">
        <CategoriesSection />
      </div>
      <div className="render-deferred">
        <FAQSection />
      </div>
    </main>
  );
}
