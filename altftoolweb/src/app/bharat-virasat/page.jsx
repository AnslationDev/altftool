import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Bharat Virasat – India's Heritage Sites | AltFTool",
    description:
      "Explore India's rich cultural heritage through an interactive showcase of historic sites, monuments, and landmarks with galleries and detailed information.",
    path: "/bharat-virasat",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
