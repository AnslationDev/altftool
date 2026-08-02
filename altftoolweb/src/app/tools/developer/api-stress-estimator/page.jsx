import ApiStressToolClient from "../../[category]/[slug]/ApiStressToolClient";
import { buildToolMetadata, getTool } from "../../toolRouteUtils";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { buildToolSeoContent } from "../../toolSeoContent";
import ToolSeoSection from "../../ToolSeoSection";

export async function generateMetadata() {
  return buildToolMetadata("api-stress-estimator");
}

export default function Page() {
  const slug = "api-stress-estimator";
  const tool = getTool(slug);
  // Both @id and url must agree with the canonical this page actually emits.
  // buildToolMetadata canonicalises every tool to /tools/all/<slug>, so a
  // toolPath under /tools/developer made the entity, its HowTo and its FAQPage
  // all claim a URL the page itself says is not canonical. The dynamic route at
  // [category]/[slug] was fixed for exactly this and carries a comment about it,
  // but a static path segment shadows the dynamic one, so this hardcoded copy —
  // which exists to guarantee prerendering for this tool, and does produce HTML
  // under both paths — never picked the fix up.
  const toolPath = `/tools/all/${slug}`;
  const seoContent = buildToolSeoContent(slug, tool);

  return (
    <>
      <JsonLd
        id="tool-schema-api-stress-estimator-developer"
        data={[
          createToolJsonLd({ slug, tool, category: "all" }),
          // Only tools with real per-tool steps/FAQs emit HowTo/FAQPage.
          // Templated fallback copy is shared across ~1,900 URLs, and Google
          // requires this markup to be unique to the page.
          seoContent.hasCuratedSteps
            ? createHowToJsonLd({
              path: toolPath,
              name: `${tool?.name || "API Stress Estimator"} workflow`,
              description: seoContent.summary,
              steps: seoContent.steps,
            })
            : null,
          seoContent.hasCuratedFaqs
            ? createFaqJsonLd({ path: toolPath, questions: seoContent.faqs })
            : null,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Developer", path: "/tools/developer" },
            { name: tool?.name || "API Stress Estimator", path: toolPath },
          ]),
        ]}
      />
      {/* Nested so ToolDetailChrome renders it inside <main> — see
          tools/[category]/[slug]/page.jsx for why. */}
      <ApiStressToolClient tool={tool} category="developer">
        <ToolSeoSection slug={slug} tool={tool} category="developer" />
      </ApiStressToolClient>
    </>
  );
}
