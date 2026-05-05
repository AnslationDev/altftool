"use client";
export const calculateRate = (rates, fromCurrency, toCurrency, amount) => {
  const rateFrom = rates[fromCurrency];
  const rateTo = rates[toCurrency];

  if (!rateFrom || !rateTo) return { finalRate: null, result: null };

  const finalRate = rateTo / rateFrom;
  const result = amount * finalRate;

  return { finalRate, result };
};
