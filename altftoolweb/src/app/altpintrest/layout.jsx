import { createPageMetadata } from "@/platform/seo/generateMetadata";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";
export async function generateMetadata() {
  return createPageMetadata({
  title: "AltPinterest - Visual Discovery Board",
  description:
    "Discover, search, save, and browse curated visual inspiration boards on AltFTool.",
  path: "/altpintrest",
});
}

export default function AltPinterestLayout({ children }) {
  return (
    <>
      {children}
      <AltfLauncher />
    </>
  );
}
