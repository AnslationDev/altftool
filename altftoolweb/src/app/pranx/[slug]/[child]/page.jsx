import PranxApp from "../../PranxApp";
import { PrankExplainer, PrankIntro } from "../../components/PrankExplainer";
import { findPrank } from "../../data/pranxData";
import { getPrankContent } from "../../data/prankContent";
import { getPrankMetadataArgs } from "../../prankSeo";
import { createPrankJsonLd } from "../../prankJsonLd";
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
  const fullSlug = `${slug}/${child}`;
  const prank = findPrank(fullSlug);
  const content = prank ? getPrankContent(prank.slug) : null;
  const path = prank ? `/pranx/${prank.slug}` : `/pranx/${fullSlug}`;
  const jsonLd = createPrankJsonLd({ prank, content, path });

  return (
    <>
      {jsonLd.length > 0 && (
        <JsonLd id={`pranx-${prank.slug.replace(/\//g, "-")}-schema`} data={jsonLd} />
      )}
      <PranxApp
        slug={fullSlug}
        answer={content?.answer}
        intro={content ? <PrankIntro prank={prank} content={content} /> : null}
        explainer={content ? <PrankExplainer prank={prank} content={content} /> : null}
      />
    </>
  );
}
