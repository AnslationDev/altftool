import Hero from "./components/Hero";
import PromptExplorer from "./components/PromptExplorer";
import { getPromptCards, getPromptCategories } from "../data/service";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createPageMetadata,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
} from "@/platform/seo/generateMetadata";

// The previous string ran to 189 characters, so trimMetaDescription cut it at
// the last sentence break and the clipboard promise — the one thing that
// separates this page from every other prompt gallery — never reached a SERP
// snippet. 156 characters at today's count, which passes through verbatim.
const DESCRIPTION = `Browse ${getPromptCards().length} Seedream 5 Pro prompt examples. Copy natural-language, production-ready prompts for photorealistic AI image generation straight to your clipboard.`;

export async function generateMetadata() {
  return createPageMetadata({
    title: "Seedream 5 Pro Prompts – Copy-Ready Library",
    description: DESCRIPTION,
    path: "/prompts/seedream-5-pro",
  });
}

export default function Page() {
  const prompts = getPromptCards();
  const categories = getPromptCategories();

  return (
    <>
      <JsonLd
        id="seedream-prompts-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/prompts/seedream-5-pro",
            name: "Seedream 5 Pro Prompt Collections",
            description: DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Prompts", path: "/prompts/seedream-5-pro" },
            { name: "Seedream 5 Pro", path: "/prompts/seedream-5-pro" },
          ]),
        ]}
      />
      <main className="min-h-screen bg-(--color-background)">
        <Hero />
        <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <PromptExplorer prompts={prompts} categories={categories} />
        </div>
      </main>
    </>
  );
}
