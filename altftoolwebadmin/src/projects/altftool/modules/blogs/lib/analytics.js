/**
 * Phase 4 — blog insights engine (pure, dependency-free).
 *
 * Works from the Firestore fields we already store (views, likesCount,
 * commentsCount, createdAt/date, category, status). True search traffic
 * (impressions/CTR/position) comes from the flag-gated Search Console seam
 * in the dashboard; everything here is computable today.
 */

import { toJsDate } from "./workflow.js";

const DAY = 86_400_000;

export function daysSince(value, now = Date.now()) {
  const d = toJsDate(value);
  if (!d) return null;
  return Math.max(0, Math.floor((now - d.getTime()) / DAY));
}

export function publishDate(blog = {}) {
  return toJsDate(blog.publishedAt) || toJsDate(blog.date) || toJsDate(blog.createdAt) || null;
}

export function engagementScore(blog = {}) {
  const views = Number(blog.views || 0);
  const likes = Number(blog.likesCount || 0);
  const comments = Number(blog.commentsCount || 0);
  // Likes and comments are scarcer signals than a view, so weight them up.
  return views + likes * 5 + comments * 8;
}

/** Views per day since publish — a traffic-free proxy for "is this alive". */
export function velocity(blog = {}, now = Date.now()) {
  const age = daysSince(publishDate(blog), now);
  if (age === null) return 0;
  return Number(blog.views || 0) / Math.max(age, 1);
}

/* ── Stats helpers ── */
export function median(nums = []) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function quartiles(nums = []) {
  if (!nums.length) return { q1: 0, median: 0, q3: 0 };
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  const lower = s.slice(0, mid);
  const upper = s.length % 2 ? s.slice(mid + 1) : s.slice(mid);
  return { q1: median(lower), median: median(s), q3: median(upper) };
}

export function average(nums = []) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/* ── Publishing cadence time-series ── */
export function publishingCadence(blogs = [], months = 6, now = Date.now()) {
  const buckets = [];
  const ref = new Date(now);
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      count: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const blog of blogs) {
    const d = publishDate(blog);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = index.get(key);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

/* ── Category benchmarks ── */
export function categoryBenchmarks(blogs = []) {
  const byCat = new Map();
  for (const blog of blogs) {
    const cat = (blog.category || "Uncategorized").trim() || "Uncategorized";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(blog);
  }
  return [...byCat.entries()]
    .map(([category, posts]) => {
      const views = posts.map((p) => Number(p.views || 0));
      return {
        category,
        count: posts.length,
        totalViews: views.reduce((a, b) => a + b, 0),
        avgViews: Math.round(average(views)),
        medianViews: Math.round(median(views)),
        published: posts.filter((p) => p.status === "published").length,
      };
    })
    .sort((a, b) => b.totalViews - a.totalViews);
}

/* ── Decay / at-risk detection ── */
export function decayRisk(blogs = [], { minAgeDays = 90, now = Date.now() } = {}) {
  const aged = blogs.filter(
    (b) => b.status === "published" && (daysSince(publishDate(b), now) || 0) >= minAgeDays,
  );
  if (aged.length < 4) return []; // not enough signal to benchmark

  const vels = aged.map((b) => velocity(b, now));
  const { q1 } = quartiles(vels);

  return aged
    .map((b) => ({ blog: b, velocity: velocity(b, now), ageDays: daysSince(publishDate(b), now) || 0 }))
    .filter((x) => x.velocity <= q1)
    .sort((a, b) => a.velocity - b.velocity || b.ageDays - a.ageDays);
}

/* ── Freshness cohorts ── */
export function freshnessCohorts(blogs = [], now = Date.now()) {
  const cohorts = { fresh: 0, recent: 0, aging: 0, stale: 0 };
  for (const blog of blogs) {
    const age = daysSince(blog.updatedAt || publishDate(blog), now);
    if (age === null) continue;
    if (age <= 30) cohorts.fresh += 1;
    else if (age <= 90) cohorts.recent += 1;
    else if (age <= 180) cohorts.aging += 1;
    else cohorts.stale += 1;
  }
  return cohorts;
}

export function topPerformers(blogs = [], n = 5) {
  return [...blogs]
    .map((b) => ({ blog: b, score: engagementScore(b) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/* ── Dashboard summary ── */
export function summarizeInsights(blogs = [], now = Date.now()) {
  const published = blogs.filter((b) => b.status === "published");
  const views = blogs.map((b) => Number(b.views || 0));
  const cadence = publishingCadence(blogs, 6, now);
  const thisMonth = cadence[cadence.length - 1]?.count || 0;
  const benchmarks = categoryBenchmarks(blogs);
  const atRisk = decayRisk(blogs, { now });

  return {
    kpis: {
      total: blogs.length,
      published: published.length,
      drafts: blogs.length - published.length,
      totalViews: views.reduce((a, b) => a + b, 0),
      avgViews: Math.round(average(views)),
      medianViews: Math.round(median(views)),
      thisMonth,
      atRisk: atRisk.length,
      topCategory: benchmarks[0]?.category || "—",
    },
    cadence,
    benchmarks,
    atRisk,
    cohorts: freshnessCohorts(blogs, now),
    top: topPerformers(blogs, 5),
  };
}
