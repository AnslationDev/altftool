import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Cookie Policy",
    description:
      "Learn how AltFTool uses cookies and similar technologies to improve your experience, analyse traffic, and personalise content — and how to manage your preferences.",
    path: "/policypages/cookie",
  });
}

export default function CookiePolicyLayout({ children }) {
  return children;
}
