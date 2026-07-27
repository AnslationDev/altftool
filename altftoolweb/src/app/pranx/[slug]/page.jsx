import PranxApp from "../PranxApp";
import { getPrankMetadataArgs } from "../prankSeo";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createPageMetadata(getPrankMetadataArgs(slug, `/pranx/${slug}`));
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <PranxApp slug={slug} />;
}
