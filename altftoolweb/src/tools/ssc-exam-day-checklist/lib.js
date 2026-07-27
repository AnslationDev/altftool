/**
 * SSC computer-based test (CBE) exam-day checklist and reporting planner.
 *
 * The rules encoded here come from the instructions the Staff Selection
 * Commission prints on the e-Admit Card and in its notices for computer-based
 * examinations:
 *
 *  - The admit card shows a reporting time and a gate closing time. The gate
 *    closes 30 minutes before the test begins and late candidates are refused.
 *  - Candidates must carry a printout of the admit card with a recent
 *    passport photograph pasted on it, one spare photograph, and an original
 *    valid photo identity document. Aadhaar is the preferred ID.
 *  - Biometric attendance — a thumb impression and a photograph — is captured
 *    at the centre, so the Commission asks candidates not to have mehandi or
 *    any coating on the fingers, which can make the scan fail.
 *  - Rough sheets are supplied at the desk and must be returned before leaving.
 *
 * Pure functions only: times are arguments, nothing is read from the clock.
 */

/** Minutes before the test starts when the centre gate closes (SSC rule). */
export const GATE_CLOSE_LEAD_MINUTES = 30;

/** Typical reporting lead printed on an SSC admit card, in minutes. */
export const TYPICAL_REPORTING_LEAD_MINUTES = 60;

/**
 * Common CBE shifts. Start times are editable defaults — the only authority is
 * the time printed on your own admit card, which changes from exam to exam.
 */
export const EXAM_SHIFTS = [
  { id: "morning", label: "Morning shift", start: "09:00" },
  { id: "afternoon", label: "Afternoon shift", start: "13:00" },
  { id: "evening", label: "Evening shift", start: "16:00" },
];

/** Photo identity documents SSC accepts in original at the centre. */
export const ACCEPTED_IDS = [
  "Aadhaar card or e-Aadhaar printout (preferred)",
  "Voter identity card",
  "PAN card",
  "Driving licence",
  "Passport",
  "School or college photo identity card",
  "Employer photo identity card, for government employees",
  "Ex-servicemen discharge book issued by the Ministry of Defence",
];

export const DEFAULTS = {
  travelMinutes: 40,
  bufferMinutes: 30,
  getReadyMinutes: 45,
};

const MAX_INTERVAL_MINUTES = 720;
const MINUTES_PER_DAY = 1440;
const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const CHECKLIST_GROUPS = [
  {
    id: "documents",
    title: "Documents you cannot enter without",
    items: [
      {
        id: "admit-card",
        label: "Printed admit card with a recent passport photograph pasted on it",
        required: true,
        note: "Print in colour on A4 and paste the same photograph you uploaded in the application.",
      },
      {
        id: "photo-id",
        label: "Original valid photo identity document",
        required: true,
        note: "Aadhaar is preferred; a photocopy or a photo of the ID on a phone is not accepted.",
      },
      {
        id: "spare-photo",
        label: "One spare passport photograph",
        required: true,
        note: "Kept for the attendance sheet if the invigilator asks for it.",
      },
      {
        id: "id-photocopy",
        label: "Photocopy of the photo ID",
        required: false,
      },
      {
        id: "pwbd",
        label: "Disability certificate and scribe request approval, if applicable",
        required: false,
        note: "Scribes must be arranged as per the Commission's approval, not on the day.",
      },
    ],
  },
  {
    id: "biometric",
    title: "Biometric and verification",
    items: [
      {
        id: "no-mehandi",
        label: "Fingers clean — no mehandi, henna or coating that can defeat the thumb scan",
        required: true,
        note: "SSC captures a biometric thumb impression at entry, and a failed scan means questions at the desk.",
      },
      {
        id: "signature-match",
        label: "Signature practised to match the one uploaded in the application",
        required: false,
      },
      {
        id: "photo-appearance",
        label: "Face clearly visible for the photograph captured at the centre",
        required: false,
      },
    ],
  },
  {
    id: "carry",
    title: "Carry with you",
    items: [
      { id: "pen", label: "Ball point pens (carry two)", required: true },
      {
        id: "water",
        label: "Transparent water bottle",
        required: false,
        note: "Rough sheets are given at the desk and must be handed back before you leave.",
      },
      { id: "spectacles", label: "Spectacles, if you use them", required: false },
      { id: "cash", label: "Small cash for local transport", required: false },
      { id: "medicines", label: "Essential medicines with prescription, if you need them", required: false },
    ],
  },
  {
    id: "before-leaving",
    title: "Before you leave home",
    items: [
      {
        id: "centre-address",
        label: "Centre address and gate confirmed on a map",
        required: true,
        note: "SSC centres are often in outer suburbs — check the route the previous evening.",
      },
      {
        id: "shift-time",
        label: "Shift, reporting time and gate closing time read off the admit card",
        required: true,
      },
      { id: "charge-phone", label: "Plan for where the phone will be left — it cannot come inside", required: false },
      { id: "dress", label: "Simple clothes, no metallic accessories that slow down frisking", required: false },
    ],
  },
];

export const PROHIBITED_ITEMS = [
  "Mobile phones, bluetooth devices and wireless earpieces, even switched off",
  "Watches of every kind, including smart and digital watches",
  "Calculators, log tables and any other calculating device",
  "Books, notes, printed matter and loose paper",
  "Cameras, pen drives and other electronic or storage devices",
  "Bags and purses — most centres provide no cloakroom",
];

export function shiftById(id) {
  return EXAM_SHIFTS.find((shift) => shift.id === id) || null;
}

export function itemKey(groupId, itemId) {
  return `${groupId}:${itemId}`;
}

/** "HH:MM" to minutes after midnight; NaN when the string is not a time. */
export function toMinutes(hhmm) {
  const match = typeof hhmm === "string" ? hhmm.match(HH_MM) : null;
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Minutes after midnight to a 24-hour string and a 12-hour label. */
export function fromMinutes(minutes) {
  const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const suffix = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return {
    minutes: wrapped,
    hhmm: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`,
    label: `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`,
    previousDay: minutes < 0,
  };
}

/**
 * Reporting plan worked backwards from the shift start.
 *
 *   gate closes = start − 30 minutes (SSC rule)
 *   be there by = gate closing − your buffer
 *   leave home  = arrival − travel time
 *   get up at   = departure − time to get ready
 */
export function buildTimeline({
  examStart,
  travelMinutes,
  bufferMinutes,
  getReadyMinutes,
  gateCloseLeadMinutes = GATE_CLOSE_LEAD_MINUTES,
}) {
  const start = toMinutes(examStart);
  if (Number.isNaN(start)) {
    return { error: "Enter the shift start time in 24-hour HH:MM form." };
  }

  const intervals = { travelMinutes, bufferMinutes, getReadyMinutes, gateCloseLeadMinutes };
  for (const raw of Object.values(intervals)) {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return { error: "Travel, buffer and getting-ready times must be zero or more minutes." };
    }
    if (value > MAX_INTERVAL_MINUTES) {
      return { error: `No single interval can be longer than ${MAX_INTERVAL_MINUTES} minutes.` };
    }
  }

  const gateClose = start - Number(gateCloseLeadMinutes);
  const arrive = gateClose - Number(bufferMinutes);
  const leaveHome = arrive - Number(travelMinutes);
  const wakeUp = leaveHome - Number(getReadyMinutes);

  return {
    examStart: fromMinutes(start),
    gateClose: fromMinutes(gateClose),
    arrive: fromMinutes(arrive),
    leaveHome: fromMinutes(leaveHome),
    wakeUp: fromMinutes(wakeUp),
    totalLeadMinutes: start - wakeUp,
    minutesBeforeStartAtCentre: start - arrive,
    startsPreviousDay: wakeUp < 0,
  };
}

/** Tick progress, with required items treated as entry-critical. */
export function checklistReadiness(checked = {}) {
  const items = CHECKLIST_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ ...item, key: itemKey(group.id, item.id) })),
  );
  if (items.length === 0) return { error: "The checklist has no items." };

  const done = items.filter((item) => checked[item.key]);
  const required = items.filter((item) => item.required);
  const blocking = required.filter((item) => !checked[item.key]);

  return {
    totalItems: items.length,
    doneItems: done.length,
    requiredItems: required.length,
    requiredDone: required.length - blocking.length,
    percent: (done.length / items.length) * 100,
    blocking: blocking.map((item) => item.label),
    ready: blocking.length === 0,
  };
}
