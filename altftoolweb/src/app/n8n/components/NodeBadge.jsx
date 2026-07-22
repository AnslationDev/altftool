// Small colored badge representing an n8n node, keyed by name for a stable color.
const PALETTE = [
  "#6D5EF8", "#E8618C", "#12B5A6", "#F5A623", "#3B82F6",
  "#8B5CF6", "#EF4444", "#10B981", "#F97316", "#0EA5E9",
];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

// Pick black or white text for readable contrast against the badge color.
function textColorFor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance (sRGB weights). Light backgrounds get dark text.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}

function initials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "N";
}

export default function NodeBadge({ name, size = 26, title }) {
  const bg = colorFor(name);
  return (
    <span
      title={title || name}
      className="inline-flex items-center justify-center rounded-md font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        color: textColorFor(bg),
        fontSize: size * 0.4,
      }}
    >
      {initials(name)}
    </span>
  );
}
