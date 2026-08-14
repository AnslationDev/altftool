import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top3 Editorial Preview Unavailable",
    description:
      "This editorial preview is unavailable while its rankings and supporting sources are verified.",
    path: "/top3",
    noindex: true,
    follow: false,
  });
}

export default function Top3Layout({ children }) {
  return children;
}
