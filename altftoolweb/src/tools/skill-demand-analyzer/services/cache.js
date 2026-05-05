/**
 * Simple localStorage cache for API responses
 */

const CACHE_PREFIX = 'skill_market_v3_'; // v3 to force fresh data fetch after API repairs
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes - shorter duration for fresh data

/**
 * Get cached data if it exists and is not expired
 */
export function getCachedData(key) {
  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const cached = localStorage.getItem(fullKey);

    if (!cached) return null;

    const entry = JSON.parse(cached);
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(fullKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Store data in cache
 */
export function setCachedData(key, data) {
  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const entry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(fullKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Clear specific cached data by key
 */
export function clearCachedDataByKey(key) {
  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Clear all cached data
 */
export function clearCache() {
  try {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith(CACHE_PREFIX)
    );
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Get recent searches from cache
 */
export function getRecentSearches() {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}recent_searches`);
    if (!cached) return [];
    return JSON.parse(cached);
  } catch (error) {
    console.error('Recent searches read error:', error);
    return [];
  }
}

/**
 * Add a search to recent searches
 */
export function addRecentSearch(skill, demandScore) {
  try {
    const searches = getRecentSearches();
    const newSearch = {
      skill,
      timestamp: Date.now(),
      demandScore,
    };

    // Remove if already exists
    const filtered = searches.filter(s => s.skill.toLowerCase() !== skill.toLowerCase());

    // Add new search at the beginning
    const updated = [newSearch, ...filtered].slice(0, 10); // Keep last 10

    localStorage.setItem(`${CACHE_PREFIX}recent_searches`, JSON.stringify(updated));
  } catch (error) {
    console.error('Recent searches write error:', error);
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches() {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}recent_searches`);
  } catch (error) {
    console.error('Recent searches clear error:', error);
  }
}
