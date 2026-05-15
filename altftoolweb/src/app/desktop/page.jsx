import DesktopClient from "./DesktopClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Desktop Software – Powerful Tools for Windows & Mac",
    description:
      "Discover useful desktop software on AltFTool. Download powerful tools for productivity, utilities, and everyday tasks designed for Windows and Mac users.",
    path: "/desktop",
    keywords: ["desktop software", "Windows tools", "Mac tools", "productivity software"],
  });
}

export default function Page() {
  return <DesktopClient />;
}
