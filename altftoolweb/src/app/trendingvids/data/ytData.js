import axios from "axios";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";

const SHORT_QUERIES = [
  "(AI OR Technology OR Coding) #shorts",
  "(Programming OR Education OR Tutorial) #shorts",
  "(MachineLearning OR Python OR WebDev) #shorts",
  "(Tech OR Innovation OR Startup) #shorts",
  "(JavaScript OR ReactJS OR NextJS) #shorts",
  "(DataScience OR CloudComputing OR DevOps) #shorts",
];

export const fetchApi = async (endpoint, params = {}) => {
  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_YOUTUBE_API_KEY is not configured.");
  }

  const response = await axios.get(`${BASE_URL}/${endpoint}`, {
    params: { ...params, key: API_KEY },
  });
  return response.data;
};

export const formatDuration = (duration) => {
  if (!duration) return "--:--";
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "--:--";

  const hours   = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const buildVideoObject = (searchItem, detailItem) => {
  if (!detailItem) return null;
  const videoId = searchItem.id?.videoId;
  return {
    videoId,
    title:        detailItem.snippet?.title        || searchItem.snippet?.title        || "Untitled Video",
    desc:         detailItem.snippet?.description  || searchItem.snippet?.description  || "",
    image:        detailItem.snippet?.thumbnails?.high?.url
               || detailItem.snippet?.thumbnails?.medium?.url
               || detailItem.snippet?.thumbnails?.default?.url,
    category:     detailItem.snippet?.channelTitle || "YouTube",
    date:         detailItem.snippet?.publishedAt
                    ? new Date(detailItem.snippet.publishedAt).toLocaleDateString()
                    : "Recently",
    time:         formatDuration(detailItem.contentDetails?.duration),
    views:        Number(detailItem.statistics?.viewCount    || 0),
    likes:        Number(detailItem.statistics?.likeCount    || 0),
    commentCount: Number(detailItem.statistics?.commentCount || 0),
  };
};

const searchAndEnrich = async ({ query, maxResults, pageToken, videoDuration, order }) => {
  const searchData = await fetchApi("search", {
    part: "snippet",
    q: query,
    type: "video",
    maxResults,
    pageToken,
    videoDuration,
    // ── FIX 2: only send `order` when it's defined — avoids sending undefined ──
    ...(order && { order }),
  });

  const items = searchData?.items || [];
  if (!items.length) return { videos: [], nextPageToken: null };

  const ids = items.map((i) => i.id?.videoId).filter(Boolean).join(",");
  if (!ids) return { videos: [], nextPageToken: null };

  const videoData = await fetchApi("videos", {
    part: "snippet,statistics,contentDetails",
    id: ids,
  });

  const videoMap = Object.fromEntries(
    (videoData.items || []).map((v) => [v.id, v])
  );

  const videos = items
    .map((item) => buildVideoObject(item, videoMap[item.id?.videoId]))
    .filter(Boolean);

  return { videos, nextPageToken: searchData.nextPageToken || null };
};

export const getYoutubeVideoById = async (videoId) => {
  const data = await fetchApi("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoId,
  });
  return data.items?.[0] || null;
};

export const getYoutubeComments = async (videoId) => {
  const data = await fetchApi("commentThreads", {
    part: "snippet",
    videoId,
    maxResults: 20,
  });
  return data.items || [];
};

export const getYoutubeVideos = async ({
  query      = "AI OR Technology OR Programming",
  maxResults = 6,
  pageToken  = "",
  isReel     = false,
  sortBy,    // "Latest" | "Popular" — mapped to YouTube's `order` param below
} = {}) => {
  try {
    // ── FIX 3: sortBy ("Latest"/"Popular") must be mapped to `order` param ───
    const order = sortBy === "Popular" ? "viewCount" : "date";
    return await searchAndEnrich({ query, maxResults, pageToken, order });
  } catch (error) {
    console.error("[getYoutubeVideos]", error);
    return { videos: [], nextPageToken: null };
  }
};

export const getSuggestedVideos = async (query, { maxResults = 10 } = {}) => {
  // ── FIX 4: query was being ignored — options object was never destructured ──
  try {
    const { videos } = await searchAndEnrich({
      query: query || "AI Technology Programming",
      maxResults,
      pageToken: "",
      videoDuration: "medium",
      order: "relevance",
    });
    return videos;
  } catch (error) {
    console.error("[getSuggestedVideos]", error);
    return [];
  }
};

const getRandomQuery = () =>
  SHORT_QUERIES[Math.floor(Math.random() * SHORT_QUERIES.length)];

export const getYoutubeShorts = async ({
  maxResults = 12,
  pageToken  = "",
} = {}) => {
  try {
    const finalQuery = getRandomQuery();

    const searchData = await fetchApi("search", {
      part: "id",
      q: finalQuery,
      type: "video",
      videoDuration: "short",
      maxResults,
      pageToken,
      order: "date",
    });

    const videoIds = (searchData.items || [])
      .map((item) => item.id.videoId)
      .join(",");

    if (!videoIds) return { videos: [], nextPageToken: null };

    const videoData = await fetchApi("videos", {
      part: "snippet,statistics,contentDetails",
      id: videoIds,
    });

    const videos = (videoData.items || []).map((video) => ({
      id:           video.id,
      title:        video.snippet.title,
      description:  video.snippet.description,
      channelId:    video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      views:        video.statistics.viewCount,
      likes:        video.statistics.likeCount,
      comments:     video.statistics.commentCount,
    }));

    const channelIds = [...new Set(videos.map((v) => v.channelId))].join(",");

    const channelData = await fetchApi("channels", {
      part: "snippet,statistics,topicDetails",
      id: channelIds,
    });

    const channelMap = {};
    (channelData.items || []).forEach((ch) => {
      channelMap[ch.id] = {
        channelDescription: ch.snippet.description,
        channelLogo:        ch.snippet.thumbnails.default.url,
        subscribers:        ch.statistics.subscriberCount,
        country:            ch.snippet.country,
        topics:             ch.topicDetails?.topicCategories || [],
      };
    });

    const finalVideos = videos.map((video) => ({
      ...video,
      ...channelMap[video.channelId],
    }));

    return { videos: finalVideos, nextPageToken: searchData.nextPageToken };
  } catch (error) {
    console.error("[getYoutubeShorts]", error);
    return { videos: [], nextPageToken: null };
  }
};
