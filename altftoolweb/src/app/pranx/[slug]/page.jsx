import PranxApp from "../PranxApp";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createPageMetadata({
    title: "Pranx Studio | AltFTool",
    description:
      "Original browser prank simulators, screensavers, fake terminals, mini games, and screenshot makers.",
    path: `/pranx/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <PranxApp slug={slug} />;
}
