export const ALTF_BRAND = Object.freeze({
  name: "AltFTool",
  shortName: "Alt F",
  tagline: "Tools for better work",
  markViewBox: "0 0 154 173",
  markPath:
    "M0 56 56 0h98l-18 28H86v28h25v29H86v88l-29-29V85H40V56h17V29L29 57v60L0 88V56Z",
});

export function renderBrandMarkSvg({
  title = "AltFTool",
  foreground = "#14b8a6",
  accent = "#22d3ee",
} = {}) {
  const safeTitle = String(title)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 154 173" role="img" aria-labelledby="title">',
    `<title id="title">${safeTitle}</title>`,
    '<defs><linearGradient id="altf-brand-gradient" x1="22" y1="4" x2="127" y2="169" gradientUnits="userSpaceOnUse">',
    `<stop stop-color="${foreground}"/><stop offset="1" stop-color="${accent}"/>`,
    "</linearGradient></defs>",
    `<path d="${ALTF_BRAND.markPath}" fill="url(#altf-brand-gradient)"/>`,
    "</svg>",
  ].join("");
}
