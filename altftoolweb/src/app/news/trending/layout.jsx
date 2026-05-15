import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Trending News & Viral Stories | AltFTool News",
  description: "Track trending news, viral stories, and fast-moving updates on AltFTool News.",
  path: "/news/trending",
  keywords: ["trending news", "viral stories", "popular headlines"],
});

export default function TrendingNewsLayout({ children }) {
  return children;
}
