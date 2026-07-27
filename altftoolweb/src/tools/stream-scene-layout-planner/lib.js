/**
 * Stream scene layout geometry.
 *
 * Works out where the gameplay capture, the facecam and an optional chat panel
 * sit on a stream canvas, and returns exact pixel rectangles you can type
 * straight into the OBS "Edit Transform" dialog (Position X/Y and Size W/H).
 *
 * Rules implemented:
 *  - SMPTE RP 218 safe areas: action-safe is the central 93% of the picture and
 *    title-safe the central 90%. The layout margin defaults to the action-safe
 *    inset of 3.5% per side so nothing important is lost to overscan or to a
 *    platform's own on-screen chrome.
 *  - Aspect-fit ("letterbox") scaling: a source of aspect ratio aw:ah placed in
 *    a box W x H is scaled by min(W / aw, H / ah), which is the largest scale
 *    that keeps the whole source inside the box without distortion. Whatever is
 *    left over becomes symmetric letterbox (top/bottom) or pillarbox (left/right)
 *    bars.
 *  - Overlap is a plain rectangle intersection, reported as a percentage of the
 *    gameplay area so you can see how much of the game the facecam is hiding.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Stream canvas sizes. */
export const CANVAS_PRESETS = {
  "1080p": { id: "1080p", label: "1920 × 1080 (1080p)", width: 1920, height: 1080 },
  "1440p": { id: "1440p", label: "2560 × 1440 (1440p)", width: 2560, height: 1440 },
  "720p": { id: "720p", label: "1280 × 720 (720p)", width: 1280, height: 720 },
  vertical: { id: "vertical", label: "1080 × 1920 (vertical)", width: 1080, height: 1920 },
};

/** Capture aspect ratios, as width:height integer pairs. */
export const SOURCE_ASPECTS = {
  "16:9": { id: "16:9", label: "16:9 (standard)", w: 16, h: 9 },
  "16:10": { id: "16:10", label: "16:10 (older monitors)", w: 16, h: 10 },
  "4:3": { id: "4:3", label: "4:3 (retro / emulator)", w: 4, h: 3 },
  "21:9": { id: "21:9", label: "21:9 ultrawide (64:27)", w: 64, h: 27 },
};

/** Corners the facecam can be anchored to inside the gameplay area. */
export const CAM_CORNERS = {
  "bottom-right": { id: "bottom-right", label: "Bottom right" },
  "bottom-left": { id: "bottom-left", label: "Bottom left" },
  "top-right": { id: "top-right", label: "Top right" },
  "top-left": { id: "top-left", label: "Top left" },
};

/** SMPTE RP 218 safe-area fractions. */
export const ACTION_SAFE_FRACTION = 0.93;
export const TITLE_SAFE_FRACTION = 0.9;

/** Default outer margin per side, as a fraction of the canvas: the action-safe inset. */
export const DEFAULT_MARGIN_PERCENT = 3.5;

/**
 * Narrowest chat panel that stays readable. Twitch's own popout chat has a
 * 340 px minimum window width; below roughly 300 px on a 1080p canvas, usernames
 * and messages start wrapping every two or three words.
 */
export const MIN_READABLE_CHAT_PX = 300;

/** Facecam coverage of the gameplay area past which the game gets hard to follow. */
export const CAM_COVERAGE_WARN_PERCENT = 15;

/** Clamp a number into a range. */
export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Largest aw:ah rectangle that fits inside boxW x boxH without distortion.
 * Returns integer pixel dimensions plus the leftover bar sizes.
 */
export function fitAspect(boxWidth, boxHeight, aspectW, aspectH) {
  if (!(boxWidth > 0) || !(boxHeight > 0) || !(aspectW > 0) || !(aspectH > 0)) {
    return { width: 0, height: 0, barX: 0, barY: 0, scale: 0 };
  }
  const scale = Math.min(boxWidth / aspectW, boxHeight / aspectH);
  const width = Math.round(aspectW * scale);
  const height = Math.round(aspectH * scale);
  return {
    width,
    height,
    barX: Math.round((boxWidth - width) / 2),
    barY: Math.round((boxHeight - height) / 2),
    scale,
  };
}

/** Overlapping area of two {x, y, width, height} rectangles, in square pixels. */
export function intersectArea(a, b) {
  if (!a || !b) return 0;
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

/** True when the inner rectangle sits entirely inside the outer one. */
export function contains(outer, inner) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** Safe-area rectangles for a canvas, per SMPTE RP 218. */
export function safeAreas(width, height) {
  const build = (fraction) => ({
    width: Math.round(width * fraction),
    height: Math.round(height * fraction),
    x: Math.round((width * (1 - fraction)) / 2),
    y: Math.round((height * (1 - fraction)) / 2),
  });
  return { action: build(ACTION_SAFE_FRACTION), title: build(TITLE_SAFE_FRACTION) };
}

/** Express a pixel rectangle as percentages of the canvas, to 2 decimal places. */
export function toPercentRect(rect, canvasWidth, canvasHeight) {
  const round = (value) => Math.round(value * 100) / 100;
  return {
    x: round((rect.x / canvasWidth) * 100),
    y: round((rect.y / canvasHeight) * 100),
    width: round((rect.width / canvasWidth) * 100),
    height: round((rect.height / canvasHeight) * 100),
  };
}

/**
 * Plan a stream scene.
 *
 * @param {object} input
 * @param {string} input.preset        Key of CANVAS_PRESETS.
 * @param {string} input.aspect        Key of SOURCE_ASPECTS for the capture.
 * @param {number} input.marginPercent Outer margin per side, % of canvas.
 * @param {boolean} input.showChat     Reserve a chat column.
 * @param {number} input.chatPercent   Chat column width, % of canvas width.
 * @param {string} input.chatSide      "left" or "right".
 * @param {number} input.gutterPercent Gap between chat and capture, % of canvas width.
 * @param {number} input.camPercent    Facecam width, % of canvas width.
 * @param {string} input.camCorner     Key of CAM_CORNERS.
 * @param {number} input.camInsetPercent Facecam inset from the capture edge, % of canvas width.
 */
export function planScene({
  preset = "1080p",
  aspect = "16:9",
  marginPercent = DEFAULT_MARGIN_PERCENT,
  showChat = true,
  chatPercent = 18,
  chatSide = "right",
  gutterPercent = 1,
  camPercent = 22,
  camCorner = "bottom-right",
  camInsetPercent = 1,
} = {}) {
  const canvas = CANVAS_PRESETS[preset];
  if (!canvas) return { error: "Choose one of the listed canvas sizes." };
  const source = SOURCE_ASPECTS[aspect];
  if (!source) return { error: "Choose one of the listed capture aspect ratios." };
  if (!CAM_CORNERS[camCorner]) return { error: "Choose a corner for the facecam." };
  if (chatSide !== "left" && chatSide !== "right") {
    return { error: "The chat column must sit on the left or the right." };
  }

  const numbers = { marginPercent, chatPercent, gutterPercent, camPercent, camInsetPercent };
  const badKey = Object.keys(numbers).find((key) => !Number.isFinite(Number(numbers[key])));
  if (badKey) return { error: "Every size must be a number." };

  const margin = Number(marginPercent);
  const chatShare = Number(chatPercent);
  const gutter = Number(gutterPercent);
  const cam = Number(camPercent);
  const camInset = Number(camInsetPercent);

  if (margin < 0 || margin > 20) return { error: "Outer margin must be between 0% and 20%." };
  if (gutter < 0 || gutter > 10) return { error: "The gutter must be between 0% and 10%." };
  if (camInset < 0 || camInset > 10) return { error: "Facecam inset must be between 0% and 10%." };
  if (cam <= 0 || cam > 60) return { error: "Facecam width must be between 1% and 60% of the canvas." };
  if (showChat && (chatShare <= 0 || chatShare > 50)) {
    return { error: "Chat width must be between 1% and 50% of the canvas." };
  }

  const { width: canvasWidth, height: canvasHeight } = canvas;
  const marginX = Math.round((canvasWidth * margin) / 100);
  const marginY = Math.round((canvasHeight * margin) / 100);
  const contentWidth = canvasWidth - marginX * 2;
  const contentHeight = canvasHeight - marginY * 2;
  if (contentWidth <= 0 || contentHeight <= 0) {
    return { error: "The margin leaves no room for any sources." };
  }

  const content = { x: marginX, y: marginY, width: contentWidth, height: contentHeight };
  const chatWidth = showChat ? Math.round((canvasWidth * chatShare) / 100) : 0;
  const gutterPx = showChat ? Math.round((canvasWidth * gutter) / 100) : 0;
  const captureBoxWidth = contentWidth - chatWidth - gutterPx;
  if (captureBoxWidth <= 0) {
    return { error: "Chat and the gutter take up the whole width — shrink one of them." };
  }

  const captureBoxX =
    showChat && chatSide === "left" ? content.x + chatWidth + gutterPx : content.x;

  const fitted = fitAspect(captureBoxWidth, contentHeight, source.w, source.h);
  const capture = {
    x: captureBoxX + fitted.barX,
    y: content.y + fitted.barY,
    width: fitted.width,
    height: fitted.height,
  };

  const chat = showChat
    ? {
        x: chatSide === "left" ? content.x : content.x + contentWidth - chatWidth,
        y: content.y,
        width: chatWidth,
        height: contentHeight,
      }
    : null;

  const camWidth = Math.round((canvasWidth * cam) / 100);
  // The facecam keeps the capture's aspect ratio so it matches a webcam frame.
  const camHeight = Math.round((camWidth * source.h) / source.w);
  const camInsetPx = Math.round((canvasWidth * camInset) / 100);
  if (camWidth > capture.width || camHeight > capture.height) {
    return { error: "The facecam is larger than the capture area — reduce its width." };
  }

  const camLeft = camCorner.endsWith("left");
  const camTop = camCorner.startsWith("top");
  const facecam = {
    x: camLeft
      ? capture.x + camInsetPx
      : capture.x + capture.width - camWidth - camInsetPx,
    y: camTop
      ? capture.y + camInsetPx
      : capture.y + capture.height - camHeight - camInsetPx,
    width: camWidth,
    height: camHeight,
  };

  const safe = safeAreas(canvasWidth, canvasHeight);
  const canvasArea = canvasWidth * canvasHeight;
  const captureArea = capture.width * capture.height;
  const camOverGame = intersectArea(facecam, capture);
  const camCoverage = captureArea > 0 ? (camOverGame / captureArea) * 100 : 0;

  const warnings = [];
  if (camCoverage > CAM_COVERAGE_WARN_PERCENT) {
    warnings.push(
      `The facecam hides ${Math.round(camCoverage)}% of the gameplay area — over ${CAM_COVERAGE_WARN_PERCENT}% starts obscuring the action.`,
    );
  }
  if (chat && chat.width < MIN_READABLE_CHAT_PX) {
    warnings.push(
      `The chat column is only ${chat.width} px wide; below about ${MIN_READABLE_CHAT_PX} px messages wrap every few words.`,
    );
  }
  if (fitted.barY > 0) {
    warnings.push(
      `A ${source.id} capture in this box leaves ${fitted.barY} px letterbox bars above and below.`,
    );
  }
  if (fitted.barX > 0) {
    warnings.push(
      `A ${source.id} capture in this box leaves ${fitted.barX} px pillarbox bars left and right.`,
    );
  }
  if (!contains(safe.title, facecam)) {
    warnings.push("The facecam crosses the title-safe boundary and may be clipped on some displays.");
  }
  if (chat && intersectArea(chat, capture) > 0) {
    warnings.push("Chat and the capture overlap — increase the gutter or shrink one of them.");
  }

  const sources = [
    { id: "capture", name: "Game / screen capture", rect: capture },
    { id: "facecam", name: "Facecam", rect: facecam },
  ];
  if (chat) sources.push({ id: "chat", name: "Chat panel", rect: chat });

  return {
    canvas: { width: canvasWidth, height: canvasHeight, label: canvas.label },
    content,
    safeArea: safe,
    sources: sources.map((entry) => ({
      ...entry,
      percent: toPercentRect(entry.rect, canvasWidth, canvasHeight),
      areaShare: Math.round(((entry.rect.width * entry.rect.height) / canvasArea) * 1000) / 10,
    })),
    capture,
    facecam,
    chat,
    aspectLabel: source.label,
    captureScalePercent: Math.round(((capture.width / canvasWidth) * 100) * 10) / 10,
    camCoveragePercent: Math.round(camCoverage * 10) / 10,
    letterboxPx: fitted.barY,
    pillarboxPx: fitted.barX,
    warnings,
  };
}

/** Render the plan as an OBS-ready transform list you can copy into the scene. */
export function formatTransformList(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `Stream scene layout — ${plan.canvas.label}`,
    `Capture aspect: ${plan.aspectLabel}`,
    "",
  ];
  plan.sources.forEach((entry) => {
    lines.push(
      `${entry.name}: Position ${entry.rect.x}, ${entry.rect.y} · Size ${entry.rect.width} × ${entry.rect.height} px (${entry.percent.width}% × ${entry.percent.height}% of canvas)`,
    );
  });
  lines.push(
    "",
    `Title-safe box: ${plan.safeArea.title.width} × ${plan.safeArea.title.height} px at ${plan.safeArea.title.x}, ${plan.safeArea.title.y}`,
    `Facecam covers ${plan.camCoveragePercent}% of the capture area`,
  );
  return lines.join("\n");
}
