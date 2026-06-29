/**
 * Editorial workflow state machine for the blog CMS.
 *
 * Backward compatibility contract:
 * - The PUBLIC-facing field stays `status ∈ {draft, published}` (Firestore
 *   rules + public renderer are unchanged).
 * - `workflowState` is ADMIN-ONLY metadata. When absent, it is derived from
 *   `status`. `published` ⇔ status "published"; everything else ⇒ "draft".
 * - Scheduling uses `publishAt` while the doc stays status:"draft" until a
 *   server job flips it at the scheduled time.
 */

export const WORKFLOW = {
  DRAFT: "draft",
  IN_REVIEW: "in_review",
  CHANGES_REQUESTED: "changes_requested",
  SEO_VALIDATION: "seo_validation",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
};

export const WORKFLOW_ORDER = [
  WORKFLOW.DRAFT,
  WORKFLOW.IN_REVIEW,
  WORKFLOW.CHANGES_REQUESTED,
  WORKFLOW.SEO_VALIDATION,
  WORKFLOW.SCHEDULED,
  WORKFLOW.PUBLISHED,
];

const ALL = new Set(WORKFLOW_ORDER);

/** Allowed transitions (admins can always fall back to draft / unpublish). */
const TRANSITIONS = {
  [WORKFLOW.DRAFT]: [WORKFLOW.IN_REVIEW, WORKFLOW.SEO_VALIDATION, WORKFLOW.PUBLISHED, WORKFLOW.SCHEDULED],
  [WORKFLOW.IN_REVIEW]: [WORKFLOW.CHANGES_REQUESTED, WORKFLOW.SEO_VALIDATION, WORKFLOW.DRAFT],
  [WORKFLOW.CHANGES_REQUESTED]: [WORKFLOW.IN_REVIEW, WORKFLOW.DRAFT],
  [WORKFLOW.SEO_VALIDATION]: [WORKFLOW.SCHEDULED, WORKFLOW.PUBLISHED, WORKFLOW.CHANGES_REQUESTED, WORKFLOW.DRAFT],
  [WORKFLOW.SCHEDULED]: [WORKFLOW.PUBLISHED, WORKFLOW.SEO_VALIDATION, WORKFLOW.DRAFT],
  [WORKFLOW.PUBLISHED]: [WORKFLOW.DRAFT, WORKFLOW.SEO_VALIDATION],
};

export const WORKFLOW_META = {
  [WORKFLOW.DRAFT]: { label: "Draft", tone: "muted", description: "Work in progress." },
  [WORKFLOW.IN_REVIEW]: { label: "In review", tone: "info", description: "Awaiting editorial review." },
  [WORKFLOW.CHANGES_REQUESTED]: { label: "Changes requested", tone: "warning", description: "Reviewer asked for edits." },
  [WORKFLOW.SEO_VALIDATION]: { label: "SEO validation", tone: "secondary", description: "Passing the SEO gate." },
  [WORKFLOW.SCHEDULED]: { label: "Scheduled", tone: "info", description: "Will publish automatically." },
  [WORKFLOW.PUBLISHED]: { label: "Published", tone: "success", description: "Live on the site." },
};

export function isWorkflowState(value) {
  return ALL.has(value);
}

/** Derive the workflow state from a blog doc (backward compatible). */
export function deriveWorkflowState(blog = {}) {
  if (isWorkflowState(blog.workflowState)) return blog.workflowState;
  return blog.status === "published" ? WORKFLOW.PUBLISHED : WORKFLOW.DRAFT;
}

/** The public `status` implied by a workflow state. */
export function statusForWorkflow(state) {
  return state === WORKFLOW.PUBLISHED ? "published" : "draft";
}

export function canTransition(from, to) {
  if (!isWorkflowState(from) || !isWorkflowState(to)) return false;
  if (from === to) return false;
  return (TRANSITIONS[from] || []).includes(to);
}

export function workflowMeta(state) {
  return WORKFLOW_META[state] || WORKFLOW_META[WORKFLOW.DRAFT];
}

/**
 * The contextual actions offered for a given state. The first item is the
 * recommended PRIMARY action (one primary action per view — master.md).
 */
export function nextActions(state) {
  switch (state) {
    case WORKFLOW.DRAFT:
      return [
        { to: WORKFLOW.IN_REVIEW, label: "Request review", primary: true },
        { to: WORKFLOW.PUBLISHED, label: "Publish now", primary: false },
      ];
    case WORKFLOW.IN_REVIEW:
      return [
        { to: WORKFLOW.SEO_VALIDATION, label: "Approve & validate SEO", primary: true },
        { to: WORKFLOW.CHANGES_REQUESTED, label: "Request changes", primary: false },
        { to: WORKFLOW.DRAFT, label: "Back to draft", primary: false },
      ];
    case WORKFLOW.CHANGES_REQUESTED:
      return [
        { to: WORKFLOW.IN_REVIEW, label: "Re-submit for review", primary: true },
        { to: WORKFLOW.DRAFT, label: "Back to draft", primary: false },
      ];
    case WORKFLOW.SEO_VALIDATION:
      return [
        { to: WORKFLOW.PUBLISHED, label: "Publish now", primary: true },
        { to: WORKFLOW.SCHEDULED, label: "Schedule", primary: false },
        { to: WORKFLOW.CHANGES_REQUESTED, label: "Request changes", primary: false },
      ];
    case WORKFLOW.SCHEDULED:
      return [
        { to: WORKFLOW.PUBLISHED, label: "Publish now", primary: true },
        { to: WORKFLOW.DRAFT, label: "Unschedule", primary: false },
      ];
    case WORKFLOW.PUBLISHED:
      return [
        { to: WORKFLOW.DRAFT, label: "Unpublish", primary: false },
        { to: WORKFLOW.SEO_VALIDATION, label: "Re-validate SEO", primary: false },
      ];
    default:
      return [{ to: WORKFLOW.IN_REVIEW, label: "Request review", primary: true }];
  }
}

export function toJsDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isScheduled(blog = {}) {
  if (deriveWorkflowState(blog) !== WORKFLOW.SCHEDULED) return false;
  const at = toJsDate(blog.publishAt);
  return Boolean(at) && at.getTime() > Date.now();
}

/** True when a scheduled post is due to go live (used by the publish job). */
export function isDueForPublish(blog = {}, now = Date.now()) {
  if (deriveWorkflowState(blog) !== WORKFLOW.SCHEDULED) return false;
  const at = toJsDate(blog.publishAt);
  return Boolean(at) && at.getTime() <= now;
}
