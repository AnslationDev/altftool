/**
 * Calculates the future salary projection year by year.
 * 
 * @param {number} currentSalary 
 * @param {number} annualIncrement Percentage
 * @param {number} years 
 * @returns {Object} An object containing the year-by-year data and summary stats
 */
export function calculateSalaryProjection(currentSalary, annualIncrement, years) {
  const data = [];
  let salary = currentSalary;
  let totalEarned = 0;

  for (let i = 1; i <= years; i++) {
    // Add current year's salary to total
    totalEarned += salary;
    
    data.push({
      year: i,
      salary: salary,
      totalEarnedSoFar: totalEarned
    });

    // Apply increment for the next year
    salary = salary * (1 + annualIncrement / 100);
  }

  const finalSalary = data[data.length - 1]?.salary || 0;
  const averageSalary = totalEarned / years || 0;

  return {
    yearlyData: data,
    summary: {
      finalSalary,
      totalEarned,
      averageSalary
    }
  };
}
