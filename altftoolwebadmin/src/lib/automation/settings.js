// ALTF Engine — Content Automation settings.
// Single settings doc: projects/altftool/settings/automation.
// Defaults keep every lane DISABLED so merging this code changes nothing
// until an admin explicitly enables it (master.md: backward-compatible).

import { adminDb } from "@/lib/firebaseAdmin";
import { SETTINGS_DOC, fsPath } from "./constants";

export const DEFAULT_SETTINGS = {
  blog: {
    enabled: false,
    dailyLimit: 10,
    perRun: 2,
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    minQualityScore: 75,
    defaultAuthor: "AltFTool Editorial",
    defaultAuthorRole: "Guide Editor",
    reviewedBy: "AltFTool Editorial Team",
  },
  seo: {
    enabled: false,
    dailyPageLimit: 25,
    perRun: 5,
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.4,
    fields: {
      title: true,
      description: true,
      keywords: true,
      og: true,
      twitter: true,
      schema: true,
      // Arbitrary head/body code injection stays OFF by default (safety).
      codeHead: false,
    },
  },
  trending: {
    enabled: false,
    gscLookbackDays: 14,
    maxSuggestionsPerRun: 10,
    suggestBlogTopics: true,
  },
  limits: {
    // Hard stop across ALL lanes: once today's estimated OpenAI spend reaches
    // this, every generating lane skips until tomorrow (UTC).
    dailyCostCapUsd: 10,
  },
  // Optional prompt-template overrides (see promptTemplates.js for the keys
  // and available {{placeholders}}). Empty string ⇒ built-in default is used.
  templates: {
    blogSystem: "",
    blogUser: "",
    blogCritique: "",
    seoSystem: "",
    seoUser: "",
  },
};

function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base?.[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else if (value !== undefined && value !== null) {
      out[key] = value;
    }
  }
  return out;
}

/** Read settings merged over safe defaults. Missing doc ⇒ pure defaults (all off). */
export async function readAutomationSettings() {
  try {
    const snap = await adminDb.doc(fsPath(SETTINGS_DOC)).get();
    if (!snap.exists) return { ...DEFAULT_SETTINGS, _missing: true };
    return deepMerge(DEFAULT_SETTINGS, snap.data());
  } catch (error) {
    // Fail closed: unreadable settings means nothing runs.
    return { ...DEFAULT_SETTINGS, _error: String(error?.message || error) };
  }
}
