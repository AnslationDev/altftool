import PranxApp from "./PranxApp";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Pranx Studio",
    description:
      "Original browser prank simulators, screensavers, fake terminals, mini games, and screenshot makers.",
    path: "/pranx",
  });
}

export default function Page() {
  return <PranxApp />;
}
