// LLM-backed generator using a local Ollama server. Model-agnostic: the model
// name is configurable; nothing else in the pipeline knows an LLM is involved.
import { ToolGenerator, SPEC_CONTRACT } from "./ToolGenerator.mjs";

export class OllamaToolGenerator extends ToolGenerator {
  constructor({ model = "qwen2.5-coder:7b", host = "http://localhost:11434", temperature = 0.2, numCtx = 8192, timeoutMs = 180000, retries = 2 } = {}) {
    super();
    this.model = model;
    this.host = host.replace(/\/$/, "");
    this.temperature = temperature;
    this.numCtx = numCtx;
    this.timeoutMs = timeoutMs;
    this.retries = retries;
  }

  get name() {
    return `ollama:${this.model}`;
  }

  async available() {
    try {
      const res = await fetch(this.host + "/api/tags", { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return false;
      const data = await res.json();
      return (data.models || []).some((m) => m.name === this.model || m.model === this.model);
    } catch {
      return false;
    }
  }

  async _call(prompt, attempt = 0) {
    try {
      const res = await fetch(this.host + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: "json",
          options: { temperature: this.temperature, num_ctx: this.numCtx, num_predict: 1024 },
        }),
        // Grow the timeout on each retry — timeouts are usually transient load.
        signal: AbortSignal.timeout(this.timeoutMs + attempt * 90000),
      });
      if (!res.ok) throw new Error("ollama HTTP " + res.status);
      const data = await res.json();
      return data.response || "";
    } catch (e) {
      const transient = e.name === "TimeoutError" || /aborted|timeout|ECONNRESET|fetch failed/i.test(e.message || "");
      if (transient && attempt < this.retries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        return this._call(prompt, attempt + 1);
      }
      throw e;
    }
  }

  _parse(text) {
    // format:json usually yields clean JSON, but guard against stray fences.
    let s = String(text).trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) s = fence[1].trim();
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start >= 0 && end > start) s = s.slice(start, end + 1);
    return JSON.parse(s);
  }

  _prompt(entry) {
    const cats = (Array.isArray(entry.category) ? entry.category : [entry.category]).filter(Boolean).join(", ");
    return `You are an expert front-end engineer generating a specification for a single, production-quality online micro-tool.

Tool name: "${entry.name}"
Category: ${cats || "Utility"}

Design a genuinely useful, complete tool. Prefer 2-4 meaningful input fields, real formulas/logic, sensible presets, and a rich result (a headline result plus supporting rows where relevant). If the tool naturally has multiple sub-functions, use "modes".

${SPEC_CONTRACT}`;
  }

  _enhancePrompt(entry, currentSpec) {
    const cats = (Array.isArray(entry.category) ? entry.category : [entry.category]).filter(Boolean).join(", ");
    return `You are upgrading an existing online tool to a richer, end-to-end product.

Tool name: "${entry.name}" (category: ${cats})
Current spec (JSON, compute shown as source):
${JSON.stringify({ ...currentSpec, compute: String(currentSpec.compute).slice(0, 1200) }, null, 2)}

Enhance it. PRIORITISE FUNCTIONALITY FIRST, then presentation:
1. Add or deepen computational features (extra useful outputs/rows, an additional mode, more inputs, presets, edge-case handling).
2. Keep everything that already works; do not remove correct behavior.
3. Then improve clarity (better labels, hints, a note).
Return the FULL upgraded spec (not a diff).

${SPEC_CONTRACT}`;
  }

  async generate(entry) {
    const raw = this._parse(await this._call(this._prompt(entry)));
    return raw;
  }

  async enhance(entry, currentSpec) {
    const raw = this._parse(await this._call(this._enhancePrompt(entry, currentSpec)));
    return raw;
  }

  // Ask the model to repair a compute function that failed validation.
  async repair(entry, badSpec, error) {
    const prompt = `The "compute" function below failed validation with this error:
${error}

compute:
${badSpec.compute}

Return ONLY a corrected JSON object with the SAME shape as before (title, description, icon, fields, compute, ...). Fix the compute so it is valid pure JavaScript, guards against NaN/divide-by-zero, and returns { result: string, rows?: [[label,value]] }. Tool: "${entry.name}".

${SPEC_CONTRACT}`;
    return this._parse(await this._call(prompt));
  }
}
