const MAX_SOURCE_LENGTH = 200_000;
const MAX_TARGETS = 500;
const MAX_VIEWPORT = 10_000;
const EXCEPTIONS = new Set([
  "none",
  "equivalent",
  "inline",
  "user-agent",
  "essential",
]);

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

function sourceRows(source) {
  const text = String(source || "").slice(0, MAX_SOURCE_LENGTH).trim();
  if (!text) return { ok: false, errors: ["Paste target JSON or CSV first."] };
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      const rows = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.targets)
          ? parsed.targets
          : null;
      if (!rows) {
        return {
          ok: false,
          errors: ["JSON must be an array or an object with a targets array."],
        };
      }
      return { ok: true, rows };
    } catch {
      return { ok: false, errors: ["The target JSON is not valid."] };
    }
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const parsedLines = lines.map(parseCsvLine);
  const first = parsedLines[0]?.map((item) => item.toLowerCase());
  const hasHeader =
    first?.includes("x") && first?.includes("y") && first?.includes("width");
  const headers = hasHeader
    ? first
    : ["label", "x", "y", "width", "height", "exception"];
  const data = hasHeader ? parsedLines.slice(1) : parsedLines;
  return {
    ok: true,
    rows: data.map((values) =>
      Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
    ),
  };
}

function normalizeTarget(row, index) {
  const x = finiteNumber(row?.x);
  const y = finiteNumber(row?.y);
  const width = finiteNumber(row?.width ?? row?.w);
  const height = finiteNumber(row?.height ?? row?.h);
  const exception = String(row?.exception || "none").trim().toLowerCase();
  const errors = [];
  if (x === null || x < 0) errors.push("x must be zero or greater");
  if (y === null || y < 0) errors.push("y must be zero or greater");
  if (width === null || width <= 0) errors.push("width must be greater than zero");
  if (height === null || height <= 0) errors.push("height must be greater than zero");
  if (!EXCEPTIONS.has(exception)) {
    errors.push("exception must be none, equivalent, inline, user-agent, or essential");
  }
  if (errors.length) {
    return {
      ok: false,
      error: `Target ${index + 1}: ${errors.join("; ")}.`,
    };
  }
  return {
    ok: true,
    target: {
      index,
      label: String(row?.label || `Target ${index + 1}`).trim().slice(0, 200),
      x,
      y,
      width,
      height,
      exception,
      centerX: x + width / 2,
      centerY: y + height / 2,
    },
  };
}

export function parseTargets(source) {
  const parsed = sourceRows(source);
  if (!parsed.ok) return parsed;
  const targets = [];
  const errors = [];
  parsed.rows.slice(0, MAX_TARGETS).forEach((row, index) => {
    const normalized = normalizeTarget(row, index);
    if (normalized.ok) targets.push(normalized.target);
    else errors.push(normalized.error);
  });
  return {
    ok: errors.length === 0 && targets.length > 0,
    targets,
    errors:
      errors.length || targets.length
        ? errors
        : ["No target rows were found in the supplied data."],
    truncated: parsed.rows.length > MAX_TARGETS,
  };
}

function circlesIntersect(first, second) {
  return Math.hypot(
    first.centerX - second.centerX,
    first.centerY - second.centerY,
  ) < 24;
}

function circleIntersectsRectangle(target, rectangle) {
  const closestX = Math.max(
    rectangle.x,
    Math.min(target.centerX, rectangle.x + rectangle.width),
  );
  const closestY = Math.max(
    rectangle.y,
    Math.min(target.centerY, rectangle.y + rectangle.height),
  );
  return Math.hypot(target.centerX - closestX, target.centerY - closestY) < 12;
}

function spacingConflict(target, targets) {
  return targets.some((other) => {
    if (other.index === target.index || other.exception !== "none") return false;
    const otherUndersized = other.width < 24 || other.height < 24;
    return otherUndersized
      ? circlesIntersect(target, other)
      : circleIntersectsRectangle(target, other);
  });
}

function reachZone(target, viewport, hand) {
  const originX = hand === "left" ? 0 : viewport.width;
  const originY = viewport.height;
  const maximumDistance = Math.hypot(viewport.width, viewport.height);
  const distance = Math.hypot(target.centerX - originX, target.centerY - originY);
  const ratio = maximumDistance ? distance / maximumDistance : 1;
  if (ratio <= 0.4) return { id: "near", label: "Near the selected thumb origin", ratio };
  if (ratio <= 0.72) return { id: "middle", label: "Middle reach heuristic", ratio };
  return { id: "far", label: "Far reach heuristic", ratio };
}

function classifyTarget(target, targets) {
  if (target.exception !== "none") {
    return {
      status: "exception-review",
      message: `The ${target.exception} exception was user-selected and needs manual evidence.`,
      spacingConflict: false,
    };
  }
  if (target.width >= 44 && target.height >= 44) {
    return {
      status: "enhanced-size",
      message: "The rectangle is at least 44 × 44 CSS px.",
      spacingConflict: false,
    };
  }
  if (target.width >= 24 && target.height >= 24) {
    return {
      status: "minimum-size",
      message: "The rectangle is at least 24 × 24 CSS px but below the enhanced size.",
      spacingConflict: false,
    };
  }
  const conflict = spacingConflict(target, targets);
  return conflict
    ? {
        status: "below-minimum",
        message:
          "The rectangle is undersized and its 24 CSS px spacing circle intersects another target geometry.",
        spacingConflict: true,
      }
    : {
        status: "spacing-candidate",
        message:
          "The rectangle is undersized, but this supplied geometry is a candidate for the spacing exception.",
        spacingConflict: false,
      };
}

export function analyzeTargets(
  source,
  { viewportWidth, viewportHeight, hand = "right" } = {},
) {
  const width = finiteNumber(viewportWidth);
  const height = finiteNumber(viewportHeight);
  const errors = [];
  if (width === null || width <= 0 || width > MAX_VIEWPORT) {
    errors.push(`Viewport width must be between 1 and ${MAX_VIEWPORT} CSS px.`);
  }
  if (height === null || height <= 0 || height > MAX_VIEWPORT) {
    errors.push(`Viewport height must be between 1 and ${MAX_VIEWPORT} CSS px.`);
  }
  if (!["left", "right"].includes(hand)) errors.push("Choose left or right hand.");
  const parsed = parseTargets(source);
  if (!parsed.ok) errors.push(...parsed.errors);
  if (errors.length) return { ok: false, errors };

  const viewport = { width, height };
  const targets = parsed.targets.map((target) => {
    const classification = classifyTarget(target, parsed.targets);
    const outsideViewport =
      target.x + target.width > width || target.y + target.height > height;
    return {
      ...target,
      ...classification,
      outsideViewport,
      reach: reachZone(target, viewport, hand),
    };
  });

  const count = (status) => targets.filter((target) => target.status === status).length;
  return {
    ok: true,
    viewport,
    hand,
    targets,
    truncated: parsed.truncated,
    counts: {
      targets: targets.length,
      enhancedSize: count("enhanced-size"),
      minimumSize: count("minimum-size"),
      spacingCandidates: count("spacing-candidate"),
      belowMinimum: count("below-minimum"),
      exceptionReview: count("exception-review"),
      outsideViewport: targets.filter((target) => target.outsideViewport).length,
      farReach: targets.filter((target) => target.reach.id === "far").length,
    },
    limitations: [
      "Only supplied CSS-pixel rectangles are checked; transformed, clipped, irregular, overlapping, dynamic, and visually obscured targets can behave differently.",
      "Exceptions require manual evidence. A spacing candidate is not an automatic WCAG pass.",
      "Thumb reach is a geometric heuristic, not an ergonomic or accessibility standard; grip, device, hand, posture, and mobility differ.",
    ],
  };
}

export function buildTargetReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.touch-target-map.v1",
    createdAt: new Date().toISOString(),
    counts: { ...result.counts },
    statusCounts: result.targets.reduce((counts, target) => {
      counts[target.status] = (counts[target.status] || 0) + 1;
      return counts;
    }, {}),
    reachCounts: result.targets.reduce((counts, target) => {
      counts[target.reach.id] = (counts[target.reach.id] || 0) + 1;
      return counts;
    }, {}),
    scope: {
      localOnly: true,
      labelsIncluded: false,
      coordinatesIncluded: false,
      wcagConformanceEstablished: false,
      ergonomicSafetyEstablished: false,
    },
  };
}
