import axios from 'axios';

/**
 * Fetch Google Trends data for a skill using the backend API route
 * @param {string} skill - The skill to search for
 * @param {string} country - The country code or country name
 */
export async function fetchGoogleTrends(skill, country = 'in') {
  try {
    const response = await axios.get('/api/trends', {
      params: {
        skill,
        country,
      },
    });

    if (response.data?.error) {
      throw new Error(response.data.error);
    }

    const payload = response.data;
    const trendData = Array.isArray(payload.labels)
      ? payload.labels.map((label, index) => ({
          date: label,
          value: Number.isFinite(Number(payload.values[index])) ? Number(payload.values[index]) : 0,
        }))
      : [];

    return {
      ...payload,
      trendData,
      growth: payload.percentageChange,
    };
  } catch (error) {
    console.error('Google Trends API Error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch trend data from Google Trends. Please try again.');
  }
}
