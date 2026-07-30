import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Blog – Tips, Guides & Tech Insights",
    description:
      "Guides, tips and tech insights from the AltFTool blog on getting more from online tools, software and browser extensions, plus product news and updates.",
    path: "/blogs",
    keywords: ["AltFTool blog", "tool guides", "tech tips", "digital productivity"],
  });
}

export default function BlogsLayout({ children }) {
  return children;
}
