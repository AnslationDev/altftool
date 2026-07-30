import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "Privacy Policy",
    description:
      "The AltFTool privacy policy: what data our website, tools and extensions collect, how we use, share and protect it, and the choices and rights you have.",
    path: "/policypages/privacy",
  });
}

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
