import PranxApp from "../../PranxApp";
import { getPrankJsonLd, getPrankMetadataArgs } from "../../prankSeo";
import JsonLd from "@/platform/seo/JsonLd";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, child } = await params;
  return createPageMetadata(
    getPrankMetadataArgs(`${slug}/${child}`, `/pranx/${slug}/${child}`),
  );
}

export default async function Page({ params }) {
  const { slug, child } = await params;
  const jsonLd = getPrankJsonLd(`${slug}/${child}`);

  return (
    <>
      {jsonLd ? (
        <JsonLd id={`pranx-schema-${slug}-${child}`} data={jsonLd} />
      ) : null}
      <PranxApp slug={`${slug}/${child}`} />
    </>
  );
}
