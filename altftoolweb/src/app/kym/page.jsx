import KymHomePage from "./components/KymHomePage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { isKymIndexable } from "./data/indexPolicy";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Meme Encyclopedia — Memes & Internet Culture",
    description:
      "Explore trending memes, viral moments, and internet culture in ALTFTool's meme encyclopedia. Browse meme origins, roundups, and community polls.",
    path: "/kym",
    keywords: [
      "meme encyclopedia",
      "trending memes",
      "internet culture",
      "meme origins",
      "viral memes",
      "meme explainers",
    ],
    // See data/indexPolicy.js. The hub is deindexed alongside the 37 entries it
    // fronts; there is nothing left for it to collect into the index.
    noindex: !isKymIndexable("/kym"),
    follow: true,
  });
}

export default function Page() {
  return <KymHomePage />;
}
