// ALTF Engine — Content Automation: SEO lane.
// Registry + health + GSC → GPT full-entry proposals → seoProposals collection.
// The central seo/runtime doc is NEVER written here; admins approve proposals
// through the existing audited /api/seo/config path.

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { getRegistryEntries } from "@/lib/seoRegistrySource";
import { isGscConfigured, gscSearchAnalytics } from "@/lib/gscClient";
import {
  PROPOSALS_COLLECTION,
  PROPOSAL_STATUS,
  SEO_RUNTIME_DOC,
  fsPath,
} from "./constants";
import { generateJson } from "./openaiClient";
import { finishRun, getTodayUsage, startRun } from "./runLog";
import {
  SEO_JSON_SCHEMA,
  buildSeoSystemPrompt,
  buildSeoUserPrompt,
  normalizeSeoProposal,
} from "./seoPrompt";

function daysAgo(n) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

/** Property-wide page+query rows, grouped per page path. Optional (GSC may be off). */
async function fetchGscQueriesByPage() {
  if (!isGscConfigured()) return new Map();
  try {
    const rows = await gscSearchAnalytics({
      startDate: daysAgo(28),
      endDate: daysAgo(1),
      dimensions: ["page", "query"],
      rowLimit: 500,
    });
    const byPage = new Map();
    for (const row of rows) {
      const [pageUrl, query] = row.keys || [];
      if (!pageUrl || !query) continue;
      let path = "";
      try {
        path = new URL(pageUrl).pathname || "/";
      } catch {
        continue;
      }
      if (!byPage.has(path)) byPage.set(path, []);
      byPage.get(path).push({
        query,
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        position: row.position || 0,
      });
    }
    for (const list of byPage.values()) list.sort((a, b) => b.impressions - a.impressions);
    return byPage;
  } catch {
    return new Map(); // GSC is an enhancer, never a blocker.
  }
}

/**
 * Priority score for picking which pages to work on first:
 * missing metadata > striking-distance GSC pages > pages without overrides.
 */
function priorityScore(entry, currentOverride, gscQueries) {
  let score = 0;
  if (entry.health?.missingTitle) score += 40;
  if (entry.health?.missingDescription) score += 40;
  if (entry.health?.missingSchema) score += 10;
  if (!currentOverride || !Object.keys(currentOverride).length) score += 15;
  const best = gscQueries?.[0];
  if (best && best.position > 4 && best.position <= 20 && best.impressions >= 50) score += 30; // striking distance
  if (entry.health?.noindex) score = -1; // never touch noindexed pages automatically
  return score;
}

async function fetchPendingProposalPaths() {
  const snap = await adminDb
    .collection(fsPath(PROPOSALS_COLLECTION))
    .where("status", "==", PROPOSAL_STATUS.PENDING)
    .get();
  return new Set(snap.docs.map((d) => d.data()?.path).filter(Boolean));
}

/** Pure generation (AI call + validation) — persists nothing. */
async function generateEntryProposal({ entry, current, gscQueries, settings }) {
  const result = await generateJson({
    provider: settings.seo.provider,
    model: settings.seo.model,
    temperature: settings.seo.temperature,
    system: buildSeoSystemPrompt(settings),
    user: buildSeoUserPrompt({ entry, current, gscQueries }, settings),
    jsonSchema: SEO_JSON_SCHEMA,
    maxTokens: 2048,
  });

  const normalized = normalizeSeoProposal(result.data, settings.seo.fields);
  if (!normalized) throw new Error("Model returned no usable fields after validation.");
  return { normalized, result };
}

/** Guess the page-type for paths that are not in the registry yet. */
function guessPageType(path = "") {
  const first = String(path).split("/").filter(Boolean)[0] || "";
  const map = {
    tools: "tools", blogs: "blogs", news: "news", policypages: "policies",
    buysmart: "buysmart", exclusivedeals: "exclusivedeals", brandrating: "brandrating",
    top: "top", wattpad: "wattpad", homeserv: "homeserv",
    altflovepdf: "altflovepdf", altfloveimg: "altfloveimg",
  };
  return map[first] || "landing";
}

/**
 * On-demand single-page generation for the Pages editor "Generate with AI"
 * button. Returns the proposed entry WITHOUT writing a proposal doc — the
 * admin reviews the filled form and saves through the audited config path.
 */
export async function generateSeoPreviewForPath({ path, settings }) {
  const normalizedPath = String(path || "").trim();
  if (!normalizedPath.startsWith("/")) throw new Error("Provide a path starting with /.");

  const [configSnap, entries, gscByPage] = await Promise.all([
    adminDb.doc(fsPath(SEO_RUNTIME_DOC)).get(),
    getRegistryEntries().catch(() => []),
    fetchGscQueriesByPage(),
  ]);
  const pages = configSnap.exists ? configSnap.data()?.pages || {} : {};
  const entry =
    entries.find((item) => item.path === normalizedPath) || {
      path: normalizedPath,
      pageType: guessPageType(normalizedPath),
      title: "",
      description: "",
      h1: "",
    };
  const current = pages[normalizedPath] || {};
  const gscQueries = gscByPage.get(normalizedPath) || [];

  const { normalized, result } = await generateEntryProposal({ entry, current, gscQueries, settings });

  return {
    path: normalizedPath,
    pageType: entry.pageType || "page",
    current,
    proposed: normalized.proposed,
    rationale: normalized.rationale,
    gscSnapshot: { topQueries: gscQueries.slice(0, 5) },
    usage: { tokens: Number(result.usage?.total_tokens || 0), costUsd: result.costUsd },
  };
}

async function generateOneProposal({ entry, current, gscQueries, settings }) {
  const { normalized, result } = await generateEntryProposal({ entry, current, gscQueries, settings });

  // Deterministic doc ID (path + UTC day) ⇒ IDEMPOTENT: a duplicate run for
  // the same page on the same day fails on create() instead of writing twice.
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const pathKey = entry.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "root";
  const ref = adminDb.collection(fsPath(PROPOSALS_COLLECTION)).doc(`${pathKey}--${day}`);
  await ref.create({
    path: entry.path,
    pageType: entry.pageType || "page",
    current: current || {},
    proposed: normalized.proposed,
    rationale: normalized.rationale,
    gscSnapshot: {
      topQueries: (gscQueries || []).slice(0, 5),
    },
    status: PROPOSAL_STATUS.PENDING,
    generatedBy: "ai",
    aiModel: result.model,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    appliedAt: null,
    appliedBy: "",
  });

  return {
    proposalId: ref.id,
    path: entry.path,
    tokens: Number(result.usage?.total_tokens || 0),
    cost: result.costUsd,
  };
}

/**
 * Run the SEO lane. `paths` (optional) restricts to admin-selected pages.
 */
export async function runSeoLane({ settings, trigger = "cron", startedBy = "", paths = [], maxCount = 0 }) {
  if (!settings.seo.enabled) return { skipped: true, reason: "seo lane disabled in settings" };

  const { produced: producedToday, totalCost: costToday } = await getTodayUsage("seo");
  const remaining = Math.max(0, settings.seo.dailyPageLimit - producedToday);
  const batch = Math.min(remaining, maxCount > 0 ? maxCount : settings.seo.perRun);
  if (batch === 0) return { skipped: true, reason: `daily limit reached (${producedToday}/${settings.seo.dailyPageLimit})` };

  const costCap = Number(settings.limits?.dailyCostCapUsd) || 0;
  if (costCap > 0 && costToday >= costCap) {
    return { skipped: true, reason: `daily cost cap reached ($${costToday.toFixed(2)}/$${costCap})` };
  }

  // Current config (for diffs) + registry (for candidates) + GSC (for relevance).
  const [configSnap, entries, gscByPage, pendingPaths] = await Promise.all([
    adminDb.doc(fsPath(SEO_RUNTIME_DOC)).get(),
    getRegistryEntries(),
    fetchGscQueriesByPage(),
    fetchPendingProposalPaths(),
  ]);
  const pages = configSnap.exists ? configSnap.data()?.pages || {} : {};

  const wanted = new Set((paths || []).filter(Boolean));
  const candidates = entries
    .filter((entry) => entry.path && !pendingPaths.has(entry.path))
    .filter((entry) => (wanted.size ? wanted.has(entry.path) : true))
    .map((entry) => ({
      entry,
      current: pages[entry.path] || {},
      gscQueries: gscByPage.get(entry.path) || [],
    }))
    .map((item) => ({ ...item, score: priorityScore(item.entry, item.current, item.gscQueries) }))
    .filter((item) => (wanted.size ? item.score >= 0 : item.score > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, batch);

  if (!candidates.length) return { skipped: true, reason: "no candidate pages (all healthy or already proposed)" };

  const runRef = await startRun({ kind: "seo", trigger, startedBy });
  const created = [];
  const failed = [];
  let tokensUsed = 0;
  let costEstimate = 0;

  for (const { entry, current, gscQueries } of candidates) {
    try {
      const result = await generateOneProposal({ entry, current, gscQueries, settings });
      tokensUsed += result.tokens;
      costEstimate += result.cost;
      created.push({ proposalId: result.proposalId, path: result.path });
    } catch (error) {
      failed.push({ path: entry.path, error: String(error?.message || error) });
    }
  }

  await finishRun(runRef, { created, failed, tokensUsed, costEstimate });
  return { runId: runRef.id, created, failed, tokensUsed, costEstimate };
}
