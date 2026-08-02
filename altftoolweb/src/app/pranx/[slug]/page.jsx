import PranxApp from "../PranxApp";
import { getPrankJsonLd, getPrankMetadataArgs } from "../prankSeo";
import JsonLd from "@/platform/seo/JsonLd";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createPageMetadata(getPrankMetadataArgs(slug, `/pranx/${slug}`));
}

export default async function Page({ params }) {
  const { slug } = await params;
  // Unknown slugs render NotFoundPrank and are noindexed, so they stay
  // entity-free; getPrankJsonLd returns null for them.
  const jsonLd = getPrankJsonLd(slug);

  return (
    <>
      {jsonLd ? (
        <JsonLd id={`pranx-schema-${slug.replace(/\//g, "-")}`} data={jsonLd} />
      ) : null}
      <PranxApp slug={slug} />
    </>
  );
}
