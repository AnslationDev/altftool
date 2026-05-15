import NewsClient from "./NewsClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Latest News & Updates – Tech, Tools and Trends | AltFTool",
    description:
      "Stay updated with the latest news on technology, digital tools, software updates, and online trends with AltFTool News.",
    path: "/news",
    keywords: ["technology news", "digital tools news", "software updates", "online trends"],
  });
}

export default function Page() {
  return <NewsClient />;
}
