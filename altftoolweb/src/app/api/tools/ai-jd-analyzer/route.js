import { NextResponse } from "next/server";
import { enforceRateLimit, fetchJson, routeError } from "@altftool/core/http";

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/";
const MAX_PAYLOAD_LENGTH = 30_000;
const ALLOWED_MODELS = new Set([
  "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "dslim/bert-base-NER",
  "facebook/bart-large-mnli",
]);

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 24,
      scope: "tools:ai-jd-analyzer",
      windowMs: 60_000,
    });
    if (limited) return limited;

    const body = await request.json();
    const model = String(body?.model || "").trim();
    const payload = body?.payload;

    if (!ALLOWED_MODELS.has(model) || !payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid analysis request." }, { status: 400 });
    }

    const serializedPayload = JSON.stringify(payload);
    if (serializedPayload.length > MAX_PAYLOAD_LENGTH) {
      return NextResponse.json(
        { error: "Job description is too long." },
        { status: 413 },
      );
    }

    const apiToken = String(
      process.env.HUGGINGFACE_API_TOKEN || process.env.HF_API_TOKEN || "",
    ).trim();
    if (!apiToken) {
      return NextResponse.json(
        { error: "AI analysis is temporarily unavailable." },
        { status: 503 },
      );
    }

    const result = await fetchJson(`${HUGGING_FACE_API_URL}${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: serializedPayload,
      timeoutMs: 30_000,
    });

    if (!result.ok) {
      console.error("Hugging Face inference request failed", result.status, result.data);
      return NextResponse.json(
        { error: "AI analysis is temporarily unavailable." },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data || {}, { status: result.status });
  } catch (error) {
    return routeError(NextResponse, error, "Job-description analysis failed.");
  }
}
