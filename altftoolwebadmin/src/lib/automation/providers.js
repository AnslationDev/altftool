// ALTF Engine — Content Automation: AI provider abstraction (server-only).
//
// One `generateJson()` entrypoint; the provider is chosen per lane from
// Admin Settings (settings/automation → blog.provider / seo.provider).
// OpenAI is the default. Gemini is fully implemented (the project already
// holds GEMINI_API_KEY for SEO recommendations). Claude and DeepSeek are
// registered with their endpoints/env names and fail with a clear message
// until a key is configured.
//
// Keys live ONLY in server env vars — never in Firestore, never client-side.

import { requireServerEnv } from "@altftool/core/env";
import { SERVER_ENV } from "@altftool/core/services";

const DEFAULT_TIMEOUT_MS = 120_000;

// Rough blended $/1M tokens for cost ESTIMATES only (run-log display).
const PRICE_PER_MTOKEN = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "gemini-2.5-pro": { input: 1.25, output: 10 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "deepseek-chat": { input: 0.27, output: 1.1 },
  _default: { input: 2.5, output: 10 },
};

export function estimateCostUsd(model, usage = {}) {
  const price = PRICE_PER_MTOKEN[model] || PRICE_PER_MTOKEN._default;
  const input = Number(usage.prompt_tokens || 0);
  const output = Number(usage.completion_tokens || 0);
  return Number(((input * price.input + output * price.output) / 1_000_000).toFixed(4));
}

/** Tolerant strict-JSON extraction (code fences / stray prose). */
function parseJsonLoose(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function transientError(message, status) {
  const error = new Error(message);
  error.status = status;
  error.transient = status === 429 || status >= 500;
  return error;
}

/* ── OpenAI (default) ── */
async function callOpenAi({ model, temperature, system, user, jsonSchema, maxTokens, timeoutMs }) {
  const apiKey = requireServerEnv(SERVER_ENV.openai); // "OPENAI_API_KEY"
  const res = await fetchWithTimeout(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: jsonSchema
          ? { type: "json_schema", json_schema: jsonSchema }
          : { type: "json_object" },
      }),
    },
    timeoutMs,
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw transientError(body?.error?.message || `OpenAI request failed (${res.status})`, res.status);

  const data = parseJsonLoose(body?.choices?.[0]?.message?.content || "");
  if (!data) throw transientError("OpenAI returned unparseable JSON", 502);
  return { data, usage: body?.usage || {}, model: body?.model || model };
}

/* ── Gemini ── */
async function callGemini({ model, temperature, system, user, jsonSchema, maxTokens, timeoutMs }) {
  const apiKey = requireServerEnv("GEMINI_API_KEY");
  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
          // Gemini's responseSchema dialect differs from OpenAI json_schema;
          // strict JSON mime + our normalizers keep the contract equivalent.
        },
      }),
    },
    timeoutMs,
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw transientError(body?.error?.message || `Gemini request failed (${res.status})`, res.status);

  const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  const data = parseJsonLoose(text);
  if (!data) throw transientError("Gemini returned unparseable JSON", 502);

  const meta = body?.usageMetadata || {};
  return {
    data,
    usage: {
      prompt_tokens: meta.promptTokenCount || 0,
      completion_tokens: meta.candidatesTokenCount || 0,
      total_tokens: meta.totalTokenCount || 0,
    },
    model,
  };
}

/* ── Registered but not yet enabled (clear failure, no silent fallback) ── */
function notConfigured(name, envVar) {
  return async () => {
    throw new Error(`${name} provider is registered but not enabled. Set ${envVar} and implement/verify the adapter before use.`);
  };
}

export const PROVIDERS = {
  openai: { call: callOpenAi, envVar: "OPENAI_API_KEY", defaultModel: "gpt-4o" },
  gemini: { call: callGemini, envVar: "GEMINI_API_KEY", defaultModel: "gemini-2.5-flash" },
  claude: { call: notConfigured("Claude", "ANTHROPIC_API_KEY"), envVar: "ANTHROPIC_API_KEY", defaultModel: "claude-sonnet-5" },
  deepseek: { call: notConfigured("DeepSeek", "DEEPSEEK_API_KEY"), envVar: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat" },
};

export const PROVIDER_KEYS = Object.keys(PROVIDERS);

/**
 * Generate a strict-JSON completion through the configured provider.
 * Retries ONCE on transient failures (429/5xx/unparseable) — bounded, so a
 * single job can never spiral into repeated billed calls.
 */
export async function generateJson({
  provider = "openai",
  model,
  temperature = 0.7,
  system,
  user,
  jsonSchema = null,
  maxTokens = 4096,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const adapter = PROVIDERS[provider] || PROVIDERS.openai;
  const resolvedModel = model || adapter.defaultModel;

  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await adapter.call({
        model: resolvedModel,
        temperature,
        system,
        user,
        jsonSchema,
        maxTokens,
        timeoutMs,
      });
      return { ...result, provider, costUsd: estimateCostUsd(resolvedModel, result.usage) };
    } catch (error) {
      lastError = error;
      if (!error?.transient) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
  throw lastError;
}
