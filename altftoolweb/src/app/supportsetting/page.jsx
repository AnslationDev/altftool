import SupportClient from "./SupportClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Settings & Support – Manage Preferences and Get Help | AltFTool",
    description:
      "Access AltFTool settings and support. Manage your preferences, permissions, system options, and find help or troubleshooting guides for tools and features.",
    path: "/supportsetting",
    keywords: ["AltFTool support", "settings", "help center", "troubleshooting"],
  });
}

export default function Page() {
  return <SupportClient />;
}
