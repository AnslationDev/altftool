"use client";

export const HAIR_COLORS = [
  { name: "Jet Black", hex: "#0A0A0A", category: "Natural" },
  { name: "Dark Brown", hex: "#2B1A12", category: "Natural" },
  { name: "Medium Brown", hex: "#4A3225", category: "Natural" },
  { name: "Light Brown", hex: "#7D5D42", category: "Natural" },
  { name: "Auburn", hex: "#7A2E16", category: "Warm" },
  { name: "Copper Red", hex: "#B44B22", category: "Warm" },
  { name: "Mahogany", hex: "#4C1C1D", category: "Warm" },
  { name: "Golden Blonde", hex: "#D6AF64", category: "Blonde" },
  { name: "Platinum Blonde", hex: "#EAE6D8", category: "Blonde" },
  { name: "Ash Blonde", hex: "#C2B59B", category: "Blonde" },
  { name: "Rose Gold", hex: "#C79386", category: "Fashion" },
  { name: "Pastel Pink", hex: "#F9A8D4", category: "Fashion" },
  { name: "Lilac", hex: "#D8B4FE", category: "Fashion" },
  { name: "Ocean Blue", hex: "#0284C7", category: "Fashion" },
  { name: "Caramel Highlights", hex: "#B88E53", category: "Highlight" },
  { name: "Honey Highlights", hex: "#D4AF37", category: "Highlight" },
];

export function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, "");
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export async function initImageSegmenter() {
  return {
    segment: (img) => {
      return {
        categoryMask: {
          getAsUint8Array: () => new Uint8Array(img.width * img.height),
        },
      };
    },
  };
}

export async function applyHairColor(canvas, hexColor, intensity = 0.5) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const targetRgb = hexToRgb(hexColor);

  const hairStartY = 0;
  const hairEndY = Math.round(canvas.height * 0.35);

  for (let y = hairStartY; y < hairEndY; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      if (idx >= 0 && idx < data.length) {
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance < 110) {
          data[idx] = Math.round(r * (1 - intensity) + targetRgb.r * intensity);
          data[idx + 1] = Math.round(g * (1 - intensity) + targetRgb.g * intensity);
          data[idx + 2] = Math.round(b * (1 - intensity) + targetRgb.b * intensity);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
