/**
 * Hardware capability fingerprint analysis.
 *
 * Browsers expose a small set of machine properties with no permission prompt:
 * logical CPU count, an approximate memory figure, touch-point support and the
 * CSS pointer/hover media features. This module takes those readings as plain
 * arguments and works out what they say.
 *
 * The rules encoded here come from the specifications:
 *  - Device Memory API: the value is rounded to a power of two and clamped to
 *    a published range, so only a handful of values can ever be reported.
 *  - navigator.hardwareConcurrency: the number of logical processors, which
 *    browsers are allowed to cap.
 *  - navigator.maxTouchPoints: simultaneous touch contacts the hardware
 *    supports; 0 means no touchscreen is reported.
 *  - Media Queries Level 4: pointer/hover describe the primary input, and
 *    any-pointer/any-hover describe every input available.
 *
 * Pure functions. No DOM, no clock, no randomness.
 */

/* ------------------------------------------------------------------ */
/* Specification-defined value sets                                    */
/* ------------------------------------------------------------------ */

/**
 * The Device Memory API deliberately reports a coarse value: it is rounded to
 * the nearest power of two and clamped between an upper and lower bound so it
 * cannot be used as a precise identifier. These are the only values a
 * conforming browser returns.
 */
export const DEVICE_MEMORY_VALUES = [0.25, 0.5, 1, 2, 4, 8];
export const DEVICE_MEMORY_MAX = 8;
export const DEVICE_MEMORY_MIN = 0.25;

export function isSpecDeviceMemory(value) {
  return DEVICE_MEMORY_VALUES.some((allowed) => Math.abs(allowed - value) < 1e-9);
}

/** Logical-core counts that mainstream consumer machines report. */
export const COMMON_CORE_COUNTS = [2, 4, 6, 8, 10, 12, 16];

/** Core counts above this normally mean a workstation or a server. */
export const WORKSTATION_CORE_THRESHOLD = 24;

/**
 * maxTouchPoints values in the wild: 0 on a plain desktop, 1 for a pen-only
 * digitiser, 5 on most phones and tablets, 10 on many Windows touchscreens.
 */
export const COMMON_TOUCH_POINTS = [0, 1, 5, 10];

/** Media Queries Level 4 keyword sets. */
export const POINTER_VALUES = ["none", "coarse", "fine"];
export const HOVER_VALUES = ["none", "hover"];

/* ------------------------------------------------------------------ */
/* Device class inference                                              */
/* ------------------------------------------------------------------ */

export const DEVICE_CLASSES = {
  PHONE: {
    id: "phone",
    label: "Phone or tablet",
    detail: "Touch is the primary input and there is no hover, the standard mobile signature.",
  },
  TOUCH_LAPTOP: {
    id: "touch-laptop",
    label: "Laptop or desktop with a touchscreen",
    detail:
      "A precise primary pointer plus touch contacts — a hybrid machine, which is a smaller group than either pure category.",
  },
  DESKTOP: {
    id: "desktop",
    label: "Desktop or laptop",
    detail: "A precise pointer that can hover, and no touch contacts reported.",
  },
  UNKNOWN: {
    id: "unknown",
    label: "Not determined",
    detail: "Not enough of the input signals were exposed to classify the device.",
  },
};

/** Classify from input capability, which is far more reliable than a UA string. */
export function inferDeviceClass({ pointer, hover, maxTouchPoints }) {
  const touch = Number(maxTouchPoints);
  const hasTouch = Number.isFinite(touch) && touch > 0;
  if (pointer === "coarse" && hover === "none") return DEVICE_CLASSES.PHONE;
  if (pointer === "fine" && hasTouch) return DEVICE_CLASSES.TOUCH_LAPTOP;
  if (pointer === "fine" && !hasTouch) return DEVICE_CLASSES.DESKTOP;
  if (pointer === "coarse" && hasTouch) return DEVICE_CLASSES.PHONE;
  return DEVICE_CLASSES.UNKNOWN;
}

/* ------------------------------------------------------------------ */
/* Combination space                                                   */
/* ------------------------------------------------------------------ */

/**
 * How many distinct answers this set of readings can produce, and the bits
 * that implies. This is an upper bound: it assumes every combination is
 * equally likely, which is not true — an 8-core machine with 8 GB is far more
 * common than a 3-core one — so the information a real tracker gains is less.
 */
export function combinationSpace(optionCounts) {
  const counts = (optionCounts || []).filter((count) => Number.isFinite(count) && count > 0);
  if (counts.length === 0) return { combinations: 0, bits: 0 };
  const combinations = counts.reduce((product, count) => product * count, 1);
  return { combinations, bits: Math.log2(combinations) };
}

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* ------------------------------------------------------------------ */

export const EXPOSURE_BANDS = [
  {
    min: 3,
    label: "Stands out",
    tone: "danger",
    summary: "Several hardware readings are unusual, which makes this machine easy to re-recognise.",
  },
  {
    min: 1,
    label: "Somewhat distinctive",
    tone: "warning",
    summary: "Most readings are ordinary, but at least one is uncommon.",
  },
  {
    min: 0,
    label: "Blends in",
    tone: "success",
    summary: "Every exposed reading matches a large group of machines.",
  },
];

export function exposureBand(count) {
  return EXPOSURE_BANDS.find((band) => count >= band.min) || EXPOSURE_BANDS[2];
}

const NOT_EXPOSED = "not exposed";

/**
 * signals = { hardwareConcurrency, deviceMemory, maxTouchPoints,
 *             pointer, hover, anyPointer, anyHover, mobileHint }
 * Any value may be null or undefined: browsers that do not implement a
 * property are handled as "not exposed", which is the privacy-preserving case.
 */
export function analyseHardware(signals) {
  const s = signals || {};

  const cores = s.hardwareConcurrency == null ? null : Number(s.hardwareConcurrency);
  if (cores !== null && (!Number.isInteger(cores) || cores < 1 || cores > 1024)) {
    return { error: "Logical processor count must be a whole number between 1 and 1024." };
  }

  const memory = s.deviceMemory == null ? null : Number(s.deviceMemory);
  if (memory !== null && (!Number.isFinite(memory) || memory <= 0 || memory > 1024)) {
    return { error: "Device memory must be a positive number of gigabytes." };
  }

  const touch = s.maxTouchPoints == null ? null : Number(s.maxTouchPoints);
  if (touch !== null && (!Number.isInteger(touch) || touch < 0 || touch > 256)) {
    return { error: "Touch points must be a whole number between 0 and 256." };
  }

  const pointer = POINTER_VALUES.includes(s.pointer) ? s.pointer : null;
  const hover = HOVER_VALUES.includes(s.hover) ? s.hover : null;
  const anyPointer = POINTER_VALUES.includes(s.anyPointer) ? s.anyPointer : pointer;
  const anyHover = HOVER_VALUES.includes(s.anyHover) ? s.anyHover : hover;

  const deviceClass = inferDeviceClass({ pointer, hover, maxTouchPoints: touch });

  const coresCommon = cores === null || COMMON_CORE_COUNTS.includes(cores);
  const memorySpecValue = memory === null || isSpecDeviceMemory(memory);
  const memoryCommon = memory === null || (memorySpecValue && memory >= 2);
  const touchCommon = touch === null || COMMON_TOUCH_POINTS.includes(touch);

  const rows = [
    {
      id: "cores",
      label: "Logical processors",
      value: cores === null ? NOT_EXPOSED : String(cores),
      distinctive: cores !== null && !coresCommon,
      note:
        cores === null
          ? "navigator.hardwareConcurrency is not being reported here, which is the quieter option."
          : cores >= WORKSTATION_CORE_THRESHOLD
            ? `${cores} logical processors points at a workstation or server, a small and easily re-recognised group.`
            : coresCommon
              ? "A common consumer core count."
              : "An unusual core count, so it separates you from the mainstream buckets.",
    },
    {
      id: "memory",
      label: "Approximate device memory",
      value: memory === null ? NOT_EXPOSED : `${memory} GB`,
      distinctive: memory !== null && !memoryCommon,
      note:
        memory === null
          ? "The Device Memory API is not implemented in every browser; when it is missing, nothing is leaked."
          : !memorySpecValue
            ? `${memory} is not one of the values the specification allows (${DEVICE_MEMORY_VALUES.join(", ")}), so this reading has been altered by an extension or a privacy setting.`
            : memory >= DEVICE_MEMORY_MAX
              ? `Reported values are capped at ${DEVICE_MEMORY_MAX} GB, so anything larger looks identical from a page's point of view.`
              : "Rounded to a power of two by design, so it is a coarse bucket rather than a precise figure.",
    },
    {
      id: "touch",
      label: "Maximum touch points",
      value: touch === null ? NOT_EXPOSED : String(touch),
      distinctive: touch !== null && !touchCommon,
      note:
        touch === null
          ? "Touch capability is not being reported."
          : touch === 0
            ? "No touchscreen reported — the usual answer on a desktop."
            : `The screen accepts ${touch} simultaneous contacts; 5 is typical on phones and 10 on Windows touchscreens.`,
    },
    {
      id: "pointer",
      label: "Primary pointer",
      value: pointer || NOT_EXPOSED,
      distinctive: pointer === "none",
      note:
        pointer === "fine"
          ? "A precise pointer: mouse, trackpad or stylus."
          : pointer === "coarse"
            ? "An imprecise pointer, which in practice means a finger."
            : pointer === "none"
              ? "No pointing device at all — rare, and therefore distinctive."
              : "The pointer media feature was not evaluated.",
    },
    {
      id: "hover",
      label: "Hover capability",
      value: hover || NOT_EXPOSED,
      distinctive: false,
      note:
        hover === "hover"
          ? "The primary input can hover, which almost always means a mouse or trackpad."
          : hover === "none"
            ? "No hover, the normal answer for touch-only devices."
            : "The hover media feature was not evaluated.",
    },
    {
      id: "anyInput",
      label: "All inputs available",
      value:
        anyPointer || anyHover
          ? `${anyPointer || "unknown"} / ${anyHover || "unknown"}`
          : NOT_EXPOSED,
      distinctive: Boolean(pointer && anyPointer && pointer !== anyPointer),
      note:
        pointer && anyPointer && pointer !== anyPointer
          ? "The primary input and the secondary input differ — a tablet with a keyboard, or a touchscreen laptop. That combination is much less common than either pure device."
          : "any-pointer and any-hover match the primary input, so only one kind of input is present.",
    },
  ];

  const exposed = rows.filter((row) => row.value !== NOT_EXPOSED).length;
  const distinctive = rows.filter((row) => row.distinctive).length;

  const space = combinationSpace([
    cores === null ? 1 : COMMON_CORE_COUNTS.length + 1,
    memory === null ? 1 : DEVICE_MEMORY_VALUES.length,
    touch === null ? 1 : COMMON_TOUCH_POINTS.length,
    pointer === null ? 1 : POINTER_VALUES.length,
    hover === null ? 1 : HOVER_VALUES.length,
  ]);

  return {
    rows,
    deviceClass,
    cores,
    memory,
    touch,
    pointer,
    hover,
    anyPointer,
    anyHover,
    exposed,
    total: rows.length,
    distinctive,
    band: exposureBand(distinctive),
    combinations: space.combinations,
    bits: space.bits,
    memorySpecValue,
    workstation: cores !== null && cores >= WORKSTATION_CORE_THRESHOLD,
  };
}

/** Reference machines to compare against. */
export const SAMPLE_PROFILES = [
  {
    id: "office-laptop",
    label: "Office laptop",
    signals: {
      hardwareConcurrency: 8,
      deviceMemory: 8,
      maxTouchPoints: 0,
      pointer: "fine",
      hover: "hover",
      anyPointer: "fine",
      anyHover: "hover",
    },
  },
  {
    id: "android-phone",
    label: "Android phone",
    signals: {
      hardwareConcurrency: 8,
      deviceMemory: 4,
      maxTouchPoints: 5,
      pointer: "coarse",
      hover: "none",
      anyPointer: "coarse",
      anyHover: "none",
    },
  },
  {
    id: "workstation",
    label: "Developer workstation",
    signals: {
      hardwareConcurrency: 32,
      deviceMemory: 8,
      maxTouchPoints: 0,
      pointer: "fine",
      hover: "hover",
      anyPointer: "fine",
      anyHover: "hover",
    },
  },
  {
    id: "privacy-browser",
    label: "Privacy browser",
    signals: {
      hardwareConcurrency: 2,
      deviceMemory: null,
      maxTouchPoints: 0,
      pointer: "fine",
      hover: "hover",
      anyPointer: "fine",
      anyHover: "hover",
    },
  },
];

export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "HARDWARE CAPABILITY FINGERPRINT",
    `Device class: ${result.deviceClass.label}`,
    "",
  ];
  result.rows.forEach((row) => {
    lines.push(`${row.label}: ${row.value} — ${row.distinctive ? "distinctive" : "ordinary"}`);
  });
  lines.push(
    "",
    `Readings exposed: ${result.exposed} of ${result.total}`,
    `Distinctive readings: ${result.distinctive}`,
    `Upper bound on combinations: ${result.combinations} (${result.bits.toFixed(1)} bits)`,
    `Verdict: ${result.band.label}`,
  );
  return lines.join("\n");
}
