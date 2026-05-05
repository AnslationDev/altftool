
export async function generateDomainsOpenAI(params) {
  const res = await fetch("/api/tools/ai-domain-generator/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Domain generation failed (${res.status}).`);
  }

  return res.json();
}
