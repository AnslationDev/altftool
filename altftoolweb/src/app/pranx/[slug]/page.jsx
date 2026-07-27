import PranxApp from "../PranxApp";
import { PrankExplainer, PrankIntro } from "../components/PrankExplainer";
import { findPrank } from "../data/pranxData";
import { getPrankContent } from "../data/prankContent";
import { getPrankMetadataArgs } from "../prankSeo";
import { createPrankJsonLd } from "../prankJsonLd";
import JsonLd from "@/platform/seo/JsonLd";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createPageMetadata(getPrankMetadataArgs(slug, `/pranx/${slug}`));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const prank = findPrank(slug);
  const content = prank ? getPrankContent(prank.slug) : null;
  const path = prank ? `/pranx/${prank.slug}` : `/pranx/${slug}`;
  const jsonLd = createPrankJsonLd({ prank, content, path });

  return (
    <>
      {jsonLd.length > 0 && <JsonLd id={`pranx-${prank.slug.replace(/\//g, "-")}-schema`} data={jsonLd} />}
      <PranxApp
        slug={slug}
        answer={content?.answer}
        intro={content ? <PrankIntro prank={prank} content={content} /> : null}
        explainer={content ? <PrankExplainer prank={prank} content={content} /> : null}
      />
    </>
  );
}
