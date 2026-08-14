import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
  title: "News Newsletter – Coming Soon | AltFTool News",
  description: "The AltFTool News email briefing has not launched. Sign-ups are not open yet.",
  path: "/news/newsletter",
  keywords: ["news newsletter", "daily briefing", "breaking alerts"],
});
}

export default function NewsNewsletterLayout({ children }) {
  return children;
}
