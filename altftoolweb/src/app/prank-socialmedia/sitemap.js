import { TEMPLATES } from "./lib/templates";

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/templates`, changeFrequency: "weekly", priority: 0.9 },
    ...TEMPLATES.map((t) => ({
      url: `${base}/editor/${t.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
