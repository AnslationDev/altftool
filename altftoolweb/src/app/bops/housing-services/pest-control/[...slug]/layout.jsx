import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Pest Control Service Preview",
  description:
    "Explore the pest-control service preview and return to the main provider page for the complete experience.",
  path: "/bops/housing-services/pest-control",
  canonical: "/bops/housing-services/pest-control",
  noindex: true,
  follow: true,
  pageType: "business-ops-preview",
});

export default function PestControlPreviewLayout({ children }) {
  return children;
}
