import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "About Us",
    description:
      "Learn about AltFTool — our mission to make free online tools, must-have Chrome extensions, and practical digital guides accessible to creators, students, and professionals.",
    path: "/policypages/about",
  });
}

export default function AboutPolicyLayout({ children }) {
  return children;
}
