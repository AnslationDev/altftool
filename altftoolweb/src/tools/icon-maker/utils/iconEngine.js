"use client";

export const ANDROID_SIZES = [48, 72, 96, 144, 192, 512];
export const FAVICON_SIZES = [16, 32, 48];
export const PWA_SIZES = [192, 512];
export const MULTI_SIZES = [64, 128, 256, 512, 1024];

export const ICON_PATHS = {
  home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z",
  user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-9 9a9 9 0 0 1 18 0v1H3v-1z",
  settings:
    "M19.4 13.5a7.8 7.8 0 0 0 .1-1.5 7.8 7.8 0 0 0-.1-1.5l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-2.6-1.5L14 2h-4l-.4 2.5A7.7 7.7 0 0 0 7 6L4.6 5 2.6 8.5l2 1.5a7.8 7.8 0 0 0-.1 1.5c0 .5 0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 2.6 1.5L10 22h4l.4-2.5A7.7 7.7 0 0 0 17 18l2.4 1 2-3.5-2-1.5zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z",
  search: "M10.5 18a7.5 7.5 0 1 1 5.3-12.8 7.5 7.5 0 0 1-5.3 12.8zm5.8-1.7L22 22l-1.8 1.8-5.7-5.7 1.8-1.8z",
  camera:
    "M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  heart:
    "M12 21s-7.5-4.6-9.5-9.3C.8 7.8 3.1 4 7 4c2.1 0 3.8 1.2 5 3 1.2-1.8 2.9-3 5-3 3.9 0 6.2 3.8 4.5 7.7C19.5 16.4 12 21 12 21z",
};

export const createDefaultState = () => ({
  iconType: "text",
  text: "AI",
  libraryIcon: "spark",
  shape: "rounded",
  size: 512,
  textColor: "#ffffff",
  iconColor: "#ffffff",
  backgroundMode: "gradient",
  gradientType: "linear",
  backgroundColor: "#0f172a",
  gradientFrom: "#06b6d4",
  gradientMiddle: "#3b82f6",
  gradientTo: "#7c3aed",
  gradientAngle: 135,
  transparent: false,
  borderWidth: 0,
  borderColor: "#ffffff",
  radius: 28,
  shadow: true,
  glow: true,
  blur: 22,
  iconScale: 62,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  uploadSrc: "",
  uploadName: "",
  exportFormat: "png",
  previewSurface: "dark",
});

export const presets = [
  {
    name: "Neon",
    patch: {
      backgroundMode: "gradient",
      gradientFrom: "#00f5ff",
      gradientTo: "#ff2bd6",
      textColor: "#ffffff",
      iconColor: "#ffffff",
      glow: true,
      shadow: true,
      radius: 30,
    },
  },
  {
    name: "Glass",
    patch: {
      backgroundMode: "gradient",
      gradientFrom: "#64748b",
      gradientTo: "#0f172a",
      borderWidth: 3,
      borderColor: "#dbeafe",
      glow: false,
      shadow: true,
      radius: 34,
    },
  },
  {
    name: "Material",
    patch: {
      backgroundMode: "solid",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
      iconColor: "#ffffff",
      shadow: true,
      glow: false,
      radius: 24,
    },
  },
  {
    name: "Flat",
    patch: {
      backgroundMode: "solid",
      backgroundColor: "#10b981",
      textColor: "#052e16",
      iconColor: "#052e16",
      shadow: false,
      glow: false,
      radius: 18,
    },
  },
  {
    name: "Minimal",
    patch: {
      backgroundMode: "solid",
      backgroundColor: "#f8fafc",
      textColor: "#111827",
      iconColor: "#111827",
      borderWidth: 2,
      borderColor: "#cbd5e1",
      shadow: false,
      glow: false,
      radius: 16,
    },
  },
];

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function polygonPath(ctx, points) {
  ctx.beginPath();
  points.forEach(([px, py], index) => {
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

function regularPolygonPoints(sides, size, radius, rotation = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (Math.PI * 2 * index) / sides;
    return [size / 2 + radius * Math.cos(angle), size / 2 + radius * Math.sin(angle)];
  });
}

function shapePath(ctx, state, size) {
  const inset = Math.max(0, state.borderWidth / 2);
  const w = size - inset * 2;
  const x = inset;
  const y = inset;
  if (state.shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, w / 2, 0, Math.PI * 2);
    ctx.closePath();
    return;
  }
  if (state.shape === "hexagon") {
    polygonPath(ctx, regularPolygonPoints(6, size, w / 2, -Math.PI / 6));
    return;
  }
  if (state.shape === "octagon") {
    polygonPath(ctx, regularPolygonPoints(8, size, w / 2, Math.PI / 8));
    return;
  }
  if (state.shape === "diamond") {
    polygonPath(ctx, [[size / 2, y], [x + w, size / 2], [size / 2, y + w], [x, size / 2]]);
    return;
  }
  if (state.shape === "triangle") {
    polygonPath(ctx, [[size / 2, y], [x + w, y + w], [x, y + w]]);
    return;
  }
  if (state.shape === "star") {
    const points = [];
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? w / 2 : w * 0.22;
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 10;
      points.push([size / 2 + radius * Math.cos(angle), size / 2 + radius * Math.sin(angle)]);
    }
    polygonPath(ctx, points);
    return;
  }
  if (state.shape === "shield") {
    polygonPath(ctx, [[size / 2, y], [x + w * 0.9, y + w * 0.18], [x + w * 0.78, y + w * 0.72], [size / 2, y + w], [x + w * 0.22, y + w * 0.72], [x + w * 0.1, y + w * 0.18]]);
    return;
  }
  if (state.shape === "rectangle") {
    roundedRectPath(ctx, x, y + size * 0.12, w, size * 0.76, (state.radius / 100) * size * 0.3);
    return;
  }
  if (state.shape === "pill") {
    roundedRectPath(ctx, x, y + size * 0.18, w, size * 0.64, size * 0.32);
    return;
  }
  if (state.shape === "square") {
    roundedRectPath(ctx, x, y, w, w, 4);
    return;
  }
  if (state.shape === "squircle" || state.shape === "app tile") {
    roundedRectPath(ctx, x, y, w, w, size * 0.24);
    return;
  }
  roundedRectPath(ctx, x, y, w, w, (state.radius / 100) * size * 0.32);
}

function getBackground(ctx, state, size) {
  if (state.backgroundMode !== "gradient") return state.backgroundColor;
  if (state.gradientType === "radial") {
    const gradient = ctx.createRadialGradient(size * 0.32, size * 0.28, size * 0.08, size / 2, size / 2, size * 0.72);
    gradient.addColorStop(0, state.gradientFrom);
    if (state.gradientMiddle) gradient.addColorStop(0.52, state.gradientMiddle);
    gradient.addColorStop(1, state.gradientTo);
    return gradient;
  }
  const angle = (state.gradientAngle * Math.PI) / 180;
  const x = Math.cos(angle) * size * 0.5;
  const y = Math.sin(angle) * size * 0.5;
  const gradient = ctx.createLinearGradient(size / 2 - x, size / 2 - y, size / 2 + x, size / 2 + y);
  gradient.addColorStop(0, state.gradientFrom);
  if (state.gradientMiddle) gradient.addColorStop(0.52, state.gradientMiddle);
  gradient.addColorStop(1, state.gradientTo);
  return gradient;
}

export function renderIconToCanvas(canvas, state, targetSize = state.size, imageElement = null) {
  const ctx = canvas.getContext("2d");
  canvas.width = targetSize;
  canvas.height = targetSize;
  ctx.clearRect(0, 0, targetSize, targetSize);

  if (!state.transparent) {
    ctx.save();
    if (state.shadow || state.glow) {
      ctx.shadowColor = state.glow ? state.gradientTo || state.iconColor : "rgba(15, 23, 42, 0.35)";
      ctx.shadowBlur = state.glow ? state.blur : Math.max(8, state.blur * 0.55);
      ctx.shadowOffsetY = state.shadow ? targetSize * 0.035 : 0;
    }
    shapePath(ctx, state, targetSize);
    ctx.fillStyle = getBackground(ctx, state, targetSize);
    ctx.fill();
    ctx.restore();
  }

  if (state.borderWidth > 0 && !state.transparent) {
    ctx.save();
    shapePath(ctx, state, targetSize);
    ctx.strokeStyle = state.borderColor;
    ctx.lineWidth = state.borderWidth * (targetSize / state.size);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(targetSize / 2 + state.offsetX * (targetSize / state.size), targetSize / 2 + state.offsetY * (targetSize / state.size));
  ctx.rotate((state.rotation * Math.PI) / 180);
  const contentSize = targetSize * (state.iconScale / 100);

  if (state.iconType === "upload" && imageElement?.complete && imageElement.naturalWidth) {
    const scale = Math.min(contentSize / imageElement.naturalWidth, contentSize / imageElement.naturalHeight);
    const w = imageElement.naturalWidth * scale;
    const h = imageElement.naturalHeight * scale;
    ctx.drawImage(imageElement, -w / 2, -h / 2, w, h);
  } else if (state.iconType === "library") {
    const pathData = ICON_PATHS[state.libraryIcon] || ICON_PATHS.home;
    ctx.fillStyle = state.iconColor;
    ctx.scale(contentSize / 24, contentSize / 24);
    ctx.translate(-12, -12);
    ctx.fill(new Path2D(pathData));
  } else {
    const label = (state.text || "A").slice(0, 4);
    const fontSize = Math.max(12, contentSize / Math.max(1.1, label.length * 0.58));
    ctx.fillStyle = state.textColor;
    ctx.font = `900 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, fontSize * 0.03);
  }
  ctx.restore();
}

export function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function buildSvg(state, size = state.size) {
  const bg = state.backgroundMode === "gradient"
    ? `<defs>${svgGradient(state)}</defs>`
    : "";
  const fill = state.transparent ? "none" : state.backgroundMode === "gradient" ? "url(#g)" : state.backgroundColor;
  const background = svgShape(state, size, fill);
  const content = state.iconType === "library"
    ? `<path d="${ICON_PATHS[state.libraryIcon] || ICON_PATHS.home}" fill="${state.iconColor}" transform="translate(${size / 2 - (size * state.iconScale) / 200} ${size / 2 - (size * state.iconScale) / 200}) scale(${(size * state.iconScale) / 2400})"/>`
    : `<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="${state.textColor}" font-family="Arial, sans-serif" font-size="${Math.round(size * state.iconScale / Math.max(105, (state.text || "A").length * 52))}" font-weight="900">${escapeXml((state.text || "A").slice(0, 4))}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}${background}${content}</svg>`;
}

function svgGradient(state) {
  const middle = state.gradientMiddle ? `<stop offset="52%" stop-color="${state.gradientMiddle}"/>` : "";
  if (state.gradientType === "radial") {
    return `<radialGradient id="g" cx="32%" cy="28%" r="72%"><stop offset="0%" stop-color="${state.gradientFrom}"/>${middle}<stop offset="100%" stop-color="${state.gradientTo}"/></radialGradient>`;
  }
  return `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${state.gradientFrom}"/>${middle}<stop offset="100%" stop-color="${state.gradientTo}"/></linearGradient>`;
}

function svgShape(state, size, fill) {
  const stroke = `stroke="${state.borderColor}" stroke-width="${state.borderWidth}"`;
  const points = (items) => items.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join(" ");
  const polygon = (items) => `<polygon points="${points(items)}" fill="${fill}" ${stroke}/>`;
  const radius = Math.round((state.radius / 100) * size * 0.32);

  if (state.shape === "circle") {
    return `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fill}" ${stroke}/>`;
  }
  if (state.shape === "rectangle") {
    return `<rect y="${size * 0.12}" width="${size}" height="${size * 0.76}" rx="${Math.round((state.radius / 100) * size * 0.3)}" fill="${fill}" ${stroke}/>`;
  }
  if (state.shape === "pill") {
    return `<rect y="${size * 0.18}" width="${size}" height="${size * 0.64}" rx="${size * 0.32}" fill="${fill}" ${stroke}/>`;
  }
  if (state.shape === "square") {
    return `<rect width="${size}" height="${size}" rx="4" fill="${fill}" ${stroke}/>`;
  }
  if (state.shape === "rounded") {
    return `<rect width="${size}" height="${size}" rx="${radius}" fill="${fill}" ${stroke}/>`;
  }
  if (state.shape === "squircle" || state.shape === "app tile") {
    return `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.24)}" fill="${fill}" ${stroke}/>`;
  }
  if (state.shape === "diamond") {
    return polygon([[size / 2, 0], [size, size / 2], [size / 2, size], [0, size / 2]]);
  }
  if (state.shape === "triangle") {
    return polygon([[size / 2, 0], [size, size], [0, size]]);
  }
  if (state.shape === "shield") {
    return polygon([[size / 2, 0], [size * 0.9, size * 0.18], [size * 0.78, size * 0.72], [size / 2, size], [size * 0.22, size * 0.72], [size * 0.1, size * 0.18]]);
  }
  if (state.shape === "star") {
    const star = Array.from({ length: 10 }, (_, index) => {
      const r = index % 2 === 0 ? size / 2 : size * 0.22;
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 10;
      return [size / 2 + r * Math.cos(angle), size / 2 + r * Math.sin(angle)];
    });
    return polygon(star);
  }

  const sides = state.shape === "octagon" ? 8 : 6;
  const rotation = state.shape === "octagon" ? Math.PI / 8 : -Math.PI / 6;
  return polygon(regularPolygonPoints(sides, size, size / 2, rotation));
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[char]);
}

export async function createIcoBlob(canvas, sizes = FAVICON_SIZES) {
  const pngs = [];
  for (const size of sizes) {
    const temp = document.createElement("canvas");
    temp.width = size;
    temp.height = size;
    temp.getContext("2d").drawImage(canvas, 0, 0, size, size);
    const blob = await canvasToBlob(temp, "image/png");
    pngs.push({ size, bytes: new Uint8Array(await blob.arrayBuffer()) });
  }

  const headerSize = 6 + pngs.length * 16;
  const total = headerSize + pngs.reduce((sum, item) => sum + item.bytes.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, pngs.length, true);
  let imageOffset = headerSize;
  pngs.forEach((item, index) => {
    const offset = 6 + index * 16;
    out[offset] = item.size >= 256 ? 0 : item.size;
    out[offset + 1] = item.size >= 256 ? 0 : item.size;
    out[offset + 2] = 0;
    out[offset + 3] = 0;
    view.setUint16(offset + 4, 1, true);
    view.setUint16(offset + 6, 32, true);
    view.setUint32(offset + 8, item.bytes.length, true);
    view.setUint32(offset + 12, imageOffset, true);
    out.set(item.bytes, imageOffset);
    imageOffset += item.bytes.length;
  });
  return new Blob([out], { type: "image/x-icon" });
}
