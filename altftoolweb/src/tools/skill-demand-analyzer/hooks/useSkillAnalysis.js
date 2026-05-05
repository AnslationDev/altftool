import { useState, useCallback } from 'react';
import { fetchAdzunaJobs } from '../services/adzunaApi.js';
import { fetchGoogleTrends } from '../services/googleTrendsApi.js';
import { calculateDemandScore, getTrendStatus } from '../utils/demandScore.js';
import { getCachedData, setCachedData, clearCachedDataByKey, addRecentSearch } from '../services/cache.js';
import { validateSkill, getRelatedSkills } from '../utils/skillValidator.js';
import { getSkillSalary } from '../utils/skillSalaryMap.js';

export function useSkillAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSingleSkill = async (skillName, normalizedCountry) => {
    const validation = validateSkill(skillName.trim());
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    const validatedSkill = validation.skill;
    
    // Fetch data from Google Trends API
    let trendsData;
    try {
      trendsData = await fetchGoogleTrends(validatedSkill, normalizedCountry);
    } catch (err) {
      throw new Error(err.message || `Failed to fetch Google Trends data for ${validatedSkill}.`);
    }

    // Fetch data from Adzuna API, with fallback for salary
    let jobData;
    let jobCount = 0;
    let avgSalary = 0;
    
    try {
      jobData = await fetchAdzunaJobs(validatedSkill, normalizedCountry);
      jobCount = jobData.jobCount;
      avgSalary = jobData.avgSalary;
      
      if (avgSalary === 0) {
        const fallbackSalary = getSkillSalary(validatedSkill);
        avgSalary = fallbackSalary.avg;
        jobData.avgSalary = avgSalary;
        jobData.minSalary = fallbackSalary.min;
        jobData.maxSalary = fallbackSalary.max;
      }
    } catch (err) {
      if (err.isConfigError) {
        throw err; // Don't fall back if it's a configuration issue
      }
      console.warn(`Adzuna API failed for ${validatedSkill}. Using salary fallback only.`, err.message);
      const fallbackSalary = getSkillSalary(validatedSkill);
      avgSalary = fallbackSalary.avg;
      jobData = {
        jobCount: 0,
        avgSalary: fallbackSalary.avg,
        minSalary: fallbackSalary.min,
        maxSalary: fallbackSalary.max,
        topLocations: [],
        country: normalizedCountry,
        apiError: err.message
      };
    }

    const demandScore = calculateDemandScore({
      jobCount,
      avgSalary,
      trendGrowth: trendsData.growth,
    });

    const trendStatus = getTrendStatus(trendsData.growth);

    return {
      skill: validatedSkill,
      jobData,
      trendsData,
      demandScore,
      trendStatus,
    };
  };

  const analyzeSkill = useCallback(async (input, country = 'in') => {
    if (!input.trim()) {
      setError('Please enter a skill to analyze');
      return;
    }

    const normalizedCountry = country.toLowerCase();
    
    // Check if input is a comparison (contains ' vs ' or ',')
    const rawSkills = input.split(/\s+vs\s+|,\s*/i).filter(s => s.trim().length > 0);
    const isComparison = rawSkills.length > 1;

    setLoading(true);
    setError(null);

    try {
      // Check cache first (using the full input string)
      const cacheKey = `analysis_${input.toLowerCase()}_${normalizedCountry}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Analyze all skills in parallel
      const results = await Promise.all(rawSkills.map(skill => analyzeSingleSkill(skill, normalizedCountry)));

      // If comparison, build combined trends data
      let combinedTrendsData = null;
      if (isComparison) {
        // Assume all skills have the same 12 months in their trendData array
        // We'll map through the first skill's trendData dates and grab values from all skills
        const months = results[0].trendsData.trendData.map(d => d.date);
        
        combinedTrendsData = months.map((month, index) => {
          const entry = { date: month };
          results.forEach(res => {
            entry[res.skill] = res.trendsData.trendData[index]?.value || 0;
          });
          return entry;
        });
      }

      const analysisData = {
        isComparison,
        input: rawSkills.join(' vs '),
        country: normalizedCountry,
        skills: results,
        combinedTrendsData,
        relatedSkills: getRelatedSkills(results[0].skill),
        // Fallback properties for components expecting single skill format when not comparing
        ...(isComparison ? {} : results[0]),
      };

      setCachedData(cacheKey, analysisData);
      
      // Add to recent searches (use main score if single, or highest score if multiple)
      const highestScore = Math.max(...results.map(r => r.demandScore.score));
      addRecentSearch(analysisData.input, highestScore);

      setData(analysisData);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze skill. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    if (!data) return;

    const input = data.input;
    const normalizedCountry = data.country || 'in';
    setLoading(true);
    setError(null);

    try {
      const cacheKey = `analysis_${input.toLowerCase()}_${normalizedCountry}`;
      clearCachedDataByKey(cacheKey);
      await analyzeSkill(input, normalizedCountry);
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh data. Please try again.');
      setLoading(false);
    }
  }, [data, analyzeSkill]);

  return {
    data,
    loading,
    error,
    analyzeSkill,
    clearData,
    refreshData,
  };
}

