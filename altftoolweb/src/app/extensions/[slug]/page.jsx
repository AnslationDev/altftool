import { cache } from "react";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { fetchExtensionBySlug } from "../_data/extensionsSource";
import PageView, {
  buildHostingAnswer,
  buildInstallSteps,
  buildLeadSentence,
} from "./PageView";

// Rendered on demand and cached: 57 slugs are not worth prerendering into the
// deploy artifact, and an hour-old catalog page is fine.
export const revalidate = 3600;

// Deduped so generateMetadata and the page body share one Firestore read.
const getExtension = cache((slug) => fetchExtensionBySlug(slug));

// SERP snippet: lead with what the extension actually does, prefixed with its
// name only when the catalog copy does not already start with it.
function buildDescription(extension) {
  const detail = String(extension.description || "").replace(/\s+/g, " ").trim();
  if (!detail) return buildLeadSentence(extension);
  const name = String(extension.name || "");
  const startsWithName = detail.toLowerCase().startsWith(name.toLowerCase());
  return startsWithName ? detail : `${name} — ${detail}`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const extension = await getExtension(slug);

  if (!extension) {
    return {
      title: "Extension not found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${extension.name} – Chrome Extension`,
    description: buildDescription(extension),
    path: `/extensions/${extension.slug || slug}`,
    image: extension.image,
    keywords: [
      extension.name,
      `${extension.name} Chrome extension`,
      `${extension.name} browser extension`,
      extension.category,
      "Chrome extension",
    ].filter(Boolean),
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const extension = await getExtension(slug);

  if (!extension) notFound();

  const path = `/extensions/${extension.slug || slug}`;
  const url = absoluteUrl(path);
  const features = Array.isArray(extension.features) ? extension.features : [];
  const installSteps = buildInstallSteps(extension);

  // SoftwareApplication carries only fields that exist in the catalog document
  // and are visible on the page. No aggregateRating: the catalog stores a rating
  // but no review count, so a rating claim would not be substantiated.
  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: extension.name,
    description: extension.description,
    applicationCategory: "BrowserApplication",
    applicationSubCategory: extension.category,
    operatingSystem: "Chrome",
    url,
    ...(extension.chromeUrl ? { installUrl: extension.chromeUrl, sameAs: extension.chromeUrl } : {}),
    ...(extension.image ? { image: extension.image } : {}),
    ...(features.length ? { featureList: features } : {}),
    publisher: { "@type": "Organization", name: "AltFTool", url: absoluteUrl("/") },
  };

  // Only questions that appear on the page as visible <h2> headings, answered by
  // the text rendered underneath them.
  const faqQuestions = [
    features.length
      ? {
          question: `What can you do with ${extension.name}?`,
          answer: features
            .map((feature) => String(feature).trim().replace(/[.;]+$/, ""))
            .filter(Boolean)
            .join(". ")
            .concat("."),
        }
      : null,
    {
      question: `Is ${extension.name} hosted on AltFTool?`,
      answer: buildHostingAnswer(extension),
    },
  ].filter(Boolean);

  return (
    <>
      <JsonLd
        id={`extension-${extension.slug || slug}-schema`}
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Extensions", path: "/extensions" },
            { name: extension.name, path },
          ]),
          softwareApplicationJsonLd,
          createFaqJsonLd({ path, questions: faqQuestions }),
          installSteps.length
            ? createHowToJsonLd({
                path,
                name: `How to install ${extension.name}`,
                description: `Install the ${extension.name} Chrome extension from its official Chrome Web Store listing.`,
                steps: installSteps,
              })
            : null,
        ]}
      />
      <PageView extension={extension} />
    </>
  );
}
