// ALTF Engine — Content Automation: TRENDING lane.
// Compares recent vs previous GSC query windows, surfaces rising queries, and
// (optionally) files them as blog topic SUGGESTIONS (status:"suggested") for
// an admin to promote to the queue. Never generates content by itself.

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { isGscConfigured, gscSearchAnalytics } from "@/lib/gscClient";
import { slugify } from "@/projects/altftool/modules/blogs/lib/slug";
import {
  BLOGS_COLLECTION,
  TOPICS_COLLECTION,
  TOPIC_STATUS,
  fsPath,
} from "./constants";
import { finishRun, startRun } from "./runLog";

function daysAgo(n) {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

function toQueryMap(rows) {
  const map = new Map();
  for (const row of rows) {
    const query = row.keys?.[0];
    if (!query) continue;
    map.set(query, {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      position: row.position || 0,
    });
  }
  return map;
}

/** Rising = meaningful impressions now + strong growth vs the previous window. */
export async function fetchRisingQueries({ lookbackDays = 14, limit = 25 } = {}) {
  if (!isGscConfigured()) return [];

  const [recentRows, previousRows] = await Promise.all([
    gscSearchAnalytics({
      startDate: daysAgo(lookbackDays),
      endDate: daysAgo(1),
      dimensions: ["query"],
      rowLimit: 250,
    }),
    gscSearchAnalytics({
      startDate: daysAgo(lookbackDays * 2),
      endDate: daysAgo(lookbackDays + 1),
      dimensions: ["query"],
      rowLimit: 250,
    }),
  ]);

  const recent = toQueryMap(recentRows);
  const previous = toQueryMap(previousRows);

  const rising = [];
  for (const [query, now] of recent.entries()) {
    if (now.impressions < 25) continue;
    const before = previous.get(query) || { impressions: 0, clicks: 0 };
    const growth = before.impressions > 0 ? now.impressions / before.impressions : Infinity;
    if (growth < 1.5) continue;
    rising.push({
      query,
      impressions: now.impressions,
      clicks: now.clicks,
      position: Number(now.position?.toFixed?.(1) ?? now.position),
      previousImpressions: before.impressions,
      growth: Number.isFinite(growth) ? Number(growth.toFixed(2)) : null, // null == brand new
    });
  }

  return rising
    .sort((a, b) => (b.growth === null ? 1 : a.growth === null ? -1 : 0) || b.impressions - a.impressions)
    .slice(0, limit);
}

async function existingTopicSlugs() {
  const snap = await adminDb.collection(fsPath(TOPICS_COLLECTION)).limit(500).get();
  return new Set(snap.docs.map((d) => slugify(d.data()?.topic || "")).filter(Boolean));
}

async function existingBlogSlug(query) {
  const slug = slugify(query);
  if (!slug) return true; // unusable ⇒ treat as existing
  const snap = await adminDb
    .collection(fsPath(BLOGS_COLLECTION))
    .where("slugLower", "==", slug)
    .limit(1)
    .get();
  return !snap.empty;
}

/**
 * Run the trending lane: file rising queries as `blogTopics` suggestions.
 */
export async function runTrendingLane({ settings, trigger = "cron", startedBy = "" }) {
  if (!settings.trending.enabled) return { skipped: true, reason: "trending lane disabled in settings" };
  if (!isGscConfigured()) return { skipped: true, reason: "GSC not configured" };

  const runRef = await startRun({ kind: "trending", trigger, startedBy });
  const created = [];
  const failed = [];

  try {
    const rising = await fetchRisingQueries({
      lookbackDays: settings.trending.gscLookbackDays,
      limit: settings.trending.maxSuggestionsPerRun * 3,
    });

    if (settings.trending.suggestBlogTopics && rising.length) {
      const taken = await existingTopicSlugs();
      let filed = 0;

      for (const item of rising) {
        if (filed >= settings.trending.maxSuggestionsPerRun) break;
        const slug = slugify(item.query);
        if (!slug || taken.has(slug)) continue;
        if (await existingBlogSlug(item.query)) continue;

        // Deterministic ID (query slug) ⇒ re-scans can never duplicate a
        // suggestion; create() fails silently if it already exists.
        const ref = adminDb.collection(fsPath(TOPICS_COLLECTION)).doc(slug.slice(0, 120));
        await ref.create({
          topic: item.query,
          keywords: [item.query],
          brief: "",
          category: "",
          priority: 0,
          status: TOPIC_STATUS.SUGGESTED,
          source: "trending",
          gscSnapshot: {
            impressions: item.impressions,
            clicks: item.clicks,
            position: item.position,
            growth: item.growth,
          },
          error: "",
          blogId: "",
          createdBy: "automation",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }).catch((error) => {
          // ALREADY_EXISTS ⇒ another run filed it; anything else re-throws.
          if (error?.code !== 6 && !/already exists/i.test(String(error?.message))) throw error;
          return null;
        });
        taken.add(slug);
        created.push({ topicId: ref.id, topic: item.query });
        filed += 1;
      }
    }
  } catch (error) {
    failed.push({ error: String(error?.message || error) });
  }

  await finishRun(runRef, { created, failed, tokensUsed: 0, costEstimate: 0 });
  return { runId: runRef.id, created, failed };
}
