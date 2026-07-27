"use client";

import { useEffect, useState } from "react";

/**
 * Client-side white-background → transparent-PNG conversion for SerpAPI
 * product photos. Most Google Shopping thumbnails sit on a flat white
 * studio background; flattening that into the app's own card background
 * (which isn't always white, e.g. dark mode) leaves a visible white box
 * around the product. This detects a white background and cuts it out.
 *
 * Approach: sample the four image corners — if they're all near-white,
 * flood-fill inward from every border pixel, turning only the CONNECTED
 * near-white region transparent. Flood-filling from the edges (rather than
 * thresholding every pixel in the image) means white text/highlights
 * inside the product itself are left alone. Falls back to the original
 * image untouched whenever the background isn't white, the canvas is
 * tainted by a cross-origin image without CORS headers, or anything else
 * goes wrong — this only ever improves the image, never breaks it.
 */

const WHITE_THRESHOLD = 235;
const resultCache = new Map(); // src -> Promise<string|null>

function isWhiteish(r, g, b) {
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
}

function removeWhiteBackground(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    // Most product-image hosts (e.g. Google's gstatic CDN) don't send CORS
    // headers, so loading them cross-origin with crossOrigin="anonymous"
    // set fails outright rather than just tainting the canvas — route
    // through our own same-origin proxy so the canvas read below actually
    // works.
    const proxiedSrc = `/api/sale/image-proxy?url=${encodeURIComponent(src)}`;

    img.onload = () => {
      try {
        const { naturalWidth: width, naturalHeight: height } = img;
        if (!width || !height) {
          resolve(null);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const cornerIndexes = [
          0,
          (width - 1) * 4,
          (height - 1) * width * 4,
          ((height - 1) * width + (width - 1)) * 4,
        ];
        const hasWhiteBackground = cornerIndexes.every((i) =>
          isWhiteish(data[i], data[i + 1], data[i + 2]),
        );

        if (!hasWhiteBackground) {
          resolve(null);
          return;
        }

        const visited = new Uint8Array(width * height);
        const stack = [];
        const enqueueIfWhite = (x, y) => {
          if (x < 0 || y < 0 || x >= width || y >= height) return;
          const pixelIndex = y * width + x;
          if (visited[pixelIndex]) return;
          const p = pixelIndex * 4;
          if (isWhiteish(data[p], data[p + 1], data[p + 2])) {
            visited[pixelIndex] = 1;
            stack.push(pixelIndex);
          }
        };

        for (let x = 0; x < width; x++) {
          enqueueIfWhite(x, 0);
          enqueueIfWhite(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          enqueueIfWhite(0, y);
          enqueueIfWhite(width - 1, y);
        }

        while (stack.length) {
          const pixelIndex = stack.pop();
          const x = pixelIndex % width;
          const y = (pixelIndex / width) | 0;
          data[pixelIndex * 4 + 3] = 0; // make transparent
          enqueueIfWhite(x + 1, y);
          enqueueIfWhite(x - 1, y);
          enqueueIfWhite(x, y + 1);
          enqueueIfWhite(x, y - 1);
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = proxiedSrc;
  });
}

function getTransparentVersion(src) {
  if (!resultCache.has(src)) {
    resultCache.set(src, removeWhiteBackground(src));
  }
  return resultCache.get(src);
}

/**
 * Resolves to the final image to display — `null` while the white-background
 * check/removal is still running, so the caller never briefly renders the
 * raw (white-background) source before the processed one is ready.
 */
export function useProductImageSrc(src) {
  const [resolvedSrc, setResolvedSrc] = useState(null);

  useEffect(() => {
    setResolvedSrc(null);
    if (!src) return undefined;

    let cancelled = false;
    getTransparentVersion(src).then((transparentSrc) => {
      if (cancelled) return;
      // transparentSrc is null when the background wasn't white (or
      // processing failed) — the original src is already background-free
      // in that case, so it's safe to use as the final image.
      setResolvedSrc(transparentSrc || src);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolvedSrc;
}

/**
 * Drop-in swap for next/image's `fill` mode — same absolute-fill layout,
 * but only renders once the white-background-to-transparent conversion has
 * finished, so the browser never shows the white-background original first.
 */
export default function SmartProductImage({ src, alt, fill, className = "", onError, draggable = false }) {
  const resolvedSrc = useProductImageSrc(src);

  if (!resolvedSrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external product photo, possibly re-rendered client-side as a transparent PNG data URL
    <img
      src={resolvedSrc}
      alt={alt}
      draggable={draggable}
      onError={onError}
      className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className}`.trim()}
    />
  );
}
