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
        id="tool-schema-api-stress-estimator-developer"
        data={[
          createToolJsonLd({ slug, tool, category: "developer" }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: "Developer", path: "/tools/developer" },
            { name: tool?.name || "API Stress Estimator", path: `/tools/developer/${slug}` },
          ]),
        ]}
      />
      <ApiStressToolClient category="developer" />
    </>
  );
}
