import HeroSection from "./components/HeroSection";
import IntentSelector from "./components/IntentSelector";
import AiAssistantBox from "@/platform/assistant/AiAssistantBox";
import CategoriesSection from "./components/CategoriesSection";
import FAQSection, { faqs } from "./components/FAQSection";
import TrendingSection from "./components/TrendingSection";
import JsonLd from "@/platform/seo/JsonLd";
import { createFaqJsonLd, createPageMetadata } from "@/platform/seo/generateMetadata";

// Evergreen and free of dynamic APIs — no cookies(), headers(), searchParams
// or fetch — so it can be served from the edge. Without this the root layout's
// `await connection()` opts it out of caching and every view pays origin TTFB:
// ~227 ms at the median against ~47 ms for routes CloudFront already holds.
//
// Scoped deliberately to this one route. Deleting the layout's connection()
// instead would make roughly 339 static routes prerender at build time, about
// 237 MiB of artifact against a 184 MiB gate — which is why that line exists.
export const dynamic = "force-static";
export const revalidate = 86400;


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
      {/* Sourced from the same `faqs` array FAQSection renders, so the markup
          and the visible copy cannot drift apart. */}
      <JsonLd id="home-faq-schema" data={createFaqJsonLd({ path: "/", questions: faqs })} />
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
