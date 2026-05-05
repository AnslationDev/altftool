// YouTube API utilities for client-side operations
export const extractVideoId = (url) => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const isValidYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};

export const generateThumbnailUrl = (videoId, quality = "maxresdefault") => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

export const generateVideoUrl = (videoId) => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

export default {
  extractVideoId,
  isValidYouTubeUrl,
  generateThumbnailUrl,
  generateVideoUrl,
};
