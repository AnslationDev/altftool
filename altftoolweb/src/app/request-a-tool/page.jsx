import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import RequestToolClient from "./RequestToolClient";

export const metadata = createPageMetadata({
  title: "Request a Tool",
  description:
    "Request a new AltFTool utility, converter, generator, calculator, or productivity workflow for the public tool library.",
  path: "/request-a-tool",
  keywords: ["request a tool", "AltFTool tool request", "suggest online tool", "feature request"],
});

function createRequestToolJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${absoluteUrl("/request-a-tool")}#webpage`,
    name: "Request a Tool",
    url: absoluteUrl("/request-a-tool"),
    description:
      "Request a new AltFTool utility, converter, generator, calculator, or productivity workflow for the public tool library.",
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

export default function RequestToolPage() {
  return (
    <>
      <JsonLd
        id="altftool-request-tool-schema"
        data={[
          createRequestToolJsonLd(),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "Request a Tool", path: "/request-a-tool" },
          ]),
        ]}
      />
      <RequestToolClient />
    </>
  );
}
