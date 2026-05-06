import ApiStressToolClient from "../../[category]/[slug]/ApiStressToolClient";
import { buildToolMetadata, getTool } from "../../toolRouteUtils";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return buildToolMetadata("api-stress-estimator");
}

export default function Page() {
  const slug = "api-stress-estimator";
  const tool = getTool(slug);

  return (
    <>
      <JsonLd
        id="tool-schema-api-stress-estimator-all"
        data={[
          createToolJsonLd({ slug, tool, category: "all" }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool?.name || "API Stress Estimator", path: `/tools/all/${slug}` },
          ]),
        ]}
      />
      <ApiStressToolClient category="all" />
    </>
  );
}
