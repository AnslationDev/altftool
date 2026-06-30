import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import StatusClient from "./StatusClient";

export async function generateMetadata() {
  return createPageMetadata({
  title: "AltFTool Status",
  description:
    "Live AltFTool public status for tool registry readiness, Firebase reads, content fallbacks, and SEO endpoints.",
  path: "/status",
  keywords: ["AltFTool status", "site health", "tool health", "Firebase status"],
});
}

function createStatusJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl("/status")}#webpage`,
    name: "AltFTool Status",
    url: absoluteUrl("/status"),
    description:
      "Live AltFTool public status for tool registry readiness, Firebase reads, content fallbacks, and SEO endpoints.",
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    about: {
      "@type": "Service",
      name: "AltFTool public web health",
      provider: {
        "@id": `${getSiteUrl()}/#organization`,
      },
      areaServed: "Worldwide",
      serviceType: "Public web application status",
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

export default function StatusPage() {
  return (
    <>
      <JsonLd
        id="altftool-status-schema"
        data={[
          createStatusJsonLd(),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "Status", path: "/status" },
          ]),
        ]}
      />
      <StatusClient />
    </>
  );
}
