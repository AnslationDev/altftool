import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "News Newsletter | AltFTool News",
  description: "Subscribe to AltFTool News briefings for local updates, breaking alerts, and topic-based news digests.",
  path: "/news/newsletter",
  keywords: ["news newsletter", "daily briefing", "breaking alerts"],
});

export default function NewsNewsletterLayout({ children }) {
  return children;
}
