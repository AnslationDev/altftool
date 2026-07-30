/**
 * Variable Font Axis Explorer — a real OpenType parser.
 *
 * Reads the sfnt table directory of a .ttf / .otf you hand it as an ArrayBuffer,
 * then decodes:
 *
 *   fvar  — the font variations table: every design axis with its tag, minimum,
 *           default and maximum, plus every named instance and its coordinates
 *           (OpenType spec, "fvar — Font Variations Table").
 *   name  — to resolve the axis and instance name IDs into readable strings, and
 *           to pull out the family / subfamily / version names.
 *   head  — unitsPerEm.
 *   OS/2  — usWeightClass and usWidthClass, i.e. what the static metadata claims.
 *
 * It also reports which of the variation-related tables are present (avar, gvar,
 * cvar, CFF2, HVAR, VVAR, MVAR, STAT) and turns the axis ranges into the CSS an
 * @font-face rule actually needs.
 *
 * Pure: DataView / TypedArray maths only. No DOM, no network, no clock, no random.
 */

/* ------------------------------------------------------------------ *
 * The registered axis registry (OpenType design-variation axis tags)
 * ------------------------------------------------------------------ */

export const REGISTERED_AXES = {
  ital: {
    tag: "ital",
    name: "Italic",
    unit: "",
    typicalMin: 0,
    typicalMax: 1,
    css: "font-style",
    summary:
      "A switch, not a slider: 0 is upright, 1 is the true italic. Values between the two are not meaningful in most families.",
  },
  opsz: {
    tag: "opsz",
    name: "Optical size",
    unit: "pt",
    typicalMin: 6,
    typicalMax: 144,
    css: "font-optical-sizing",
    summary:
      "The point size the outlines are tuned for. Low values thicken hairlines and open the spacing for captions; high values sharpen contrast for display sizes.",
  },
  slnt: {
    tag: "slnt",
    name: "Slant",
    unit: "deg",
    typicalMin: -90,
    typicalMax: 90,
    css: "font-style: oblique",
    summary:
      "Oblique angle in degrees. The slnt sign is the opposite of the CSS one: slnt -10 is CSS oblique 10deg.",
  },
  wdth: {
    tag: "wdth",
    name: "Width",
    unit: "%",
    typicalMin: 50,
    typicalMax: 200,
    css: "font-stretch",
    summary:
      "Percentage of the normal width, where 100 is normal. CSS font-stretch takes the same percentage directly.",
  },
  wght: {
    tag: "wght",
    name: "Weight",
    unit: "",
    typicalMin: 1,
    typicalMax: 1000,
    css: "font-weight",
    summary:
      "Stroke weight on the familiar 1-1000 scale: 400 is regular, 700 is bold. CSS font-weight takes the number directly.",
  },
};

/** Axis flags, fvar spec. */
export const AXIS_FLAG_HIDDEN = 0x0001;

/** Names for the sfnt `name` table IDs this tool surfaces. */
export const NAME_IDS = {
  0: "Copyright",
  1: "Family",
  2: "Subfamily",
  3: "Unique identifier",
  4: "Full name",
  5: "Version",
  6: "PostScript name",
  7: "Trademark",
  8: "Manufacturer",
  9: "Designer",
  11: "Vendor URL",
  13: "Licence",
  14: "Licence URL",
  16: "Typographic family",
  17: "Typographic subfamily",
  25: "Variations PostScript name prefix",
};

/** Variation-related tables and what their presence means. */
export const VARIATION_TABLES = [
  ["fvar", "Declares the axes — required for any variable font."],
  ["gvar", "TrueType glyph outline deltas (glyf-based variable fonts)."],
  ["CFF2", "CFF2 charstrings with embedded deltas (PostScript-based variable fonts)."],
  ["avar", "Axis value remapping — the slider is not linear."],
  ["cvar", "CVT deltas for hinting."],
  ["HVAR", "Horizontal metric deltas — advance widths vary across the space."],
  ["VVAR", "Vertical metric deltas."],
  ["MVAR", "Font-wide metric deltas (x-height, underline, and so on)."],
  ["STAT", "Style attributes — how the axes map onto named styles."],
];

/* ------------------------------------------------------------------ *
 * Byte-level helpers
 * ------------------------------------------------------------------ */

const tagFromUint32 = (value) =>
  String.fromCharCode((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);

const readTag = (view, offset) =>
  String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );

/** F16Dot16 fixed-point, as fvar stores axis coordinates. */
const readFixed = (view, offset) => view.getInt32(offset) / 65536;

function decodeUtf16BE(bytes) {
  let out = "";
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    out += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
  }
  return out;
}

function decodeLatin1(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}

/** Round to at most `places` decimals and drop trailing zeros. */
export function formatAxisValue(value, places = 3) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const rounded = Number(value.toFixed(places));
  return String(rounded);
}

/* ------------------------------------------------------------------ *
 * sfnt directory
 * ------------------------------------------------------------------ */

function readTableDirectory(view) {
  if (view.byteLength < 12) {
    return { error: "That file is too small to be a font (under 12 bytes)." };
  }
  const version = view.getUint32(0);
  const versionTag = tagFromUint32(version);

  if (versionTag === "wOFF" || versionTag === "wOF2") {
    return {
      error:
        versionTag === "wOF2"
          ? "This is a WOFF2 file. WOFF2 wraps the font in Brotli compression that the browser will not unpack for a script, so upload the original .ttf or .otf instead."
          : "This is a WOFF file. WOFF wraps the font in zlib compression, so upload the original .ttf or .otf instead.",
    };
  }
  if (versionTag === "ttcf") {
    return {
      error: "This is a TrueType Collection (.ttc). Extract the individual .ttf you want and upload that.",
    };
  }
  if (version !== 0x00010000 && versionTag !== "OTTO" && versionTag !== "true" && versionTag !== "typ1") {
    return {
      error: `Not an OpenType or TrueType file — the first four bytes are "${versionTag.replace(/[^\x20-\x7e]/g, ".")}".`,
    };
  }

  const numTables = view.getUint16(4);
  if (numTables === 0) return { error: "The font's table directory is empty." };
  if (12 + numTables * 16 > view.byteLength) {
    return { error: "The table directory runs past the end of the file — the upload is truncated." };
  }

  const tables = new Map();
  for (let i = 0; i < numTables; i += 1) {
    const record = 12 + i * 16;
    const tag = readTag(view, record);
    const offset = view.getUint32(record + 8);
    const length = view.getUint32(record + 12);
    if (offset + length > view.byteLength) continue; // truncated table, skip it
    tables.set(tag, { tag, offset, length });
  }

  const sfntVersion =
    version === 0x00010000 ? "0x00010000 (TrueType)" : `${versionTag} (0x${version.toString(16).padStart(8, "0")})`;

  return {
    sfntVersion,
    outlineFormat: versionTag === "OTTO" ? "PostScript (CFF / CFF2)" : "TrueType (glyf)",
    numTables,
    tables,
  };
}

/* ------------------------------------------------------------------ *
 * name table
 * ------------------------------------------------------------------ */

/**
 * Decode the `name` table into a Map of nameID -> string, preferring the Windows
 * platform / English record, then any Unicode record, then Macintosh.
 */
function readNameTable(view, table) {
  const names = new Map();
  if (!table || table.length < 6) return names;
  const base = table.offset;
  const count = view.getUint16(base + 2);
  const storage = base + view.getUint16(base + 4);

  const rank = (platformID, languageID) => {
    if (platformID === 3 && languageID === 0x0409) return 0; // Windows, en-US
    if (platformID === 3) return 1;
    if (platformID === 0) return 2; // Unicode
    if (platformID === 1 && languageID === 0) return 3; // Mac English
    return 4;
  };

  const best = new Map();
  for (let i = 0; i < count; i += 1) {
    const record = base + 6 + i * 12;
    if (record + 12 > base + table.length) break;
    const platformID = view.getUint16(record);
    const languageID = view.getUint16(record + 4);
    const nameID = view.getUint16(record + 6);
    const length = view.getUint16(record + 8);
    const stringOffset = view.getUint16(record + 10);
    const start = storage + stringOffset;
    if (start + length > view.byteLength) continue;

    const score = rank(platformID, languageID);
    if (best.has(nameID) && best.get(nameID) <= score) continue;

    const bytes = new Uint8Array(view.buffer, view.byteOffset + start, length);
    const text = platformID === 1 ? decodeLatin1(bytes) : decodeUtf16BE(bytes);
    const trimmed = text.replace(/ +$/, "").trim();
    if (trimmed === "") continue;
    best.set(nameID, score);
    names.set(nameID, trimmed);
  }
  return names;
}

/* ------------------------------------------------------------------ *
 * fvar table
 * ------------------------------------------------------------------ */

function readFvar(view, table, names) {
  if (table.length < 16) return { error: "The fvar table is too short to be read." };
  const base = table.offset;
  const majorVersion = view.getUint16(base);
  const axesArrayOffset = view.getUint16(base + 4);
  const axisCount = view.getUint16(base + 8);
  const axisSize = view.getUint16(base + 10);
  const instanceCount = view.getUint16(base + 12);
  const instanceSize = view.getUint16(base + 14);

  if (majorVersion !== 1) {
    return { error: `fvar version ${majorVersion} is not one this parser understands (expected 1).` };
  }
  if (axisCount === 0) return { error: "The fvar table declares zero axes, so this is not a variable font." };
  if (axisSize < 20) return { error: `fvar says each axis record is ${axisSize} bytes; the spec requires at least 20.` };

  const axesStart = base + axesArrayOffset;
  if (axesStart + axisCount * axisSize > view.byteLength) {
    return { error: "The fvar axis array runs past the end of the file." };
  }

  const axes = [];
  for (let i = 0; i < axisCount; i += 1) {
    const record = axesStart + i * axisSize;
    const tag = readTag(view, record);
    const minValue = readFixed(view, record + 4);
    const defaultValue = readFixed(view, record + 8);
    const maxValue = readFixed(view, record + 12);
    const flags = view.getUint16(record + 16);
    const axisNameID = view.getUint16(record + 18);
    const registered = REGISTERED_AXES[tag] || null;

    const warnings = [];
    if (!(minValue <= defaultValue && defaultValue <= maxValue)) {
      warnings.push(
        `The record is inconsistent: min ${formatAxisValue(minValue)}, default ${formatAxisValue(defaultValue)}, max ${formatAxisValue(maxValue)} are not in order.`,
      );
    }
    if (minValue === maxValue) warnings.push("Minimum equals maximum, so this axis cannot move.");
    if (!registered && tag !== tag.toUpperCase()) {
      warnings.push(
        "Custom axis tags are supposed to be all-uppercase; a lowercase tag that is not in the registry may be ignored by some software.",
      );
    }

    axes.push({
      tag,
      index: i,
      nameID: axisNameID,
      name: names.get(axisNameID) || registered?.name || tag,
      minValue,
      defaultValue,
      maxValue,
      range: maxValue - minValue,
      flags,
      hidden: (flags & AXIS_FLAG_HIDDEN) !== 0,
      registered: Boolean(registered),
      registry: registered,
      unit: registered?.unit ?? "",
      cssProperty: registered?.css ?? "font-variation-settings only",
      summary:
        registered?.summary ??
        "A custom axis. Only font-variation-settings can drive it — there is no CSS property that maps to it.",
      warnings,
    });
  }

  const instancesStart = axesStart + axisCount * axisSize;
  const minimumInstanceSize = axisCount * 4 + 4;
  const instances = [];
  if (instanceCount > 0 && instanceSize >= minimumInstanceSize) {
    for (let i = 0; i < instanceCount; i += 1) {
      const record = instancesStart + i * instanceSize;
      if (record + instanceSize > view.byteLength) break;
      const subfamilyNameID = view.getUint16(record);
      const instanceFlags = view.getUint16(record + 2);
      const coordinates = {};
      for (let a = 0; a < axisCount; a += 1) {
        coordinates[axes[a].tag] = readFixed(view, record + 4 + a * 4);
      }
      const postScriptNameID = instanceSize >= minimumInstanceSize + 2 ? view.getUint16(record + 4 + axisCount * 4) : null;
      instances.push({
        index: i,
        nameID: subfamilyNameID,
        name: names.get(subfamilyNameID) || `Instance ${i + 1}`,
        postScriptName: postScriptNameID === null ? null : names.get(postScriptNameID) || null,
        flags: instanceFlags,
        coordinates,
      });
    }
  }

  return { axes, instances, axisCount, instanceCount, axisSize, instanceSize };
}

/* ------------------------------------------------------------------ *
 * Public entry point
 * ------------------------------------------------------------------ */

/**
 * Parse a font binary.
 *
 * @param {ArrayBuffer|Uint8Array} buffer the raw .ttf / .otf bytes.
 * @param {string} [fileName] used only to build the example @font-face src.
 * @returns {object} { error } or the parsed report.
 */
export function parseVariableFont(buffer, fileName = "font.ttf") {
  if (!buffer) return { error: "No font loaded yet. Choose a .ttf or .otf file." };

  let view;
  try {
    view =
      buffer instanceof DataView
        ? buffer
        : ArrayBuffer.isView(buffer)
          ? new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
          : new DataView(buffer);
  } catch {
    return { error: "That input could not be read as a byte buffer." };
  }
  if (view.byteLength === 0) return { error: "That file is empty." };

  const directory = readTableDirectory(view);
  if (directory.error) return { error: directory.error };

  const { tables } = directory;
  const names = readNameTable(view, tables.get("name"));

  const fvarTable = tables.get("fvar");
  if (!fvarTable) {
    return {
      error: `This font has no fvar table, so it is a static font, not a variable one. Tables present: ${Array.from(tables.keys()).sort().join(", ")}.`,
    };
  }

  const fvar = readFvar(view, fvarTable, names);
  if (fvar.error) return { error: fvar.error };

  const head = tables.get("head");
  const unitsPerEm = head && head.length >= 20 ? view.getUint16(head.offset + 18) : null;

  const os2 = tables.get("OS/2");
  const usWeightClass = os2 && os2.length >= 6 ? view.getUint16(os2.offset + 4) : null;
  const usWidthClass = os2 && os2.length >= 8 ? view.getUint16(os2.offset + 6) : null;

  const presentVariationTables = VARIATION_TABLES.filter(([tag]) => tables.has(tag)).map(([tag, note]) => ({
    tag,
    note,
    present: true,
  }));
  const missingVariationTables = VARIATION_TABLES.filter(([tag]) => !tables.has(tag)).map(([tag, note]) => ({
    tag,
    note,
    present: false,
  }));

  const nameEntries = Object.entries(NAME_IDS)
    .map(([id, label]) => ({ id: Number(id), label, value: names.get(Number(id)) || null }))
    .filter((entry) => entry.value !== null);

  const familyName =
    names.get(16) || names.get(1) || fileName.replace(/\.[a-z0-9]+$/i, "") || "Variable Font";

  const notes = [];
  if (tables.has("avar")) {
    notes.push(
      "This font has an avar table, so the axis scale is remapped internally: moving a slider halfway does not necessarily land halfway between the two masters.",
    );
  }
  if (!tables.has("gvar") && !tables.has("CFF2")) {
    notes.push(
      "Neither gvar nor CFF2 is present, so there are no outline deltas — the axes are declared but the glyphs may not actually change.",
    );
  }
  if (!tables.has("STAT")) {
    notes.push(
      "No STAT table. STAT is required by the OpenType spec for variable fonts and is what lets applications build a sensible style menu.",
    );
  }
  const hiddenAxes = fvar.axes.filter((axis) => axis.hidden);
  if (hiddenAxes.length > 0) {
    notes.push(
      `${hiddenAxes.map((a) => a.tag).join(", ")} ${hiddenAxes.length === 1 ? "is" : "are"} flagged hidden, which asks user interfaces not to expose ${hiddenAxes.length === 1 ? "it" : "them"} to designers.`,
    );
  }

  return {
    fileName,
    fileSize: view.byteLength,
    sfntVersion: directory.sfntVersion,
    outlineFormat: directory.outlineFormat,
    numTables: directory.numTables,
    tableTags: Array.from(tables.keys()).sort(),
    familyName,
    names: nameEntries,
    unitsPerEm,
    usWeightClass,
    usWidthClass,
    axes: fvar.axes,
    instances: fvar.instances,
    axisCount: fvar.axisCount,
    instanceCount: fvar.instances.length,
    declaredInstanceCount: fvar.instanceCount,
    variationTables: [...presentVariationTables, ...missingVariationTables],
    notes,
  };
}

/* ------------------------------------------------------------------ *
 * Derived values and CSS
 * ------------------------------------------------------------------ */

/** The coordinate set a font renders at with no overrides. */
export function defaultAxisValues(axes) {
  const values = {};
  (axes || []).forEach((axis) => {
    values[axis.tag] = axis.defaultValue;
  });
  return values;
}

/** Clamp a value into an axis's declared range. */
export function clampAxisValue(axis, value) {
  if (!axis) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return axis.defaultValue;
  if (value < axis.minValue) return axis.minValue;
  if (value > axis.maxValue) return axis.maxValue;
  return value;
}

/** `"wght" 700, "wdth" 87.5` in fvar order. */
export function buildVariationSettings(axes, values) {
  const list = (axes || [])
    .map((axis) => {
      const value = values && Object.prototype.hasOwnProperty.call(values, axis.tag) ? values[axis.tag] : axis.defaultValue;
      const safe = clampAxisValue(axis, typeof value === "number" ? value : Number(value));
      return `"${axis.tag}" ${formatAxisValue(safe)}`;
    })
    .join(", ");
  return list || "normal";
}

/**
 * The CSS an @font-face rule needs, derived only from what fvar declares.
 * Registered axes map onto real CSS properties; everything else can only be
 * driven through font-variation-settings, and the output says so.
 */
export function buildFontFaceCss({ familyName, fileName, axes, outlineFormat, values } = {}) {
  const list = axes || [];
  const family = familyName || "Variable Font";
  const file = fileName || "font.ttf";
  const isCff = String(outlineFormat || "").startsWith("PostScript");
  const format = isCff ? "opentype-variations" : "truetype-variations";

  const byTag = new Map(list.map((axis) => [axis.tag, axis]));
  const descriptors = [`  font-family: "${family}";`, `  src: url("${file}") format("${format}");`];

  const wght = byTag.get("wght");
  if (wght) descriptors.push(`  font-weight: ${formatAxisValue(wght.minValue)} ${formatAxisValue(wght.maxValue)};`);

  const wdth = byTag.get("wdth");
  if (wdth) descriptors.push(`  font-stretch: ${formatAxisValue(wdth.minValue)}% ${formatAxisValue(wdth.maxValue)}%;`);

  const slnt = byTag.get("slnt");
  if (slnt) {
    // CSS oblique angles run the opposite way to the slnt axis.
    const lo = formatAxisValue(-slnt.maxValue);
    const hi = formatAxisValue(-slnt.minValue);
    descriptors.push(`  font-style: oblique ${lo}deg ${hi}deg;`);
  } else if (byTag.get("ital")) {
    descriptors.push("  font-style: normal italic;");
  }

  descriptors.push("  font-display: swap;");

  const fontFace = [`@font-face {`, ...descriptors, `}`].join("\n");

  const usage = [
    `.sample {`,
    `  font-family: "${family}", sans-serif;`,
    `  font-variation-settings: ${buildVariationSettings(list, values || defaultAxisValues(list))};`,
    byTag.get("opsz") ? `  font-optical-sizing: auto;` : null,
    `}`,
  ]
    .filter(Boolean)
    .join("\n");

  const unmapped = list.filter((axis) => !REGISTERED_AXES[axis.tag]).map((axis) => axis.tag);

  return {
    fontFace,
    usage,
    css: `${fontFace}\n\n${usage}`,
    format,
    unmappedAxes: unmapped,
  };
}

/** Find the named instance, if any, that sits exactly on the current coordinates. */
export function matchNamedInstance(instances, values, axes) {
  const list = instances || [];
  const tags = (axes || []).map((axis) => axis.tag);
  return (
    list.find((instance) =>
      tags.every((tag) => {
        const a = instance.coordinates[tag];
        const b = values ? values[tag] : undefined;
        if (typeof a !== "number" || typeof b !== "number") return false;
        return Math.abs(a - b) < 1e-6;
      }),
    ) || null
  );
}

/**
 * A tidy per-axis table row: where the value sits inside its own range, as a
 * plain percentage of the declared span (not a quality score).
 */
export function describeAxisPosition(axis, value) {
  if (!axis) return null;
  const safe = clampAxisValue(axis, value);
  const span = axis.maxValue - axis.minValue;
  const percent = span === 0 ? 0 : ((safe - axis.minValue) / span) * 100;
  return {
    tag: axis.tag,
    value: safe,
    formatted: `${formatAxisValue(safe)}${axis.unit}`,
    percentOfRange: Number(percent.toFixed(1)),
    atDefault: Math.abs(safe - axis.defaultValue) < 1e-6,
    atMin: Math.abs(safe - axis.minValue) < 1e-6,
    atMax: Math.abs(safe - axis.maxValue) < 1e-6,
  };
}

export default parseVariableFont;
