import { NextResponse } from "next/server";
import { getServerEnv, requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, fetchJson, routeError } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

const DEFAULT_TLDS = [".com", ".net", ".io", ".in", ".org"];
const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z0-9.-]{2,}$/;

function normalizeParams(input = {}) {
  const idea = String(input.idea || input.keyword || "").trim().slice(0, 120);
  const style = String(input.style || "brandable").trim().slice(0, 40);
  const count = Math.min(Math.max(Number(input.count) || 10, 1), 20);
  const tlds = Array.isArray(input.tlds) ? input.tlds : DEFAULT_TLDS;

  return {
    idea,
    style,
    count,
    tlds: tlds
      .map((tld) => String(tld).trim().toLowerCase())
      .filter(Boolean)
      .map((tld) => (tld.startsWith(".") ? tld : `.${tld}`))
      .filter((tld) => /^\.[a-z0-9.-]{2,}$/.test(tld))
      .slice(0, 10),
  };
}

function buildPrompt(params) {
  return [
    "You are a domain name generator.",
    "Return only JSON with a suggestions array of domain names.",
    "Rules: lowercase only, no spaces, valid DNS labels, no leading or trailing hyphen.",
    `Allowed TLDs: ${params.tlds.join(", ")}`,
    `Generate ${params.count} unique domains for idea "${params.idea}" in style "${params.style}".`,
  ].join("\n");
}

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 8,
      scope: "tools:domain-ai",
      windowMs: 60000,
    });
    if (limited) return limited;

    const apiKey = requireServerEnv(SERVER_ENV.openai);

    const params = normalizeParams(await req.json());
    if (!params.idea) {
      return NextResponse.json({ error: "Missing idea.", suggestions: [] }, { status: 400 });
    }

    const result = await fetchJson("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getServerEnv("OPENAI_DOMAIN_MODEL") || "gpt-4o-mini",
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You generate concise brandable domain names." },
          { role: "user", content: buildPrompt(params) },
        ],
      }),
      timeoutMs: 20000,
    });

    const data = result.data;
    if (!result.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI request failed.", suggestions: [] },
        { status: result.status }
      );
    }

    const content = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const suggestions = Array.isArray(parsed?.suggestions)
      ? parsed.suggestions
          .map((item) => String(item).trim().toLowerCase())
          .filter((item) => DOMAIN_PATTERN.test(item))
          .slice(0, params.count)
      : [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    return routeError(NextResponse, error, "Domain generation failed.");
  }
}
