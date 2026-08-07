export const MODEL_CATALOG = [
  {
    id: "tinyllama-1.1b",
    name: "TinyLlama 1.1B",
    category: "Ultra-Light",
    parameters: "1.1B",
    minRamGb: 4,
    minVramGb: 0,
    minDiskGb: 3,
    description: "Compact text model suitable for low-power CPUs and mobile environments.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "phi-3-mini",
    name: "Phi-3 Mini 3.8B",
    category: "Lightweight",
    parameters: "3.8B",
    minRamGb: 6,
    minVramGb: 0,
    minDiskGb: 5,
    description: "Microsoft's high-efficiency reasoning model with strong math & logic.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "gemma-2b",
    name: "Gemma 2B / 4B",
    category: "Lightweight",
    parameters: "2B - 4B",
    minRamGb: 8,
    minVramGb: 0,
    minDiskGb: 6,
    description: "Google lightweight open model family optimized for local text tasks.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2 3B",
    category: "Desktop Standard",
    parameters: "3B",
    minRamGb: 8,
    minVramGb: 2,
    minDiskGb: 6,
    description: "Meta lightweight model for rapid local instruction-following & chat.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "llama-3.2-8b",
    name: "Llama 3.1 / 3.2 8B",
    category: "Desktop Standard",
    parameters: "8B",
    minRamGb: 16,
    minVramGb: 6,
    minDiskGb: 10,
    description: "State-of-the-art general purpose local workhorse model.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "qwen-2.5-7b",
    name: "Qwen 2.5 7B",
    category: "Coding & Math",
    parameters: "7B",
    minRamGb: 16,
    minVramGb: 6,
    minDiskGb: 10,
    description: "Alibaba's top-tier multilingual and code assistant model.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B Instruct",
    category: "Desktop Standard",
    parameters: "7B",
    minRamGb: 16,
    minVramGb: 6,
    minDiskGb: 10,
    description: "Fast, highly capable instruct model with strong context processing.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "deepseek-r1-8b",
    name: "DeepSeek R1 Distill 8B",
    category: "Reasoning AI",
    parameters: "8B",
    minRamGb: 16,
    minVramGb: 6,
    minDiskGb: 12,
    description: "Reasoning model with chain-of-thought problem solving.",
    recommendedQuant: "Q4_K_M",
  },
  {
    id: "deepseek-r1-14b",
    name: "DeepSeek R1 Distill 14B",
    category: "Advanced Reasoning",
    parameters: "14B",
    minRamGb: 32,
    minVramGb: 12,
    minDiskGb: 20,
    description: "Heavy reasoning model requiring 32GB RAM or dedicated 12GB+ GPU VRAM.",
    recommendedQuant: "Q4_K_M",
  },
];

export const FRAMEWORK_CATALOG = [
  {
    id: "ollama",
    name: "Ollama",
    tagline: "Get up and running with Llama 3, Mistral, and DeepSeek locally.",
    type: "CLI & Background Service",
    url: "https://ollama.com",
    supportsAccelerations: ["cuda", "metal", "rocm", "directml", "none"],
    minRamGb: 8,
  },
  {
    id: "lm-studio",
    name: "LM Studio",
    tagline: "Run local LLMs with a slick desktop GUI & OpenAI-compatible local server.",
    type: "Desktop GUI Application",
    url: "https://lmstudio.ai",
    supportsAccelerations: ["cuda", "metal", "rocm", "none"],
    minRamGb: 8,
  },
  {
    id: "webllm",
    name: "WebLLM (WebGPU)",
    tagline: "High-performance in-browser LLM execution powered by WebGPU.",
    type: "100% In-Browser Engine",
    url: "https://webllm.mlc.ai",
    supportsAccelerations: ["metal", "cuda", "rocm", "directml", "other"],
    minRamGb: 8,
  },
  {
    id: "llama-cpp",
    name: "llama.cpp",
    tagline: "C/C++ LLM inference engine with minimal memory footprint.",
    type: "Core Engine / Library",
    url: "https://github.com/ggerganov/llama.cpp",
    supportsAccelerations: ["cuda", "metal", "rocm", "directml", "none"],
    minRamGb: 4,
  },
  {
    id: "jan-ai",
    name: "Jan.ai",
    tagline: "Open-source ChatGPT alternative that runs 100% offline on your computer.",
    type: "Desktop Application",
    url: "https://jan.ai",
    supportsAccelerations: ["cuda", "metal", "none"],
    minRamGb: 8,
  },
  {
    id: "gpt4all",
    name: "GPT4All",
    tagline: "Ecosystem of open-source chatbots that privacy-first run locally.",
    type: "Desktop Application",
    url: "https://gpt4all.io",
    supportsAccelerations: ["cuda", "metal", "none"],
    minRamGb: 8,
  },
];

export function evaluateModelCompatibility(hardware, model) {
  if (!hardware) return "Unknown";
  const {
    ramGb: rawRamGb = 0,
    vramGb: rawVramGb = 0,
    freeDiskGb: rawFreeDiskGb = 0,
    acceleration = "none",
  } = hardware;
  // Defense-in-depth: coerce to Number in case an un-normalized (string-typed)
  // hardware object reaches this function, so `+` below can't silently become
  // string concatenation.
  const ramGb = Number(rawRamGb) || 0;
  const vramGb = Number(rawVramGb) || 0;
  const freeDiskGb = Number(rawFreeDiskGb) || 0;
  const effectiveMem = Math.max(ramGb, vramGb + (ramGb > 16 ? ramGb * 0.5 : 0));

  if (ramGb < model.minRamGb * 0.75 || freeDiskGb < model.minDiskGb) {
    return "Not Recommended";
  }
  if (ramGb >= model.minRamGb && (model.minVramGb === 0 || vramGb >= model.minVramGb || acceleration === "metal" || acceleration === "cuda")) {
    return "Recommended";
  }
  if (effectiveMem >= model.minRamGb) {
    return "Runs Well";
  }
  return "Heavy / Marginal";
}

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
    "webgpu",
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

export function buildReadinessReport(result, { manuallyEntered = true } = {}) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.local-ai-readiness-summary.v1",
    createdAt: new Date().toISOString(),
    scope: {
      localOnly: true,
      manuallyEnteredSpecifications: Boolean(manuallyEntered),
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
