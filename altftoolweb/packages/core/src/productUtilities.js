const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const frequencyScores = Object.freeze({
  "one-off": 4,
  yearly: 8,
  monthly: 14,
  weekly: 18,
  daily: 22,
});

const reachScores = Object.freeze({ niche: 8, focused: 12, broad: 18 });

export function evaluateIdea(input = {}) {
  const problem = clean(input.problem);
  const audience = clean(input.audience);
  const urgency = Math.min(5, Math.max(1, Number(input.urgency) || 1));
  const willingness = Math.min(5, Math.max(1, Number(input.willingness) || 1));
  const frequency = frequencyScores[input.frequency] ?? frequencyScores.monthly;
  const reach = reachScores[input.reach] ?? reachScores.focused;

  const components = {
    problem: Math.min(20, Math.round(problem.length / 6)),
    audience: Math.min(15, Math.round(audience.length / 4)),
    urgency: urgency * 5,
    frequency,
    willingness: willingness * 4,
    reach,
  };
  const raw = Object.values(components).reduce((sum, value) => sum + value, 0);
  const score = Math.min(100, Math.round((raw / 120) * 100));
  const band = score >= 75 ? "Strong signal" : score >= 55 ? "Promising" : score >= 35 ? "Needs evidence" : "Early hypothesis";

  const risks = [];
  if (problem.length < 50) risks.push("Problem statement needs more specific evidence and context.");
  if (audience.length < 20) risks.push("Audience definition is broad; identify a narrower first user group.");
  if (urgency <= 2) risks.push("Low urgency can make adoption and retention difficult.");
  if (willingness <= 2) risks.push("Willingness to pay is unproven; test value before building deeply.");
  if (frequency <= frequencyScores.monthly) risks.push("Infrequent use may require a different pricing or distribution model.");
  if (!risks.length) risks.push("Competitive differentiation and acquisition cost still need direct validation.");

  return {
    score,
    band,
    components,
    risks,
    experiments: [
      `Interview 5 ${audience || "target users"} about the last time they faced this problem.`,
      "Publish a focused landing page with one measurable call to action.",
      "Deliver the outcome manually for three users before automating it.",
      "Define a stop rule: the minimum response or conversion needed to continue.",
    ],
  };
}

function transcriptLines(transcript) {
  return String(transcript || "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => clean(line))
    .filter((line) => line.length >= 8);
}

export function analyzeTranscript(transcript) {
  const lines = transcriptLines(transcript);
  const includes = (pattern) => lines.filter((line) => pattern.test(line));
  const unique = (values) => [...new Set(values)].slice(0, 12);

  return {
    wordCount: clean(transcript).split(" ").filter(Boolean).length,
    summary: lines.slice(0, 4),
    decisions: unique(includes(/\b(decided|agreed|approved|confirmed|we will|we'll|final decision)\b/i)),
    actions: unique(includes(/\b(action|todo|to-do|will|need to|follow up|owner|due|by (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i)),
    questions: unique(lines.filter((line) => line.endsWith("?") || /\b(open question|need to clarify|unknown)\b/i.test(line))),
  };
}

export const FLOW_ACTIONS = Object.freeze([
  { id: "trim", label: "Trim whitespace" },
  { id: "uppercase", label: "Uppercase" },
  { id: "lowercase", label: "Lowercase" },
  { id: "sort-lines", label: "Sort lines" },
  { id: "unique-lines", label: "Remove duplicate lines" },
  { id: "json-format", label: "Format JSON" },
  { id: "extract-urls", label: "Extract URLs" },
  { id: "timestamp", label: "Add timestamp" },
]);

export function runTextWorkflow(input, actionIds = [], now = new Date()) {
  let value = String(input ?? "");
  const log = [];

  for (const actionId of actionIds) {
    const before = value;
    if (actionId === "trim") value = value.trim();
    else if (actionId === "uppercase") value = value.toUpperCase();
    else if (actionId === "lowercase") value = value.toLowerCase();
    else if (actionId === "sort-lines") value = value.split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join("\n");
    else if (actionId === "unique-lines") value = [...new Set(value.split(/\r?\n/))].join("\n");
    else if (actionId === "json-format") value = JSON.stringify(JSON.parse(value), null, 2);
    else if (actionId === "extract-urls") value = (value.match(/https?:\/\/[^\s<>'\"]+/g) || []).join("\n");
    else if (actionId === "timestamp") value = `${now.toISOString()}\n${value}`;
    else throw new Error(`Unknown workflow action: ${actionId}`);
    log.push({ actionId, changed: before !== value, outputLength: value.length });
  }

  return { output: value, log };
}

export function calculateNetworkMetrics({ latencies = [], downloadBytes = 0, downloadMs = 0, uploadBytes = 0, uploadMs = 0 } = {}) {
  const validLatencies = latencies.map(Number).filter((value) => Number.isFinite(value) && value >= 0);
  const latency = validLatencies.length
    ? validLatencies.reduce((sum, value) => sum + value, 0) / validLatencies.length
    : 0;
  const jitter = validLatencies.length > 1
    ? validLatencies.slice(1).reduce((sum, value, index) => sum + Math.abs(value - validLatencies[index]), 0) / (validLatencies.length - 1)
    : 0;
  const toMbps = (bytes, ms) => (bytes > 0 && ms > 0 ? (bytes * 8) / (ms / 1000) / 1_000_000 : 0);
  const downloadMbps = toMbps(downloadBytes, downloadMs);
  const uploadMbps = toMbps(uploadBytes, uploadMs);
  const quality = latency <= 50 && jitter <= 15 ? "Responsive" : latency <= 120 && jitter <= 35 ? "Usable" : "Unstable";

  return {
    latencyMs: Number(latency.toFixed(1)),
    jitterMs: Number(jitter.toFixed(1)),
    downloadMbps: Number(downloadMbps.toFixed(2)),
    uploadMbps: Number(uploadMbps.toFixed(2)),
    quality,
  };
}

export function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = String(value || "").toUpperCase().replace(/[\s=-]/g, "");
  if (!normalized || [...normalized].some((char) => !alphabet.includes(char))) {
    throw new Error("Enter a valid Base32 secret.");
  }
  let bits = "";
  for (const char of normalized) bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  return new Uint8Array(bytes);
}

export async function generateTotp(secret, timestamp = Date.now(), options = {}) {
  const digits = options.digits ?? 6;
  const period = options.period ?? 30;
  const counter = Math.floor(timestamp / 1000 / period);
  const counterBytes = new Uint8Array(8);
  let remaining = BigInt(counter);
  for (let index = 7; index >= 0; index -= 1) {
    counterBytes[index] = Number(remaining & 255n);
    remaining >>= 8n;
  }
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    decodeBase32(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(await globalThis.crypto.subtle.sign("HMAC", key, counterBytes));
  const offset = signature[signature.length - 1] & 15;
  const binary = ((signature[offset] & 127) << 24)
    | ((signature[offset + 1] & 255) << 16)
    | ((signature[offset + 2] & 255) << 8)
    | (signature[offset + 3] & 255);
  return String(binary % (10 ** digits)).padStart(digits, "0");
}
