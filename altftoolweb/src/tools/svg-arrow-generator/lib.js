/**
 * SVG arrow geometry.
 *
 * The arrow shaft is a single quadratic Bezier curve B(t) = (1-t)^2 P0 + 2(1-t)t C + t^2 P2
 * (SVG "Q" command). The control point C is placed on the perpendicular bisector of the
 * chord P0->P2 so the curve stays symmetric.
 *
 * Useful property of a quadratic Bezier: the point at t = 0.5 is (P0 + 2C + P2) / 4, which is
 * exactly halfway between the chord midpoint and C. So to make the curve bulge by a chosen
 * "bow" distance we offset C by 2 x bow from the midpoint.
 *
 * The tangent is B'(t) = 2(1-t)(C - P0) + 2t(P2 - C); the arrowhead is rotated to B'(1) at the
 * end of the shaft and to -B'(0) at the start when a second head is drawn.
 */

/** SVG user units. Below 40 a canvas is too small to annotate; above 2000 files get unwieldy. */
export const CANVAS_MIN = 40;
export const CANVAS_MAX = 2000;

/** Bow height as a percentage of the straight-line (chord) distance between the two points. */
export const CURVE_MIN = -200;
export const CURVE_MAX = 200;

/** Stroke width limits in SVG user units. */
export const STROKE_MIN = 0.25;
export const STROKE_MAX = 40;

/** Arrowhead length in SVG user units. 0 is allowed and simply means "no head". */
export const HEAD_MIN = 0;
export const HEAD_MAX = 200;

export const HEAD_STYLES = [
  { value: "triangle", label: "Filled triangle" },
  { value: "line", label: "Open V (stroked)" },
  { value: "none", label: "No head" },
];

/** Half-angle of the open "V" head, measured from the shaft. 30 deg is the classic draft angle. */
export const BARB_ANGLE_DEG = 30;

/** Base width of the filled triangle head, as a fraction of its length. */
export const HEAD_WIDTH_RATIO = 0.75;

/**
 * A filled triangle head is opaque, so the shaft is trimmed back by most of the head length.
 * This keeps a round line cap from poking out of the tip at large stroke widths.
 */
export const TRIANGLE_TRIM_RATIO = 0.85;

/** Samples used for the polyline approximation of the curve's arc length. */
export const ARC_SAMPLES = 240;

const DEG = 180 / Math.PI;

/** Parse a user-typed value into a finite number, or NaN. Not part of the geometry. */
export function parseNumber(raw) {
  if (raw === null || raw === undefined) return NaN;
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
}

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function quadPoint(p0, c, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p2.y,
  };
}

function quadTangent(p0, c, p2, t) {
  const mt = 1 - t;
  return {
    x: 2 * mt * (c.x - p0.x) + 2 * t * (p2.x - c.x),
    y: 2 * mt * (c.y - p0.y) + 2 * t * (p2.y - c.y),
  };
}

function unit(v) {
  const len = Math.hypot(v.x, v.y);
  if (!(len > 0)) return { x: 1, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/** Cumulative arc length of the polyline approximation, plus the sample points. */
function arcTable(p0, c, p2, samples) {
  const points = [];
  const cumulative = [0];
  for (let i = 0; i <= samples; i += 1) {
    points.push(quadPoint(p0, c, p2, i / samples));
  }
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    cumulative.push(cumulative[i - 1] + Math.hypot(dx, dy));
  }
  return { points, cumulative, total: cumulative[cumulative.length - 1] };
}

/** Curve parameter t at a given distance along the curve, by linear interpolation of the table. */
function tAtDistance(table, distance) {
  if (!(distance > 0)) return 0;
  if (distance >= table.total) return 1;
  const samples = table.cumulative.length - 1;
  for (let i = 1; i <= samples; i += 1) {
    if (table.cumulative[i] >= distance) {
      const span = table.cumulative[i] - table.cumulative[i - 1];
      const frac = span > 0 ? (distance - table.cumulative[i - 1]) / span : 0;
      return (i - 1 + frac) / samples;
    }
  }
  return 1;
}

/**
 * Exact control points of the sub-curve of a quadratic Bezier on [a, b].
 * For a quadratic the middle control point is B(a) + B'(a) * (b - a) / 2.
 */
function splitQuad(p0, c, p2, a, b) {
  const start = quadPoint(p0, c, p2, a);
  const end = quadPoint(p0, c, p2, b);
  const d = quadTangent(p0, c, p2, a);
  const span = (b - a) / 2;
  return {
    start,
    control: { x: start.x + d.x * span, y: start.y + d.y * span },
    end,
  };
}

function trianglePoints(tip, direction, headSize) {
  const u = unit(direction);
  const half = (headSize * HEAD_WIDTH_RATIO) / 2;
  const base = { x: tip.x - u.x * headSize, y: tip.y - u.y * headSize };
  const n = { x: -u.y, y: u.x };
  return [
    tip,
    { x: base.x - n.x * half, y: base.y - n.y * half },
    { x: base.x + n.x * half, y: base.y + n.y * half },
  ];
}

function barbPoints(tip, direction, headSize) {
  const u = unit(direction);
  const angle = BARB_ANGLE_DEG / DEG;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const back = { x: -u.x * headSize, y: -u.y * headSize };
  return [
    { x: tip.x + back.x * cos - back.y * sin, y: tip.y + back.x * sin + back.y * cos },
    { x: tip.x + back.x * cos + back.y * sin, y: tip.y - back.x * sin + back.y * cos },
  ];
}

function pointsAttr(points) {
  return points.map((p) => `${round(p.x)},${round(p.y)}`).join(" ");
}

/**
 * Build every piece of an annotation arrow.
 * Returns { error } for input that cannot produce a drawable arrow.
 */
export function buildArrow(options = {}) {
  const {
    width = 320,
    height = 200,
    x1 = 20,
    y1 = 150,
    x2 = 300,
    y2 = 60,
    curvePercent = 20,
    strokeWidth = 3,
    headSize = 18,
    headStyle = "triangle",
    dashed = false,
    doubleHeaded = false,
  } = options;

  const numbers = { width, height, x1, y1, x2, y2, curvePercent, strokeWidth, headSize };
  for (const [key, value] of Object.entries(numbers)) {
    if (!Number.isFinite(Number(value))) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }

  const w = Number(width);
  const h = Number(height);
  if (w < CANVAS_MIN || w > CANVAS_MAX || h < CANVAS_MIN || h > CANVAS_MAX) {
    return { error: `Canvas width and height must be between ${CANVAS_MIN} and ${CANVAS_MAX}.` };
  }

  const curve = Number(curvePercent);
  if (curve < CURVE_MIN || curve > CURVE_MAX) {
    return { error: `Curve must be between ${CURVE_MIN}% and ${CURVE_MAX}% of the chord length.` };
  }

  const stroke = Number(strokeWidth);
  if (stroke < STROKE_MIN || stroke > STROKE_MAX) {
    return { error: `Stroke width must be between ${STROKE_MIN} and ${STROKE_MAX}.` };
  }

  const head = Number(headSize);
  if (head < HEAD_MIN || head > HEAD_MAX) {
    return { error: `Arrowhead size must be between ${HEAD_MIN} and ${HEAD_MAX}.` };
  }

  const style = HEAD_STYLES.some((item) => item.value === headStyle) ? headStyle : "triangle";
  const drawHead = style !== "none" && head > 0;

  const p0 = { x: Number(x1), y: Number(y1) };
  const p2 = { x: Number(x2), y: Number(y2) };
  const chord = Math.hypot(p2.x - p0.x, p2.y - p0.y);
  if (!(chord > 0)) {
    return { error: "Start and end points are identical — move one of them to draw an arrow." };
  }

  const mid = { x: (p0.x + p2.x) / 2, y: (p0.y + p2.y) / 2 };
  const normal = { x: -(p2.y - p0.y) / chord, y: (p2.x - p0.x) / chord };
  const bow = (curve / 100) * chord;
  const control = { x: mid.x + normal.x * 2 * bow, y: mid.y + normal.y * 2 * bow };
  const isStraight = Math.abs(bow) < 0.005;

  const table = arcTable(p0, control, p2, ARC_SAMPLES);
  const arcLength = table.total;

  const trim = style === "triangle" && drawHead ? head * TRIANGLE_TRIM_RATIO : 0;
  // Never trim away more than 90% of the shaft, however large the head.
  const safeTrim = Math.min(trim, arcLength * 0.9);
  const endTrim = drawHead ? safeTrim : 0;
  const startTrim = drawHead && doubleHeaded ? Math.min(safeTrim, arcLength * 0.9 - endTrim) : 0;

  const tEnd = tAtDistance(table, arcLength - endTrim);
  const tStart = tAtDistance(table, Math.max(0, startTrim));
  const segment = splitQuad(p0, control, p2, tStart, Math.max(tStart, tEnd));

  const shaftD = isStraight
    ? `M ${round(segment.start.x)} ${round(segment.start.y)} L ${round(segment.end.x)} ${round(segment.end.y)}`
    : `M ${round(segment.start.x)} ${round(segment.start.y)} Q ${round(segment.control.x)} ${round(
        segment.control.y,
      )} ${round(segment.end.x)} ${round(segment.end.y)}`;

  const fullPathD = isStraight
    ? `M ${round(p0.x)} ${round(p0.y)} L ${round(p2.x)} ${round(p2.y)}`
    : `M ${round(p0.x)} ${round(p0.y)} Q ${round(control.x)} ${round(control.y)} ${round(p2.x)} ${round(p2.y)}`;

  const endDir = quadTangent(p0, control, p2, 1);
  const startDir = quadTangent(p0, control, p2, 0);
  const endAngleDeg = Math.atan2(endDir.y, endDir.x) * DEG;
  const startAngleDeg = Math.atan2(-startDir.y, -startDir.x) * DEG;

  let endHead = null;
  let startHead = null;
  if (drawHead && style === "triangle") {
    endHead = { kind: "polygon", points: pointsAttr(trianglePoints(p2, endDir, head)) };
    if (doubleHeaded) {
      startHead = {
        kind: "polygon",
        points: pointsAttr(
          trianglePoints(p0, { x: -startDir.x, y: -startDir.y }, head),
        ),
      };
    }
  } else if (drawHead && style === "line") {
    const barbs = barbPoints(p2, endDir, head);
    endHead = {
      kind: "path",
      d: `M ${round(barbs[0].x)} ${round(barbs[0].y)} L ${round(p2.x)} ${round(p2.y)} L ${round(
        barbs[1].x,
      )} ${round(barbs[1].y)}`,
    };
    if (doubleHeaded) {
      const startBarbs = barbPoints(p0, { x: -startDir.x, y: -startDir.y }, head);
      startHead = {
        kind: "path",
        d: `M ${round(startBarbs[0].x)} ${round(startBarbs[0].y)} L ${round(p0.x)} ${round(
          p0.y,
        )} L ${round(startBarbs[1].x)} ${round(startBarbs[1].y)}`,
      };
    }
  }

  const dashArray = dashed ? `${round(stroke * 3)} ${round(stroke * 2.5)}` : null;
  // The length of the actual drawn/copied shaft path (shaftD), after head
  // trimming — distinct from arcLength, which is the full chord-to-chord
  // curve length before any trimming.
  const shaftLength = Math.max(0, arcLength - endTrim - startTrim);

  return {
    width: w,
    height: h,
    shaftD,
    fullPathD,
    endHead,
    startHead,
    dashArray,
    strokeWidth: round(stroke),
    control: { x: round(control.x), y: round(control.y) },
    bowHeight: round(Math.abs(bow)),
    chordLength: round(chord),
    arcLength: round(arcLength),
    shaftLength: round(shaftLength),
    endAngleDeg: round(endAngleDeg, 1),
    startAngleDeg: round(startAngleDeg, 1),
    headStyle: style,
    doubleHeaded: Boolean(doubleHeaded) && drawHead,
  };
}

/** Serialise a built arrow to standalone SVG markup that inherits the surrounding text colour. */
export function arrowToSvg(arrow, { indent = "  " } = {}) {
  if (!arrow || arrow.error) return "";
  const lines = [];
  const dash = arrow.dashArray ? ` stroke-dasharray="${arrow.dashArray}"` : "";
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${arrow.width} ${arrow.height}" width="${arrow.width}" height="${arrow.height}" fill="none" stroke="currentColor">`,
  );
  lines.push(
    `${indent}<path d="${arrow.shaftD}" stroke-width="${arrow.strokeWidth}" stroke-linecap="round"${dash} />`,
  );
  for (const head of [arrow.endHead, arrow.startHead]) {
    if (!head) continue;
    if (head.kind === "polygon") {
      lines.push(`${indent}<polygon points="${head.points}" fill="currentColor" stroke="none" />`);
    } else {
      lines.push(
        `${indent}<path d="${head.d}" stroke-width="${arrow.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`,
      );
    }
  }
  lines.push("</svg>");
  return lines.join("\n");
}
