import { getSiteUrl } from "@/platform/seo/generateMetadata";

export default function manifest() {
  return {
    name: "AltFTool - Daily Digital Toolkit",
    short_name: "AltFTool",
    description:
      "Free online tools, software picks, Chrome extensions, ranked guides, and productivity utilities.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["productivity", "utilities", "developer"],
    lang: "en",
    id: getSiteUrl(),
    icons: [
      {
        src: "/altftool-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon1.png",
        sizes: "255x248",
        type: "image/png",
      },
    ],
  };
}
