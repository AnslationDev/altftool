const PALETTES = [
  ["#14B8A6", "#0D9488", "#0F766E", "#115E59", "#134E4A", "#5EEAD4", "#2DD4BF", "#99F6E4"],
  ["#F43F5E", "#E11D48", "#BE123C", "#FB7185", "#FDA4AF", "#FECDD3", "#FFE4E6", "#FFE4E6"],
  ["#8B5CF6", "#7C3AED", "#6D28D9", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE", "#F5F3FF"],
  ["#3B82F6", "#2563EB", "#1D4ED8", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE", "#EFF6FF"],
  ["#F59E0B", "#D97706", "#B45309", "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7", "#FFFBEB"],
  ["#10B981", "#059669", "#047857", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5", "#ECFDF5"],
  ["#EC4899", "#DB2777", "#BE185D", "#F472B6", "#F9A8D4", "#FBCFE8", "#FCE7F3", "#FDF2F8"],
  ["#6366F1", "#4F46E5", "#4338CA", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF", "#EEF2FF"],
];

export function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const palette = PALETTES[i % PALETTES.length];
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

export function getWheelTheme(name) {
  const themes = {
    ocean: ["#0EA5E9", "#0284C7", "#0369A1", "#38BDF8", "#7DD3FC", "#BAE6FD", "#E0F2FE", "#F0F9FF"],
    sunset: ["#F97316", "#EA580C", "#C2410C", "#FB923C", "#FDBA74", "#FED7AA", "#FFEDD5", "#FFF7ED"],
    forest: ["#22C55E", "#16A34A", "#15803D", "#4ADE80", "#86EFAC", "#BBF7D0", "#DCFCE7", "#F0FDF4"],
    midnight: ["#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#E2E8F0", "#F1F5F9"],
    candy: ["#EC4899", "#F43F5E", "#8B5CF6", "#3B82F6", "#14B8A6", "#F59E0B", "#22C55E", "#EF4444"],
  };
  return themes[name] || PALETTES[0];
}
