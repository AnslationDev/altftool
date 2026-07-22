import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { enforceRateLimit, fetchJson, routeError } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

const MODEL_NAME = "gemini-2.5-flash";
const MAX_BRAND_LENGTH = 80;
const MAX_STYLE_LENGTH = 500;

export async function POST(request) {
  try {
    const limited = enforceRateLimit(NextResponse, request, {
      limit: 8,
      scope: "tools:logo-slogan-generator",
      windowMs: 60_000,
    });
    if (limited) return limited;

    const payload = await request.json();
    const brandName = String(payload?.brandName || "").trim();
    const style = String(payload?.style || "").trim();

    if (!brandName || !style) {
      return NextResponse.json(
        { error: "Brand name and style are required." },
        { status: 400 },
      );
    }

    if (brandName.length > MAX_BRAND_LENGTH || style.length > MAX_STYLE_LENGTH) {
      return NextResponse.json(
        { error: "Brand name or style description is too long." },
        { status: 400 },
      );
    }

    const apiKey = requireServerEnv(SERVER_ENV.gemini);

    const result = await fetchJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Company name: "${brandName}". Brand style or industry: "${style}". Generate 5 to 7 short, distinct slogans.`,
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: "You are a branding specialist. Return only a numbered list of 5 to 7 concise slogans with no introduction or closing text.",
              },
            ],
          },
        }),
        timeoutMs: 20_000,
      },
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.data?.error?.message || "Slogan generation failed." },
        { status: result.status },
      );
    }

    const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
      return NextResponse.json(
        { error: "The AI response did not contain any slogans." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    return routeError(NextResponse, error, "Slogan generation failed.");
  }
}
