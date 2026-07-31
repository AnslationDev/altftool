
export const truncateText = (text, maxLength = 120) => {
  const value = typeof text === "string" ? text : "";
  return value.length > maxLength ? value.slice(0, maxLength) + "…" : value;
};