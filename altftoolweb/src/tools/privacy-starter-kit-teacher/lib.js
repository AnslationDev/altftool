/**
 * Teacher Privacy Starter Kit — applicable actions and readiness scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Two things are being protected at once, and they need different actions:
 *   1. Student data. Under India's Digital Personal Data Protection Act 2023,
 *      anyone under 18 is a child, processing a child's personal data requires
 *      verifiable consent from a parent or lawful guardian, and tracking,
 *      behavioural monitoring and targeted advertising directed at children are
 *      not permitted. Schools are the data fiduciary; an individual teacher acts
 *      within that, which is why "use the school's account, not your personal
 *      one" is the single highest-weighted action here.
 *   2. The teacher's own boundaries. A personal mobile number shared with a
 *      class of parents cannot be unshared, and out-of-hours contact is the most
 *      common way teaching spills into private life.
 *
 * Actions are filtered to the platforms and setting you actually use, so the
 * plan is short. Weights rank them by consequence. The score is a readiness
 * percentage over the actions that apply to you, not a compliance certificate.
 */

/** Age at which DPDP Act 2023 stops treating a student as a child. */
export const CHILD_AGE_LIMIT = 18;

export const TRACKS = [
  { id: "studentData", label: "Student data" },
  { id: "accounts", label: "Accounts and devices" },
  { id: "boundaries", label: "Your own boundaries" },
];

export const CONTEXTS = [
  { id: "primary", label: "Primary school", minorStudents: true },
  { id: "secondary", label: "Secondary or senior secondary", minorStudents: true },
  { id: "college", label: "College or university", minorStudents: false },
  { id: "tuition", label: "Private tuition or coaching", minorStudents: true },
  { id: "online", label: "Independent online teaching", minorStudents: true },
];

export const PLATFORMS = [
  { id: "classroom", label: "Google Classroom or Workspace for Education" },
  { id: "teams", label: "Microsoft Teams for Education" },
  { id: "lms", label: "A school LMS or ERP portal" },
  { id: "whatsapp", label: "WhatsApp groups with students or parents" },
  { id: "video", label: "Zoom, Meet or another video class tool" },
  { id: "sheets", label: "Spreadsheets of marks kept by me" },
  { id: "social", label: "A public social account used for teaching" },
];

/**
 * Action library. `platforms` limits an action to people using those tools;
 * `minorsOnly` limits it to settings where students are under 18.
 */
export const ACTIONS = [
  {
    id: "schoolAccount",
    track: "studentData",
    label: "Do all class work from the school-issued account, never a personal one",
    why: "The school is the data fiduciary. Student data in your personal account sits outside its controls, retention and deletion.",
    weight: 20,
  },
  {
    id: "consentRecord",
    track: "studentData",
    label: "Check the school holds parental consent for every tool you introduce",
    why: "Processing a child's data needs verifiable consent from a parent or guardian, and it is the school that must hold it.",
    weight: 18,
    minorsOnly: true,
  },
  {
    id: "noNewTools",
    track: "studentData",
    label: "Do not sign a class up for a new app without the school approving it first",
    why: "A free quiz app can be an unapproved transfer of a whole class's data to a third party.",
    weight: 16,
  },
  {
    id: "minimise",
    track: "studentData",
    label: "Collect only what you need: no home addresses, ID numbers or medical details in your own files",
    why: "Data you never collected cannot leak. Marks and attendance are enough for teaching.",
    weight: 14,
  },
  {
    id: "sheetSharing",
    track: "studentData",
    label: "Share mark sheets to named people only — never 'anyone with the link'",
    why: "Link sharing is the most common way a class list ends up indexed or forwarded.",
    weight: 16,
    platforms: ["sheets", "classroom", "teams", "lms"],
  },
  {
    id: "noPublicPhotos",
    track: "studentData",
    label: "Never post student faces, names or work publicly without written parental permission",
    why: "A photograph identifies a child. Consent for the classroom is not consent for the internet.",
    weight: 18,
    minorsOnly: true,
    platforms: ["social", "whatsapp"],
  },
  {
    id: "bcc",
    track: "studentData",
    label: "Email parents using BCC, or the platform's own messaging, so addresses stay private",
    why: "One To-field mistake exposes every parent's email to every other parent.",
    weight: 10,
  },
  {
    id: "gradeExport",
    track: "studentData",
    label: "Delete downloaded exports of marks and attendance once the term closes",
    why: "Old exports on a personal laptop are the copies nobody remembers to protect.",
    weight: 10,
    platforms: ["sheets", "lms"],
  },
  {
    id: "recordingPolicy",
    track: "studentData",
    label: "Tell the class when a session is recorded, and store recordings in the school's space",
    why: "Recorded lessons capture children's faces and voices and need the same controls as any other record.",
    weight: 12,
    platforms: ["video", "teams"],
  },
  {
    id: "mfa",
    track: "accounts",
    label: "Turn on two-factor authentication on the school account",
    why: "A compromised teacher account is a live door into every student record it can reach.",
    weight: 18,
  },
  {
    id: "deviceLock",
    track: "accounts",
    label: "Lock the laptop and phone with a PIN or biometric, with disk encryption on",
    why: "Most student-data loss is a lost or borrowed device, not an attacker.",
    weight: 14,
  },
  {
    id: "separateProfile",
    track: "accounts",
    label: "Keep a separate browser profile or user account for teaching",
    why: "It stops personal logins, bookmarks and autofill from appearing on a projected screen.",
    weight: 10,
  },
  {
    id: "screenShareHygiene",
    track: "accounts",
    label: "Close tabs, mute notifications and share a single window when projecting",
    why: "The classic leak is a message preview appearing while your screen is on the board.",
    weight: 10,
    platforms: ["video", "teams", "classroom"],
  },
  {
    id: "sharedComputer",
    track: "accounts",
    label: "Sign out of the staffroom or lab computer every time",
    why: "Shared machines keep sessions alive for whoever sits down next.",
    weight: 8,
  },
  {
    id: "workNumber",
    track: "boundaries",
    label: "Use a school number, a second SIM or a work app instead of your personal mobile",
    why: "A personal number given to one parent group cannot be taken back.",
    weight: 16,
  },
  {
    id: "groupAdmin",
    track: "boundaries",
    label: "Set class groups so only admins can post, and keep parents in a separate group",
    why: "It stops your number from becoming the after-hours help desk and limits who sees whose contact.",
    weight: 12,
    platforms: ["whatsapp"],
  },
  {
    id: "hours",
    track: "boundaries",
    label: "Publish reply hours and stick to them, including in the group description",
    why: "Written expectations are what make an unanswered 10pm message unremarkable.",
    weight: 10,
  },
  {
    id: "socialSeparation",
    track: "boundaries",
    label: "Keep personal social accounts private and do not accept student follow requests",
    why: "It removes the ambiguity for you and for them, and protects your own family's posts.",
    weight: 12,
    platforms: ["social"],
  },
  {
    id: "reportRoute",
    track: "boundaries",
    label: "Know the school's route for reporting a data mistake, and use it the same day",
    why: "Early disclosure is what keeps a mis-sent spreadsheet from becoming a breach investigation.",
    weight: 12,
  },
];

const ACTION_BY_ID = new Map(ACTIONS.map((action) => [action.id, action]));

export const LIMITS = { maxClasses: 40, maxPerClass: 200 };

export const BANDS = [
  { id: "strong", label: "Well protected", tone: "success", min: 85, advice: "Almost everything that applies to you is in place. Re-check when the school adopts a new tool." },
  { id: "good", label: "Mostly there", tone: "success", min: 65, advice: "Good base. The outstanding items below are short and mostly one-time settings changes." },
  { id: "partial", label: "Gaps worth closing", tone: "warning", min: 40, advice: "Start at the top of the list — the first two or three carry most of the risk." },
  { id: "thin", label: "Start here", tone: "danger", min: 0, advice: "Begin with the school account and two-factor authentication; they protect every student record at once." },
];

const byId = (list, id) => list.find((item) => item.id === id);

/**
 * Build the applicable plan and score readiness.
 *
 * @param {object} input
 * @param {string} input.context      id from CONTEXTS
 * @param {string[]} input.platforms  ids from PLATFORMS
 * @param {string[]} input.done       ids of actions already done
 * @param {number|string} input.classes    number of classes or sections taught
 * @param {number|string} input.perClass   students per class
 * @param {boolean} input.usesPersonalPhone
 * @returns {object} result, or { error }
 */
export function buildTeacherPlan({
  context,
  platforms = [],
  done = [],
  classes = 1,
  perClass = 30,
  usesPersonalPhone = false,
} = {}) {
  const setting = byId(CONTEXTS, context);
  if (!setting) return { error: "Choose the setting you teach in." };
  if (!Array.isArray(platforms)) return { error: "The list of platforms is unreadable." };
  if (!Array.isArray(done)) return { error: "The list of completed actions is unreadable." };
  if (platforms.some((id) => !byId(PLATFORMS, id))) return { error: "One of the platforms is not recognised." };
  if (done.some((id) => !ACTION_BY_ID.has(id))) return { error: "One of the completed actions is not in this kit." };

  const classCount = Number(classes);
  const perClassCount = Number(perClass);
  if (!Number.isFinite(classCount) || !Number.isFinite(perClassCount)) {
    return { error: "Class counts must be numbers." };
  }
  if (classCount < 1) return { error: "Enter at least one class." };
  if (classCount > LIMITS.maxClasses) return { error: `More than ${LIMITS.maxClasses} classes is out of range.` };
  if (perClassCount < 1) return { error: "Enter at least one student per class." };
  if (perClassCount > LIMITS.maxPerClass) return { error: `More than ${LIMITS.maxPerClass} students per class is out of range.` };

  const studentRecords = Math.round(classCount * perClassCount);

  const applicable = ACTIONS.filter((action) => {
    if (action.minorsOnly && !setting.minorStudents) return false;
    if (action.platforms && !action.platforms.some((id) => platforms.includes(id))) return false;
    if (action.id === "workNumber" && !usesPersonalPhone) return false;
    return true;
  });

  const completed = applicable.filter((action) => done.includes(action.id));
  const outstanding = applicable
    .filter((action) => !done.includes(action.id))
    .sort((a, b) => b.weight - a.weight);

  const applicableWeight = applicable.reduce((sum, action) => sum + action.weight, 0);
  const doneWeight = completed.reduce((sum, action) => sum + action.weight, 0);
  const score = applicableWeight > 0 ? Math.round((doneWeight / applicableWeight) * 100) : 100;
  const band = BANDS.find((item) => score >= item.min) || BANDS[BANDS.length - 1];

  const tracks = TRACKS.map((track) => {
    const all = applicable.filter((action) => action.track === track.id);
    const total = all.reduce((sum, action) => sum + action.weight, 0);
    const doneInTrack = all
      .filter((action) => done.includes(action.id))
      .reduce((sum, action) => sum + action.weight, 0);
    return {
      ...track,
      total,
      coverage: total > 0 ? Math.round((doneInTrack / total) * 100) : 100,
      outstanding: all.filter((action) => !done.includes(action.id)),
    };
  });

  return {
    setting,
    studentRecords,
    classCount,
    perClassCount,
    applicable,
    completed,
    outstanding,
    firstThree: outstanding.slice(0, 3),
    score,
    band,
    tracks,
    minorStudents: setting.minorStudents,
    usesPersonalPhone: Boolean(usesPersonalPhone),
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatTeacherPlan(result) {
  if (!result || result.error) return "";
  const lines = [
    "Teacher privacy starter kit",
    `Setting: ${result.setting.label}`,
    `Student records you handle: about ${result.studentRecords} (${result.classCount} classes x ${result.perClassCount})`,
    `Readiness: ${result.score}% — ${result.band.label}`,
    `Actions done: ${result.completed.length}/${result.applicable.length} that apply to you`,
  ];
  if (result.minorStudents) {
    lines.push(
      "",
      "Because your students are under 18, processing their data needs verifiable parental consent, held by the school.",
    );
  }
  if (result.outstanding.length > 0) {
    lines.push("", "Outstanding, highest impact first:");
    result.outstanding.forEach((action) => lines.push(`- [${action.track}] ${action.label}`));
  }
  lines.push("", result.band.advice);
  return lines.join("\n");
}
