/**
 * Resume Metadata Risk Explainer — logic module.
 *
 * Pure data + arithmetic. No React, no DOM, no clock reads.
 *
 * A CV is read twice: by a person, and by the file properties panel. This
 * catalogue lists what the second reading gives away, and how each submission
 * route changes it.
 */

/** Severity ladder: 1 / 3 / 6 so one "high" outranks two "medium". */
export const SEVERITY_WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });

export const SEVERITY_LABEL = Object.freeze({ low: "Low", medium: "Medium", high: "High" });

/**
 * Where the signal lives:
 *  - "fileprops"      → Office core/app properties or the PDF /Info dictionary.
 *  - "editingHistory" → tracked changes, comments and text hidden by formatting.
 *  - "filename"       → the name of the file you upload or attach.
 *  - "platform"       → the record the job platform keeps around your application.
 *  - "inference"      → conclusions drawn from the visible content; nothing removes these
 *                       except editing the CV.
 */
export const CARRIERS = Object.freeze([
  "fileprops",
  "editingHistory",
  "filename",
  "platform",
  "inference",
]);

/**
 * Submission routes.
 * `removes` lists the carriers that route genuinely clears.
 * `platformRecord` is true where an employer platform stores a candidate record
 * alongside the file.
 */
export const ROUTES = Object.freeze([
  {
    id: "docx-email",
    label: "Email the Word file to a recruiter",
    removes: [],
    platformRecord: false,
    note: "The recruiter gets your working document — properties, revisions and all — and can open File > Properties in one click.",
  },
  {
    id: "pdf-email",
    label: "Export a PDF and email that",
    removes: ["editingHistory"],
    platformRecord: false,
    note: "Comments, tracked changes and hidden text drop out of the printed view, but Word copies the Author and Title into the PDF properties.",
  },
  {
    id: "ats-upload",
    label: "Upload to an employer's application portal (ATS)",
    removes: [],
    platformRecord: true,
    note: "The system parses your CV into fields and keeps the original file on the candidate record, visible to the whole hiring team.",
  },
  {
    id: "easy-apply",
    label: "One-click apply from a job network",
    removes: [],
    platformRecord: true,
    note: "The stored CV is forwarded as-is, and your profile and application history travel with it.",
  },
  {
    id: "printed",
    label: "Print it and hand over paper",
    removes: ["fileprops", "editingHistory", "filename"],
    platformRecord: false,
    note: "Nothing digital survives — but everything a reader can infer from the words on the page still does.",
  },
]);

export const CATALOGUE = Object.freeze([
  {
    id: "author-field",
    group: "File properties",
    carrier: "fileprops",
    severity: "high",
    label: "Author field naming someone else",
    reveals:
      "The Author property holds the name registered in the copy of Office that created the file. If you started from a friend's CV, a paid writing service or an employer template, that name — not yours — is what a recruiter sees in Properties.",
    fix: "Open File > Info > Properties, set Author to your own name, and clear 'Last modified by'.",
  },
  {
    id: "company-field",
    group: "File properties",
    carrier: "fileprops",
    severity: "high",
    label: "Company property from a work laptop",
    reveals:
      "Corporate Office installs stamp the employer's name into the Company property, which tells the hiring company you wrote your CV on your current employer's equipment and time.",
    fix: "Write your CV on a personal device, or clear the Company property before sending.",
  },
  {
    id: "template-path",
    group: "File properties",
    carrier: "fileprops",
    severity: "medium",
    label: "Template path pointing at an internal server",
    reveals:
      "A document built from a company template can keep the template's UNC path, naming an internal file server and, by extension, your employer.",
    fix: "Copy your content into a blank document created from the default template.",
  },
  {
    id: "revision-editing-time",
    group: "File properties",
    carrier: "fileprops",
    severity: "medium",
    label: "Revision number and total editing time",
    reveals:
      "Office counts saves and accumulates minutes of editing, so a CV tailored to a role in seven minutes and one revision reads as generic once the properties are checked.",
    fix: "Rebuild the file for a fresh counter, or remove document properties before export.",
  },
  {
    id: "creation-date",
    group: "File properties",
    carrier: "fileprops",
    severity: "medium",
    label: "Creation date years before you applied",
    reveals:
      "CreationDate persists through edits, so a 2019 date on an application sent in 2026 shows the CV has been recycled rather than written for this role.",
    fix: "Start the tailored version in a new file so the date matches the application.",
  },
  {
    id: "last-printed",
    group: "File properties",
    carrier: "fileprops",
    severity: "low",
    label: "Last printed timestamp",
    reveals:
      "Office records when the document was last printed, which pairs awkwardly with a workday timestamp on a corporate printer.",
    fix: "Remove document properties and personal information before sharing.",
  },
  {
    id: "producer-app",
    group: "File properties",
    carrier: "fileprops",
    severity: "low",
    label: "Producer and application version",
    reveals:
      "The producing application and its version identify your operating system and whether you used a CV builder, which some reviewers read as a signal about the content.",
    fix: "Harmless on its own; cleared with the rest of the properties.",
  },
  {
    id: "tracked-changes-comments",
    group: "Edit history and hidden text",
    carrier: "editingHistory",
    severity: "high",
    label: "Tracked changes and reviewer comments",
    reveals:
      "Feedback like 'drop the gap year' or 'inflate this title' stays in the file with the reviewer's name attached until the changes are accepted and the comments deleted.",
    fix: "Accept all changes, delete all comments, then export a PDF.",
  },
  {
    id: "deleted-earlier-versions",
    group: "Edit history and hidden text",
    carrier: "editingHistory",
    severity: "medium",
    label: "Earlier wording still recoverable",
    reveals:
      "Rewritten job titles, removed employers and adjusted dates can remain in unaccepted revisions, so the previous version of your history is readable next to the new one.",
    fix: "Paste the final text into a clean document rather than editing the old one.",
  },
  {
    id: "white-text-keywords",
    group: "Edit history and hidden text",
    carrier: "editingHistory",
    severity: "high",
    label: "Invisible keyword stuffing",
    reveals:
      "White or zero-size text added to beat keyword filters is invisible on screen but comes out in full when the parser extracts the text — and reads as deliberate deception to the recruiter who sees the parsed version.",
    fix: "Delete it. Put genuine keywords in normal, visible sentences instead.",
  },
  {
    id: "custom-fields-notes",
    group: "Edit history and hidden text",
    carrier: "editingHistory",
    severity: "low",
    label: "Leftover custom properties and keywords",
    reveals:
      "Keywords, Category and Comments fields set by a template or a CV builder can carry marketing text or the name of the service that produced the file.",
    fix: "Clear the custom properties along with the standard ones.",
  },
  {
    id: "filename-target-company",
    group: "The filename",
    carrier: "filename",
    severity: "high",
    label: "Another employer's name in the filename",
    reveals:
      "Sending 'CV_Northwind_v3.pdf' to a different company shows exactly who else you are applying to and how many drafts you keep.",
    fix: "Use one neutral pattern for every application, such as 'Firstname-Lastname-CV.pdf'.",
  },
  {
    id: "filename-personal-details",
    group: "The filename",
    carrier: "filename",
    severity: "medium",
    label: "Personal details in the filename",
    reveals:
      "Names like 'Resume_1994_final.pdf' or one containing your full date of birth put age and identity details in front of a reviewer before the document opens.",
    fix: "Keep the filename to your name and the word CV or resume.",
  },
  {
    id: "ats-stored-original",
    group: "What the platform records",
    carrier: "platform",
    severity: "medium",
    label: "The original file kept on your candidate record",
    reveals:
      "Application systems parse the CV into structured fields and keep the uploaded file itself, so any property you left in it is stored with your record, not just read once.",
    fix: "Upload a clean export, because you cannot edit the stored copy afterwards.",
  },
  {
    id: "ats-retention-visibility",
    group: "What the platform records",
    carrier: "platform",
    severity: "medium",
    label: "Retention and who can see the record",
    reveals:
      "Candidate records, recruiter notes and rejection reasons persist inside that employer's system for a defined retention period and are usually visible to the whole hiring team, including for future roles.",
    fix: "Check the privacy notice for the retention period, and use your data-subject access or deletion rights if you want the record removed.",
  },
  {
    id: "profile-activity",
    group: "What the platform records",
    carrier: "platform",
    severity: "low",
    label: "Profile and activity attached to the application",
    reveals:
      "One-click applications carry your profile, its recent changes and your application history on that network alongside the CV.",
    fix: "Review your profile visibility settings before a burst of applications.",
  },
  {
    id: "graduation-dates-age",
    group: "What the content implies",
    carrier: "inference",
    severity: "high",
    label: "Dates that reveal your age",
    reveals:
      "Graduation years and a full employment history back to the 1990s let anyone estimate your age within a year or two, which is the main route to age bias in screening.",
    fix: "Show the most recent 10-15 years in detail and drop graduation years if you are concerned about age screening.",
  },
  {
    id: "work-email",
    group: "What the content implies",
    carrier: "inference",
    severity: "medium",
    label: "Contact details tied to your employer",
    reveals:
      "A work email address or desk number tells the reader you are job-hunting on company systems, where your employer can lawfully read the mailbox in most jurisdictions.",
    fix: "Use a personal address and mobile number on every application.",
  },
  {
    id: "locale-date-format",
    group: "What the content implies",
    carrier: "inference",
    severity: "low",
    label: "Language, spelling and date format",
    reveals:
      "Document language, spelling conventions and DD/MM versus MM/DD narrow down where you live and studied, sometimes contradicting the location you state.",
    fix: "Set the document language deliberately for the market you are applying in.",
  },
  {
    id: "portfolio-link-tracking",
    group: "What the content implies",
    carrier: "inference",
    severity: "low",
    label: "Trackable links in the document",
    reveals:
      "Shortened or tagged portfolio links let the destination record who opened them and when, and a per-application tag makes each recruiter's visit distinguishable.",
    fix: "Link directly to a plain URL you control if you would rather not create that trail.",
  },
]);

export const RISK_BANDS = Object.freeze([
  { id: "none", label: "Nothing left from your list", min: 0, max: 0, advice: "Nothing you ticked survives this submission route." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "The file says little beyond what you wrote in it." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Properties or the filename undercut the story your CV tells. Clean them before applying." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "A reviewer can see who wrote the file, when, and who else you are applying to. Rebuild the CV in a clean file." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "Hidden text and edit history are travelling with your application. Do not send this file." },
]);

/** Sum of weights across the whole catalogue — the 100% reference point. */
export const MAX_WEIGHT = CATALOGUE.reduce(
  (total, item) => total + SEVERITY_WEIGHT[item.severity],
  0,
);

export function getRoute(routeId) {
  return ROUTES.find((route) => route.id === routeId) || null;
}

/** Does this signal reach the reviewer through the chosen submission route? */
export function survivesRoute(item, route) {
  if (!item || !route) return false;
  if (item.carrier === "platform") return Boolean(route.platformRecord);
  if (item.carrier === "inference") return true;
  return !route.removes.includes(item.carrier);
}

function bandFor(score) {
  return (
    RISK_BANDS.find((band) => score >= band.min && score <= band.max) ||
    RISK_BANDS[RISK_BANDS.length - 1]
  );
}

/**
 * Score what a recruiter or application system can read beyond your words.
 *
 * score = 100 x (severity weight reaching the reviewer)
 *             / (severity weight of the whole catalogue)
 *
 * @param {{ selectedIds?: string[], routeId?: string }} input
 * @returns {{ score:number, band:object, ... }|{ error:string }}
 */
export function assessResumeRisk({ selectedIds = [], routeId = "pdf-email" } = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Selected signals must be a list of catalogue ids." };
  }
  const route = getRoute(routeId);
  if (!route) return { error: "Choose one of the listed submission routes." };

  const unique = Array.from(new Set(selectedIds.filter((id) => typeof id === "string")));
  const known = unique.map((id) => CATALOGUE.find((item) => item.id === id)).filter(Boolean);
  const unknownCount = unique.length - known.length;

  const surviving = [];
  const removed = [];
  known.forEach((item) => {
    if (survivesRoute(item, route)) surviving.push(item);
    else removed.push(item);
  });

  const survivingWeight = surviving.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );
  const selectedWeight = known.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );
  const score = MAX_WEIGHT > 0 ? Math.round((survivingWeight / MAX_WEIGHT) * 100) : 0;
  const removedShare =
    selectedWeight > 0
      ? Math.round(((selectedWeight - survivingWeight) / selectedWeight) * 100)
      : 0;

  const bySeverity = { high: 0, medium: 0, low: 0 };
  surviving.forEach((item) => {
    bySeverity[item.severity] += 1;
  });

  const actions = surviving
    .slice()
    .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
    .map((item) => ({ label: item.label, severity: item.severity, fix: item.fix }));

  return {
    score,
    band: bandFor(score),
    route,
    selectedCount: known.length,
    unknownCount,
    surviving,
    removed,
    survivingWeight,
    selectedWeight,
    maxWeight: MAX_WEIGHT,
    removedShare,
    bySeverity,
    actions,
  };
}

/** Catalogue grouped for display, in declaration order. */
export function groupedCatalogue() {
  const groups = [];
  CATALOGUE.forEach((item) => {
    let group = groups.find((entry) => entry.name === item.group);
    if (!group) {
      group = { name: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  });
  return groups;
}
