/* ================================================================
   ALTF Love IMG — browser image processing toolkit
   100% client-side. Canvas / File / Blob APIs only. No backend.
================================================================ */

export const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const ACCEPTED_TYPES = "image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp";

/** Read a File into an HTMLImageElement + object URL. */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        img,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try a different file."));
    };
    img.src = url;
  });
}

/** Load an image element directly from a data/object URL (no revoke). */
export function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load."));
    img.src = src;
  });
}

/** Promise wrapper around canvas.toBlob. */
export function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed."))),
      type,
      quality
    );
  });
}

function makeCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  return canvas;
}

/* ---------------- Resize ---------------- */
export async function resize(img, { width, height, type = "image/png", quality = 0.92 } = {}) {
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/* ---------------- Compress ---------------- */
export async function compress(
  img,
  { quality = 0.7, type = "image/jpeg", maxWidth = null, background = "#ffffff" } = {}
) {
  let { width, height } = { width: img.naturalWidth, height: img.naturalHeight };
  if (maxWidth && width > maxWidth) {
    height = Math.round((maxWidth / width) * height);
    width = maxWidth;
  }
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (type === "image/jpeg") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width, height };
}

/* ---------------- Crop ---------------- */
/** crop region given in source-pixel coordinates */
export async function crop(img, { x, y, width, height, type = "image/png", quality = 0.92, background = "#ffffff" } = {}) {
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/* ---------------- Rotate / Flip ---------------- */
export async function transform(
  img,
  { degrees = 0, flipH = false, flipV = false, type = "image/png", quality = 0.92, background = "#ffffff" } = {}
) {
  const rad = (degrees * Math.PI) / 180;
  const swap = degrees === 90 || degrees === 270;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = makeCanvas(swap ? h : w, swap ? w : h);
  const ctx = canvas.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -w / 2, -h / 2);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/* ---------------- Format conversion ---------------- */
export async function convert(img, { type = "image/png", quality = 0.92, background = "#ffffff" } = {}) {
  const canvas = makeCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/* ---------------- Filters / editor ---------------- */
export function buildFilterString({
  brightness = 100,
  contrast = 100,
  saturation = 100,
  exposure = 100,
  blur = 0,
  grayscale = 0,
  sepia = 0,
} = {}) {
  // exposure is emulated via an extra brightness multiplier
  const bright = (brightness / 100) * (exposure / 100) * 100;
  return [
    `brightness(${bright}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
    `blur(${blur}px)`,
    `grayscale(${grayscale}%)`,
    `sepia(${sepia}%)`,
  ].join(" ");
}

/** Apply css-style filters + optional unsharp-style sharpen via convolution. */
export async function applyFilters(img, adjustments = {}, { type = "image/png", quality = 0.92 } = {}) {
  const { sharpen = 0 } = adjustments;
  const canvas = makeCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  ctx.filter = buildFilterString(adjustments);
  if (type === "image/jpeg") {
    ctx.save();
    ctx.filter = "none";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  ctx.drawImage(img, 0, 0);
  if (sharpen > 0) {
    sharpenInPlace(ctx, canvas.width, canvas.height, sharpen / 100);
  }
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: canvas.width, height: canvas.height };
}

/** Simple 3x3 sharpen convolution, mix controls intensity (0..1). */
function sharpenInPlace(ctx, w, h, mix) {
  if (w * h > 6_000_000) return; // guard very large images
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const a = mix;
  const kernel = [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0];
  const s = src.data;
  const d = out.data;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += s[idx] * kernel[k++];
          }
        }
        const o = (y * w + x) * 4 + c;
        d[o] = Math.max(0, Math.min(255, sum));
      }
      const o = (y * w + x) * 4;
      d[o + 3] = s[o + 3];
    }
  }
  // copy edges
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0 && s[i + 3] !== 0) {
      d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = s[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

/* ---------------- Watermark ---------------- */
export async function watermarkText(
  img,
  {
    text = "ALTF",
    fontSize = 8, // percent of image width
    color = "#ffffff",
    opacity = 0.5,
    position = "bottom-right",
    rotation = 0,
    fontFamily = "Geist, sans-serif",
    tile = false,
    type = "image/png",
    quality = 0.92,
  } = {}
) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0);
  const px = Math.max(10, (fontSize / 100) * w);
  ctx.font = `700 ${px}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.textBaseline = "middle";

  if (tile) {
    ctx.textAlign = "center";
    const stepX = ctx.measureText(text).width * 1.8 || px * 4;
    const stepY = px * 3;
    for (let y = stepY / 2; y < h + stepY; y += stepY) {
      for (let x = stepX / 2; x < w + stepX; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    const { tx, ty, align } = anchorPoint(position, w, h, px);
    ctx.textAlign = align;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: w, height: h };
}

export async function watermarkImage(
  img,
  markImg,
  {
    scale = 25, // percent of base width
    opacity = 0.5,
    position = "bottom-right",
    rotation = 0,
    margin = 4, // percent
    type = "image/png",
    quality = 0.92,
  } = {}
) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0);
  const mw = (scale / 100) * w;
  const mh = (mw / markImg.naturalWidth) * markImg.naturalHeight;
  const m = (margin / 100) * w;
  const { x, y } = blockAnchor(position, w, h, mw, mh, m);
  ctx.globalAlpha = opacity;
  ctx.save();
  ctx.translate(x + mw / 2, y + mh / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(markImg, -mw / 2, -mh / 2, mw, mh);
  ctx.restore();
  ctx.globalAlpha = 1;
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: w, height: h };
}

function anchorPoint(position, w, h, px) {
  const pad = px * 0.6;
  const map = {
    "top-left": { tx: pad, ty: pad + px / 2, align: "left" },
    "top-center": { tx: w / 2, ty: pad + px / 2, align: "center" },
    "top-right": { tx: w - pad, ty: pad + px / 2, align: "right" },
    center: { tx: w / 2, ty: h / 2, align: "center" },
    "bottom-left": { tx: pad, ty: h - pad - px / 2, align: "left" },
    "bottom-center": { tx: w / 2, ty: h - pad - px / 2, align: "center" },
    "bottom-right": { tx: w - pad, ty: h - pad - px / 2, align: "right" },
  };
  return map[position] || map["bottom-right"];
}

function blockAnchor(position, w, h, mw, mh, m) {
  const map = {
    "top-left": { x: m, y: m },
    "top-center": { x: (w - mw) / 2, y: m },
    "top-right": { x: w - mw - m, y: m },
    center: { x: (w - mw) / 2, y: (h - mh) / 2 },
    "bottom-left": { x: m, y: h - mh - m },
    "bottom-center": { x: (w - mw) / 2, y: h - mh - m },
    "bottom-right": { x: w - mw - m, y: h - mh - m },
  };
  return map[position] || map["bottom-right"];
}

/* ---------------- Meme ---------------- */
export async function drawMeme(
  img,
  {
    topText = "",
    bottomText = "",
    fontSize = 9, // percent of width
    color = "#ffffff",
    strokeColor = "#000000",
    strokeWidth = 3,
    fontFamily = "Impact, Geist, sans-serif",
    uppercase = true,
    type = "image/png",
    quality = 0.92,
  } = {}
) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const px = (fontSize / 100) * w;
  ctx.font = `700 ${px}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.lineWidth = (strokeWidth / 100) * px * 4;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = color;

  const render = (text, baseline, yPos) => {
    if (!text) return;
    ctx.textBaseline = baseline;
    const t = uppercase ? text.toUpperCase() : text;
    const lines = wrapText(ctx, t, w * 0.92);
    const lineH = px * 1.05;
    lines.forEach((line, i) => {
      const y = baseline === "top" ? yPos + i * lineH : yPos - (lines.length - 1 - i) * lineH;
      if (ctx.lineWidth > 0) ctx.strokeText(line, w / 2, y);
      ctx.fillText(line, w / 2, y);
    });
  };
  render(topText, "top", px * 0.3);
  render(bottomText, "bottom", h - px * 0.3);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: w, height: h };
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------------- Upscale (browser, bicubic-ish) ---------------- */
export async function upscale(img, { factor = 2, sharpen = 20, type = "image/png", quality = 0.95 } = {}) {
  const w = Math.round(img.naturalWidth * factor);
  const h = Math.round(img.naturalHeight * factor);
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  if (sharpen > 0) sharpenInPlace(ctx, w, h, sharpen / 100);
  const blob = await canvasToBlob(canvas, type, quality);
  return { blob, width: w, height: h };
}
