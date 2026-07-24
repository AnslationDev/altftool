export const MEDIA_LIMITS = {
  bytes: 80 * 1024 * 1024,
  pixels: 16_777_216,
  edge: 8_192,
  durationSeconds: 60 * 60,
};

export const SUPPORTED_MEDIA_TYPES = new Set([
  "image/gif",
  "video/mp4",
  "video/webm",
]);

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizedBoolean(value) {
  return value === true;
}

export function classifyMediaType(type) {
  if (type === "image/gif") return "gif";
  if (type === "video/mp4" || type === "video/webm") return "video";
  return null;
}

export function validateMediaFile({ type, size } = {}) {
  const kind = classifyMediaType(String(type || "").toLowerCase());
  const bytes = finite(size, -1);

  if (!kind || !SUPPORTED_MEDIA_TYPES.has(String(type || "").toLowerCase())) {
    return {
      ok: false,
      error: "Choose a GIF, MP4, or WebM file.",
    };
  }
  if (bytes <= 0) {
    return { ok: false, error: "The selected file is empty." };
  }
  if (bytes > MEDIA_LIMITS.bytes) {
    return {
      ok: false,
      error: "The selected file is larger than the 80 MB local limit.",
    };
  }
  return { ok: true, kind, bytes };
}

export function readGifDimensions(buffer) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 10) {
    return { ok: false, error: "The GIF header is incomplete." };
  }
  const bytes = new Uint8Array(buffer);
  const signature = String.fromCharCode(...bytes.slice(0, 6));
  if (signature !== "GIF87a" && signature !== "GIF89a") {
    return {
      ok: false,
      error: "The file does not contain a valid GIF header.",
    };
  }
  const view = new DataView(buffer);
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  if (!width || !height) {
    return { ok: false, error: "The GIF reports an empty canvas." };
  }
  return { ok: true, width, height };
}

export function validateDecodedMedia({
  width,
  height,
  duration = 0,
  kind,
} = {}) {
  const safeWidth = Math.floor(finite(width, 0));
  const safeHeight = Math.floor(finite(height, 0));
  const safeDuration = finite(duration, 0);

  if (!["gif", "video"].includes(kind)) {
    return { ok: false, error: "The media kind is unsupported." };
  }
  if (safeWidth <= 0 || safeHeight <= 0) {
    return {
      ok: false,
      error: "The browser did not report usable dimensions.",
    };
  }
  if (
    safeWidth > MEDIA_LIMITS.edge ||
    safeHeight > MEDIA_LIMITS.edge ||
    safeWidth * safeHeight > MEDIA_LIMITS.pixels
  ) {
    return {
      ok: false,
      error: "The media canvas exceeds the 16.8-megapixel safety limit.",
    };
  }
  if (
    kind === "video" &&
    (!Number.isFinite(safeDuration) ||
      safeDuration <= 0 ||
      safeDuration > MEDIA_LIMITS.durationSeconds)
  ) {
    return {
      ok: false,
      error: "The video duration is missing or exceeds the 60-minute limit.",
    };
  }
  return {
    ok: true,
    width: safeWidth,
    height: safeHeight,
    duration: kind === "video" ? safeDuration : null,
  };
}

export function normalizeCaptureTime(value, duration) {
  const safeDuration = Math.max(0, finite(duration, 0));
  if (!safeDuration) return 0;
  return Number(
    Math.min(safeDuration, Math.max(0, finite(value, 0))).toFixed(3),
  );
}

export function reviewMotionDelivery(input = {}) {
  const settings = {
    autoplay: normalizedBoolean(input.autoplay),
    loops: normalizedBoolean(input.loops),
    lastsMoreThanFiveSeconds: normalizedBoolean(input.lastsMoreThanFiveSeconds),
    runsInParallel: normalizedBoolean(input.runsInParallel),
    pauseControl: normalizedBoolean(input.pauseControl),
    respectsPreference: normalizedBoolean(input.respectsPreference),
    motionEssential: normalizedBoolean(input.motionEssential),
    meaningfulStill: normalizedBoolean(input.meaningfulStill),
  };
  const findings = [];

  const pauseStopHideApplies =
    settings.autoplay &&
    settings.lastsMoreThanFiveSeconds &&
    settings.runsInParallel &&
    !settings.motionEssential;

  if (pauseStopHideApplies) {
    findings.push({
      severity: settings.pauseControl ? "review" : "high",
      code: "pause-stop-hide-control",
      message: settings.pauseControl
        ? "The recorded delivery meets the WCAG 2.2.2 moving-content conditions; confirm the pause, stop, or hide control is available, immediate, and keyboard accessible."
        : "Nonessential motion is recorded as starting automatically, lasting more than five seconds, and running in parallel with other content without a pause, stop, or hide control.",
    });
  } else if (settings.autoplay) {
    findings.push({
      severity: "note",
      code: "pause-stop-hide-context",
      message:
        "Automatic motion is recorded, but the checklist does not establish every WCAG 2.2.2 moving-content condition; verify actual duration, parallel presentation, essentiality, and available controls.",
    });
  }
  if (settings.loops && !settings.autoplay && !settings.pauseControl) {
    findings.push({
      severity: "review",
      code: "user-initiated-loop-review",
      message:
        "This loop starts only after a user action, so it is outside WCAG 2.2.2's automatic-start condition. A stop control can still improve the experience.",
    });
  }
  if (!settings.respectsPreference) {
    findings.push({
      severity: "review",
      code: "preference-unhandled",
      message:
        "No prefers-reduced-motion response is planned. This is a best-practice review cue, not a conformance finding; provide a reduced or replaced experience where practical.",
    });
  }
  if (!settings.meaningfulStill) {
    findings.push({
      severity: "review",
      code: "fallback-context",
      message:
        "Confirm the still fallback and nearby text preserve the purpose or information of the media.",
    });
  }
  if (settings.motionEssential) {
    findings.push({
      severity: "note",
      code: "essential-claim",
      message:
        "Essential motion is a contextual author decision; document why removing it would change the information or function.",
    });
  }
  if (!settings.autoplay && settings.respectsPreference) {
    findings.push({
      severity: "note",
      code: "controlled-start",
      message:
        "Playback starts only after user action and a motion-preference response is planned; test the real implementation with keyboard and assistive technology.",
    });
  }

  const high = findings.filter((finding) => finding.severity === "high").length;
  const review = findings.filter(
    (finding) => finding.severity === "review",
  ).length;
  return {
    settings,
    findings,
    level: high ? "action-needed" : review ? "review" : "no-obvious-risk",
    counts: {
      high,
      review,
      note: findings.length - high - review,
    },
  };
}

export function buildMotionPreviewReport({
  media,
  captureTime = 0,
  review,
} = {}) {
  if (!media || !review) return null;
  return {
    schema: "altftool.motion-reduced-media-local-review-report.v1",
    reportType: "motion-reduced-media-local-review-report",
    reportDescription:
      "Local review report containing media metadata, selected delivery settings, finding counts, and review findings.",
    createdAt: new Date().toISOString(),
    createdAtMeaning: "Time this local review report was generated.",
    media: {
      kind: media.kind,
      mimeType: media.mimeType,
      bytes: media.bytes,
      width: media.width,
      height: media.height,
      durationSeconds:
        media.kind === "video" ? Number(media.duration.toFixed(3)) : null,
    },
    selectedFallbackTimeSeconds:
      media.kind === "video"
        ? normalizeCaptureTime(captureTime, media.duration)
        : null,
    review: {
      level: review.level,
      counts: review.counts,
      settings: review.settings,
      findings: review.findings.map(({ severity, code, message }) => ({
        severity,
        code,
        message,
      })),
    },
    scope: {
      mediaIncluded: false,
      fileNameIncluded: false,
      mediaMetadataIncluded: true,
      selectedSettingsIncluded: true,
      reviewFindingsIncluded: true,
      frameAnalysisPerformed: false,
      flashSafetyAnalyzed: false,
      wcagConformanceEstablished: false,
    },
  };
}
