import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Blog – Tips, Guides & Tech Insights",
    description:
      "Read the latest articles on the AltFTool Blog. Discover helpful tips, in-depth guides, tech insights, and updates about tools, software, and digital productivity.",
    path: "/blogs",
    keywords: ["AltFTool blog", "tool guides", "tech tips", "digital productivity"],
  });
}

export default function BlogsLayout({ children }) {
  return children;
}
