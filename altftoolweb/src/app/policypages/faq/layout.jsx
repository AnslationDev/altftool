import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "FAQ",
    description:
      "Find answers to common questions about AltFTool tools, extensions, deals, accounts, support, privacy, and how the platform works.",
    path: "/policypages/faq",
  });
}

export default function FaqLayout({ children }) {
  return children;
}
