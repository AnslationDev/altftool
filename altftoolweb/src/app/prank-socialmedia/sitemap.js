import { TEMPLATES } from "./lib/templates";
import { getSiteUrl } from "@/platform/seo/generateMetadata";

export default function sitemap() {
  const base = getSiteUrl();
  return [
    { url: `${base}/prank-socialmedia`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/prank-socialmedia/templates`, changeFrequency: "weekly", priority: 0.7 },
    ...TEMPLATES.map((t) => ({
      url: `${base}/prank-socialmedia/editor/${t.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    })),
  ];
}
