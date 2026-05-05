import SupportClient from "./SupportClient";

export async function generateMetadata() {
  return {
    title: "Settings & Support – Manage Preferences and Get Help | AltFTool",
    description:
      "Access AltFTool settings and support. Manage your preferences, permissions, system options, and find help or troubleshooting guides for tools and features.",
  };
}

export default function Page() {
  return <SupportClient />;
}