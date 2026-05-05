




const getApiKey="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"

function buildPrompt(p) {
  return [
    "You are a domain name generator.",
    "Return ONLY a JSON object with a single key 'suggestions' that is an array of domain names.",
    "Rules for each domain:",
    "- lowercase only",
    "- no spaces",
    "- only a-z, 0-9, and hyphen",
    "- cannot start or end with hyphen",
    "- max 63 characters for SLD",
    `- must use one of these TLDs: ${p.tlds.join(", ")}`,
    `Generate ${p.count} unique domains for idea: '${p.idea}' in style: '${p.style}'.`,
  ].join("\n");
}

export async function generateDomainsOpenAI(params) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { suggestions: [] };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You generate domain names." },
        { role: "user", content: buildPrompt(params) },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return { suggestions: [] };

  try {
    const parsed = JSON.parse(content);
    const suggestions = Array.isArray(parsed?.suggestions)
      ? parsed.suggestions.map((s) => String(s))
      : [];
    return { suggestions };
  } catch {
    return { suggestions: [] };
  }
}