import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Privacy Policy",
    description:
      "Read the AltFTool Privacy Policy to understand what data we collect, how we use and protect it, and the choices you have across our tools, extensions, and website.",
    path: "/policypages/privacy",
  });
}

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
