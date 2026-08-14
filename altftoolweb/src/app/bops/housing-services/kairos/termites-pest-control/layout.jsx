import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Kairos Fictional Pest-Service UI Preview",
  description:
    "Explore a fictional, non-operational pest-service interface preview within the ALTFTool Business Ops gallery.",
  path: "/bops/housing-services/kairos/termites-pest-control",
  canonical: "/bops/housing-services/kairos",
  noindex: true,
  follow: true,
  pageType: "business-ops-preview",
});

export default function KairosTermiteLayout({ children }) {
  return children;
}
