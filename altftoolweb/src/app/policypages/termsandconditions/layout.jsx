import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Terms & Conditions",
    description:
      "Read the AltFTool Terms & Conditions governing your use of our website, online tools, and services, including acceptable use, liability, and your rights.",
    path: "/policypages/termsandconditions",
  });
}

export default function TermsPolicyLayout({ children }) {
  return children;
}
