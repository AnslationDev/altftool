const DAYS_PER_MONTH = 30;

export function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatUnits(value) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(value >= 100 ? 0 : 1)} kWh`;
}

export function getEfficiencyReduction(appliance) {
  const name = appliance.name.toLowerCase();
  if (name.includes("ac")) return 0.3;
  if (name.includes("fridge") || name.includes("refrigerator")) return 0.25;
  if (name.includes("fan")) return 0.35;
  if (name.includes("light") || name.includes("bulb")) return 0.35;
  if (name.includes("geyser") || name.includes("heater")) return 0.25;
  if (name.includes("cooler")) return 0.2;
  if (name.includes("washing")) return 0.18;
  if (name.includes("tv") || name.includes("television")) return 0.18;
  if (name.includes("microwave") || name.includes("oven")) return 0.12;
  if (name.includes("laptop") || name.includes("computer")) return 0.1;

  const categoryFallback = {
    Kitchen: 0.18,
    Bedroom: 0.2,
    Hall: 0.18,
    Bathroom: 0.25,
    Outdoor: 0.16,
    Other: 0.15,
  };

  return categoryFallback[appliance.roomCategory] || 0.15;
}

export function calculateSlabBill(monthlyUnits, state, includeTax, customTaxPercent, customRate) {
  let energyCharge = 0;

  if (customRate && Number(customRate) > 0) {
    energyCharge = monthlyUnits * Number(customRate);
  }

  const fixedCharge = monthlyUnits > 0 ? (state?.fixedCharge ?? 0) : 0;
  const taxableAmount = energyCharge + fixedCharge;
  const activeTaxPercent = customTaxPercent !== undefined ? customTaxPercent : (state?.taxPercent ?? 0);
  const taxAmount = includeTax ? (taxableAmount * activeTaxPercent) / 100 : 0;

  return {
    energyCharge,
    fixedCharge,
    taxAmount,
    totalCost: taxableAmount + taxAmount,
  };
}

export function calculateDashboard(
  appliances,
  state,
  includeTax,
  efficientMode = false,
  customTaxPercent,
  customRate,
) {
  const usageWithoutCost = appliances.map((appliance) => {
    const optimizedWattage = efficientMode
      ? appliance.wattage * (1 - getEfficiencyReduction(appliance))
      : appliance.wattage;
    const dailyUnits = (optimizedWattage * appliance.quantity * appliance.hoursPerDay) / 1000;
    const monthlyUnits = dailyUnits * DAYS_PER_MONTH;

    return {
      id: appliance.id,
      name: appliance.name,
      roomCategory: appliance.roomCategory,
      wattage: appliance.wattage,
      optimizedWattage,
      dailyUnits,
      monthlyUnits,
      yearlyUnits: monthlyUnits * 12,
      monthlyCost: 0,
      sharePercent: 0,
    };
  });

  const monthlyUnits = usageWithoutCost.reduce((total, item) => total + item.monthlyUnits, 0);
  const bill = calculateSlabBill(monthlyUnits, state, includeTax, customTaxPercent, customRate);
  const effectiveCostPerUnit = monthlyUnits > 0 ? bill.totalCost / monthlyUnits : 0;
  const applianceBreakdown = usageWithoutCost.map((item) => ({
    ...item,
    monthlyCost: item.monthlyUnits * effectiveCostPerUnit,
    sharePercent: monthlyUnits > 0 ? (item.monthlyUnits / monthlyUnits) * 100 : 0,
  }));

  const biggestConsumer = applianceBreakdown.reduce((winner, item) => {
    if (!winner || item.monthlyUnits > winner.monthlyUnits) return item;
    return winner;
  }, undefined);

  return {
    dailyUnits: monthlyUnits / DAYS_PER_MONTH,
    monthlyUnits,
    yearlyUnits: monthlyUnits * 12,
    dailyCost: bill.totalCost / DAYS_PER_MONTH,
    monthlyCost: bill.totalCost,
    yearlyCost: bill.totalCost * 12,
    effectiveCostPerUnit,
    energyCharge: bill.energyCharge,
    fixedCharge: bill.fixedCharge,
    taxAmount: bill.taxAmount,
    applianceBreakdown,
    biggestConsumer,
    efficientMode,
  };
}

export function buildProjection(monthlyCost, months = 12) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index + 1, 1);
    const month = date.toLocaleString("en-IN", { month: "short" });
    const seasonalLift = [3, 4, 5, 6, 7, 8].includes(date.getMonth()) ? 1.09 : 1;
    const growth = 1 + index * 0.012;
    const projected = monthlyCost * growth * seasonalLift;

    return {
      month,
      bill12M: Math.round(projected),
      bill6M: index < 6 ? Math.round(projected) : null,
    };
  });
}

export function estimateOneHourSaving(appliance, effectiveCostPerUnit) {
  const dailyUnits = (appliance.wattage * appliance.quantity) / 1000;
  return dailyUnits * DAYS_PER_MONTH * effectiveCostPerUnit;
}