import KymHomePage from "./components/KymHomePage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Know Your Meme – Memes & Internet Culture",
    description:
      "Explore trending memes, viral moments, and internet culture on AltFTool's KYM hub. Browse meme origins, roundups, and community polls.",
    path: "/kym",
  });
}

export default function Page() {
  return <KymHomePage />;
}
