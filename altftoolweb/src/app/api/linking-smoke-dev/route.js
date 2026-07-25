// TEMPORARY smoke-test route for the internal-linking engine. DELETE before commit.
import { NextResponse } from "next/server";
import { getContentGraph } from "@/platform/linking/contentGraph";
import { getRelatedContentForPreset } from "@/platform/linking/relatedContent";

export async function GET() {
  const graph = getContentGraph();
  const counts = {};
  graph.forEach((item) => {
    counts[item.section] = (counts[item.section] || 0) + 1;
  });

  const samples = {
    toolPage: getRelatedContentForPreset(
      {
        href: "/tools/all/image-compressor",
        title: "Image Compressor",
        description: "Compress JPG, PNG and WebP images in your browser.",
        tags: ["Image & Photo", "image", "compressor"],
        section: "tools",
      },
      "utility",
    ),
    top9Page: getRelatedContentForPreset(
      {
        href: "/top9/best-ai-tools",
        title: "Best AI tools",
        description: "Ranked list of AI tools for productivity.",
        tags: ["AI", "productivity"],
        section: "top9",
      },
      "editorial",
    ),
    locationPage: getRelatedContentForPreset(
      {
        href: "/locations/india",
        title: "AltFTool in India",
        description: "Free tools, guides and deals for India.",
        tags: ["India", "Country"],
        section: "locations",
      },
      "discovery",
    ),
  };

  return NextResponse.json({ total: graph.length, counts, samples });
}
