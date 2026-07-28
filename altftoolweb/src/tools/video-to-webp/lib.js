/**
 * Animated WebP muxing, and the frame-timing arithmetic that feeds it.
 *
 * A browser canvas can encode a single still WebP (canvas.toBlob with
 * "image/webp"), but it cannot produce an *animated* one. The container format,
 * however, is simple enough to assemble by hand, and that is what this module
 * does: it takes a list of still WebP files and rewrites them as one animated
 * WebP.
 *
 * WebP container (Google's "WebP Container Specification", RIFF based):
 *
 *   RIFF header      "RIFF" + uint32LE(fileSize − 8) + "WEBP"
 *   VP8X  (10 bytes) flags byte, 3 reserved bytes,
 *                    canvas width − 1 (uint24LE), canvas height − 1 (uint24LE)
 *                    flags bit 1 = animation, bit 4 = alpha
 *   ANIM  (6 bytes)  background colour BGRA, loop count (uint16LE, 0 = forever)
 *   ANMF  (per frame) frame x/2 (uint24LE), frame y/2 (uint24LE),
 *                    width − 1, height − 1, duration in ms (uint24LE),
 *                    1 flags byte (bit 1 blending, bit 0 disposal),
 *                    then the frame's own ALPH and VP8/VP8L chunks verbatim
 *
 * Every RIFF chunk is padded to an even length with one zero byte; the pad byte
 * is excluded from the chunk's own size field but included in the file size.
 *
 * Frame timing: sampling a clip at f frames per second between t0 and t1 gives
 * frames at t0 + i/f, and each frame is shown for 1000/f milliseconds, so the
 * animation plays back at the same speed as the source.
 *
 * Pure module: no React, no DOM, no canvas, no clock reads.
 */

/** Four-character codes used by the container. */
export const FOURCC = {
  RIFF: "RIFF",
  WEBP: "WEBP",
  VP8X: "VP8X",
  ANIM: "ANIM",
  ANMF: "ANMF",
  ALPH: "ALPH",
  VP8: "VP8 ",
  VP8L: "VP8L",
};

/** VP8X flag bits, per the container specification. */
export const VP8X_ANIMATION_FLAG = 0x02;
export const VP8X_ALPHA_FLAG = 0x10;

/** Canvas and frame dimensions are stored as 24-bit "minus one" values, so the
 * largest side the format can express is 2^24 = 16777216 pixels. */
export const MAX_CANVAS_SIDE = 16777216;

/** Frame duration is a 24-bit millisecond value. */
export const MAX_FRAME_DURATION_MS = 16777215;

/** Loop count is a 16-bit value; 0 means loop forever. */
export const MAX_LOOP_COUNT = 65535;

/** Practical ceiling on frames in one animation. 600 frames at 15 fps is 40
 * seconds, already a multi-megabyte file for a browser to hold in memory. */
export const MAX_FRAMES = 600;

/** Frame rates offered. 15 fps is the usual sweet spot for a short web loop. */
export const FPS_PRESETS = [5, 8, 10, 12, 15, 20, 24, 30];

/** Output widths offered; height follows the source aspect ratio. */
export const WIDTH_PRESETS = [240, 320, 480, 640, 800];

/** Longest clip segment accepted, in seconds. */
export const MAX_SEGMENT_SECONDS = 60;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function fourccBytes(code) {
  return [code.charCodeAt(0), code.charCodeAt(1), code.charCodeAt(2), code.charCodeAt(3)];
}

function readFourcc(bytes, offset) {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function readUint32LE(bytes, offset) {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

function writeUint32LE(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function writeUint24LE(target, offset, value) {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
}

/**
 * Wrap a payload in a RIFF chunk header, padding to an even length.
 * @param {string} code four-character code
 * @param {Uint8Array} payload
 * @returns {Uint8Array}
 */
export function makeChunk(code, payload) {
  const padded = payload.length % 2 === 1 ? 1 : 0;
  const out = new Uint8Array(8 + payload.length + padded);
  out.set(fourccBytes(code), 0);
  writeUint32LE(out, 4, payload.length);
  out.set(payload, 8);
  return out;
}

/**
 * List the RIFF chunks inside a WebP file.
 *
 * @param {Uint8Array} bytes a complete .webp file
 * @returns {{ chunks: Array<{ code: string, start: number, size: number, total: number }> }
 *           | { error: string }}
 */
export function listWebpChunks(bytes) {
  if (!bytes || bytes.length < 12) return { error: "That file is too short to be a WebP image." };
  if (readFourcc(bytes, 0) !== FOURCC.RIFF || readFourcc(bytes, 8) !== FOURCC.WEBP) {
    return { error: "That file is not a WebP image (missing the RIFF/WEBP header)." };
  }
  const chunks = [];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const code = readFourcc(bytes, offset);
    const size = readUint32LE(bytes, offset + 4);
    const start = offset + 8;
    if (start + size > bytes.length) break;
    const total = 8 + size + (size % 2 === 1 ? 1 : 0);
    chunks.push({ code, start, size, total });
    offset += total;
  }
  if (chunks.length === 0) return { error: "That WebP file contains no readable chunks." };
  return { chunks };
}

/**
 * Read the pixel dimensions of a still WebP.
 *
 * VP8 (lossy) keyframes carry a 3-byte start code 0x9d 0x01 0x2a at payload
 * offset 3, followed by two 16-bit little-endian values whose low 14 bits are
 * the width and height. VP8L (lossless) packs width−1 and height−1 as 14-bit
 * fields immediately after its 0x2f signature byte.
 *
 * @param {Uint8Array} bytes
 * @returns {{ width: number, height: number, hasAlpha: boolean } | { error: string }}
 */
export function readWebpDimensions(bytes) {
  const listed = listWebpChunks(bytes);
  if (listed.error) return listed;

  const byCode = new Map(listed.chunks.map((chunk) => [chunk.code, chunk]));
  const hasAlpha = byCode.has(FOURCC.ALPH);

  const vp8x = byCode.get(FOURCC.VP8X);
  if (vp8x && vp8x.size >= 10) {
    const p = vp8x.start;
    const width = (bytes[p + 4] | (bytes[p + 5] << 8) | (bytes[p + 6] << 16)) + 1;
    const height = (bytes[p + 7] | (bytes[p + 8] << 8) | (bytes[p + 9] << 16)) + 1;
    return { width, height, hasAlpha: hasAlpha || (bytes[p] & VP8X_ALPHA_FLAG) !== 0 };
  }

  const vp8 = byCode.get(FOURCC.VP8);
  if (vp8 && vp8.size >= 10) {
    const p = vp8.start;
    if (bytes[p + 3] !== 0x9d || bytes[p + 4] !== 0x01 || bytes[p + 5] !== 0x2a) {
      return { error: "This WebP frame is not a keyframe, so its size cannot be read." };
    }
    const width = (bytes[p + 6] | (bytes[p + 7] << 8)) & 0x3fff;
    const height = (bytes[p + 8] | (bytes[p + 9] << 8)) & 0x3fff;
    return { width, height, hasAlpha };
  }

  const vp8l = byCode.get(FOURCC.VP8L);
  if (vp8l && vp8l.size >= 5) {
    const p = vp8l.start;
    if (bytes[p] !== 0x2f) return { error: "This WebP frame has a damaged lossless header." };
    const packed = readUint32LE(bytes, p + 1);
    const width = (packed & 0x3fff) + 1;
    const height = ((packed >>> 14) & 0x3fff) + 1;
    const alphaBit = ((packed >>> 28) & 1) === 1;
    return { width, height, hasAlpha: hasAlpha || alphaBit };
  }

  return { error: "This WebP file has no VP8, VP8L or VP8X chunk." };
}

/**
 * Pull the image chunks (ALPH plus VP8 or VP8L) out of a still WebP, ready to
 * be embedded inside an ANMF frame. Metadata chunks are deliberately dropped.
 *
 * @param {Uint8Array} bytes
 * @returns {{ payload: Uint8Array, hasAlpha: boolean } | { error: string }}
 */
export function extractFrameChunks(bytes) {
  const listed = listWebpChunks(bytes);
  if (listed.error) return listed;

  const kept = listed.chunks.filter(
    (chunk) => chunk.code === FOURCC.ALPH || chunk.code === FOURCC.VP8 || chunk.code === FOURCC.VP8L,
  );
  if (kept.length === 0) {
    return { error: "This WebP file has no image data to copy into the animation." };
  }

  const total = kept.reduce((sum, chunk) => sum + chunk.total, 0);
  const payload = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of kept) {
    payload.set(bytes.subarray(chunk.start - 8, chunk.start - 8 + chunk.total), cursor);
    cursor += chunk.total;
  }
  return { payload, hasAlpha: kept.some((chunk) => chunk.code === FOURCC.ALPH) };
}

/**
 * Assemble an animated WebP from a list of still WebP frames.
 *
 * @param {object} options
 * @param {Array<{ data: Uint8Array, durationMs: number }>} options.frames
 * @param {number} options.width  canvas width in pixels
 * @param {number} options.height canvas height in pixels
 * @param {number} [options.loopCount] 0 = loop forever
 * @returns {{ bytes: Uint8Array, byteLength: number, frameCount: number,
 *             durationMs: number, width: number, height: number } | { error: string }}
 */
export function buildAnimatedWebp({ frames, width, height, loopCount = 0 } = {}) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return { error: "There are no frames to put in the animation." };
  }
  if (frames.length > MAX_FRAMES) {
    return { error: `An animation here can hold at most ${MAX_FRAMES} frames.` };
  }
  if (!isNum(width) || !isNum(height) || width < 1 || height < 1) {
    return { error: "The animation needs a width and height of at least one pixel." };
  }
  if (width > MAX_CANVAS_SIDE || height > MAX_CANVAS_SIDE) {
    return { error: "The WebP format cannot store a canvas that large." };
  }
  if (!isNum(loopCount) || loopCount < 0 || loopCount > MAX_LOOP_COUNT) {
    return { error: `The loop count must be between 0 (forever) and ${MAX_LOOP_COUNT}.` };
  }

  const canvasWidth = Math.round(width);
  const canvasHeight = Math.round(height);
  const anmfChunks = [];
  let totalDuration = 0;
  let anyAlpha = false;

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    if (!frame || !frame.data || frame.data.length === 0) {
      return { error: `Frame ${i + 1} has no image data.` };
    }
    if (!isNum(frame.durationMs) || frame.durationMs < 0) {
      return { error: `Frame ${i + 1} has an invalid duration.` };
    }
    const durationMs = Math.min(MAX_FRAME_DURATION_MS, Math.round(frame.durationMs));

    const dims = readWebpDimensions(frame.data);
    if (dims.error) return { error: `Frame ${i + 1}: ${dims.error}` };
    if (dims.width !== canvasWidth || dims.height !== canvasHeight) {
      return {
        error: `Frame ${i + 1} is ${dims.width}x${dims.height} but the animation canvas is ${canvasWidth}x${canvasHeight}. Every frame must be the same size.`,
      };
    }

    const extracted = extractFrameChunks(frame.data);
    if (extracted.error) return { error: `Frame ${i + 1}: ${extracted.error}` };
    if (extracted.hasAlpha) anyAlpha = true;

    const anmfPayload = new Uint8Array(16 + extracted.payload.length);
    writeUint24LE(anmfPayload, 0, 0); // frame x, in units of 2 px
    writeUint24LE(anmfPayload, 3, 0); // frame y, in units of 2 px
    writeUint24LE(anmfPayload, 6, canvasWidth - 1);
    writeUint24LE(anmfPayload, 9, canvasHeight - 1);
    writeUint24LE(anmfPayload, 12, durationMs);
    // Bit 1 = blending (0 = alpha blend), bit 0 = disposal (0 = keep previous).
    // Every frame here is a full-canvas replacement, so both stay at 0.
    anmfPayload[15] = 0;
    anmfPayload.set(extracted.payload, 16);

    anmfChunks.push(makeChunk(FOURCC.ANMF, anmfPayload));
    totalDuration += durationMs;
  }

  const vp8xPayload = new Uint8Array(10);
  vp8xPayload[0] = VP8X_ANIMATION_FLAG | (anyAlpha ? VP8X_ALPHA_FLAG : 0);
  writeUint24LE(vp8xPayload, 4, canvasWidth - 1);
  writeUint24LE(vp8xPayload, 7, canvasHeight - 1);
  const vp8xChunk = makeChunk(FOURCC.VP8X, vp8xPayload);

  const animPayload = new Uint8Array(6);
  // Background colour BGRA; fully transparent so viewers use their own backdrop.
  animPayload[0] = 0;
  animPayload[1] = 0;
  animPayload[2] = 0;
  animPayload[3] = 0;
  animPayload[4] = loopCount & 0xff;
  animPayload[5] = (loopCount >>> 8) & 0xff;
  const animChunk = makeChunk(FOURCC.ANIM, animPayload);

  const bodyLength =
    4 + vp8xChunk.length + animChunk.length + anmfChunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(8 + bodyLength);
  out.set(fourccBytes(FOURCC.RIFF), 0);
  writeUint32LE(out, 4, bodyLength);
  out.set(fourccBytes(FOURCC.WEBP), 8);

  let cursor = 12;
  out.set(vp8xChunk, cursor);
  cursor += vp8xChunk.length;
  out.set(animChunk, cursor);
  cursor += animChunk.length;
  for (const chunk of anmfChunks) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }

  return {
    bytes: out,
    byteLength: out.length,
    frameCount: frames.length,
    durationMs: totalDuration,
    width: canvasWidth,
    height: canvasHeight,
  };
}

/**
 * Times to sample, and how long each sampled frame should be shown.
 *
 * @param {object} options
 * @param {number} options.duration clip length in seconds
 * @param {number} options.fps frames per second to sample
 * @param {number} [options.startTime] seconds
 * @param {number} [options.endTime] seconds; defaults to the clip end
 * @returns {{ times: number[], frameDurationMs: number, spanSeconds: number }
 *           | { error: string }}
 */
export function planFrameTimes({ duration, fps, startTime = 0, endTime } = {}) {
  if (!isNum(duration) || duration <= 0) {
    return { error: "The video duration could not be read yet." };
  }
  if (!isNum(fps) || fps <= 0) return { error: "Choose a frame rate above zero." };
  if (fps > 60) return { error: "Sampling above 60 frames per second is not supported." };
  if (!isNum(startTime) || startTime < 0) return { error: "The start time must be zero or more." };

  const stop = isNum(endTime) && endTime > 0 ? Math.min(endTime, duration) : duration;
  if (startTime >= stop) {
    return { error: "The start time must come before the end time." };
  }
  const spanSeconds = stop - startTime;
  if (spanSeconds > MAX_SEGMENT_SECONDS) {
    return { error: `Keep the clip to ${MAX_SEGMENT_SECONDS} seconds or less, otherwise the file gets unusably large.` };
  }

  const frameDurationMs = Math.round(1000 / fps);
  const frameCount = Math.floor(spanSeconds * fps);
  if (frameCount < 1) {
    return { error: "That range is shorter than one frame at this frame rate." };
  }
  if (frameCount > MAX_FRAMES) {
    return {
      error: `That would need ${frameCount} frames. Lower the frame rate or shorten the clip to stay under ${MAX_FRAMES}.`,
    };
  }

  const times = [];
  for (let i = 0; i < frameCount; i += 1) {
    times.push(Math.round((startTime + i / fps) * 1000) / 1000);
  }
  return { times, frameDurationMs, spanSeconds: Math.round(spanSeconds * 1000) / 1000 };
}

/**
 * Output dimensions for a target width, keeping the source aspect ratio and
 * never enlarging.
 *
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} targetWidth
 * @returns {{ width: number, height: number } | { error: string }}
 */
export function computeOutputSize(sourceWidth, sourceHeight, targetWidth) {
  if (!isNum(sourceWidth) || !isNum(sourceHeight) || sourceWidth < 1 || sourceHeight < 1) {
    return { error: "The video has no readable width or height yet." };
  }
  if (!isNum(targetWidth) || targetWidth < 1) {
    return { error: "Choose an output width of at least 1 pixel." };
  }
  const width = Math.min(Math.round(targetWidth), Math.round(sourceWidth));
  const height = Math.max(1, Math.round((width * sourceHeight) / sourceWidth));
  return { width, height };
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

/**
 * Seconds as M:SS.
 * @param {number} seconds
 * @returns {string}
 */
export function formatClock(seconds) {
  if (!isNum(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
