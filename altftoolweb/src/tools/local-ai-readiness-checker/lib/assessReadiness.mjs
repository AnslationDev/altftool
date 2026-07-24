const LIMITS = {
  ramGb: 4096,
  vramGb: 1024,
  freeDiskGb: 100_000,
  logicalCores: 1024,
};

export const WORKLOAD_PROFILES = [
  {
    id: "cpu-experiment",
    name: "CPU-only experimentation",
    description: "Short, occasional local text tasks with patience for slower responses.",
    requirements: { ramGb: 8, vramGb: 0, freeDiskGb: 10, logicalCores: 4 },
    needsAcceleration: false,
  },
  {
    id: "routine-text",
    name: "Routine local text work",
    description: "Regular local chat, drafting, or code-assistance experiments.",
    requirements: { ramGb: 16, vramGb: 0, freeDiskGb: 20, logicalCores: 6 },
    needsAcceleration: false,
  },
  {
    id: "accelerated-text",
    name: "GPU-accelerated text work",
    description: "Interactive local text workloads intended to use hardware acceleration.",
    requirements: { ramGb: 16, vramGb: 6, freeDiskGb: 30, logicalCores: 6 },
    needsAcceleration: true,
  },
  {
    id: "local-media",
    name: "Local media generation",
    description: "Heavier image, audio, or mixed-media experiments on the local device.",
    requirements: { ramGb: 32, vramGb: 8, freeDiskGb: 50, logicalCores: 8 },
    needsAcceleration: true,
  },
];

const FIELD_LABELS = {
  ramGb: "system memory",
  vramGb: "dedicated or shared accelerator memory",
  freeDiskGb: "free disk space",
  logicalCores: "logical CPU cores",
};

function parseBoundedNumber(value, field) {
  if (value === "" || value === null || value === undefined) {
    return { ok: false, error: `${FIELD_LABELS[field]} is required.` };
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > LIMITS[field]) {
    return {
      ok: false,
      error: `${FIELD_LABELS[field]} must be between 0 and ${LIMITS[field]}.`,
    };
  }
  return { ok: true, value: number };
}

export function normalizeHardware(input = {}) {
  const values = {};
  const errors = [];
  for (const field of Object.keys(LIMITS)) {
    const parsed = parseBoundedNumber(input[field], field);
    if (!parsed.ok) errors.push(parsed.error);
    else values[field] = parsed.value;
  }

  const acceleration = String(input.acceleration || "none").trim().toLowerCase();
  const allowedAcceleration = new Set([
    "none",
    "cuda",
    "rocm",
    "metal",
    "directml",
    "other",
    "unknown",
  ]);
  if (!allowedAcceleration.has(acceleration)) {
    errors.push("Choose a supported acceleration option.");
  }

  return {
    ok: errors.length === 0,
    errors,
    hardware: errors.length
      ? null
      : {
          ...values,
          acceleration,
        },
  };
}

function compareProfile(hardware, profile) {
  const gaps = [];
  const margins = [];

  for (const field of Object.keys(profile.requirements)) {
    const available = hardware[field];
    const required = profile.requirements[field];
    if (available < required) {
      gaps.push({
        field,
        label: FIELD_LABELS[field],
        required,
        available,
        shortfall: required - available,
        unit: field === "logicalCores" ? "cores" : "GB",
      });
    } else {
      margins.push({
        field,
        label: FIELD_LABELS[field],
        required,
        available,
        headroom: available - required,
        unit: field === "logicalCores" ? "cores" : "GB",
      });
    }
  }

  const accelerationGap =
    profile.needsAcceleration &&
    (hardware.acceleration === "none" || hardware.acceleration === "unknown");
  if (accelerationGap) {
    gaps.push({
      field: "acceleration",
      label: "known compatible hardware acceleration",
      required: "required by this illustrative profile",
      available:
        hardware.acceleration === "unknown" ? "not confirmed" : "not selected",
      shortfall: null,
      unit: "",
    });
  }

  let status = "meets-thresholds";
  if (gaps.length) {
    const numericGaps = gaps.filter((gap) => typeof gap.shortfall === "number");
    const close =
      !accelerationGap &&
      gaps.length === 1 &&
      numericGaps.length === 1 &&
      numericGaps[0].available >= numericGaps[0].required * 0.75;
    status = close ? "close-to-thresholds" : "below-thresholds";
  }

  return {
    id: profile.id,
    name: profile.name,
    description: profile.description,
    requirements: { ...profile.requirements },
    needsAcceleration: profile.needsAcceleration,
    status,
    gaps,
    margins,
  };
}

export function assessReadiness(input = {}, profileIds = []) {
  const normalized = normalizeHardware(input);
  if (!normalized.ok) {
    return { ok: false, errors: normalized.errors };
  }

  const requested = new Set(
    Array.isArray(profileIds) ? profileIds.map(String) : [],
  );
  const selectedProfiles = requested.size
    ? WORKLOAD_PROFILES.filter((profile) => requested.has(profile.id))
    : WORKLOAD_PROFILES;

  if (!selectedProfiles.length) {
    return { ok: false, errors: ["Select at least one known workload profile."] };
  }

  const assessments = selectedProfiles.map((profile) =>
    compareProfile(normalized.hardware, profile),
  );

  return {
    ok: true,
    hardware: normalized.hardware,
    assessments,
    counts: {
      assessed: assessments.length,
      meetsThresholds: assessments.filter(
        (item) => item.status === "meets-thresholds",
      ).length,
      closeToThresholds: assessments.filter(
        (item) => item.status === "close-to-thresholds",
      ).length,
      belowThresholds: assessments.filter(
        (item) => item.status === "below-thresholds",
      ).length,
      totalGaps: assessments.reduce((sum, item) => sum + item.gaps.length, 0),
    },
  };
}

export function buildReadinessReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.local-ai-readiness-summary.v1",
    createdAt: new Date().toISOString(),
    scope: {
      localOnly: true,
      manuallyEnteredSpecifications: true,
      deviceWasScanned: false,
      modelCompatibilityWasTested: false,
    },
    counts: { ...result.counts },
    profiles: result.assessments.map((item) => ({
      id: item.id,
      status: item.status,
      gapCount: item.gaps.length,
    })),
  };
}
