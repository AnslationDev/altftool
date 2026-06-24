import { getSiteUrl } from "@/platform/seo/generateMetadata";

export default function robots() {
  const siteUrl = getSiteUrl().replace("www.", "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/status", "/buysmart/redirect"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
