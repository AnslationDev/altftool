import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Ancestry – Discover Your Name's Meaning & Origin",
    description:
      "Explore the history, meaning, and origin of first and last names with the AltFTool ancestry tool and learn the story behind your name.",
    path: "/ancestory",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
