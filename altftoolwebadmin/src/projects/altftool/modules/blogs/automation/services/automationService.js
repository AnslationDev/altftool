// ALTF Engine — Content Automation: admin client service.
// Client SDK reads/writes for blogTopics / seoProposals / settings / runs
// (all admin-only via firestore.rules), plus authenticated calls to the
// server lanes (/api/automation/run, /api/blogs/generate, /api/seo/generate).

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  fetchSeoConfig,
  saveSeoConfig,
} from "@/projects/altftool/modules/seo/services/seoService";

const PROJECT_ID = "altftool";
const col = (name) => collection(db, "projects", PROJECT_ID, name);
const ref = (name, id) => doc(db, "projects", PROJECT_ID, name, id);

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  const token = await user.getIdToken();
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function readJson(res, fallback) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || fallback);
  return data;
}

/* ── Settings (projects/altftool/settings/automation) ── */

export const SETTINGS_DEFAULTS = {
  blog: { enabled: false, dailyLimit: 10, perRun: 2, provider: "openai", model: "gpt-4o", minQualityScore: 75, defaultAuthor: "AltFTool Editorial" },
  seo: { enabled: false, dailyPageLimit: 25, perRun: 5, provider: "openai", model: "gpt-4o" },
  trending: { enabled: false, gscLookbackDays: 14, maxSuggestionsPerRun: 10, suggestBlogTopics: true },
  limits: { dailyCostCapUsd: 10 },
};

export async function fetchAutomationSettings() {
  const snap = await getDoc(ref("settings", "automation"));
  const stored = snap.exists() ? snap.data() : {};
  return {
    blog: { ...SETTINGS_DEFAULTS.blog, ...(stored.blog || {}) },
    seo: { ...SETTINGS_DEFAULTS.seo, ...(stored.seo || {}) },
    trending: { ...SETTINGS_DEFAULTS.trending, ...(stored.trending || {}) },
    limits: { ...SETTINGS_DEFAULTS.limits, ...(stored.limits || {}) },
  };
}

export async function saveAutomationSettings(settings) {
  await setDoc(
    ref("settings", "automation"),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/* ── Topic queue (projects/altftool/blogTopics) ── */

export async function fetchTopics() {
  const snap = await getDocs(query(col("blogTopics"), limit(500)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort(
      (a, b) =>
        (Number(b.priority) || 0) - (Number(a.priority) || 0) ||
        (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
    );
}

export async function addTopics(lines, { createdBy = "" } = {}) {
  const topics = [...new Set(lines.map((l) => String(l).trim()).filter((l) => l.length >= 8))];
  await Promise.all(
    topics.map((topic) => {
      const newRef = doc(col("blogTopics"));
      return setDoc(newRef, {
        topic,
        keywords: [],
        brief: "",
        category: "",
        priority: 0,
        status: "pending",
        source: "manual",
        error: "",
        blogId: "",
        createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }),
  );
  return topics.length;
}

export async function updateTopic(id, patch) {
  await updateDoc(ref("blogTopics", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteTopic(id) {
  await deleteDoc(ref("blogTopics", id));
}

/** Promote a trending suggestion into the pending queue. */
export function promoteTopic(id) {
  return updateTopic(id, { status: "pending" });
}

/** Re-queue a failed topic. */
export function retryTopic(id) {
  return updateTopic(id, { status: "pending", error: "" });
}

/* ── Runs (projects/altftool/blogAutomationRuns) ── */

export async function fetchRuns(count = 30) {
  const snap = await getDocs(query(col("blogAutomationRuns"), orderBy("startedAt", "desc"), limit(count)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ── SEO proposals (projects/altftool/seoProposals) ── */

export async function fetchProposals() {
  const snap = await getDocs(query(col("seoProposals"), limit(300)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}

export async function rejectProposal(id, adminEmail = "") {
  await updateDoc(ref("seoProposals", id), {
    status: "rejected",
    appliedBy: adminEmail,
    updatedAt: serverTimestamp(),
  });
}

/**
 * High-risk detection: robots/canonical/sitemap changes must never ride along
 * silently (and are excluded from bulk approve). The AI lane never proposes
 * these today — this guards future lanes and hand-edited proposal docs too.
 */
export function isHighRiskProposal(proposal) {
  const p = proposal?.proposed || {};
  return (
    "noindex" in p ||
    "follow" in p ||
    "canonical" in p ||
    "sitemap" in p ||
    "code" in p
  );
}

/**
 * Approve + apply: merge the proposed entry over the current page override and
 * persist through the EXISTING audited /api/seo/config path (same path the
 * manual Pages editor uses), then mark the proposal applied.
 */
export async function approveProposal(proposal, adminEmail = "") {
  const config = await fetchSeoConfig();
  const pages = { ...(config.pages || {}) };
  const current = pages[proposal.path] || {};
  pages[proposal.path] = { ...current, ...proposal.proposed };

  await saveSeoConfig({ ...config, pages }, { paths: [proposal.path] });

  await updateDoc(ref("seoProposals", proposal.id), {
    status: "applied",
    appliedBy: adminEmail,
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Bulk approve: ONE config read + ONE audited save for all selected paths,
 * then mark every proposal applied. High-risk proposals are refused here —
 * approve those individually after review.
 */
export async function bulkApproveProposals(proposals, adminEmail = "") {
  const safe = proposals.filter((p) => p.status === "pending" && !isHighRiskProposal(p));
  if (!safe.length) return { applied: 0, skipped: proposals.length };

  const config = await fetchSeoConfig();
  const pages = { ...(config.pages || {}) };
  for (const proposal of safe) {
    pages[proposal.path] = { ...(pages[proposal.path] || {}), ...proposal.proposed };
  }

  await saveSeoConfig({ ...config, pages }, { paths: safe.map((p) => p.path) });

  await Promise.all(
    safe.map((proposal) =>
      updateDoc(ref("seoProposals", proposal.id), {
        status: "applied",
        appliedBy: adminEmail,
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    ),
  );

  return { applied: safe.length, skipped: proposals.length - safe.length };
}

/* ── Server lane triggers ── */

export async function triggerRun({ lanes, count = 0, paths = [] } = {}) {
  const res = await fetch("/api/automation/run", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ lanes, count, paths }),
  });
  return readJson(res, "Automation run failed");
}

export async function triggerBlogGeneration(count = 1) {
  const res = await fetch("/api/blogs/generate", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ count }),
  });
  return readJson(res, "Blog generation failed");
}

export async function triggerSeoGeneration({ paths = [], count = 0 } = {}) {
  const res = await fetch("/api/seo/generate", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ paths, count }),
  });
  return readJson(res, "SEO proposal generation failed");
}
