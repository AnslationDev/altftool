import { getSiteUrl } from "@/platform/seo/generateMetadata";
import { MANIFEST_BACKGROUND, MANIFEST_THEME } from "./chromeColors";

export default function manifest() {
  return {
    name: "AltFTool - Daily Digital Toolkit",
    short_name: "AltFTool",
    description:
      "Free online tools, software picks, Chrome extensions, ranked guides, and productivity utilities.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // If the browser cannot honour `standalone` it should fall back to a slim
    // chrome rather than a full browser tab.
    display_override: ["standalone", "minimal-ui"],
    background_color: MANIFEST_BACKGROUND,
    theme_color: MANIFEST_THEME,
    categories: ["productivity", "utilities", "developer"],
    lang: "en",
    dir: "ltr",
    id: getSiteUrl(),
    // No `orientation` lock: the games and several canvas tools are used in
    // landscape, so pinning portrait would break them.
    icons: [
      // Scalable mark first — crisp at any density where SVG is supported.
      {
        src: "/brand/altftool-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      // Raster fallbacks. Android's installability check wants a 192 and a 512.
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Maskable: opaque tile with the mark inside the central 80% safe zone,
      // so Android crops it to the launcher shape instead of shrinking the
      // icon onto a white circle.
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    // Long-press the installed icon. These point at real, existing routes.
    shortcuts: [
      {
        name: "Step Counter",
        short_name: "Steps",
        url: "/tools/all/step-counter",
        icons: [{ src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Age & Gender Detector",
        short_name: "Age Detector",
        url: "/tools/all/age-gender-detector",
        icons: [{ src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "All Tools",
        short_name: "Tools",
        url: "/tools",
        icons: [{ src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
