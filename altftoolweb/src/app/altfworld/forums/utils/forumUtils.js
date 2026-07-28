export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function paginate(items, page = 1, pageSize = 12) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getCategoryThreadCount(categorySlug, threads) {
  return threads.filter((thread) => thread.categorySlug === categorySlug).length;
}
