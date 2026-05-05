import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, fetchJson, routeError } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

const MODEL_NAME = "gemini-2.5-flash";

export async function POST(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 10,
      scope: "tools:financial-gemini",
      windowMs: 60000,
    });
    if (limited) return limited;

    const apiKey = requireServerEnv(SERVER_ENV.gemini);

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }

    const result = await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        timeoutMs: 20000,
      }
    );

    const data = result.data;
    if (!result.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Gemini request failed." },
        { status: result.status }
      );
    }

    return NextResponse.json({
      text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "",
    });
  } catch (error) {
    return routeError(NextResponse, error, "Gemini request failed.");
  }
}
