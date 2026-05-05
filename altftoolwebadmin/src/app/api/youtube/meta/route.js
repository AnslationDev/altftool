// app/api/youtube/meta/route.js

import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${apiKey}`,
  { next: { revalidate: 60 } }
);

    if (!res.ok) {
      return NextResponse.json({ error: "YouTube API error" }, { status: res.status });
    }

    const data = await res.json();
    const snippet = data.items?.[0]?.snippet;

    if (!snippet) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Pick the best available thumbnail (maxres → high → medium → default)
    const thumbs = snippet.thumbnails ?? {};
    const thumbnailUrl =
      thumbs.maxres?.url ??
      thumbs.high?.url   ??
      thumbs.medium?.url ??
      thumbs.default?.url ?? "";

    const contentDetails = data.items?.[0]?.contentDetails;

return NextResponse.json({
  title:        snippet.title        ?? "",
  description:  snippet.description  ?? "",
  channelName:  snippet.channelTitle ?? "",
  thumbnailUrl,
  duration:     contentDetails?.duration
                  ? formatDuration(contentDetails.duration)
                  : "",
});
  } catch (err) {
    console.error("[youtube/meta] fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const h = parseInt(match?.[1] || 0);
  const m = parseInt(match?.[2] || 0);
  const s = parseInt(match?.[3] || 0);

  const pad = (n) => String(n).padStart(2, "0");

  return h > 0
    ? `${h}:${pad(m)}:${pad(s)}`
    : `${m}:${pad(s)}`;
}
}