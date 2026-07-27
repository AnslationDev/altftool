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

export async function generateMetadata() {
  return buildToolMetadata("api-stress-estimator");
}

export default function Page() {
  const slug = "api-stress-estimator";
  const tool = getTool(slug);
  const toolPath = `/tools/developer/${slug}`;
  const seoContent = buildToolSeoContent(slug, tool);

  return (
    <>
      <JsonLd
        id="tool-schema-api-stress-estimator-developer"
        data={[
          createToolJsonLd({ slug, tool, category: "developer" }),
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
      <h1 className="sr-only">API Stress Estimator</h1>
      <ApiStressToolClient category="developer" />
    </>
  );
}
