/**
 * photoStorage — turn a wizard photo into something that survives a reload.
 *
 * The post-ad wizard previews photos as `URL.createObjectURL` blobs. Those are
 * the right tool for previews (instant, full resolution, zero copies) and the
 * wrong tool for persistence: a blob URL dies with the document, so an ad that
 * stored one showed blank covers on /bazaar/my-ads after any reload.
 *
 * The fix is not "store the photo" — it is "store a thumbnail". localStorage
 * is ~5 MB per origin, measured in UTF-16 code units, and it is shared with
 * every other tool on this site plus the rest of the bazaar store (saved ads,
 * searches, offers, other posted ads). One phone photo is 3–8 MB; even one
 * would evict everything. A 144 px JPEG data URL is ~4–10 KB, which is why
 * `THUMBNAIL_BUDGET_BYTES` caps the *total* thumbnail spend per ad at ~600 KB —
 * generous for 8 thumbnails, and still leaves ~90% of the origin's storage for
 * everyone else.
 *
 * Failure honesty: `toThumbnail` returns `null` for anything it cannot decode
 * or encode (corrupt file, 0×0 image, tainted canvas). It never throws — the
 * caller skips that photo and posts the rest, because one bad file must not
 * take the wizard down.
 */

export const THUMBNAIL_MAX_EDGE = 144;
export const THUMBNAIL_QUALITY = 0.7;

/**
 * Total characters of data-URL the wizard will persist for one ad's photos.
 *
 * Data URLs are pure ASCII, so `length` in characters ≈ bytes on the wire and
 * ≈ half the UTF-16 storage cost — close enough for a budget whose job is to
 * keep photo data an order of magnitude below the ~5 MB origin quota.
 */
export const THUMBNAIL_BUDGET_BYTES = 600 * 1024;

/**
 * Estimated storage cost, in characters (≈ bytes, see above), of a list of
 * data URLs. JSON serialisation adds only quotes and keys around each — base64
 * needs no escaping — so a plain length sum is accurate to within ~1%.
 */
export function estimateStoredSize(dataUrls) {
  let total = 0;
  for (const url of dataUrls || []) {
    if (typeof url === "string") total += url.length;
  }
  return total;
}

/**
 * Decode a Blob/File into something `drawImage` accepts, plus its pixel size
 * and a `release()` for whatever resources the decode pinned.
 *
 * Preferred path: `createImageBitmap(blob, { imageOrientation: "from-image" })`
 * — decodes off the main thread and bakes the EXIF orientation in. Some older
 * engines implement `createImageBitmap` but reject the options bag, so that
 * exact failure retries without options before falling back.
 *
 * Fallback path: an `<img decoding="async">` fed by a temporary object URL.
 * Modern engines apply EXIF orientation to `<img>` sources in `drawImage` too;
 * on very old browsers this path may produce a sideways thumbnail. That is an
 * accepted cosmetic limit — hand-parsing EXIF here would be far more code than
 * the browsers it would serve.
 */
async function decodeToDrawable(blob) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      try {
        const bitmap = await createImageBitmap(blob);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          release: () => bitmap.close(),
        };
      } catch {
        // Not a bitmap this engine can decode — give the <img> path a turn;
        // it accepts some sources createImageBitmap rejects.
      }
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    if (image.decode) {
      await image.decode();
    } else {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("image failed to load"));
      });
    }
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Downscale one image file/blob to a JPEG data URL small enough to persist.
 *
 * Aspect ratio is preserved; the longest edge becomes `maxEdge` (images
 * already smaller are never upscaled). Returns the data URL, or `null` when
 * the image cannot be decoded or encoded — the caller should skip that photo.
 *
 * @param {Blob} fileOrBlob
 * @param {{ maxEdge?: number, quality?: number }} [options]
 * @returns {Promise<string|null>}
 */
export async function toThumbnail(
  fileOrBlob,
  { maxEdge = THUMBNAIL_MAX_EDGE, quality = THUMBNAIL_QUALITY } = {},
) {
  if (typeof document === "undefined" || !fileOrBlob) return null;

  let drawable = null;
  try {
    drawable = await decodeToDrawable(fileOrBlob);
    const { source, width, height } = drawable;
    if (!width || !height) return null;

    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;

    // JPEG has no alpha channel: without a matte, a transparent PNG would come
    // out black. White is pixel content baked into the image, not UI theming,
    // so the no-raw-hex styling rule does not apply here.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    if ("imageSmoothingQuality" in context) context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    // A broken or tainted canvas answers "data:," rather than throwing.
    return dataUrl.startsWith("data:image/") ? dataUrl : null;
  } catch {
    return null;
  } finally {
    drawable?.release();
  }
}
