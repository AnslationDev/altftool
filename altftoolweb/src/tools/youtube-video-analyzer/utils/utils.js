// Utility functions for the YouTube Downloader

/**
 * Format seconds into HH:MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let formatted = "";
  if (hrs > 0) {
    formatted += `${hrs}:`;
  }
  formatted += `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return formatted;
}

/**
 * Sanitize filename by replacing invalid characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  return filename.replace(/[^\w\s.-]/gi, "_");
}

/**
 * Validate YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

const youtubeUtils = {
  formatDuration,
  sanitizeFilename,
  isValidYouTubeUrl,
};

export default youtubeUtils;
