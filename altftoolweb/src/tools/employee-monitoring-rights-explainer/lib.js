/**
 * Employee Monitoring Rights Explainer — logic module.
 *
 * Pure logic for three things:
 *  1. Scoring how much of an employee's working life a chosen set of monitoring
 *     practices actually captures.
 *  2. Scoring how much the employer has disclosed about it, against the items a
 *     workable monitoring notice normally covers.
 *  3. Assembling a written request an employee can send to HR, built only from
 *     the practices and gaps selected.
 *
 * This is an explainer, not legal advice. Employment law, data protection law and
 * your contract decide what is permissible in your situation; speak to a qualified
 * employment lawyer or your union before acting on anything here.
 */

/* ---------------------------------------------------------------------------
 * The legal backdrop, described rather than advised
 * ------------------------------------------------------------------------- */

export const LEGAL_ANCHORS = [
  {
    id: "dpdp",
    name: "Digital Personal Data Protection Act, 2023 (India)",
    detail:
      "Treats the employer as a Data Fiduciary for personal data it processes. Section 7 lists employment as a legitimate use, so consent is not always the basis, but the duties of purpose limitation, accuracy, security safeguards, breach notification and erasure once the purpose is served still apply.",
  },
  {
    id: "it-act",
    name: "Information Technology Act, 2000 and the SPDI Rules, 2011",
    detail:
      "Section 43A requires reasonable security practices for sensitive personal data, and the 2011 rules expect a published privacy policy covering what is collected and why. Section 72A penalises disclosure of information in breach of a lawful contract.",
  },
  {
    id: "puttaswamy",
    name: "K. S. Puttaswamy v. Union of India (2017)",
    detail:
      "The Supreme Court held privacy to be a fundamental right under Article 21. It binds the State directly; its effect on a private employer runs through statute, contract and how courts read reasonableness, rather than as a direct claim.",
  },
  {
    id: "gdpr",
    name: "GDPR Article 88 and EDPB guidance (if you work for an EU entity)",
    detail:
      "Monitoring must be necessary and proportionate to a specific purpose, with a transparency notice and usually a data protection impact assessment. Consent from an employee is treated as rarely freely given because of the imbalance of power.",
  },
];

/* ---------------------------------------------------------------------------
 * Monitoring practices
 * ------------------------------------------------------------------------- */

/**
 * Intrusiveness weights run 1 to 5 and describe how much of a person's life the
 * practice can capture, not whether it is lawful. `crossesBoundary` marks
 * practices that can reach beyond work time or work equipment.
 */
export const PRACTICES = [
  {
    id: "email-logs",
    label: "Work email and chat retention",
    weight: 2,
    crossesBoundary: false,
    sees: "Every message sent or received on company systems, usually retained for years and searchable during investigations and litigation holds.",
  },
  {
    id: "web-proxy",
    label: "Web proxy or DNS filtering",
    weight: 2,
    crossesBoundary: false,
    sees: "Which sites you visit on the corporate network or VPN, with timestamps. Health, financial and job-search browsing shows up here like anything else.",
  },
  {
    id: "endpoint-agent",
    label: "Endpoint agent or DLP on the laptop",
    weight: 3,
    crossesBoundary: false,
    sees: "Files opened and copied, USB use, uploads to personal cloud storage, and often the titles of documents and windows.",
  },
  {
    id: "screenshots",
    label: "Periodic screenshots",
    weight: 4,
    crossesBoundary: false,
    sees: "Whatever is on screen at capture time, including personal messages open in another tab and anything a colleague shares with you.",
  },
  {
    id: "keystrokes",
    label: "Keystroke logging",
    weight: 5,
    crossesBoundary: true,
    sees: "Everything typed on the device, which can include passwords for personal accounts if you ever sign into one on it.",
  },
  {
    id: "webcam",
    label: "Webcam capture or always-on video",
    weight: 5,
    crossesBoundary: true,
    sees: "Your home, the people in it, and the hours you are at the desk. The most contested practice in remote work.",
  },
  {
    id: "activity-score",
    label: "Productivity or activity scoring",
    weight: 3,
    crossesBoundary: false,
    sees: "Keyboard and mouse activity converted into an idle or active rating, often compared across a team and used in appraisals.",
  },
  {
    id: "location",
    label: "Location tracking on a company phone or vehicle",
    weight: 4,
    crossesBoundary: true,
    sees: "Where the device is, which outside working hours is where you are. Whether tracking pauses off-shift is the question that matters.",
  },
  {
    id: "calls",
    label: "Call recording",
    weight: 3,
    crossesBoundary: false,
    sees: "The content of calls, often kept for quality and dispute purposes. Whether the other party is told is a separate question.",
  },
  {
    id: "cctv",
    label: "CCTV in the workplace",
    weight: 2,
    crossesBoundary: false,
    sees: "Movement through the premises. Cameras in break areas, prayer rooms or washroom approaches are where objections usually arise.",
  },
  {
    id: "badge",
    label: "Badge and access-control logs",
    weight: 1,
    crossesBoundary: false,
    sees: "Entry and exit times per door, which doubles as an attendance and break-duration record.",
  },
  {
    id: "byod",
    label: "Mobile device management on your personal phone",
    weight: 5,
    crossesBoundary: true,
    sees: "Depending on the profile: installed apps, network details, location, and the ability to wipe the device. A work profile that only manages work apps is a materially different thing from full device enrolment.",
  },
  {
    id: "social",
    label: "Monitoring of your personal social media",
    weight: 4,
    crossesBoundary: true,
    sees: "What you post outside work, typically justified by brand or conduct policies. Scope and who reviews it are rarely written down.",
  },
];

export const MAX_PRACTICE_SCORE = PRACTICES.reduce((total, item) => total + item.weight, 0);

/* ---------------------------------------------------------------------------
 * Disclosure items
 * ------------------------------------------------------------------------- */

/** What a workable monitoring notice normally spells out. */
export const DISCLOSURE_ITEMS = [
  { id: "what", label: "Exactly what is monitored, tool by tool", weight: 3 },
  { id: "why", label: "The specific purpose each tool serves", weight: 3 },
  { id: "when", label: "Whether monitoring runs outside working hours", weight: 3 },
  { id: "who", label: "Who can view the data and under what approval", weight: 3 },
  { id: "retention", label: "How long each category is retained, and when it is deleted", weight: 2 },
  { id: "personal-device", label: "What happens on a personal device, and what a wipe removes", weight: 2 },
  { id: "decisions", label: "Whether the data feeds appraisals, discipline or automated decisions", weight: 3 },
  { id: "access", label: "How you can ask for a copy of what is held about you", weight: 2 },
  { id: "challenge", label: "How to challenge a reading or an inference you say is wrong", weight: 2 },
  { id: "contact", label: "A named contact or Data Protection Officer to write to", weight: 2 },
];

export const MAX_DISCLOSURE_SCORE = DISCLOSURE_ITEMS.reduce((total, item) => total + item.weight, 0);

/* ---------------------------------------------------------------------------
 * Questions worth asking
 * ------------------------------------------------------------------------- */

export const HR_QUESTIONS = [
  "Which specific tools are deployed on my device, and can I see the monitoring notice that covers them?",
  "Does any tool run outside my working hours, and does it pause when I am on leave?",
  "Who is able to view my data, and does viewing it require an approval or leave an audit trail?",
  "How long is each category kept, and what triggers deletion?",
  "Is any of this used in appraisal, promotion or disciplinary decisions, and is any decision automated?",
  "If a personal device is enrolled, exactly what can the company see, and what would a remote wipe remove?",
  "How do I request a copy of the data held about me, and how do I correct something that is wrong?",
  "Who is the named contact or Data Protection Officer for questions about this?",
];

/* ---------------------------------------------------------------------------
 * Pure functions
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Score how much a chosen set of practices captures.
 *
 * @param {{ practiceIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function scoreMonitoring({ practiceIds } = {}) {
  if (!Array.isArray(practiceIds)) {
    return { error: "Select the monitoring you know or believe is in place." };
  }
  const selected = new Set(practiceIds.filter((id) => typeof id === "string"));
  const matched = PRACTICES.filter((item) => selected.has(item.id));
  const score = matched.reduce((total, item) => total + item.weight, 0);
  const percent = MAX_PRACTICE_SCORE > 0 ? round2((score / MAX_PRACTICE_SCORE) * 100) : 0;
  const boundaryHits = matched.filter((item) => item.crossesBoundary);

  let band = "none";
  let summary = "Nothing selected. Tick what you know is deployed, and what you suspect but have not been told.";

  if (score === 0) {
    band = "none";
  } else if (percent >= 55) {
    band = "pervasive";
    summary =
      "This combination captures most of a working day and a good part of what surrounds it. Ask for the monitoring notice and the retention schedule in writing.";
  } else if (percent >= 30) {
    band = "high";
    summary =
      "Substantial coverage of activity and content. The questions that matter are purpose, retention and who can look.";
  } else if (percent >= 12) {
    band = "moderate";
    summary =
      "Typical of a managed corporate environment. Worth confirming retention periods and whether any of it feeds appraisal.";
  } else {
    band = "light";
    summary =
      "Light-touch, largely infrastructure logging. Still ask how long it is kept and who can search it.";
  }

  return {
    score,
    maxScore: MAX_PRACTICE_SCORE,
    percent,
    band,
    summary,
    matched,
    matchedCount: matched.length,
    totalPractices: PRACTICES.length,
    boundaryHits,
    boundaryCount: boundaryHits.length,
    boundaryNote:
      boundaryHits.length > 0
        ? `${boundaryHits.length} of the selected practices can reach beyond work equipment or work hours. Those are the ones to ask about first.`
        : "None of the selected practices reach beyond work equipment or work hours as described.",
  };
}

/**
 * Score how much the employer has actually disclosed.
 *
 * @param {{ disclosedIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function scoreTransparency({ disclosedIds } = {}) {
  if (!Array.isArray(disclosedIds)) {
    return { error: "Tick the things your employer has actually put in writing." };
  }
  const selected = new Set(disclosedIds.filter((id) => typeof id === "string"));
  const disclosed = DISCLOSURE_ITEMS.filter((item) => selected.has(item.id));
  const gaps = DISCLOSURE_ITEMS.filter((item) => !selected.has(item.id));
  const score = disclosed.reduce((total, item) => total + item.weight, 0);
  const percent = MAX_DISCLOSURE_SCORE > 0 ? round2((score / MAX_DISCLOSURE_SCORE) * 100) : 0;

  let band;
  let summary;
  if (percent >= 85) {
    band = "clear";
    summary = "Close to a complete notice. Keep a dated copy so you can tell if it changes.";
  } else if (percent >= 55) {
    band = "partial";
    summary = "Most of it is written down. Ask for the missing items rather than assuming a practice does not exist.";
  } else if (percent > 0) {
    band = "thin";
    summary = "More is happening than has been explained. A written request for the missing items is reasonable and routine.";
  } else {
    band = "none";
    summary = "Nothing has been disclosed. Asking for the monitoring notice is the first step, not an escalation.";
  }

  return {
    score,
    maxScore: MAX_DISCLOSURE_SCORE,
    percent,
    band,
    summary,
    disclosed,
    gaps,
    disclosedCount: disclosed.length,
    gapCount: gaps.length,
    totalItems: DISCLOSURE_ITEMS.length,
  };
}

/**
 * Build a written request covering the selected practices and disclosure gaps.
 *
 * @param {{ practiceIds?: string[], gapIds?: string[] }} input
 * @returns {object} { text }, or { error } for invalid input.
 */
export function buildInformationRequest({ practiceIds, gapIds } = {}) {
  if (!Array.isArray(practiceIds) || !Array.isArray(gapIds)) {
    return { error: "Select at least one monitoring practice before drafting a request." };
  }
  const practiceSet = new Set(practiceIds.filter((id) => typeof id === "string"));
  const gapSet = new Set(gapIds.filter((id) => typeof id === "string"));
  const practices = PRACTICES.filter((item) => practiceSet.has(item.id));
  const gaps = DISCLOSURE_ITEMS.filter((item) => gapSet.has(item.id));

  if (practices.length === 0) {
    return { error: "Select at least one monitoring practice before drafting a request." };
  }

  const lines = [
    "Subject: Request for the workplace monitoring notice and related details",
    "",
    "Hello,",
    "",
    "I would like to understand the monitoring that applies to my role, so that I can work within it. Could you please share the current monitoring notice or policy, and confirm the position on the following:",
    "",
    "Practices I understand to be in place:",
    ...practices.map((item) => `- ${item.label}`),
  ];

  if (gaps.length > 0) {
    lines.push(
      "",
      "Points I have not been able to find in writing:",
      ...gaps.map((item) => `- ${item.label}`),
    );
  }

  lines.push(
    "",
    "I am asking so that the position is documented for both of us, and I am happy to discuss it in a call as well. A written reply would be helpful for my own records.",
    "",
    "Thank you,",
  );

  return {
    text: lines.join("\n"),
    practiceCount: practices.length,
    gapCount: gaps.length,
  };
}
