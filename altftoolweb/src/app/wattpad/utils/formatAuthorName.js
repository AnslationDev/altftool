export function formatAuthorName(authorId) {
  if (!authorId || typeof authorId !== "string") return "Unknown Author";
  const cleaned = authorId.replace(/^(user|author|usr)[_-]?/i, "").trim();
  if (!cleaned) return "Unknown Author";
  if (/^[0-9a-f]+$/i.test(cleaned)) return `Author ${cleaned}`;
  return cleaned
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
