import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";
import { fetchFestivalPhoto, fetchFestivalPhotos } from "@/app/lookouts/festival/lib/upstream";

export async function GET(req) {
  const limited = enforceRateLimit(NextResponse, req, {
    limit: 60,
    scope: "lookouts:festival:photos",
    windowMs: 60000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim();
  const wikipediaTitle = (searchParams.get("wikipediaTitle") || "").trim();

  if (!query || query.length > 120) {
    return NextResponse.json({ error: "query is required." }, { status: 400 });
  }

  let photos = await fetchFestivalPhotos(query);

  // With no photo-provider key configured the search above returns null, which
  // would leave the calendar grid image-less. Fall back to the festival's
  // keyless Wikipedia page image when the caller supplies its title.
  if (!photos?.length && wikipediaTitle && wikipediaTitle.length <= 200) {
    const fallback = await fetchFestivalPhoto({ unsplashQuery: query, wikipediaTitle });
    photos = fallback ? [fallback] : null;
  }

  return jsonResponse(
    NextResponse,
    { photos: photos || [] },
    { cache: { sMaxage: 86400, staleWhileRevalidate: 604800 } },
  );
}
