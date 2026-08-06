import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { FAQS, TOOL_CATEGORIES, TOTAL_TOOLS } from "./data/tools";
import FreeAiToolsLanding from "./components/FreeAiToolsLanding";
import "./free-ai-tool.css";

const PAGE_DESCRIPTION = `Discover ${TOTAL_TOOLS}+ hand-picked free AI tools across ${TOOL_CATEGORIES.length} categories — image generation, video, writing, voice, music, coding, SEO, and more. Compare and open the best free AI tools in one place.`;

export async function generateMetadata() {
  return createPageMetadata({
    title: `Free AI Tools – ${TOTAL_TOOLS}+ Best Free AI Tools by Category`,
    description: PAGE_DESCRIPTION,
    path: "/lookouts/free-ai-tool",
    keywords: [
      "free AI tools",
      "best free AI tools",
      "AI tools directory",
      "free AI image generator",
      "free AI video generator",
      "free AI writing tools",
      "AltFTool AI",
    ],
  });
}

function createFreeAiToolJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/lookouts/free-ai-tool")}#webpage`,
    name: "Free AI Tools",
    url: absoluteUrl("/lookouts/free-ai-tool"),
    description: PAGE_DESCRIPTION,
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

function createCategoryListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl("/lookouts/free-ai-tool")}#categories`,
    name: "Free AI Tool Categories",
    numberOfItems: TOOL_CATEGORIES.length,
    itemListElement: TOOL_CATEGORIES.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.label,
      url: `${absoluteUrl("/lookouts/free-ai-tool")}#explore`,
    })),
  };
}

function createFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/lookouts/free-ai-tool")}#faq`,
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export default function FreeAiToolPage() {
  return (
    <>
      <JsonLd
        id="altftool-free-ai-tool-schema"
        data={[
          createFreeAiToolJsonLd(),
          createCategoryListJsonLd(),
          createFaqJsonLd(),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "Lookouts", path: "/lookouts" },
            { name: "Free AI Tools", path: "/lookouts/free-ai-tool" },
          ]),
        ]}
      />
      <FreeAiToolsLanding />
    </>
  );
}
