import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "AltPinterest - Visual Discovery Board",
  description:
    "Discover, search, save, and browse visual inspiration boards powered by AltFTool and live Firebase pin data.",
  path: "/altpintrest",
});

export default function AltPinterestLayout({ children }) {
  return children;
}
