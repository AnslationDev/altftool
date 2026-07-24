import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Kairos Termite and Pest Control Preview",
  description:
    "Review the Kairos termite and pest-control service preview within the AltFTool Business Ops directory.",
  path: "/bops/housing-services/kairos/termites-pest-control",
  canonical: "/bops/housing-services/kairos",
  noindex: true,
  follow: true,
  pageType: "business-ops-preview",
});

export default function KairosTermiteLayout({ children }) {
  return children;
}
