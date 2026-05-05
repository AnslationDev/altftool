/**
 * Utility function to fetch data from a URL with built-in retry logic.
 * @param {string} url - The URL to fetch.
 * @param {number} [retries=3] - The number of times to retry the fetch.
 * @returns {Promise<any>} The parsed JSON data (full package metadata).
 */
export const fetchWithRetry = async (url, retries = 3) => {
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Package not found or registry unavailable.");
        }
        throw new Error(`Network error: ${response.status}`);
      }
      // IMPORTANT: Return the full package data object
      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`Retry ${i + 1}/${retries} failed.`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 500));
      }
    }
  }
  throw lastError;
};
