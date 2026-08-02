import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CALCULATORS } from "./toolsData";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free Online Calculators — Finance, Health & Math",
    description:
      "A fast, fully private suite of 100+ free online calculators for loan and EMI, compound interest, BMI, percentage, unit conversion, date and time, and more.",
    path: "/altfcalculators",
  });
}

export default function Page(props) {
  // The hub listed every tool on screen but described itself to a crawler as an
  // undifferentiated page — no CollectionPage, no ItemList — while its own
  // /altfcalculators/[toolSlug] detail routes have emitted SoftwareApplication and
  // BreadcrumbList all along. The item list is built from CALCULATORS in
  // ./toolsData, the same array the detail routes resolve against, so the
  // markup cannot drift from what the page actually links to.
  const items = CALCULATORS.map((tool) => ({
    name: tool.name,
    path: `/altfcalculators/${tool.slug}`,
    description: tool.desc,
  }));

  return (
    <>
      <JsonLd
        id="altfcalculators-hub-schema"
        data={[
          createCollectionPageJsonLd({
            name: "Free Online Calculators",
            description: "Every calculator on AltFTool, grouped by finance, health, math, unit conversion and date and time.",
            path: "/altfcalculators",
          }),
          createItemListJsonLd({ path: "/altfcalculators", items }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Free Online Calculators", path: "/altfcalculators" },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
