import PranxApp from "../../PranxApp";
import { getPrankMetadataArgs } from "../../prankSeo";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, child } = await params;
  return createPageMetadata(
    getPrankMetadataArgs(`${slug}/${child}`, `/pranx/${slug}/${child}`),
  );
}

export default async function Page({ params }) {
  const { slug, child } = await params;
  return <PranxApp slug={`${slug}/${child}`} />;
}
