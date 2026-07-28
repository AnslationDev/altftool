/**
 * SVG Path Editor — parse, edit, convert and measure an SVG path "d" attribute.
 *
 * EVERYTHING HERE FOLLOWS SVG 1.1 §8.3 (Path data) AND APPENDIX F.6.
 *
 * Commands and their parameter counts (§8.3.2 - §8.3.8):
 *   M/m moveto            2   x y
 *   L/l lineto            2   x y
 *   H/h horizontal        1   x
 *   V/v vertical          1   y
 *   C/c cubic bezier      6   x1 y1 x2 y2 x y
 *   S/s smooth cubic      4   x2 y2 x y
 *   Q/q quadratic         4   x1 y1 x y
 *   T/t smooth quadratic  2   x y
 *   A/a elliptical arc    7   rx ry x-axis-rotation large-arc-flag sweep-flag x y
 *   Z/z closepath         0
 * An uppercase letter means absolute coordinates, lowercase means relative to the
 * current point. A command letter may be omitted when repeating the previous command,
 * except after moveto, where the repeat is treated as lineto (§8.3.2).
 *
 * The two arc flags are single characters, "0" or "1", and may be written with no
 * separator at all — "a1 1 0 011 1" is legal — so they are scanned one character at a
 * time rather than as general numbers. This is the most common path-parser bug.
 *
 * Smooth commands (§8.3.6): the first control point of S is the reflection of the
 * previous cubic's second control point about the current point; for T it is the
 * reflection of the previous quadratic's control point. When the previous command was
 * not of the matching kind, the control point coincides with the current point.
 *
 * Arc to cubic (Appendix F.6.5, endpoint to centre parameterisation) is used for
 * bounding boxes, so an arc's true extent is measured rather than guessed from its
 * endpoints. Out-of-range radii are corrected exactly as F.6.6 prescribes.
 *
 * Pure module: strings and numbers in, strings and numbers out. No DOM, no clock.
 */

/** Parameter count for each path command letter, SVG 1.1 §8.3.2-§8.3.8. */
export const COMMAND_PARAMETERS = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0,
};

/** Human labels for each parameter slot, used by the editor UI. */
export const PARAMETER_LABELS = {
  M: ["x", "y"],
  L: ["x", "y"],
  H: ["x"],
  V: ["y"],
  C: ["x1", "y1", "x2", "y2", "x", "y"],
  S: ["x2", "y2", "x", "y"],
  Q: ["x1", "y1", "x", "y"],
  T: ["x", "y"],
  A: ["rx", "ry", "rotation", "large-arc", "sweep", "x", "y"],
  Z: [],
};

/** Zero-based indexes of the two flag parameters of an arc, which must be 0 or 1. */
export const ARC_FLAG_INDEXES = [3, 4];

/** Decimal places used when writing numbers back out. */
export const DEFAULT_PRECISION = 3;

/** Widest precision worth keeping in path data. */
export const MAX_PRECISION = 8;

/** Below this the arc radius is treated as degenerate and the arc becomes a line (F.6.2). */
const RADIUS_EPSILON = 1e-9;

const NUMBER_AT_RE = /^[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/;

/** Round to `precision` decimals and render in the shortest legal SVG number form. */
export function formatNumber(value, precision = DEFAULT_PRECISION) {
  if (!Number.isFinite(value)) return "0";
  const places = Math.max(0, Math.min(MAX_PRECISION, Math.trunc(precision)));
  const factor = Math.pow(10, places);
  let rounded = Math.round(value * factor) / factor;
  if (Object.is(rounded, -0)) rounded = 0;
  if (Math.abs(rounded) >= 1e21) return String(rounded);
  let out = rounded.toFixed(places);
  if (out.indexOf(".") !== -1) out = out.replace(/0+$/, "").replace(/\.$/, "");
  out = out.replace(/^(-?)0\./, "$1.");
  if (out === "" || out === "-") out = "0";
  return out;
}

/* ------------------------------------------------------------------ parsing -- */

/**
 * Parse a path "d" string into a list of commands.
 * @returns {{commands: Array<{command: string, relative: boolean, values: number[]}>}}
 *          or { error } with a plain-language reason.
 */
export function parsePath(d) {
  if (typeof d !== "string" || d.trim() === "")
    return { error: "Enter a path — it must start with a moveto command such as M 0 0." };

  const text = d;
  let i = 0;
  const n = text.length;
  const commands = [];

  const skipSeparators = () => {
    while (i < n && (/\s/.test(text[i]) || text[i] === ",")) i += 1;
  };

  const readNumber = () => {
    skipSeparators();
    const rest = text.slice(i);
    const match = NUMBER_AT_RE.exec(rest);
    if (!match || match[0] === "" || match[0] === "." || match[0] === "-" || match[0] === "+")
      return null;
    i += match[0].length;
    const value = Number(match[0]);
    return Number.isFinite(value) ? value : null;
  };

  const readFlag = () => {
    skipSeparators();
    const ch = text[i];
    if (ch === "0" || ch === "1") {
      i += 1;
      return ch === "1" ? 1 : 0;
    }
    return null;
  };

  skipSeparators();
  if (i >= n) return { error: "The path is empty." };
  if (!/[Mm]/.test(text[i]))
    return { error: `A path must start with M or m, not "${text[i]}".` };

  let lastLetter = null;

  while (i < n) {
    skipSeparators();
    if (i >= n) break;

    let letter;
    const ch = text[i];
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(ch)) {
      letter = ch;
      i += 1;
    } else if (/[A-Za-z]/.test(ch)) {
      return { error: `"${ch}" is not an SVG path command.` };
    } else if (lastLetter) {
      // Implicit repeat of the previous command; after a moveto it becomes a lineto (§8.3.2).
      letter = lastLetter === "M" ? "L" : lastLetter === "m" ? "l" : lastLetter;
    } else {
      return { error: `Unexpected character "${ch}" at position ${i} — expected a command letter.` };
    }

    const upper = letter.toUpperCase();
    const relative = letter !== upper;
    const count = COMMAND_PARAMETERS[upper];
    if (count === undefined) return { error: `"${letter}" is not an SVG path command.` };

    if (count === 0) {
      commands.push({ command: "Z", relative, values: [] });
      lastLetter = letter;
      skipSeparators();
      continue;
    }

    const values = [];
    for (let p = 0; p < count; p += 1) {
      const isFlag = upper === "A" && ARC_FLAG_INDEXES.includes(p);
      const value = isFlag ? readFlag() : readNumber();
      if (value === null) {
        if (isFlag)
          return {
            error: `Arc command "${letter}" needs its large-arc and sweep flags to be 0 or 1.`,
          };
        return {
          error: `Command "${letter}" needs ${count} numbers but only ${p} were found.`,
        };
      }
      values.push(value);
    }
    commands.push({ command: upper, relative, values });
    lastLetter = letter;
  }

  if (commands.length === 0) return { error: "No path commands were found." };
  return { commands };
}

/* ------------------------------------------------------------ serialisation -- */

/**
 * Write commands back out as a "d" string.
 * @param {Array} commands
 * @param {object} [options] { precision, minify }
 */
export function serializePath(commands, options = {}) {
  const precision = options.precision ?? DEFAULT_PRECISION;
  const minify = options.minify ?? false;
  const parts = [];

  for (const cmd of commands) {
    const letter = cmd.relative ? cmd.command.toLowerCase() : cmd.command;
    if (cmd.command === "Z") {
      parts.push(letter);
      continue;
    }
    const rendered = cmd.values.map((value, index) =>
      cmd.command === "A" && ARC_FLAG_INDEXES.includes(index)
        ? String(value ? 1 : 0)
        : formatNumber(value, precision),
    );
    parts.push(letter + (minify ? "" : " ") + joinNumbers(rendered, minify));
  }

  // The command letter already separates one command from the next, so in minified form
  // the parts are simply concatenated (SVG 1.1 §8.3.1).
  return minify ? parts.join("") : parts.join(" ").trim();
}

function joinNumbers(rendered, minify) {
  if (!minify) return rendered.join(" ");
  let out = "";
  let previous = null;
  for (const token of rendered) {
    if (previous !== null && needsSeparator(previous, token)) out += " ";
    out += token;
    previous = token;
  }
  return out;
}

function needsSeparator(previous, next) {
  if (next[0] === "-" || next[0] === "+") return false;
  if (previous.indexOf("e") !== -1 || previous.indexOf("E") !== -1) return true;
  if (next[0] === "." && previous.indexOf(".") !== -1) return false;
  return true;
}

/* ------------------------------------------------- absolute / relative form -- */

function reflect(point, about) {
  return [2 * about[0] - point[0], 2 * about[1] - point[1]];
}

/**
 * Walk the command list, tracking the current point, the subpath start and the previous
 * control point. Calls `visit(absoluteCommand, state)` for each command.
 */
function walk(commands, visit) {
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let lastCubicControl = null;
  let lastQuadControl = null;
  let previousCommand = null;

  for (const cmd of commands) {
    const v = cmd.values;
    const rel = cmd.relative;
    let abs;

    switch (cmd.command) {
      case "M":
        abs = rel ? [cx + v[0], cy + v[1]] : [v[0], v[1]];
        visit({ command: "M", values: abs.slice() }, { cx, cy });
        cx = abs[0];
        cy = abs[1];
        sx = cx;
        sy = cy;
        lastCubicControl = null;
        lastQuadControl = null;
        break;
      case "L":
        abs = rel ? [cx + v[0], cy + v[1]] : [v[0], v[1]];
        visit({ command: "L", values: abs.slice() }, { cx, cy });
        cx = abs[0];
        cy = abs[1];
        lastCubicControl = null;
        lastQuadControl = null;
        break;
      case "H":
        abs = [rel ? cx + v[0] : v[0]];
        visit({ command: "H", values: abs.slice() }, { cx, cy });
        cx = abs[0];
        lastCubicControl = null;
        lastQuadControl = null;
        break;
      case "V":
        abs = [rel ? cy + v[0] : v[0]];
        visit({ command: "V", values: abs.slice() }, { cx, cy });
        cy = abs[0];
        lastCubicControl = null;
        lastQuadControl = null;
        break;
      case "C":
        abs = rel
          ? [cx + v[0], cy + v[1], cx + v[2], cy + v[3], cx + v[4], cy + v[5]]
          : v.slice();
        visit({ command: "C", values: abs.slice() }, { cx, cy });
        lastCubicControl = [abs[2], abs[3]];
        lastQuadControl = null;
        cx = abs[4];
        cy = abs[5];
        break;
      case "S": {
        abs = rel ? [cx + v[0], cy + v[1], cx + v[2], cy + v[3]] : v.slice();
        const isSmooth = previousCommand === "C" || previousCommand === "S";
        const c1 = isSmooth && lastCubicControl ? reflect(lastCubicControl, [cx, cy]) : [cx, cy];
        visit({ command: "S", values: abs.slice(), control1: c1 }, { cx, cy });
        lastCubicControl = [abs[0], abs[1]];
        lastQuadControl = null;
        cx = abs[2];
        cy = abs[3];
        break;
      }
      case "Q":
        abs = rel ? [cx + v[0], cy + v[1], cx + v[2], cy + v[3]] : v.slice();
        visit({ command: "Q", values: abs.slice() }, { cx, cy });
        lastQuadControl = [abs[0], abs[1]];
        lastCubicControl = null;
        cx = abs[2];
        cy = abs[3];
        break;
      case "T": {
        abs = rel ? [cx + v[0], cy + v[1]] : v.slice();
        const isSmooth = previousCommand === "Q" || previousCommand === "T";
        const c1 = isSmooth && lastQuadControl ? reflect(lastQuadControl, [cx, cy]) : [cx, cy];
        visit({ command: "T", values: abs.slice(), control1: c1 }, { cx, cy });
        lastQuadControl = c1;
        lastCubicControl = null;
        cx = abs[0];
        cy = abs[1];
        break;
      }
      case "A":
        abs = rel
          ? [v[0], v[1], v[2], v[3], v[4], cx + v[5], cy + v[6]]
          : v.slice();
        visit({ command: "A", values: abs.slice() }, { cx, cy });
        cx = abs[5];
        cy = abs[6];
        lastCubicControl = null;
        lastQuadControl = null;
        break;
      case "Z":
        visit({ command: "Z", values: [] }, { cx, cy });
        cx = sx;
        cy = sy;
        lastCubicControl = null;
        lastQuadControl = null;
        break;
      default:
        break;
    }
    previousCommand = cmd.command;
  }
}

/** Convert every command to absolute coordinates, keeping the same command letters. */
export function toAbsolute(commands) {
  const out = [];
  walk(commands, (abs) => {
    out.push({ command: abs.command, relative: false, values: abs.values.slice() });
  });
  return out;
}

/** Convert every command to relative coordinates, keeping the same command letters. */
export function toRelative(commands) {
  const out = [];
  walk(commands, (abs, state) => {
    const { cx, cy } = state;
    const v = abs.values;
    switch (abs.command) {
      case "M":
      case "L":
      case "T":
        out.push({ command: abs.command, relative: true, values: [v[0] - cx, v[1] - cy] });
        break;
      case "H":
        out.push({ command: "H", relative: true, values: [v[0] - cx] });
        break;
      case "V":
        out.push({ command: "V", relative: true, values: [v[0] - cy] });
        break;
      case "C":
        out.push({
          command: "C",
          relative: true,
          values: [v[0] - cx, v[1] - cy, v[2] - cx, v[3] - cy, v[4] - cx, v[5] - cy],
        });
        break;
      case "S":
      case "Q":
        out.push({
          command: abs.command,
          relative: true,
          values: [v[0] - cx, v[1] - cy, v[2] - cx, v[3] - cy],
        });
        break;
      case "A":
        out.push({
          command: "A",
          relative: true,
          values: [v[0], v[1], v[2], v[3], v[4], v[5] - cx, v[6] - cy],
        });
        break;
      case "Z":
        out.push({ command: "Z", relative: true, values: [] });
        break;
      default:
        break;
    }
  });
  return out;
}

/* --------------------------------------------------------------- transforms -- */

/**
 * Move and uniformly scale a path. Scaling happens about the origin first, then the
 * translation is applied, i.e. p' = p * scale + [dx, dy].
 * Arc radii are multiplied by the same scale, which is only correct for a uniform
 * scale — that is why non-uniform scaling is not offered.
 */
export function transformPath(commands, { dx = 0, dy = 0, scale = 1 } = {}) {
  const s = Number(scale);
  if (!Number.isFinite(s) || s <= 0)
    return { error: "Scale must be a positive number — mirroring is not supported." };
  if (!Number.isFinite(Number(dx)) || !Number.isFinite(Number(dy)))
    return { error: "Move X and move Y must be numbers." };

  const absolute = toAbsolute(commands);
  const tx = Number(dx);
  const ty = Number(dy);
  const out = absolute.map((cmd) => {
    const v = cmd.values;
    switch (cmd.command) {
      case "M":
      case "L":
      case "T":
        return { ...cmd, values: [v[0] * s + tx, v[1] * s + ty] };
      case "H":
        return { ...cmd, values: [v[0] * s + tx] };
      case "V":
        return { ...cmd, values: [v[0] * s + ty] };
      case "C":
        return {
          ...cmd,
          values: [
            v[0] * s + tx,
            v[1] * s + ty,
            v[2] * s + tx,
            v[3] * s + ty,
            v[4] * s + tx,
            v[5] * s + ty,
          ],
        };
      case "S":
      case "Q":
        return {
          ...cmd,
          values: [v[0] * s + tx, v[1] * s + ty, v[2] * s + tx, v[3] * s + ty],
        };
      case "A":
        return {
          ...cmd,
          values: [
            Math.abs(v[0] * s),
            Math.abs(v[1] * s),
            v[2],
            v[3],
            v[4],
            v[5] * s + tx,
            v[6] * s + ty,
          ],
        };
      default:
        return { ...cmd, values: [] };
    }
  });
  return { commands: out };
}

/* ------------------------------------------------------------ arc to cubic -- */

/**
 * Convert one elliptical arc to a list of cubic bezier segments.
 * Implements SVG 1.1 Appendix F.6.5 (endpoint to centre parameterisation) and F.6.6
 * (out-of-range radii are scaled up until the endpoints fit on the ellipse).
 *
 * @returns {Array<[x1,y1,x2,y2,x,y]>} absolute cubic control points
 */
export function arcToCubic(x0, y0, rxIn, ryIn, xAxisRotationDeg, largeArc, sweep, x, y) {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx < RADIUS_EPSILON || ry < RADIUS_EPSILON) return [[x0, y0, x, y, x, y]]; // F.6.2: degenerate → line
  if (x0 === x && y0 === y) return []; // F.6.2: identical endpoints → arc is omitted

  const phi = (xAxisRotationDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  // F.6.5 step 1: translate so the midpoint is the origin and rotate by -phi
  const dx2 = (x0 - x) / 2;
  const dy2 = (y0 - y) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  // F.6.6: scale radii up if they are too small to span the endpoints
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const factor = Math.sqrt(lambda);
    rx *= factor;
    ry *= factor;
  }

  // F.6.5 step 2: the centre in the rotated frame
  const rxSq = rx * rx;
  const rySq = ry * ry;
  const numerator = rxSq * rySq - rxSq * y1p * y1p - rySq * x1p * x1p;
  const denominator = rxSq * y1p * y1p + rySq * x1p * x1p;
  let coefficient = denominator === 0 ? 0 : Math.sqrt(Math.max(0, numerator / denominator));
  if (largeArc === sweep) coefficient = -coefficient;
  const cxp = (coefficient * rx * y1p) / ry;
  const cyp = (-coefficient * ry * x1p) / rx;

  // F.6.5 step 3: back to the original frame
  const cx = cosPhi * cxp - sinPhi * cyp + (x0 + x) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y0 + y) / 2;

  // F.6.5 step 4: the start angle and the swept angle
  const angle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    let a = Math.acos(Math.min(1, Math.max(-1, len === 0 ? 1 : dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let deltaTheta = angle(
    (x1p - cxp) / rx,
    (y1p - cyp) / ry,
    (-x1p - cxp) / rx,
    (-y1p - cyp) / ry,
  );
  if (!sweep && deltaTheta > 0) deltaTheta -= 2 * Math.PI;
  if (sweep && deltaTheta < 0) deltaTheta += 2 * Math.PI;

  // A cubic approximates an elliptical arc well up to a quarter turn, so split there.
  const segments = Math.max(1, Math.ceil(Math.abs(deltaTheta) / (Math.PI / 2)));
  const delta = deltaTheta / segments;
  // Standard control-point distance for approximating a circular arc of angle `delta`.
  const t = (4 / 3) * Math.tan(delta / 4);

  const result = [];
  let th = theta1;
  let px = x0;
  let py = y0;
  for (let s = 0; s < segments; s += 1) {
    const thNext = th + delta;
    const cosT = Math.cos(th);
    const sinT = Math.sin(th);
    const cosN = Math.cos(thNext);
    const sinN = Math.sin(thNext);

    const ex = cx + rx * cosPhi * cosN - ry * sinPhi * sinN;
    const ey = cy + rx * sinPhi * cosN + ry * cosPhi * sinN;

    const dx1 = -rx * cosPhi * sinT - ry * sinPhi * cosT;
    const dy1 = -rx * sinPhi * sinT + ry * cosPhi * cosT;
    const dx3 = -rx * cosPhi * sinN - ry * sinPhi * cosN;
    const dy3 = -rx * sinPhi * sinN + ry * cosPhi * cosN;

    result.push([px + t * dx1, py + t * dy1, ex - t * dx3, ey - t * dy3, ex, ey]);
    px = ex;
    py = ey;
    th = thNext;
  }
  return result;
}

/* ---------------------------------------------------------------- geometry -- */

function cubicExtrema(p0, p1, p2, p3) {
  // A cubic component is p0(1-t)^3 + 3p1 t(1-t)^2 + 3p2 t^2(1-t) + p3 t^3.
  // Its derivative is a quadratic; its roots inside (0,1) are the local extrema.
  const values = [p0, p3];
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  const at = (t) =>
    Math.pow(1 - t, 3) * p0 +
    3 * Math.pow(1 - t, 2) * t * p1 +
    3 * (1 - t) * t * t * p2 +
    t * t * t * p3;

  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) {
      const t = -c / b;
      if (t > 0 && t < 1) values.push(at(t));
    }
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const root = Math.sqrt(disc);
      for (const t of [(-b + root) / (2 * a), (-b - root) / (2 * a)]) {
        if (t > 0 && t < 1) values.push(at(t));
      }
    }
  }
  return values;
}

/**
 * Exact bounding box of a path, in user units.
 * Curves are measured at their true extrema, not at their control points, and arcs are
 * converted to cubics first, so the box is tight.
 * @returns {{minX, minY, maxX, maxY, width, height}} or { error }
 */
export function pathBounds(commands) {
  if (!Array.isArray(commands) || commands.length === 0)
    return { error: "There is nothing to measure." };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  walk(commands, (abs, state) => {
    const { cx, cy } = state;
    const v = abs.values;
    switch (abs.command) {
      case "M":
        // A moveto draws nothing, so only the point it lands on belongs to the box.
        add(v[0], v[1]);
        break;
      case "L":
        add(v[0], v[1]);
        add(cx, cy);
        break;
      case "T": {
        // A quadratic equals a cubic whose controls sit 2/3 of the way to the
        // quadratic's single control point, so the same extrema solver applies.
        const c = abs.control1 || [cx, cy];
        const c1x = cx + (2 / 3) * (c[0] - cx);
        const c1y = cy + (2 / 3) * (c[1] - cy);
        const c2x = v[0] + (2 / 3) * (c[0] - v[0]);
        const c2y = v[1] + (2 / 3) * (c[1] - v[1]);
        for (const value of cubicExtrema(cx, c1x, c2x, v[0])) add(value, cy);
        for (const value of cubicExtrema(cy, c1y, c2y, v[1])) add(cx, value);
        add(cx, cy);
        add(v[0], v[1]);
        break;
      }
      case "H":
        add(v[0], cy);
        add(cx, cy);
        break;
      case "V":
        add(cx, v[0]);
        add(cx, cy);
        break;
      case "C": {
        for (const value of cubicExtrema(cx, v[0], v[2], v[4])) add(value, cy);
        for (const value of cubicExtrema(cy, v[1], v[3], v[5])) add(cx, value);
        add(cx, cy);
        add(v[4], v[5]);
        break;
      }
      case "S": {
        const c1 = abs.control1 || [cx, cy];
        for (const value of cubicExtrema(cx, c1[0], v[0], v[2])) add(value, cy);
        for (const value of cubicExtrema(cy, c1[1], v[1], v[3])) add(cx, value);
        add(cx, cy);
        add(v[2], v[3]);
        break;
      }
      case "Q": {
        const c1x = cx + (2 / 3) * (v[0] - cx);
        const c1y = cy + (2 / 3) * (v[1] - cy);
        const c2x = v[2] + (2 / 3) * (v[0] - v[2]);
        const c2y = v[3] + (2 / 3) * (v[1] - v[3]);
        for (const value of cubicExtrema(cx, c1x, c2x, v[2])) add(value, cy);
        for (const value of cubicExtrema(cy, c1y, c2y, v[3])) add(cx, value);
        add(cx, cy);
        add(v[2], v[3]);
        break;
      }
      case "A": {
        const cubics = arcToCubic(cx, cy, v[0], v[1], v[2], v[3], v[4], v[5], v[6]);
        let px = cx;
        let py = cy;
        add(px, py);
        for (const seg of cubics) {
          for (const value of cubicExtrema(px, seg[0], seg[2], seg[4])) add(value, py);
          for (const value of cubicExtrema(py, seg[1], seg[3], seg[5])) add(px, value);
          px = seg[4];
          py = seg[5];
          add(px, py);
        }
        break;
      }
      case "Z":
        add(cx, cy);
        break;
      default:
        break;
    }
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY))
    return { error: "The path has no drawable points." };

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/* ---------------------------------------------------------------- editing -- */

/**
 * Replace one parameter of one command, returning a new list.
 * Arc flags are coerced to 0 or 1; everything else must be a finite number.
 */
export function updateCommandValue(commands, commandIndex, valueIndex, rawValue) {
  if (!Array.isArray(commands) || !commands[commandIndex])
    return { error: "That command no longer exists." };
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return { error: "That value is not a number." };
  const next = commands.map((cmd, i) => {
    if (i !== commandIndex) return cmd;
    const values = cmd.values.slice();
    values[valueIndex] =
      cmd.command === "A" && ARC_FLAG_INDEXES.includes(valueIndex) ? (value ? 1 : 0) : value;
    return { ...cmd, values };
  });
  return { commands: next };
}

/** Remove one command from the list. A path must keep at least one command. */
export function removeCommand(commands, commandIndex) {
  if (!Array.isArray(commands) || commands.length <= 1)
    return { error: "A path needs at least one command." };
  return { commands: commands.filter((_, i) => i !== commandIndex) };
}

/**
 * The on-path anchor points (the endpoint of every drawing command), in absolute user
 * units. Control points are not included — these are the handles a user would drag.
 */
export function pathPoints(commands) {
  const points = [];
  walk(commands, (abs, state) => {
    const v = abs.values;
    switch (abs.command) {
      case "M":
      case "L":
      case "T":
        points.push({ x: v[0], y: v[1], command: abs.command });
        break;
      case "H":
        points.push({ x: v[0], y: state.cy, command: "H" });
        break;
      case "V":
        points.push({ x: state.cx, y: v[0], command: "V" });
        break;
      case "C":
        points.push({ x: v[4], y: v[5], command: "C" });
        break;
      case "S":
      case "Q":
        points.push({ x: v[2], y: v[3], command: abs.command });
        break;
      case "A":
        points.push({ x: v[5], y: v[6], command: "A" });
        break;
      default:
        break;
    }
  });
  return points;
}

/** Fraction of the longer side added as breathing room around the preview. */
export const PREVIEW_PADDING_RATIO = 0.08;

/**
 * A viewBox that frames the path with a little padding. A zero-width or zero-height
 * path (a straight horizontal line, say) still needs a positive box, so the smaller
 * side falls back to the larger one.
 */
export function previewViewBox(bounds, paddingRatio = PREVIEW_PADDING_RATIO) {
  if (!bounds || bounds.error) return { error: bounds?.error ?? "No bounds to frame." };
  const span = Math.max(bounds.width, bounds.height, 1);
  const pad = span * paddingRatio;
  const width = (bounds.width > 0 ? bounds.width : span) + pad * 2;
  const height = (bounds.height > 0 ? bounds.height : span) + pad * 2;
  const x = bounds.minX - (width - bounds.width) / 2;
  const y = bounds.minY - (height - bounds.height) / 2;
  return { x, y, width, height, viewBox: `${x} ${y} ${width} ${height}`, span };
}

/**
 * One-call summary used by the UI: parse, measure, and produce absolute, relative and
 * minified renderings of the same path.
 */
export function analyzePath(d, options = {}) {
  const parsed = parsePath(d);
  if (parsed.error) return parsed;
  const bounds = pathBounds(parsed.commands);
  if (bounds.error) return bounds;
  const precision = options.precision ?? DEFAULT_PRECISION;
  const absolute = toAbsolute(parsed.commands);
  const relative = toRelative(parsed.commands);
  return {
    commands: parsed.commands,
    commandCount: parsed.commands.length,
    subpathCount: parsed.commands.filter((c) => c.command === "M").length,
    bounds,
    points: pathPoints(parsed.commands),
    preview: previewViewBox(bounds),
    absolute: serializePath(absolute, { precision }),
    relative: serializePath(relative, { precision }),
    minified: serializePath(relative, { precision, minify: true }),
    pretty: serializePath(parsed.commands, { precision }),
  };
}
