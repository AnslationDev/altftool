import PranxApp from "../../PranxApp";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, child } = await params;
  return createPageMetadata({
    title: "Pranx Studio | AltFTool",
    description:
      "Original browser prank simulators, screensavers, fake terminals, mini games, and screenshot makers.",
    path: `/pranx/${slug}/${child}`,
  });
}

export default async function Page({ params }) {
  const { slug, child } = await params;
  return <PranxApp slug={`${slug}/${child}`} />;
}
