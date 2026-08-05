export const extractHistoricalRate = (data, date, quote) => {
  const nestedRate = data?.rates?.[date]?.[quote];
  const flatRate = data?.rates?.[quote];
  const rate = Number(nestedRate ?? flatRate);

  return Number.isFinite(rate) && rate > 0 ? rate : null;
};
