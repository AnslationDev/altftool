import KymHomePage from "./components/KymHomePage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Meme Encyclopedia – Trending Memes & Internet Culture",
    description:
      "Explore trending memes, viral moments, and internet culture in the AltFTool meme encyclopedia. Browse meme origins, roundups, and community polls.",
    path: "/kym",
    keywords: [
      "meme encyclopedia",
      "trending memes",
      "internet culture",
      "meme origins",
      "viral memes",
      "meme explainers",
    ],
  });
}

export default function Page() {
  return <KymHomePage />;
}
