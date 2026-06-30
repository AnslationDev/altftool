import { createPageMetadata } from "@/platform/seo/generateMetadata";

export function generateMetadata() {
  return createPageMetadata({
    title: "About AltF Tools",
    description:
      "Learn about AltF Tools — a curated platform for trusted productivity tools, browser extensions, apps, AI tools, and practical digital resources.",
    path: "/policypages/about",
  });
}

export default function AboutPolicyLayout({ children }) {
  return children;
}
