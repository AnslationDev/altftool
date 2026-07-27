/**
 * Tokens Per Second Benchmark Sheet — pure logic.
 *
 * Converts raw timings from a local LLM run into decode throughput, prefill
 * throughput, time to first token and, where a memory bandwidth figure is
 * given, the memory-bandwidth ceiling and how close the run gets to it.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/**
 * Effective bits per weight for the common llama.cpp quantisation formats, as
 * published in the k-quants documentation. These are averages over the whole
 * tensor set, which is why they are not whole numbers.
 */
export const QUANT_FORMATS = [
  { id: "f16", label: "F16 (unquantised half precision)", bitsPerWeight: 16 },
  { id: "q8_0", label: "Q8_0", bitsPerWeight: 8.5 },
  { id: "q6_k", label: "Q6_K", bitsPerWeight: 6.56 },
  { id: "q5_k_m", label: "Q5_K_M", bitsPerWeight: 5.69 },
  { id: "q5_0", label: "Q5_0", bitsPerWeight: 5.5 },
  { id: "q4_k_m", label: "Q4_K_M", bitsPerWeight: 4.83 },
  { id: "q4_0", label: "Q4_0", bitsPerWeight: 4.5 },
  { id: "q3_k_m", label: "Q3_K_M", bitsPerWeight: 3.89 },
  { id: "q2_k", label: "Q2_K", bitsPerWeight: 2.63 },
];

/** Decimal gigabytes, to stay consistent with GB/s memory bandwidth figures. */
export const BYTES_PER_GB = 1e9;
export const BITS_PER_BYTE = 8;

/**
 * Weights are not the only thing in memory. KV cache, activations and the
 * runtime add roughly this much on top for a typical short-context session.
 * It is an allowance, not a measurement — real KV cache scales with context
 * length, layer count and head configuration.
 */
export const RUNTIME_OVERHEAD_SHARE = 0.2;

export const MIN_PARAMS_B = 0.05;
export const MAX_PARAMS_B = 2000;
export const MAX_TOKENS = 10000000;
export const MAX_SECONDS = 86400;
export const MAX_BANDWIDTH_GBPS = 100000;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Weight-only size in decimal GB for a model of N billion parameters. */
export function modelSizeGB(paramsB, quantId) {
  const quant = QUANT_FORMATS.find((item) => item.id === quantId);
  if (!quant) return NaN;
  const params = Number(paramsB);
  if (!isFiniteNumber(params) || params <= 0) return NaN;
  return (params * 1e9 * quant.bitsPerWeight) / BITS_PER_BYTE / BYTES_PER_GB;
}

/**
 * Autoregressive decoding reads every weight once per token, so the fastest a
 * single stream can decode is bandwidth divided by the resident weight size.
 * This is a ceiling, never an achievable number.
 */
export function rooflineTokensPerSecond(bandwidthGBps, sizeGB) {
  if (!isFiniteNumber(bandwidthGBps) || bandwidthGBps <= 0) return null;
  if (!isFiniteNumber(sizeGB) || sizeGB <= 0) return null;
  return bandwidthGBps / sizeGB;
}

/** Metrics for one benchmark run. Returns { error } for unusable input. */
export function computeRun(input) {
  const {
    label = "",
    hardware = "",
    paramsB,
    quant = "q4_k_m",
    promptTokens,
    generatedTokens,
    prefillSeconds,
    decodeSeconds,
    bandwidthGBps = "",
  } = input || {};

  const quantEntry = QUANT_FORMATS.find((item) => item.id === quant);
  if (!quantEntry) return { error: "Choose a quantisation format." };

  const params = Number(paramsB);
  if (!isFiniteNumber(params)) return { error: "Parameter count must be a number, in billions." };
  if (params < MIN_PARAMS_B || params > MAX_PARAMS_B) {
    return { error: `Parameter count should be between ${MIN_PARAMS_B} and ${MAX_PARAMS_B} billion.` };
  }

  const prompt = Number(promptTokens);
  const generated = Number(generatedTokens);
  const prefill = Number(prefillSeconds);
  const decode = Number(decodeSeconds);

  if ([prompt, generated, prefill, decode].some((value) => !isFiniteNumber(value))) {
    return { error: "Token counts and timings must all be numbers." };
  }
  if (generated <= 0) return { error: "Generated tokens must be greater than zero." };
  if (decode <= 0) return { error: "Generation time must be greater than zero seconds." };
  if (prompt < 0 || prefill < 0) return { error: "Prompt tokens and prefill time cannot be negative." };
  if (prompt > MAX_TOKENS || generated > MAX_TOKENS) return { error: "Token counts are out of range." };
  if (prefill > MAX_SECONDS || decode > MAX_SECONDS) return { error: "Timings are out of range." };

  let bandwidth = null;
  if (String(bandwidthGBps).trim() !== "") {
    const parsed = Number(bandwidthGBps);
    if (!isFiniteNumber(parsed)) return { error: "Memory bandwidth must be a number in GB/s, or left blank." };
    if (parsed <= 0 || parsed > MAX_BANDWIDTH_GBPS) {
      return { error: `Memory bandwidth should be between 0 and ${MAX_BANDWIDTH_GBPS} GB/s, or left blank.` };
    }
    bandwidth = parsed;
  }

  const weightsGB = modelSizeGB(params, quant);
  const residentGB = weightsGB * (1 + RUNTIME_OVERHEAD_SHARE);
  const totalSeconds = prefill + decode;
  const decodeTps = generated / decode;
  const prefillTps = prompt > 0 && prefill > 0 ? prompt / prefill : null;
  const totalTps = totalSeconds > 0 ? (prompt + generated) / totalSeconds : null;
  const roofline = rooflineTokensPerSecond(bandwidth, weightsGB);

  return {
    label: label.trim() || `${params}B ${quantEntry.label}`,
    hardware: hardware.trim(),
    quantLabel: quantEntry.label,
    bitsPerWeight: quantEntry.bitsPerWeight,
    paramsB: params,
    weightsGB,
    residentGB,
    promptTokens: prompt,
    generatedTokens: generated,
    prefillSeconds: prefill,
    decodeSeconds: decode,
    totalSeconds,
    ttftMs: prefill * 1000,
    decodeTps,
    prefillTps,
    totalTps,
    bandwidthGBps: bandwidth,
    rooflineTps: roofline,
    efficiencyPct: roofline ? (decodeTps / roofline) * 100 : null,
  };
}

export function median(values) {
  const list = values.filter((value) => isFiniteNumber(value)).slice().sort((a, b) => a - b);
  if (list.length === 0) return null;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 === 1 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
}

/** Aggregate a set of computed runs. Returns null for an empty set. */
export function summariseRuns(runs) {
  const list = (Array.isArray(runs) ? runs : []).filter((run) => run && !run.error);
  if (list.length === 0) return null;
  const speeds = list.map((run) => run.decodeTps);
  const fastest = list.reduce((best, run) => (run.decodeTps > best.decodeTps ? run : best), list[0]);
  const slowest = list.reduce((worst, run) => (run.decodeTps < worst.decodeTps ? run : worst), list[0]);
  return {
    count: list.length,
    fastest,
    slowest,
    medianDecodeTps: median(speeds),
    meanDecodeTps: speeds.reduce((sum, value) => sum + value, 0) / speeds.length,
    spread: slowest.decodeTps > 0 ? fastest.decodeTps / slowest.decodeTps : null,
  };
}

const fixed = (value, digits) => (isFiniteNumber(value) ? value.toFixed(digits) : "—");

/** Markdown table of every run, ready to paste into a README or an issue. */
export function buildSheetMarkdown(runs) {
  const list = (Array.isArray(runs) ? runs : []).filter((run) => run && !run.error);
  if (list.length === 0) return "";
  const header = [
    "| Model | Hardware | Quant | Size GB | Prompt | Gen | TTFT s | Decode tok/s | Prefill tok/s | Roofline tok/s | % of roof |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  const body = list.map((run) =>
    [
      run.label,
      run.hardware || "—",
      run.quantLabel,
      fixed(run.weightsGB, 2),
      run.promptTokens,
      run.generatedTokens,
      fixed(run.prefillSeconds, 2),
      fixed(run.decodeTps, 1),
      run.prefillTps === null ? "—" : fixed(run.prefillTps, 0),
      run.rooflineTps === null ? "—" : fixed(run.rooflineTps, 1),
      run.efficiencyPct === null ? "—" : `${fixed(run.efficiencyPct, 0)}%`,
    ].join(" | ")
  );
  return [...header, ...body.map((row) => `| ${row} |`)].join("\n");
}
