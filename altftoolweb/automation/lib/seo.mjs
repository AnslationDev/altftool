// Shared per-tool SEO content generation (unique intro / how-to steps / use
// cases / benefits / FAQs). Used by both `generate-seo.mjs` and the build
// pipeline so every tool ships distinctive, tool-specific copy instead of the
// generic category template.
function parseJSON(text) {
  let s = String(text).trim();
  const f = s.match(/```(?:json)?\s*([\s\S]*?)```/); if (f) s = f[1].trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}"); if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

// pool = a ProviderPool. spec = a ToolSpec (or {title, description, category, fields, note}).
// Returns { intro, steps, useCases, benefits, faqs } or throws.
export async function generateSeo(pool, spec) {
  const fields = (spec.fields || []).map((f) => f.label).filter(Boolean).join(", ") || "(a single action)";
  const prompt = `Write UNIQUE marketing/SEO content for a specific browser tool. Everything must be about THIS tool only — no generic filler.

Tool: "${spec.title}"
What it does: ${spec.description}
Inputs: ${fields}
${spec.note ? "Note: " + spec.note : ""}

Return ONLY JSON:
{
  "intro": "2-3 sentences describing exactly what this tool does and who it's for",
  "steps": ["specific step referencing THIS tool's actual inputs", "step 2", "step 3"],
  "useCases": ["specific real scenario 1", "scenario 2", "scenario 3"],
  "benefits": [["Short benefit title","one specific sentence"],["...","..."],["...","..."]],
  "faqs": [["A real question about THIS tool?","A specific answer."],["...","..."],["...","..."]]
}
Be concrete and specific to "${spec.title}". Never say "ship cleaner code", "paste your data", or "pick the format".`;
  const { text } = await pool.chat(
    [{ role: "system", content: "You write concise, tool-specific SEO copy. Output only valid JSON." }, { role: "user", content: prompt }],
    { json: true },
  );
  const c = parseJSON(text);
  return {
    intro: String(c.intro || "").trim(),
    steps: (c.steps || []).map(String).slice(0, 4),
    useCases: (c.useCases || []).map(String).slice(0, 4),
    benefits: (c.benefits || []).map((b) => (Array.isArray(b) ? [String(b[0]), String(b[1])] : [String(b.title), String(b.body)])).filter((b) => b[0]).slice(0, 3),
    faqs: (c.faqs || []).map((f) => (Array.isArray(f) ? [String(f[0]), String(f[1])] : [String(f.q), String(f.a)])).filter((f) => f[0] && f[1]).slice(0, 4),
  };
}
