import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AltF Maker Studio Introduction",
  description:
    "Open the AltF Maker Studio for newspaper clippings, posters, scene cards, character graphics, and stylized text.",
  path: "/fodey-new/landing",
  canonical: "/fodey-new",
  noindex: true,
  follow: true,
  pageType: "creative-experience",
});

export default function MakerStudioLandingLayout({ children }) {
  return children;
}
