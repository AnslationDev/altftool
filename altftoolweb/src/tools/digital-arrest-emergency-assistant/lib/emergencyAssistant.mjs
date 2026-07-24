export const ACCESSED_DATE = "24 July 2026";

export const IMMEDIATE_STEPS = [
  {
    id: "pause",
    title: "Pause and steady yourself",
    detail:
      "Do not let a countdown, secrecy demand, or threat force a rushed decision.",
  },
  {
    id: "protect-money",
    title: "Do not pay or approve a transfer",
    detail:
      "Do not move money, scan a payment code, approve a collection request, or follow transfer instructions.",
  },
  {
    id: "protect-access",
    title: "Protect accounts and devices",
    detail:
      "Do not share passwords, authentication codes, payment secrets, your screen, or remote device access.",
  },
  {
    id: "leave-call",
    title: "Leave the call when safely possible",
    detail:
      "You do not have to remain visually available. If someone is physically nearby or you feel unsafe, move to a safer place.",
  },
  {
    id: "verify",
    title: "Verify through an independent channel",
    detail:
      "Use an official, separately published channel—not any detail, link, or transfer destination supplied by the caller.",
  },
  {
    id: "preserve",
    title: "Preserve original evidence",
    detail:
      "Keep original messages, emails, files, screenshots, recordings, and transaction records. Do not edit or delete the originals.",
  },
  {
    id: "prepare-report",
    title: "Prepare an official report",
    detail:
      "Type cybercrime.gov.in into your browser yourself when ready. This tool does not open or submit the report.",
  },
];

export const EVIDENCE_TYPES = [
  {
    id: "screenshots",
    label: "Screenshots",
    detail: "Call screen, profile, messages, threats, or payment instructions.",
  },
  {
    id: "recordings",
    label: "Recordings",
    detail: "Original audio or video already captured safely and lawfully.",
  },
  {
    id: "chat-export",
    label: "Chat transcript or export",
    detail: "Keep the original conversation and any exported copy.",
  },
  {
    id: "email",
    label: "Original email",
    detail: "Keep the complete message and attachments, not only a screenshot.",
  },
  {
    id: "transaction",
    label: "Transaction record",
    detail: "Receipt, statement, reference, beneficiary, or merchant details.",
  },
  {
    id: "addresses",
    label: "Web or profile addresses",
    detail: "Record them as text without opening unfamiliar destinations.",
  },
  {
    id: "documents",
    label: "Files or documents received",
    detail: "Keep originals untouched and note where they came from.",
  },
  {
    id: "timeline",
    label: "Written timeline",
    detail: "Sequence of calls, claims, demands, actions, and approximate times.",
  },
];

export const CHANNEL_OPTIONS = [
  { value: "", label: "Not recorded" },
  { value: "voice-call", label: "Voice call" },
  { value: "video-call", label: "Video call" },
  { value: "messaging", label: "Messaging app" },
  { value: "email", label: "Email" },
  { value: "mixed", label: "More than one channel" },
  { value: "other", label: "Other" },
];

export const TRANSFER_OPTIONS = [
  { value: "", label: "Not recorded" },
  { value: "none", label: "No transfer made" },
  { value: "attempted", label: "Attempted but not completed" },
  { value: "completed", label: "Transfer completed" },
  { value: "unsure", label: "Unsure" },
];

export const INCIDENT_FIELDS = [
  {
    id: "incidentTime",
    label: "Approximate date and time",
    reportLabel: "Approximate date and time",
    type: "datetime-local",
    maxLength: 80,
  },
  {
    id: "channel",
    label: "Contact channel",
    reportLabel: "Contact channel",
    type: "select-channel",
  },
  {
    id: "claimedAgency",
    label: "Agency or organisation claimed",
    reportLabel: "Claimed agency or organisation",
    placeholder: "Record the exact name used",
    maxLength: 300,
  },
  {
    id: "claimedIdentity",
    label: "Name, role, rank, or case reference claimed",
    reportLabel: "Claimed identity or reference",
    placeholder: "Record exact wording where possible",
    maxLength: 500,
  },
  {
    id: "displayedIdentifier",
    label: "Displayed caller, account, or profile identifier",
    reportLabel: "Displayed identifier",
    placeholder: "Record what appeared on screen",
    maxLength: 500,
  },
  {
    id: "allegation",
    label: "What they alleged",
    reportLabel: "Allegation or story used",
    placeholder: "Parcel, account, relative, case, or other claim",
    maxLength: 3000,
    multiline: true,
  },
  {
    id: "demand",
    label: "What they demanded or instructed",
    reportLabel: "Demand or instruction",
    placeholder: "Money, secrecy, screen sharing, app installation, or other action",
    maxLength: 3000,
    multiline: true,
  },
  {
    id: "transferStatus",
    label: "Transfer status",
    reportLabel: "Transfer status",
    type: "select-transfer",
  },
  {
    id: "transactionDetails",
    label: "Transaction details, if relevant",
    reportLabel: "Transaction details",
    placeholder: "Amount, date, bank or merchant, beneficiary, and transaction reference",
    maxLength: 2000,
    multiline: true,
  },
  {
    id: "informationShared",
    label: "Information, access, or files shared",
    reportLabel: "Information or access shared",
    placeholder: "Describe what was disclosed or accessed; do not add secrets here",
    maxLength: 3000,
    multiline: true,
  },
  {
    id: "timelineNotes",
    label: "Timeline and other notes",
    reportLabel: "Timeline and notes",
    placeholder: "Record events in order, including approximate times",
    maxLength: 6000,
    multiline: true,
    fullWidth: true,
  },
];

export const OFFICIAL_SOURCES = [
  {
    title: "I4C advisory on digital arrest",
    publisher: "Indian Cybercrime Coordination Centre, Ministry of Home Affairs",
    url: "https://cybercrime.gov.in/pdf/Advisories/ADVISORYTAU-ADV-003DigitalArrest06.03.2025.pdf",
    supports:
      "Real law enforcement does not arrest people digitally; Indian law has no concept of a digital arrest.",
  },
  {
    title: "Alert on blackmail and digital arrest impersonation",
    publisher: "Ministry of Home Affairs / Press Information Bureau",
    url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2020570",
    supports:
      "Documents impersonation patterns, forced video availability, fake office sets, and money demands.",
  },
  {
    title: "National Cybercrime Reporting Portal FAQ",
    publisher: "Government of India",
    url: "https://www.cybercrime.gov.in/webform/FAQ.aspx",
    supports:
      "Lists useful supporting material such as statements, receipts, emails, chats, screenshots, videos, images, and web addresses.",
  },
  {
    title: "Citizen manual for reporting other cybercrime",
    publisher: "Ministry of Home Affairs",
    url: "https://cybercrime.gov.in/UploadMedia/MHA-CitizenManualReportOtherCyberCrime-v10.pdf",
    supports:
      "Advises preserving original evidence and retaining incident and transaction details.",
  },
  {
    title: "Official address describing the digital arrest pattern",
    publisher: "Prime Minister’s Office",
    url: "https://www.pmindia.gov.in/en/news_updates/pms-address-in-the-115th-episode-of-mann-ki-baat/",
    supports:
      "States that investigative agencies do not conduct this kind of enquiry through a phone call or a video call and government agencies do not demand money in this manner.",
  },
];

const CHANNEL_LABELS = new Map(
  CHANNEL_OPTIONS.map((option) => [option.value, option.label]),
);
const TRANSFER_LABELS = new Map(
  TRANSFER_OPTIONS.map((option) => [option.value, option.label]),
);

export function createEmptyIncident() {
  return Object.fromEntries(INCIDENT_FIELDS.map((field) => [field.id, ""]));
}

export function createCheckState(items) {
  return Object.fromEntries(items.map((item) => [item.id, false]));
}

export function getPreparationSummary(incident, steps, evidence) {
  return {
    completedSteps: IMMEDIATE_STEPS.filter((item) => Boolean(steps[item.id])).length,
    totalSteps: IMMEDIATE_STEPS.length,
    notedEvidence: EVIDENCE_TYPES.filter((item) => Boolean(evidence[item.id])).length,
    totalEvidence: EVIDENCE_TYPES.length,
    recordedFields: INCIDENT_FIELDS.filter((field) =>
      String(incident[field.id] ?? "").trim(),
    ).length,
    totalFields: INCIDENT_FIELDS.length,
  };
}

export function hasPreparedContent(incident, steps, evidence) {
  return (
    Object.values(incident).some((value) => String(value ?? "").trim()) ||
    Object.values(steps).some(Boolean) ||
    Object.values(evidence).some(Boolean)
  );
}

function cleanValue(value, maxLength = 6000) {
  return String(value ?? "")
    .replace(/\r\n?/gu, "\n")
    .trim()
    .slice(0, maxLength);
}

function displayFieldValue(field, rawValue) {
  const value = cleanValue(rawValue, field.maxLength);
  if (!value) return "Not recorded";
  if (field.type === "select-channel") {
    return CHANNEL_LABELS.get(value) || value;
  }
  if (field.type === "select-transfer") {
    return TRANSFER_LABELS.get(value) || value;
  }
  return value;
}

function formatCreatedAt(createdAt) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toISOString();
}

export function buildEvidencePack({
  incident = createEmptyIncident(),
  steps = createCheckState(IMMEDIATE_STEPS),
  evidence = createCheckState(EVIDENCE_TYPES),
  createdAt = new Date(),
} = {}) {
  const lines = [
    "DIGITAL ARREST INCIDENT NOTES",
    `Created locally: ${formatCreatedAt(createdAt)}`,
    "",
    "PURPOSE AND LIMITS",
    "This file organises user-provided notes. It is not original evidence, a fraud verdict, legal advice, or an official report.",
    "Keep original messages, emails, recordings, screenshots, files, and transaction records untouched.",
    "",
    "OFFICIAL GUIDANCE",
    "Official I4C guidance says real law enforcement does not arrest people digitally and Indian law has no concept of a digital arrest.",
    "Official PMO guidance says investigative agencies do not conduct this kind of enquiry through a phone call or a video call, and government agencies do not demand money in this manner.",
    "",
    "IMMEDIATE CHECKLIST",
  ];

  for (const step of IMMEDIATE_STEPS) {
    lines.push(`[${steps[step.id] ? "done" : "not marked"}] ${step.title}`);
  }

  lines.push("", "INCIDENT SUMMARY");
  for (const field of INCIDENT_FIELDS) {
    lines.push(`${field.reportLabel}: ${displayFieldValue(field, incident[field.id])}`);
  }

  lines.push("", "EVIDENCE MANIFEST");
  for (const item of EVIDENCE_TYPES) {
    lines.push(`[${evidence[item.id] ? "available" : "not marked"}] ${item.label}`);
  }

  lines.push(
    "",
    "PRESERVATION REMINDER",
    "Do not edit or delete original evidence. Keep original context, filenames, timestamps, and source messages where available.",
    "This downloaded note is an organiser only; it does not replace the original material.",
    "",
    "OFFICIAL SOURCES",
  );

  for (const source of OFFICIAL_SOURCES) {
    lines.push(`${source.title} — ${source.publisher}`);
    lines.push(source.url);
    lines.push(`Accessed: ${ACCESSED_DATE}`);
  }

  return `${lines.join("\n")}\n`;
}

export function evidencePackFilename(createdAt = new Date()) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const stamp = Number.isNaN(date.getTime())
    ? "undated"
    : date.toISOString().slice(0, 10);
  return `digital-arrest-incident-notes-${stamp}.txt`;
}
