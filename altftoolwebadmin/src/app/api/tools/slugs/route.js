import { NextResponse } from "next/server";

import { TOOL_SLUGS } from "@/config/toolSlugs.generated";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      count: TOOL_SLUGS.length,
      items: TOOL_SLUGS,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
