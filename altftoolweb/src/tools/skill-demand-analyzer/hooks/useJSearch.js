import { useState, useCallback } from 'react';

const JOBS_CACHE_PREFIX = 'jsearch_cache_';
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours in milliseconds

export const useJSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchJobs = useCallback(async (skill, filters = {}) => {
    if (!skill) return;

    const { country = 'us', remote = false, fullTime = false } = filters;
    const cacheKey = `${JOBS_CACHE_PREFIX}${skill.toLowerCase().replace(/\s+/g, '_')}_${country}_${remote}_${fullTime}`;

    // 1. Check local cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_TTL;
        
        if (!isExpired) {
          console.log(`Using cached jobs for: ${skill}`);
          setJobs(data);
          setError(null);
          return;
        } else {
          localStorage.removeItem(cacheKey); // Clear expired cache
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        skill,
        country,
        remote: remote.toString(),
        fullTime: fullTime.toString()
      });

      const response = await fetch(`/api/tools/skill-demand/jsearch?${params.toString()}`);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch jobs');
      }

      const data = await response.json();
      const results = data.data && Array.isArray(data.data) ? data.data : [];

      // 2. Save to cache
      try {
        const cacheEntry = {
          data: results,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      } catch (e) {
        console.warn('Cache write error:', e);
      }

      setJobs(results);
    } catch (err) {
      console.error('Job search hook error:', err);
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearJobs = useCallback(() => {
    setJobs([]);
    setError(null);
    setLoading(false);
  }, []);

  return { jobs, loading, error, searchJobs, clearJobs };
};
