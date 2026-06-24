// altftoolwebadmin/src/app/api/seo/recommendations/route.js
//
// ALTF Engine — AI-powered SEO recommendations (Phase 5).
// POST returns a suggested { title, description, keywords } for a page.
// Uses Gemini when GEMINI_API_KEY is set; otherwise falls back to a deterministic
// heuristic so the feature always returns something useful. Read-only: applying a
// suggestion goes through the audited /api/seo/config save path on the client.

import { NextResponse } from "next/server";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { enforceRateLimit } from "@altftool/core/http";
import { getServerEnv } from "@altftool/core/env";
import {
  buildRecommendationPrompt,
  parseRecommendation,
  heuristicRecommendation,
} from "@altftool/core/seo";

const MODEL = "gemini-2.5-flash";

function authErrorResponse(error) {
  const message = String(error?.message || "Unauthorized");
  const status = /forbidden|inactive/i.test(message) ? 403 : 401;
  return NextResponse.json({ error: status === 403 ? "Forbidden" : "Unauthorized" }, { status });
}

export async function POST(request) {
  const limited = enforceRateLimit(NextResponse, request, {
    limit: 15,
    windowMs: 60_000,
    scope: "seo-recommend",
  });
  if (limited) return limited;

  try {
    await verifyActiveAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }
  const input = {
    path: typeof body?.path === "string" ? body.path : "",
    title: typeof body?.title === "string" ? body.title : "",
    content: typeof body?.content === "string" ? body.content : "",
    url: typeof body?.url === "string" ? body.url : "",
    brand: typeof body?.brand === "string" ? body.brand : "AltFTool",
  };

  const apiKey = getServerEnv("GEMINI_API_KEY");
  if (apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const prompt = buildRecommendationPrompt(input);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: controller.signal,
        },
      );
      if (res.ok) {
        const data = await res.json().catch(() => null);
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const suggestion = parseRecommendation(text);
        if (suggestion) return NextResponse.json({ suggestion, source: "ai" });
      }
    } catch (error) {
      console.error("[seo/recommendations] AI call failed, using heuristic", error);
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json({ suggestion: heuristicRecommendation(input), source: "heuristic" });
}
