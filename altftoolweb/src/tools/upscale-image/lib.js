/**
 * Image upscaling by separable filtered resampling.
 *
 * Enlarging an image means asking, for every output pixel, what colour the
 * source image would have at the matching sub-pixel position. That value is a
 * weighted average of nearby source pixels, with the weights coming from a
 * reconstruction kernel k(x):
 *
 *   out[i] = Σ src[j] · k(centre_i − j) / Σ k(centre_i − j)
 *
 * The pass is separable — filter every row horizontally, then filter the result
 * vertically — which turns an O(r²) 2-D convolution into two O(r) 1-D ones and
 * gives exactly the same answer for the kernels used here.
 *
 * Kernels implemented (all standard, all published definitions):
 *   nearest   box of radius 0.5 — keeps hard pixel edges, used for pixel art
 *   bilinear  triangle of radius 1
 *   bicubic   Catmull-Rom cubic, the a = −0.5 member of the Mitchell-Netravali
 *             family, which is the "bicubic" of Photoshop and ImageMagick
 *   lanczos3  sinc(x)·sinc(x/3) truncated at radius 3 — sharpest of the four
 *
 * Alpha is handled by convolving premultiplied colour, then un-premultiplying,
 * so transparent pixels cannot bleed their (undefined) colour into opaque ones.
 *
 * Pure module: no React, no DOM, no canvas. Everything works on plain RGBA
 * byte arrays, so the same code runs in a worker or in Node.
 */

/** Bytes per pixel in an RGBA buffer. */
export const CHANNELS = 4;

/** Largest output the browser can be asked for. 40 megapixels of RGBA is
 * roughly 160 MB in a single typed array, which is already near the practical
 * ceiling for a browser tab. */
export const MAX_OUTPUT_PIXELS = 40 * 1000 * 1000;

/** Largest input accepted, in pixels. */
export const MAX_INPUT_PIXELS = 40 * 1000 * 1000;

/** Scale factors offered. */
export const SCALE_PRESETS = [1.5, 2, 3, 4, 6, 8];

/** Allowed scale range. Below 0.05 or above 16 the result stops being useful. */
export const MIN_SCALE = 0.05;
export const MAX_SCALE = 16;

/** Catmull-Rom parameter. a = −0.5 is the value that makes the cubic
 * interpolate the source samples exactly and is what "bicubic" means in
 * mainstream image editors. */
export const CATMULL_ROM_A = -0.5;

/** Lanczos window size: the kernel is truncated at ±3 source pixels. */
export const LANCZOS_TAPS = 3;

/** Unsharp mask strength range. 0 means no sharpening. */
export const MAX_SHARPEN = 1.5;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function sinc(x) {
  if (x === 0) return 1;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

/** Kernel definitions: radius plus weight function. */
export const KERNELS = {
  nearest: {
    label: "Nearest neighbour",
    hint: "Hard pixel edges — best for pixel art and screenshots of text",
    radius: 0.5,
    weight: (x) => (Math.abs(x) <= 0.5 ? 1 : 0),
  },
  bilinear: {
    label: "Bilinear",
    hint: "Smoothest and softest, fastest to compute",
    radius: 1,
    weight: (x) => {
      const a = Math.abs(x);
      return a < 1 ? 1 - a : 0;
    },
  },
  bicubic: {
    label: "Bicubic (Catmull-Rom)",
    hint: "Balanced sharpness — the classic photo enlargement filter",
    radius: 2,
    weight: (x) => {
      const a = Math.abs(x);
      const A = CATMULL_ROM_A;
      if (a < 1) return (A + 2) * a * a * a - (A + 3) * a * a + 1;
      if (a < 2) return A * a * a * a - 5 * A * a * a + 8 * A * a - 4 * A;
      return 0;
    },
  },
  lanczos3: {
    label: "Lanczos 3",
    hint: "Sharpest detail retention, may ring slightly on hard edges",
    radius: LANCZOS_TAPS,
    weight: (x) => {
      const a = Math.abs(x);
      if (a >= LANCZOS_TAPS) return 0;
      return sinc(a) * sinc(a / LANCZOS_TAPS);
    },
  },
};

/**
 * Output dimensions for a scale factor, rounded to whole pixels.
 *
 * @param {number} width  source width in pixels
 * @param {number} height source height in pixels
 * @param {number} scale  multiplier, e.g. 2 for double size
 * @returns {{ width: number, height: number, pixels: number } | { error: string }}
 */
export function computeTargetSize(width, height, scale) {
  if (!isNum(width) || !isNum(height) || width < 1 || height < 1) {
    return { error: "The source image has no usable width or height." };
  }
  if (!isNum(scale)) return { error: "Enter the scale as a number." };
  if (scale < MIN_SCALE || scale > MAX_SCALE) {
    return { error: `Choose a scale between ${MIN_SCALE}x and ${MAX_SCALE}x.` };
  }
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const pixels = targetWidth * targetHeight;
  if (pixels > MAX_OUTPUT_PIXELS) {
    return {
      error: `That would produce ${targetWidth}x${targetHeight} pixels, over the ${(MAX_OUTPUT_PIXELS / 1e6).toFixed(0)} megapixel limit. Use a smaller scale.`,
    };
  }
  return { width: targetWidth, height: targetHeight, pixels };
}

/**
 * Precompute, for every output position along one axis, which source samples
 * contribute and with what normalised weight.
 *
 * @param {number} sourceSize
 * @param {number} targetSize
 * @param {{ radius: number, weight: (x: number) => number }} kernel
 * @returns {Array<{ start: number, weights: Float32Array }>}
 */
export function buildWeightTable(sourceSize, targetSize, kernel) {
  const scale = targetSize / sourceSize;
  // When shrinking, the kernel must widen to cover every source pixel that
  // falls inside one output pixel, otherwise samples are skipped (aliasing).
  const filterScale = scale < 1 ? 1 / scale : 1;
  const support = kernel.radius * filterScale;
  const table = new Array(targetSize);

  for (let i = 0; i < targetSize; i += 1) {
    // Centre of output pixel i mapped back into source coordinates.
    const centre = (i + 0.5) / scale - 0.5;
    const first = Math.max(0, Math.ceil(centre - support));
    const last = Math.min(sourceSize - 1, Math.floor(centre + support));
    const count = Math.max(1, last - first + 1);
    const weights = new Float32Array(count);

    let total = 0;
    for (let j = 0; j < count; j += 1) {
      const w = kernel.weight((first + j - centre) / filterScale);
      weights[j] = w;
      total += w;
    }
    if (total === 0) {
      // Degenerate window (can happen with the box kernel exactly on a
      // boundary): fall back to the single nearest source pixel.
      weights.fill(0);
      weights[Math.min(count - 1, Math.max(0, Math.round(centre) - first))] = 1;
    } else {
      for (let j = 0; j < count; j += 1) weights[j] /= total;
    }
    table[i] = { start: first, weights };
  }
  return table;
}

/**
 * Resample an RGBA image to a new size.
 *
 * @param {{ data: Uint8ClampedArray|Uint8Array|number[], width: number, height: number }} image
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @param {"nearest"|"bilinear"|"bicubic"|"lanczos3"} kernelName
 * @returns {{ data: Uint8ClampedArray, width: number, height: number } | { error: string }}
 */
export function resampleRgba(image, targetWidth, targetHeight, kernelName = "lanczos3") {
  const kernel = KERNELS[kernelName];
  if (!kernel) return { error: "Choose one of the four resampling methods." };
  if (!image || !image.data) return { error: "No image data was supplied." };

  const { width, height, data } = image;
  if (!isNum(width) || !isNum(height) || width < 1 || height < 1) {
    return { error: "The source image has no usable width or height." };
  }
  if (width * height > MAX_INPUT_PIXELS) {
    return { error: "That image is larger than 40 megapixels, which is too big to resample here." };
  }
  if (data.length !== width * height * CHANNELS) {
    return { error: "The pixel buffer does not match the stated image size." };
  }
  if (!isNum(targetWidth) || !isNum(targetHeight) || targetWidth < 1 || targetHeight < 1) {
    return { error: "The output size must be at least one pixel on each side." };
  }
  if (targetWidth * targetHeight > MAX_OUTPUT_PIXELS) {
    return { error: "The requested output is over the 40 megapixel limit." };
  }

  const outWidth = Math.round(targetWidth);
  const outHeight = Math.round(targetHeight);

  // Pass 1: horizontal, into a float buffer of premultiplied RGBA.
  const horizontal = new Float32Array(outWidth * height * CHANNELS);
  const xTable = buildWeightTable(width, outWidth, kernel);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width * CHANNELS;
    const outRowOffset = y * outWidth * CHANNELS;
    for (let x = 0; x < outWidth; x += 1) {
      const { start, weights } = xTable[x];
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let k = 0; k < weights.length; k += 1) {
        const w = weights[k];
        if (w === 0) continue;
        const p = rowOffset + (start + k) * CHANNELS;
        const alpha = data[p + 3] / 255;
        r += data[p] * alpha * w;
        g += data[p + 1] * alpha * w;
        b += data[p + 2] * alpha * w;
        a += data[p + 3] * w;
      }
      const o = outRowOffset + x * CHANNELS;
      horizontal[o] = r;
      horizontal[o + 1] = g;
      horizontal[o + 2] = b;
      horizontal[o + 3] = a;
    }
  }

  // Pass 2: vertical, un-premultiplying on the way out.
  const out = new Uint8ClampedArray(outWidth * outHeight * CHANNELS);
  const yTable = buildWeightTable(height, outHeight, kernel);

  for (let y = 0; y < outHeight; y += 1) {
    const { start, weights } = yTable[y];
    const outRowOffset = y * outWidth * CHANNELS;
    for (let x = 0; x < outWidth; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let k = 0; k < weights.length; k += 1) {
        const w = weights[k];
        if (w === 0) continue;
        const p = ((start + k) * outWidth + x) * CHANNELS;
        r += horizontal[p] * w;
        g += horizontal[p + 1] * w;
        b += horizontal[p + 2] * w;
        a += horizontal[p + 3] * w;
      }
      const o = outRowOffset + x * CHANNELS;
      const alpha = Math.min(255, Math.max(0, a));
      if (alpha <= 0) {
        out[o] = 0;
        out[o + 1] = 0;
        out[o + 2] = 0;
        out[o + 3] = 0;
      } else {
        const inverse = 255 / alpha;
        out[o] = Math.round(r * inverse);
        out[o + 1] = Math.round(g * inverse);
        out[o + 2] = Math.round(b * inverse);
        out[o + 3] = Math.round(alpha);
      }
    }
  }

  return { data: out, width: outWidth, height: outHeight };
}

/**
 * Unsharp mask: out = original + amount × (original − 3×3 box blur).
 * This is the classic sharpening operator; enlargement always softens edges a
 * little, and a small amount restores apparent detail without inventing any.
 *
 * @param {{ data: Uint8ClampedArray, width: number, height: number }} image
 * @param {number} amount 0 (off) to MAX_SHARPEN
 * @returns {{ data: Uint8ClampedArray, width: number, height: number } | { error: string }}
 */
export function sharpenRgba(image, amount) {
  if (!image || !image.data) return { error: "No image data was supplied." };
  if (!isNum(amount)) return { error: "Enter the sharpening amount as a number." };
  if (amount < 0 || amount > MAX_SHARPEN) {
    return { error: `Sharpening must be between 0 and ${MAX_SHARPEN}.` };
  }
  const { data, width, height } = image;
  if (data.length !== width * height * CHANNELS) {
    return { error: "The pixel buffer does not match the stated image size." };
  }
  if (amount === 0) return { data, width, height };

  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * CHANNELS;
      for (let c = 0; c < 3; c += 1) {
        let sum = 0;
        let count = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          const yy = y + dy;
          if (yy < 0 || yy >= height) continue;
          for (let dx = -1; dx <= 1; dx += 1) {
            const xx = x + dx;
            if (xx < 0 || xx >= width) continue;
            sum += data[(yy * width + xx) * CHANNELS + c];
            count += 1;
          }
        }
        const blurred = sum / count;
        out[o + c] = Math.round(data[o + c] + amount * (data[o + c] - blurred));
      }
      out[o + 3] = data[o + 3];
    }
  }
  return { data: out, width, height };
}

/**
 * Full upscale: resample, then optionally sharpen.
 *
 * @param {{ data: Uint8ClampedArray, width: number, height: number }} image
 * @param {{ scale?: number, kernel?: string, sharpen?: number }} options
 * @returns {{ data: Uint8ClampedArray, width: number, height: number,
 *             sourceWidth: number, sourceHeight: number, scale: number,
 *             kernel: string, megapixels: number } | { error: string }}
 */
export function upscaleImage(image, { scale = 2, kernel = "lanczos3", sharpen = 0 } = {}) {
  if (!image || !image.data) return { error: "Choose an image to upscale." };
  const target = computeTargetSize(image.width, image.height, scale);
  if (target.error) return target;

  const resampled = resampleRgba(image, target.width, target.height, kernel);
  if (resampled.error) return resampled;

  const sharpened = sharpenRgba(resampled, sharpen);
  if (sharpened.error) return sharpened;

  return {
    data: sharpened.data,
    width: sharpened.width,
    height: sharpened.height,
    sourceWidth: image.width,
    sourceHeight: image.height,
    scale,
    kernel,
    megapixels: Math.round((target.pixels / 1e6) * 100) / 100,
  };
}

/**
 * Byte count as a short human string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!isNum(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}
