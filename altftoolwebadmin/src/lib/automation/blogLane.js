// ALTF Engine — Content Automation: BLOG lane.
// Topic queue → GPT draft → sanitize → quality gate (retry once) →
// Firestore draft (status:"draft", workflowState:"in_review"). Never publishes.

import { FieldValue } from "firebase-admin/firestore";
import { evaluateBlogContent } from "@altftool/core/blogContentHealth";
import { adminDb } from "@/lib/firebaseAdmin";
import { slugify } from "@/projects/altftool/modules/blogs/lib/slug";
import {
  BLOGS_COLLECTION,
  CATEGORIES_COLLECTION,
  TOPICS_COLLECTION,
  TOPIC_STATUS,
  fsPath,
} from "./constants";
import { generateJson } from "./openaiClient";
import { countProducedToday, finishRun, startRun, sumCostToday } from "./runLog";
import {
  BLOG_JSON_SCHEMA,
  assembleBlogDoc,
  buildBlogSystemPrompt,
  buildBlogUserPrompt,
  buildCritiqueUserPrompt,
} from "./blogPrompt";

async function fetchCategoryNames() {
  const snap = await adminDb.collection(fsPath(CATEGORIES_COLLECTION)).get();
  const names = snap.docs.map((d) => d.data()?.name).filter(Boolean);
  if (!names.some((n) => String(n).toLowerCase() === "tools")) names.push("Tools");
  return names;
}

async function claimNextTopics(count) {
  const snap = await adminDb
    .collection(fsPath(TOPICS_COLLECTION))
    .where("status", "==", TOPIC_STATUS.PENDING)
    .limit(50)
    .get();

  const candidates = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort(
      (a, b) =>
        (Number(b.priority) || 0) - (Number(a.priority) || 0) ||
        (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0),
    );

  // TRANSACTIONAL claim: each topic flips pending → generating exactly once,
  // so overlapping cron/manual runs can never double-generate (exactly-once
  // billing guarantee). A topic that lost the race is simply skipped.
  const claimed = [];
  for (const topic of candidates) {
    if (claimed.length >= count) break;
    const ref = adminDb.doc(`${fsPath(TOPICS_COLLECTION)}/${topic.id}`);
    try {
      const won = await adminDb.runTransaction(async (tx) => {
        const fresh = await tx.get(ref);
        if (!fresh.exists || fresh.data()?.status !== TOPIC_STATUS.PENDING) return false;
        tx.update(ref, { status: TOPIC_STATUS.GENERATING, updatedAt: FieldValue.serverTimestamp() });
        return true;
      });
      if (won) claimed.push(topic);
    } catch {
      // Contention ⇒ another run owns it; skip.
    }
  }
  return claimed;
}

async function markTopic(id, patch) {
  await adminDb
    .doc(`${fsPath(TOPICS_COLLECTION)}/${id}`)
    .set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function findUniqueSlug(heading) {
  const base = slugify(heading).slice(0, 75).replace(/-+$/, "");
  if (!base) return null;
  const blogs = adminDb.collection(fsPath(BLOGS_COLLECTION));

  for (let n = 0; n < 5; n += 1) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const snap = await blogs.where("slugLower", "==", candidate).limit(1).get();
    if (snap.empty) return candidate;
    if (n === 0) {
      // Exact topic already covered — treat as duplicate, don't spin variants
      // unless the heading itself differs (caller decides via `duplicateOf`).
      const existing = snap.docs[0];
      return { duplicateOf: existing.id, slug: candidate };
    }
  }
  return null;
}

/* ── Fuzzy dedupe (Phase 3) ──
   Exact slugLower match misses near-duplicates like
   "how-to-compress-pdf-files" vs "compress-pdf-files-guide".
   Compare meaningful slug tokens with a containment ratio. */

const DEDUPE_STOP_TOKENS = new Set([
  "a", "an", "and", "best", "complete", "for", "guide", "how", "in", "of",
  "on", "the", "to", "top", "ultimate", "vs", "with", "your", "you",
]);

function slugTokens(value) {
  return new Set(
    slugify(value)
      .split("-")
      .filter((t) => t.length > 2 && !DEDUPE_STOP_TOKENS.has(t)),
  );
}

function containmentRatio(a, b) {
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return common / Math.min(a.size, b.size);
}

/** All existing slugs, projected server-side (cheap even for large collections). */
async function fetchExistingSlugs() {
  const snap = await adminDb.collection(fsPath(BLOGS_COLLECTION)).select("slugLower", "slug").get();
  return snap.docs.map((d) => d.data()?.slugLower || d.data()?.slug || "").filter(Boolean);
}

export function findFuzzyDuplicate(heading, existingSlugs, threshold = 0.8) {
  const target = slugTokens(heading);
  if (target.size < 2) return null;
  for (const slug of existingSlugs) {
    const ratio = containmentRatio(target, slugTokens(slug));
    if (ratio >= threshold) return { slug, ratio: Number(ratio.toFixed(2)) };
  }
  return null;
}

async function generateOneBlog({ topic, categories, settings, existingSlugs = [] }) {
  const system = buildBlogSystemPrompt(settings);
  const user = buildBlogUserPrompt(
    {
      topic: topic.topic,
      keywords: topic.keywords || [],
      brief: topic.brief || "",
      categories,
      trendingQueries: topic.trendingQueries || [],
    },
    settings,
  );

  const first = await generateJson({
    provider: settings.blog.provider,
    model: settings.blog.model,
    temperature: settings.blog.temperature,
    system,
    user,
    jsonSchema: BLOG_JSON_SCHEMA,
    maxTokens: 8192,
  });

  let generated = first.data;
  let tokens = Number(first.usage?.total_tokens || 0);
  let cost = first.costUsd;

  const gate = (doc) => {
    const audit = evaluateBlogContent(doc);
    // Image is attached by the human reviewer, so the image check (weight 9)
    // is structurally impossible here — grade against the achievable maximum.
    return { ...audit, threshold: settings.blog.minQualityScore };
  };

  const slugResult = await findUniqueSlug(generated.heading);
  if (!slugResult) throw new Error("Could not derive a slug from the generated heading.");
  if (slugResult.duplicateOf) {
    const error = new Error(`Duplicate: a blog with slug "${slugResult.slug}" already exists.`);
    error.duplicate = true;
    throw error;
  }

  const fuzzy = findFuzzyDuplicate(generated.heading, existingSlugs);
  if (fuzzy) {
    const error = new Error(`Near-duplicate of existing post "${fuzzy.slug}" (${Math.round(fuzzy.ratio * 100)}% topic overlap).`);
    error.duplicate = true;
    throw error;
  }

  let doc = assembleBlogDoc({
    generated,
    slug: slugResult,
    settings,
    topicId: topic.id,
    model: first.model,
  });
  let audit = gate(doc);

  if (audit.score < settings.blog.minQualityScore) {
    const retry = await generateJson({
      provider: settings.blog.provider,
      model: settings.blog.model,
      temperature: Math.max(0.3, settings.blog.temperature - 0.2),
      system,
      user: buildCritiqueUserPrompt(generated, audit, settings),
      jsonSchema: BLOG_JSON_SCHEMA,
      maxTokens: 8192,
    });
    tokens += Number(retry.usage?.total_tokens || 0);
    cost += retry.costUsd;
    generated = retry.data;

    doc = assembleBlogDoc({
      generated,
      slug: slugResult,
      settings,
      topicId: topic.id,
      model: retry.model,
    });
    audit = gate(doc);

    if (audit.score < settings.blog.minQualityScore) {
      const error = new Error(
        `Quality gate failed after retry (${audit.score}/${settings.blog.minQualityScore}). Missing: ${audit.missing.join(", ")}`,
      );
      error.qualityScore = audit.score;
      throw error;
    }
  }

  const ref = adminDb.collection(fsPath(BLOGS_COLLECTION)).doc();
  await ref.set({
    ...doc,
    slugLower: slugify(doc.slug),
    aiQualityScore: audit.score,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { blogId: ref.id, slug: doc.slug, heading: doc.heading, score: audit.score, tokens, cost };
}

/**
 * Run the blog lane: respects settings.blog.enabled, dailyLimit and perRun.
 * @returns run summary (also persisted to blogAutomationRuns).
 */
export async function runBlogLane({ settings, trigger = "cron", startedBy = "", maxCount = 0 }) {
  if (!settings.blog.enabled) return { skipped: true, reason: "blog lane disabled in settings" };

  const producedToday = await countProducedToday("blog");
  const remaining = Math.max(0, settings.blog.dailyLimit - producedToday);
  const batch = Math.min(remaining, maxCount > 0 ? maxCount : settings.blog.perRun);
  if (batch === 0) return { skipped: true, reason: `daily limit reached (${producedToday}/${settings.blog.dailyLimit})` };

  const costToday = await sumCostToday();
  const costCap = Number(settings.limits?.dailyCostCapUsd) || 0;
  if (costCap > 0 && costToday >= costCap) {
    return { skipped: true, reason: `daily cost cap reached ($${costToday.toFixed(2)}/$${costCap})` };
  }

  const topics = await claimNextTopics(batch);
  if (!topics.length) return { skipped: true, reason: "no pending topics in queue" };

  const runRef = await startRun({ kind: "blog", trigger, startedBy });
  const [categories, existingSlugs] = await Promise.all([fetchCategoryNames(), fetchExistingSlugs()]);

  const created = [];
  const failed = [];
  let tokensUsed = 0;
  let costEstimate = 0;

  for (const topic of topics) {
    try {
      const result = await generateOneBlog({ topic, categories, settings, existingSlugs });
      tokensUsed += result.tokens;
      costEstimate += result.cost;
      created.push({ topicId: topic.id, blogId: result.blogId, slug: result.slug, heading: result.heading, score: result.score });
      await markTopic(topic.id, { status: TOPIC_STATUS.DONE, blogId: result.blogId, error: "" });
    } catch (error) {
      failed.push({ topicId: topic.id, topic: topic.topic, error: String(error?.message || error) });
      await markTopic(topic.id, {
        status: TOPIC_STATUS.FAILED,
        error: String(error?.message || error),
      });
    }
  }

  await finishRun(runRef, { created, failed, tokensUsed, costEstimate });
  return { runId: runRef.id, created, failed, tokensUsed, costEstimate };
}
