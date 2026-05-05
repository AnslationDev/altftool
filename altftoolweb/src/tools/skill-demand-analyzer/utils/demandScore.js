/**
 * Calculate demand score based on job count, salary, and trend growth
 * Score ranges from 0-100
 * 
 * Weights:
 * - Job Count: 50%
 * - Salary: 20%
 * - Trend Growth: 30%
 */

// Reference values for normalization (based on typical market data)
const MAX_JOB_COUNT = 50000;
const MAX_SALARY = 200000;

export function calculateDemandScore(input) {
  const { jobCount, avgSalary, trendGrowth } = input;

  // Use Logarithmic scale for jobs to make it feel more realistic and industry-standard
  // Small counts grow fast, large counts require significant volume for 100%
  // 100 jobs -> 40%, 1,000 jobs -> 60%, 10,000 jobs -> 80%, 100,000+ jobs -> 100%
  const jobScore = Math.min((Math.log10(Math.max(1, jobCount)) / 5) * 100, 100);

  // Salary normalization (Refined for a more premium market cap)
  const salaryScore = Math.min((avgSalary / 250000) * 100, 100);

  // Trend score: Stable (0%) growth now starts at a solid 60 points
  // We reduce the impact of search trends since they are often noisy
  const trendScore = Math.max(20, Math.min(60 + (trendGrowth * 0.4), 100));

  // Calculate weighted score (Jobs carry the most weight for real-world demand)
  const score = (jobScore * 0.65) + (salaryScore * 0.25) + (trendScore * 0.10);


  // Determine level and color
  let level;
  let color;

  if (score >= 75) {
    level = 'Very High';
    color = 'text-blue-800';
  } else if (score >= 50) {
    level = 'High';
    color = 'text-blue-600';
  } else if (score >= 25) {
    level = 'Medium';
    color = 'text-blue-500';
  } else {
    level = 'Low';
    color = 'text-blue-400';
  }

  return {
    score: Math.round(score),
    jobScore: Math.round(jobScore),
    salaryScore: Math.round(salaryScore),
    trendScore: Math.round(trendScore),
    level,
    color,
  };
}

/**
 * Determine trend status based on growth percentage
 */
export function getTrendStatus(growth) {
  if (growth > 10) {
    return { status: 'Trending', icon: '↑', color: 'text-white' };
  } else if (growth < -10) {
    return { status: 'Declining', icon: '↓', color: 'text-white' };
  } else {
    return { status: 'Stable', icon: '→', color: 'text-white' };
  }
}
