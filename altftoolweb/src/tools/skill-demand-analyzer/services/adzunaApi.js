import axios from 'axios';

/**
 * Fetch job data from Adzuna API via our backend proxy
 * @param {string} skill - The skill to search for
 * @param {string} country - The country code (e.g., 'in', 'us', 'gb')
 */
export async function fetchAdzunaJobs(skill, country = 'in') {
  try {
    const response = await axios.get('/api/tools/skill-demand/jobs', {
      params: {
        skill,
        country
      }
    });

    console.log("response data of adzuna api: ", response.data);
    return response.data;
  } catch (error) {
    console.error('Adzuna Proxy API error:', error);

    // Check if it's a configuration error from the server
    if (error.response?.data?.error?.includes('API keys are missing')) {
      const configError = new Error(error.response.data.error);
      configError.isConfigError = true;
      throw configError;
    }

    throw new Error(error.response?.data?.error || 'Failed to fetch job data. Please try again.');
  }
}

