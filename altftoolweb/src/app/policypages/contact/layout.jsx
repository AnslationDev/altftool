import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Contact Us",
    description:
      "Get in touch with the AltFTool team for product support, feedback, partnership, or press enquiries. We're happy to help you get the most from our tools.",
    path: "/policypages/contact",
  });
}

export default function ContactPolicyLayout({ children }) {
  return children;
}
