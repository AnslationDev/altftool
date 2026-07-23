// ============================================================================
// providers.mjs — free LLM providers behind one interface, with a pool that
// rotates + fails over on rate-limit/timeout. Local Ollama is the last resort
// so the pipeline never fully stalls. Add a key to .env → add to a pool.
//
//   chat(messages, {json}) -> string
// Each adapter reads its key from env and is skipped if the key is absent.
// ============================================================================

const timeout = (ms) => AbortSignal.timeout(ms);

async function post(url, body, headers, ms = 120000) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: timeout(ms) });
  if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
  return r.json();
}

// ---- adapters ----------------------------------------------------------------
export const adapters = {
  ollama: {
    id: "ollama", available: async () => { try { const r = await fetch("http://localhost:11434/api/tags", { signal: timeout(3000) }); return r.ok; } catch { return false; } },
    async chat(messages, { json } = {}) {
      const prompt = messages.map((m) => (m.role === "system" ? "[SYSTEM] " : "") + m.content).join("\n\n");
      const d = await post("http://localhost:11434/api/generate", { model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b", prompt, stream: false, ...(json ? { format: "json" } : {}), options: { temperature: 0.2, num_ctx: 8192 } }, {}, 180000);
      return d.response || "";
    },
  },
  gemini: {
    id: "gemini", available: async () => !!process.env.GEMINI_API_KEY,
    async chat(messages, { json } = {}) {
      const key = process.env.GEMINI_API_KEY, model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const contents = messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const sys = messages.find((m) => m.role === "system");
      const d = await post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { contents, ...(sys ? { systemInstruction: { parts: [{ text: sys.content }] } } : {}), generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: "application/json" } : {}) } }, {}, 45000);
      return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
    },
  },
  groq: {
    id: "groq", available: async () => !!process.env.GROQ_API_KEY,
    async chat(messages, { json } = {}) {
      const d = await post("https://api.groq.com/openai/v1/chat/completions", { model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", messages, temperature: 0.2, ...(json ? { response_format: { type: "json_object" } } : {}) }, { Authorization: "Bearer " + process.env.GROQ_API_KEY }, 45000);
      return d.choices?.[0]?.message?.content || "";
    },
  },
  openrouter: {
    id: "openrouter", available: async () => !!process.env.OPENROUTER_API_KEY,
    async chat(messages, { json } = {}) {
      const d = await post("https://openrouter.ai/api/v1/chat/completions", { model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat", messages, temperature: 0.2, ...(json ? { response_format: { type: "json_object" } } : {}) }, { Authorization: "Bearer " + process.env.OPENROUTER_API_KEY });
      return d.choices?.[0]?.message?.content || "";
    },
  },
};

// A pool for a role: ordered adapter ids, try each, fail over on 429/timeout.
export class ProviderPool {
  constructor(order = ["gemini", "groq", "openrouter", "ollama"]) {
    this.order = order.map((id) => adapters[id]).filter(Boolean);
  }
  async ready() {
    const live = [];
    for (const a of this.order) if (await a.available()) live.push(a);
    this.live = live.length ? live : [adapters.ollama];
    return this.live.map((a) => a.id);
  }
  async chat(messages, opts = {}) {
    if (!this.live) await this.ready();
    let lastErr;
    for (const a of this.live) {
      try { return { text: await a.chat(messages, opts), via: a.id }; }
      catch (e) { lastErr = e; /* rate-limited / timeout → next provider */ }
    }
    throw lastErr || new Error("no provider available");
  }
}
