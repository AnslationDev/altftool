import { NextResponse } from "next/server";
import { getTrendingCards } from "@/app/n8n/data/service";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const workflows = getTrendingCards(200);

  return NextResponse.json(
    {
      workflows,
      total: workflows.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
