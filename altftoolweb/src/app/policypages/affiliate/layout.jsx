import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Affiliate Disclosure",
    description:
      "AltFTool's affiliate disclosure explains how we may earn commissions from links to third-party products and tools, at no additional cost to you.",
    path: "/policypages/affiliate",
  });
}

export default function AffiliatePolicyLayout({ children }) {
  return children;
}
