import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, fetchJson, jsonResponse, routeError, searchParam } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{6,32}$/;

function formatDuration(iso = "") {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = parseInt(match?.[1] || 0, 10);
  const m = parseInt(match?.[2] || 0, 10);
  const s = parseInt(match?.[3] || 0, 10);
  const pad = (n) => String(n).padStart(2, "0");

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export async function GET(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 60,
      scope: "admin:youtube-meta",
      windowMs: 60000,
    });
    if (limited) return limited;

    const videoId = searchParam(request, "videoId");
    if (!VIDEO_ID_PATTERN.test(videoId)) {
      return NextResponse.json({ error: "Valid videoId is required." }, { status: 400 });
    }

    const apiKey = requireServerEnv(SERVER_ENV.youtube);
    const upstream = new URL("https://www.googleapis.com/youtube/v3/videos");
    upstream.searchParams.set("part", "snippet,contentDetails");
    upstream.searchParams.set("id", videoId);
    upstream.searchParams.set("key", apiKey);

    const result = await fetchJson(upstream, {
      next: { revalidate: 3600 },
      timeoutMs: 10000,
    });

    if (!result.ok) {
      return NextResponse.json({ error: "YouTube API error." }, { status: result.status || 502 });
    }

    const item = result.data.items?.[0];
    const snippet = item?.snippet;
    if (!snippet) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const thumbs = snippet.thumbnails ?? {};
    const thumbnailUrl =
      thumbs.maxres?.url ??
      thumbs.high?.url ??
      thumbs.medium?.url ??
      thumbs.default?.url ??
      "";

    return jsonResponse(NextResponse, {
      channelName: snippet.channelTitle ?? "",
      description: snippet.description ?? "",
      duration: item?.contentDetails?.duration ? formatDuration(item.contentDetails.duration) : "",
      thumbnailUrl,
      title: snippet.title ?? "",
    }, {
      cache: { sMaxage: 3600, staleWhileRevalidate: 86400 },
    });
  } catch (error) {
    return routeError(NextResponse, error, "YouTube metadata request failed.");
  }
}
