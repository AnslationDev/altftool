/**
 * Meeting invite wording builder.
 *
 * Composes the invite text and does the two pieces of arithmetic that actually
 * decide whether a meeting works: does the time-boxed agenda fit inside the slot,
 * and what does the slot cost in paid attendee time.
 *
 * Pure module — no React, no DOM, no clock reads.
 */

/** Calendar slots people actually book. */
export const DURATION_OPTIONS = [15, 25, 30, 45, 50, 60, 90];

/** Leave the last slice of the meeting for wrap-up and actions rather than agenda items. */
export const WRAP_UP_RESERVE_RATIO = 0.1;

/** Above this headcount a working meeting turns into a broadcast; split it or record it instead. */
export const LARGE_MEETING_THRESHOLD = 8;

export const MEETING_TYPES = [
  {
    id: "decision",
    label: "Decision",
    opener: "We need a decision on",
    close: "If you cannot attend, send your position in writing beforehand and I will represent it.",
    agenda: [
      ["Context and constraints", 5],
      ["Options on the table", 15],
      ["Discussion", 15],
      ["Decision and owner", 10],
    ],
    needsDecisionOwner: true,
  },
  {
    id: "review",
    label: "Review / status",
    opener: "This is a working review of",
    close: "Come with your section updated in the doc; we will not read out slides.",
    agenda: [
      ["Numbers since last review", 10],
      ["What slipped and why", 15],
      ["Risks for next period", 10],
      ["Actions", 5],
    ],
    needsDecisionOwner: false,
  },
  {
    id: "brainstorm",
    label: "Brainstorm / working session",
    opener: "We are generating options for",
    close: "No judging ideas in the first half — we diverge, then converge.",
    agenda: [
      ["Frame the problem", 10],
      ["Silent idea generation", 10],
      ["Share and cluster", 20],
      ["Pick what to prototype", 10],
    ],
    needsDecisionOwner: false,
  },
  {
    id: "kickoff",
    label: "Project kickoff",
    opener: "We are starting work on",
    close: "Bring questions about scope now — it is cheaper to change today than in week six.",
    agenda: [
      ["Why this project, why now", 10],
      ["Scope and non-goals", 15],
      ["Roles and owners", 10],
      ["Milestones and first checkpoint", 10],
    ],
    needsDecisionOwner: true,
  },
  {
    id: "oneonone",
    label: "One-to-one",
    opener: "Regular one-to-one covering",
    close: "Your topics come first — add anything you want to cover to the shared doc.",
    agenda: [
      ["Your topics", 15],
      ["Progress and blockers", 10],
      ["Feedback both ways", 5],
    ],
    needsDecisionOwner: false,
  },
  {
    id: "retro",
    label: "Retrospective",
    opener: "Retrospective on",
    close: "Blameless: we talk about the system and the process, not about people.",
    agenda: [
      ["What went well", 10],
      ["What did not", 15],
      ["Experiments for next cycle", 15],
      ["Owners and dates", 5],
    ],
    needsDecisionOwner: false,
  },
];

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MINUTES_PER_DAY = 1440;

export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

const HOUR_FORMAT = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

/** Render minutes-since-midnight as "9:30 am". Wraps past midnight. */
export function formatMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const stamp = Date.UTC(2000, 0, 1, 0, wrapped);
  return HOUR_FORMAT.format(new Date(stamp)).toLowerCase();
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso) {
  if (typeof iso !== "string" || !DATE_PATTERN.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return "";
  return DAY_FORMAT.format(date);
}

/** "Name — 20" or "Name" per line; minutes default to 10. */
export function parseAgenda(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^(.*?)[\s]*[—:|-]\s*(\d{1,3})\s*(?:m|min|mins|minutes)?$/i.exec(line);
      if (match && match[1].trim()) {
        return { label: match[1].trim(), minutes: Number(match[2]) };
      }
      return { label: line.replace(/[—:|-]\s*$/, "").trim(), minutes: 10 };
    })
    .filter((item) => item.label);
}

export function splitPeople(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clean(value) {
  return typeof value === "string" ? value.trim().replace(/[ \t]+/g, " ") : "";
}

/**
 * Build the invite.
 * Returns { subject, body, agendaTotal, ... } or { error }.
 */
export function buildInvite(input = {}) {
  const topic = clean(input.topic);
  if (!topic) return { error: "Add the meeting topic — it becomes the subject line." };

  const objective = clean(input.objective);
  if (!objective) {
    return { error: "State the objective: what must be true when the meeting ends." };
  }

  const duration = Number(input.durationMinutes);
  if (!Number.isFinite(duration) || duration <= 0) {
    return { error: "Meeting length must be a positive number of minutes." };
  }
  if (duration > 480) {
    return { error: "Keep the slot under 8 hours — split a longer session into separate invites." };
  }

  const startMinutes = parseTimeToMinutes(input.startTime);
  if (startMinutes === null) return { error: "Enter a start time as HH:MM in 24-hour form." };

  const dateLabel = formatDate(input.dateIso);
  if (!dateLabel) return { error: "Pick a valid meeting date." };

  const type = MEETING_TYPES.find((item) => item.id === clean(input.typeId)) || MEETING_TYPES[0];

  const required = splitPeople(input.required);
  const optional = splitPeople(input.optional);
  if (required.length === 0) {
    return { error: "List at least one required attendee." };
  }

  const agenda = parseAgenda(input.agenda);
  if (agenda.length === 0) {
    return { error: "Add at least one agenda line — an invite without an agenda gets declined." };
  }
  if (agenda.some((item) => !Number.isFinite(item.minutes) || item.minutes <= 0)) {
    return { error: "Every agenda item needs a positive number of minutes." };
  }

  const hourlyRate = Number(input.hourlyRate);
  const rate = Number.isFinite(hourlyRate) && hourlyRate >= 0 ? hourlyRate : 0;

  const agendaTotal = agenda.reduce((sum, item) => sum + item.minutes, 0);
  const reserve = Math.round(duration * WRAP_UP_RESERVE_RATIO);
  const usable = duration - reserve;
  const unallocated = duration - agendaTotal;
  const overbooked = agendaTotal > usable;

  // Walk the clock so each agenda line carries its own start time.
  let cursor = startMinutes;
  const timedAgenda = agenda.map((item) => {
    const from = cursor;
    cursor += item.minutes;
    return {
      label: item.label,
      minutes: item.minutes,
      fromLabel: formatMinutes(from),
      toLabel: formatMinutes(cursor),
    };
  });

  const endMinutes = startMinutes + duration;
  const attendeeCount = required.length + optional.length;
  // Cost of the slot = heads x hours x blended hourly rate.
  const costEstimate = attendeeCount * (duration / 60) * rate;
  const personMinutes = attendeeCount * duration;

  const location = clean(input.location) || "Video call — link in the calendar entry";
  const preRead = clean(input.preRead);
  const decisionOwner = clean(input.decisionOwner);

  const subject = `${type.label}: ${topic} (${duration} min)`;

  const bodyLines = [];
  bodyLines.push(`${type.opener} ${topic}.`);
  bodyLines.push("");
  bodyLines.push(`Objective: ${objective}`);
  bodyLines.push(
    `When: ${dateLabel}, ${formatMinutes(startMinutes)}–${formatMinutes(endMinutes)} (${duration} min)`,
  );
  bodyLines.push(`Where: ${location}`);
  if (decisionOwner) bodyLines.push(`Decision owner: ${decisionOwner}`);
  bodyLines.push("");
  bodyLines.push("Agenda");
  timedAgenda.forEach((item) => {
    bodyLines.push(`  ${item.fromLabel}–${item.toLabel} · ${item.label} (${item.minutes} min)`);
  });
  bodyLines.push("");
  if (preRead) {
    bodyLines.push(`Before the meeting: ${preRead}`);
    bodyLines.push("");
  }
  bodyLines.push(`Required: ${required.join(", ")}`);
  if (optional.length > 0) bodyLines.push(`Optional: ${optional.join(", ")}`);
  bodyLines.push("");
  bodyLines.push(type.close);

  const checklist = [
    { label: "Objective states what must be true at the end", ok: objective.length >= 20 },
    { label: "Every agenda item is time-boxed", ok: true },
    { label: "Agenda fits the slot with wrap-up time left", ok: !overbooked },
    { label: "Required and optional attendees are separated", ok: optional.length > 0 },
    { label: "A pre-read or preparation ask is included", ok: Boolean(preRead) },
    {
      label: "A named decision owner is given",
      ok: !type.needsDecisionOwner || Boolean(decisionOwner),
    },
    {
      label: `Working group of ${LARGE_MEETING_THRESHOLD} people or fewer`,
      ok: attendeeCount <= LARGE_MEETING_THRESHOLD,
    },
  ];

  return {
    subject,
    body: bodyLines.join("\n"),
    typeLabel: type.label,
    dateLabel,
    startLabel: formatMinutes(startMinutes),
    endLabel: formatMinutes(endMinutes),
    duration,
    agenda: timedAgenda,
    agendaTotal,
    usable,
    reserve,
    unallocated,
    overbooked,
    overBy: Math.max(0, agendaTotal - usable),
    attendeeCount,
    requiredCount: required.length,
    optionalCount: optional.length,
    personMinutes,
    costEstimate,
    hourlyRate: rate,
    checklist,
    score: checklist.filter((item) => item.ok).length,
    scoreMax: checklist.length,
  };
}
