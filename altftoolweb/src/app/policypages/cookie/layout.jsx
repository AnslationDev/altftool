import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Cookie Policy",
    description:
      "How AltFTool uses cookies and similar technologies to run the site, remember your settings, measure traffic and personalise content, and how to manage them.",
    path: "/policypages/cookie",
  });
}

export default function CookiePolicyLayout({ children }) {
  return children;
}
