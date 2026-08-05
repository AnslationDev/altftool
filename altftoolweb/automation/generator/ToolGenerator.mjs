// The model-agnostic contract every generator implements. The pipeline only
// ever talks to this interface, so swapping Ollama for another LLM/API (or the
// deterministic template engine) requires no change to the pipeline.
export class ToolGenerator {
  get name() {
    return "base";
  }

  /** Whether this generator can run right now (server reachable, etc.). */
  async available() {
    return true;
  }

  /**
   * Produce a raw ToolSpec for a manifest entry { slug, name, category }.
   * Return an object (passed to normalizeSpec) or null if it cannot.
   */
  async generate(entry) {
    void entry;
    throw new Error(this.name + ".generate() not implemented");
  }

  /**
   * Produce an enhanced raw ToolSpec given the current normalized spec.
   * Default: fall back to a fresh generate().
   */
  async enhance(entry /* , currentSpec */) {
    return this.generate(entry);
  }
}

// The JSON contract we ask any LLM to satisfy. Kept here so every LLM-backed
// generator shares one source of truth.
export const SPEC_CONTRACT = `Return ONLY one JSON object (no markdown, no prose) with this shape:
{
  "title": "Human tool name",
  "description": "One sentence (<=160 chars) describing what it does",
  "icon": "lucide-react icon name in kebab-case (e.g. calculator, percent, ruler)",
  "modes": [{"id":"basic","label":"Basic"}],           // OPTIONAL: only if the tool has distinct sub-modes; omit otherwise
  "fields": [
    {"key":"amount","label":"Amount","type":"number","default":"1000","suffix":"$"},
    {"key":"unit","label":"From","type":"select","default":"c","choices":[{"value":"c","label":"Celsius"},{"value":"f","label":"Fahrenheit"}]}
    // types: number | text | textarea | password | select | date | range | toggle | file
    // password fields are masked and excluded from browser storage/summary exports
    // add "mode":"<modeId>" to a field to show it only in that mode
    // file fields: {"key":"doc","label":"Upload file","type":"file","readAs":"text"}   // or "dataUrl" for images/binary
  ],
  "compute": "(values, mode) => { /* PURE js */ return { result: 'string', caption: 'optional', rows: [['Label','Value']], list: ['optional'], table: {headers:['A'],rows:[['1']]} }; }",
  "presets": [{"label":"Example","values":{"amount":"1000"}}],
  "note": "short factual disclaimer, optional",
  "exportResultOnly": false,                              // OPTIONAL: true when copy/download must contain only result.result
  "intro": "one friendly paragraph about the tool",
  "useCases": ["use case 1","use case 2","use case 3"],
  "benefits": [["Benefit title","one sentence"],["...","..."],["...","..."]],
  "faqs": [["Question?","Answer."],["Question?","Answer."],["Question?","Answer."]]
}
CRITICAL — field keys and compute must match EXACTLY:
- Each field's "key" is the EXACT property compute reads from \`values\`. If a field key is "initial_amount", compute MUST read \`values.initial_amount\` — never \`values.initialAmount\`. Mismatched keys produce NaN and are rejected.
- Prefer short snake_case keys and reuse the SAME identifier in both places.

RULES for "compute":
- It is a STRING containing a single pure JavaScript arrow function.
- number and range fields arrive as Numbers; file fields arrive as {name, type, size, text?, dataUrl?}.
- MUST return an object with at least a string "result", computed from the inputs.
- NO import/require, NO fetch/XHR/network, NO window/document/DOM, NO Node APIs.
- Only use Math, Date, Number, String, Array, Object, JSON, Intl, BigInt, RegExp, crypto.subtle, TextEncoder, TextDecoder, btoa, atob.
- Guard divide-by-zero / NaN and return a helpful message string instead.
- Make it genuinely correct and useful (REAL formulas/algorithms). NEVER return placeholder text like "in progress", "converted to…", "saved as…", "example.com", or echo the input unchanged. If it can't be computed for real in the browser, it will be rejected — do not fake it.`;
