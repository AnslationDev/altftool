
export const truncateText = (text, maxLength = 120) =>
text.length > maxLength ? text.slice(0, maxLength) + "…" : text;