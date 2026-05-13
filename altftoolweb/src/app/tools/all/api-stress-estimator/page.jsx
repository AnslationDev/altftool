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
  const toolPath = `/tools/all/${slug}`;
  const seoContent = buildToolSeoContent(slug, tool);

  return (
    <>
      <JsonLd
        id="tool-schema-api-stress-estimator-all"
        data={[
          createToolJsonLd({ slug, tool, category: "all" }),
          createHowToJsonLd({
            path: toolPath,
            name: `${tool?.name || "API Stress Estimator"} workflow`,
            description: seoContent.summary,
            steps: seoContent.steps,
          }),
          createFaqJsonLd({ path: toolPath, questions: seoContent.faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool?.name || "API Stress Estimator", path: toolPath },
          ]),
        ]}
      />
      <ApiStressToolClient category="all" />
    </>
  );
}
