// ALTF Engine — Content Automation (Blog + SEO lanes).
// Shared constants. Server-only (imported by API routes and automation libs).
//
// Everything is INERT unless ALTFT_CONTENT_AUTOMATION_ENABLED === "true"
// (same inert-by-default contract as the SEO engine / master.md).

export const AUTOMATION_FLAG = "ALTFT_CONTENT_AUTOMATION_ENABLED";
export const CRON_SECRET_ENV = "AUTOMATION_CRON_SECRET";

export const PROJECT_ID = "altftool";

// Firestore locations (all under the existing projects/altftool namespace).
export const TOPICS_COLLECTION = ["projects", PROJECT_ID, "blogTopics"];
export const RUNS_COLLECTION = ["projects", PROJECT_ID, "blogAutomationRuns"];
export const PROPOSALS_COLLECTION = ["projects", PROJECT_ID, "seoProposals"];
export const SETTINGS_DOC = ["projects", PROJECT_ID, "settings", "automation"];
export const BLOGS_COLLECTION = ["projects", PROJECT_ID, "blogs"];
export const CATEGORIES_COLLECTION = ["projects", PROJECT_ID, "categories"];
export const SEO_RUNTIME_DOC = ["projects", PROJECT_ID, "seo", "runtime"];

export const TOPIC_STATUS = {
  SUGGESTED: "suggested", // trending intake — admin promotes to "pending"
  PENDING: "pending",
  GENERATING: "generating",
  DONE: "done",
  FAILED: "failed",
};

export const PROPOSAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  APPLIED: "applied",
};

export const LANES = ["trending", "blog", "seo"];

export function isAutomationEnabled() {
  return process.env[AUTOMATION_FLAG] === "true";
}

/** Join a Firestore path array for adminDb.doc()/collection(). */
export function fsPath(segments) {
  return segments.join("/");
}
