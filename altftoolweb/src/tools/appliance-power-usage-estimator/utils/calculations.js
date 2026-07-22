export const calculateApplianceMetrics = (appliance, rate) => {
  const { wattage, hoursPerDay, quantity } = appliance;
  const watts = Number(wattage) || 0;
  const hours = Number(hoursPerDay) || 0;
  const qty = Number(quantity) || 0;
  const costPerUnit = Number(rate) || 0;

  const dailyUnits = (watts * hours * qty) / 1000;
  const monthlyUnits = dailyUnits * 30;
  const yearlyUnits = dailyUnits * 365;

  const dailyCost = dailyUnits * costPerUnit;
  const monthlyCost = monthlyUnits * costPerUnit;
  const yearlyCost = yearlyUnits * costPerUnit;

  return {
    dailyUnits,
    monthlyUnits,
    yearlyUnits,
    dailyCost,
    monthlyCost,
    yearlyCost,
  };
};

export const calculateTotals = (appliances, rate) => {
  return appliances.reduce(
    (acc, appliance) => {
      const metrics = calculateApplianceMetrics(appliance, rate);
      acc.totalDailyUnits += metrics.dailyUnits;
      acc.totalMonthlyUnits += metrics.monthlyUnits;
      acc.totalYearlyUnits += metrics.yearlyUnits;
      acc.totalMonthlyCost += metrics.monthlyCost;
      acc.totalYearlyCost += metrics.yearlyCost;

      if (metrics.monthlyCost > acc.highestConsumingValue) {
        acc.highestConsumingValue = metrics.monthlyCost;
        acc.highestConsumingAppliance = appliance.name;
      }

      return acc;
    },
    {
      totalDailyUnits: 0,
      totalMonthlyUnits: 0,
      totalYearlyUnits: 0,
      totalMonthlyCost: 0,
      totalYearlyCost: 0,
      highestConsumingAppliance: "None",
      highestConsumingValue: 0,
    }
  );
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatUnits = (value) => {
  return value.toFixed(2) + " kWh";
};
