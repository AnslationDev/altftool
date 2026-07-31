/**
 * Doctor visit preparation logic.
 *
 * Pure module — no React, no DOM, no clock reads. Dates arrive as ISO strings.
 * Informational only: it organises what you already know before an appointment.
 * It does not assess symptoms or suggest a diagnosis.
 */

/**
 * SOCRATES — the standard clinical mnemonic for taking a symptom history.
 * Answering these in advance is exactly what a clinician will ask for.
 */
export const SOCRATES_FIELDS = [
  { key: "site", letter: "S", label: "Site", prompt: "Where exactly is it? Point to one spot if you can." },
  { key: "onset", letter: "O", label: "Onset", prompt: "When did it start, and did it come on suddenly or slowly?" },
  { key: "character", letter: "C", label: "Character", prompt: "What does it feel like — sharp, dull, burning, cramping, tight?" },
  { key: "radiation", letter: "R", label: "Radiation", prompt: "Does it spread anywhere else?" },
  { key: "associations", letter: "A", label: "Associations", prompt: "What else happens with it — nausea, fever, breathlessness, rash?" },
  { key: "timeCourse", letter: "T", label: "Time course", prompt: "Is it constant or does it come and go? Worse at any time of day?" },
  { key: "exacerbating", letter: "E", label: "Exacerbating and relieving", prompt: "What makes it worse, and what has helped?" },
  { key: "severity", letter: "S", label: "Severity", prompt: "Score it 0 to 10, where 10 is the worst you can imagine." },
];

export const SEVERITY_MIN = 0;
export const SEVERITY_MAX = 10;

/**
 * Ask Me 3 — the three questions the patient-safety programme of the same name
 * recommends every patient leaves an appointment able to answer.
 */
export const ASK_ME_3 = [
  "What is my main problem?",
  "What do I need to do about it?",
  "Why is it important that I do this?",
];

/* A routine primary-care appointment is short — 10 minutes is the standard slot
   in the NHS and in most Indian OPD clinics. */
export const DEFAULT_APPOINTMENT_MINUTES = 10;
export const MIN_APPOINTMENT_MINUTES = 1;
export const MAX_APPOINTMENT_MINUTES = 120;

/* Most of the slot goes on the clinician's own history taking, examination,
   typing and prescribing. This tool assumes 40% of the slot is realistically
   available for your questions — a planning assumption, not a clinical rule. */
export const QUESTION_TIME_FRACTION = 0.4;

/* A question plus a useful answer takes roughly a minute. */
export const MINUTES_PER_QUESTION = 1;

export const PRIORITIES = [
  { id: "must", label: "Must ask today", rank: 0 },
  { id: "should", label: "Should ask if there is time", rank: 1 },
  { id: "nice", label: "Nice to know", rank: 2 },
];

/**
 * Symptoms that are usually treated as needing urgent assessment rather than a
 * routine appointment. This list mirrors widely published public-health advice
 * (including the FAST stroke signs); it is a prompt to seek help sooner, not a
 * diagnosis.
 */
export const RED_FLAGS = [
  { id: "chest-pain", label: "Chest pain or pressure, especially with sweating, nausea or arm/jaw pain" },
  { id: "fast-face", label: "Face drooping on one side" },
  { id: "fast-arm", label: "Weakness or numbness in one arm or leg" },
  { id: "fast-speech", label: "Speech suddenly slurred or garbled" },
  { id: "breathing", label: "Struggling to breathe or speak a full sentence" },
  { id: "thunderclap", label: "Sudden, severe headache that peaked within seconds" },
  { id: "vision", label: "Sudden loss of vision in one or both eyes" },
  { id: "coughing-blood", label: "Coughing up or vomiting blood" },
  { id: "black-stool", label: "Black tarry stool or blood in the stool" },
  { id: "severe-abdo", label: "Severe abdominal pain with a rigid or tender belly" },
  { id: "confusion", label: "New confusion, drowsiness, or a fit" },
  { id: "weight-loss", label: "Unexplained weight loss over recent months" },
  { id: "fever-rash", label: "High fever with a rash that does not fade under pressure" },
];

/* Red flags in this subset are conventionally treated as call-an-ambulance now,
   rather than book-an-earlier-appointment. */
export const EMERGENCY_FLAG_IDS = [
  "chest-pain",
  "fast-face",
  "fast-arm",
  "fast-speech",
  "breathing",
  "thunderclap",
  "vision",
  "coughing-blood",
  "black-stool",
  "confusion",
  "fever-rash",
  "severe-abdo",
];

/** Starter questions people commonly forget to ask. */
export const SUGGESTED_QUESTIONS = [
  { text: "What is the most likely cause, and what else could it be?", priority: "must" },
  { text: "What test are you ordering, and what would change if it is positive?", priority: "must" },
  { text: "What are the options apart from the one you are recommending?", priority: "should" },
  { text: "What side effects should make me stop this medicine and call you?", priority: "must" },
  { text: "How long before I should feel better, and what if I do not?", priority: "must" },
  { text: "Does this interact with anything else I take?", priority: "should" },
  { text: "Do I need a follow-up, and who books it?", priority: "should" },
  { text: "Is there a cheaper or generic version of this?", priority: "nice" },
  { text: "What should I avoid — food, alcohol, driving, exercise?", priority: "should" },
  { text: "Can you write the diagnosis down so I can read about it?", priority: "nice" },
];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, ms: probe.getTime() };
}

/** Whole days from the first date to the second. Null if either is unusable. */
export function daysBetween(fromIso, toIso) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (!from || !to) return null;
  const MS_PER_DAY = 86400000;
  return Math.round((to.ms - from.ms) / MS_PER_DAY);
}

/** How many questions realistically fit in an appointment of a given length. */
export function questionCapacity(appointmentMinutes) {
  if (!Number.isFinite(appointmentMinutes) || appointmentMinutes <= 0) return null;
  const available = appointmentMinutes * QUESTION_TIME_FRACTION;
  // If the rounded minutes shown to the user is 0 (the same rounding the UI
  // applies to questionMinutes), there is no time to floor up to 1 question —
  // otherwise the UI would show "1 question fits" next to "0 minutes yours".
  if (Math.round(available) === 0) return 0;
  const capacity = Math.floor(available / MINUTES_PER_QUESTION);
  return Math.max(1, capacity);
}

/** Human-readable duration from a number of days. */
export function describeDuration(days) {
  if (days === null || !Number.isFinite(days)) return null;
  if (days < 0) return null;
  if (days === 0) return "started today";
  if (days === 1) return "1 day";
  if (days < 14) return `${days} days`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  if (days < 730) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

/**
 * Build the appointment brief.
 * @returns {{error: string}|object}
 */
export function buildVisitBrief(input = {}) {
  const reason = clean(input.reason);
  if (!reason) {
    return { error: "Write the one-line reason for the visit — the thing you would say first." };
  }
  if (reason.length > 200) {
    return { error: "Keep the reason for the visit under 200 characters. Detail goes in the symptom summary." };
  }

  const appointmentMinutes = Number(input.appointmentMinutes);
  if (!Number.isFinite(appointmentMinutes)) {
    return { error: "Appointment length must be a number of minutes." };
  }
  if (appointmentMinutes < MIN_APPOINTMENT_MINUTES || appointmentMinutes > MAX_APPOINTMENT_MINUTES) {
    return {
      error: `Appointment length must be between ${MIN_APPOINTMENT_MINUTES} and ${MAX_APPOINTMENT_MINUTES} minutes.`,
    };
  }

  const appointmentDate = clean(input.appointmentDate);
  if (appointmentDate && !parseIsoDate(appointmentDate)) {
    return { error: "Appointment date must be a real date in YYYY-MM-DD form." };
  }

  const socrates = input.socrates && typeof input.socrates === "object" ? input.socrates : {};
  const onsetDate = clean(socrates.onsetDate);
  if (onsetDate && !parseIsoDate(onsetDate)) {
    return { error: "Symptom start date must be a real date in YYYY-MM-DD form." };
  }

  const hasSeverity = socrates.severity !== "" && socrates.severity !== null && socrates.severity !== undefined;
  const severity = hasSeverity ? Number(socrates.severity) : null;
  if (hasSeverity && (!Number.isFinite(severity) || severity < SEVERITY_MIN || severity > SEVERITY_MAX)) {
    return { error: `Severity must be a number from ${SEVERITY_MIN} to ${SEVERITY_MAX}.` };
  }

  let durationDays = null;
  if (onsetDate && appointmentDate) {
    durationDays = daysBetween(onsetDate, appointmentDate);
    if (durationDays === null || durationDays < 0) {
      return { error: "The symptom start date is after the appointment date. Check both dates." };
    }
  }

  const rawQuestions = Array.isArray(input.questions) ? input.questions : [];
  const questions = rawQuestions
    .map((question, index) => ({
      id: clean(question && question.id) || `q${index}`,
      text: clean(question && question.text),
      priority: PRIORITIES.some((p) => p.id === (question && question.priority)) ? question.priority : "should",
      order: index,
    }))
    .filter((question) => question.text);

  const rankOf = (priority) => {
    const found = PRIORITIES.find((p) => p.id === priority);
    return found ? found.rank : 1;
  };

  const ranked = [...questions]
    .sort((a, b) => rankOf(a.priority) - rankOf(b.priority) || a.order - b.order)
    .map((question, index) => ({ ...question, rank: index + 1 }));

  const capacity = questionCapacity(appointmentMinutes);
  const askToday = ranked.slice(0, capacity);
  const deferred = ranked.slice(capacity);
  const mustCount = ranked.filter((question) => question.priority === "must").length;

  const flagIds = Array.isArray(input.redFlags) ? input.redFlags.filter((id) => typeof id === "string") : [];
  const flags = RED_FLAGS.filter((flag) => flagIds.includes(flag.id));
  const emergencyFlags = flags.filter((flag) => EMERGENCY_FLAG_IDS.includes(flag.id));

  const socratesLines = SOCRATES_FIELDS.map((field) => {
    const value = field.key === "severity" ? (severity === null ? "" : `${severity}/10`) : clean(socrates[field.key]);
    return { ...field, value };
  });
  const socratesAnswered = socratesLines.filter((line) => line.value).length;
  const socratesCompleteness = Math.round((socratesAnswered / SOCRATES_FIELDS.length) * 100);

  const medicines = clean(input.medicines);
  const allergies = clean(input.allergies);
  const outcome = clean(input.desiredOutcome);

  const warnings = [];
  if (emergencyFlags.length > 0) {
    warnings.push(
      `You ticked ${emergencyFlags.length} sign${emergencyFlags.length > 1 ? "s" : ""} that public health services list as needing urgent assessment. Do not wait for this appointment — call your local emergency number or go to an emergency department now.`,
    );
  } else if (flags.length > 0) {
    warnings.push(
      "You ticked a symptom that is usually assessed sooner rather than later. Ring the clinic and ask whether the appointment should be brought forward.",
    );
  }
  if (mustCount > capacity) {
    warnings.push(
      `You have ${mustCount} must-ask questions but only about ${capacity} fit in ${appointmentMinutes} minutes. Ask for a double appointment or split them across two visits.`,
    );
  }
  if (socratesCompleteness < 50) {
    warnings.push("Less than half the symptom summary is filled in. The clinician will ask these anyway — answering them now saves minutes.");
  }
  if (!medicines) {
    warnings.push("List your current medicines and doses, including anything bought over the counter. It is the single most useful thing to bring.");
  }

  const briefLines = [
    "APPOINTMENT BRIEF",
    appointmentDate ? `Date: ${appointmentDate} (${appointmentMinutes} minutes)` : `Length: ${appointmentMinutes} minutes`,
    `Reason for visit: ${reason}`,
    "",
    "SYMPTOM SUMMARY (SOCRATES)",
    ...socratesLines
      .filter((line) => line.value)
      .map((line) => `  ${line.letter} — ${line.label}: ${line.value}`),
  ];
  if (durationDays !== null) {
    briefLines.push(`  Duration: ${describeDuration(durationDays)} (since ${onsetDate})`);
  }
  briefLines.push("");
  if (medicines) briefLines.push("CURRENT MEDICINES", `  ${medicines}`, "");
  if (allergies) briefLines.push("ALLERGIES", `  ${allergies}`, "");
  if (flags.length) {
    briefLines.push("SYMPTOMS I WAS TOLD TO MENTION", ...flags.map((flag) => `  - ${flag.label}`), "");
  }
  briefLines.push("QUESTIONS FOR TODAY");
  askToday.forEach((question, index) => {
    briefLines.push(`  ${index + 1}. ${question.text}`);
  });
  if (deferred.length) {
    briefLines.push("", "IF THERE IS TIME, OR NEXT VISIT");
    deferred.forEach((question, index) => {
      briefLines.push(`  ${index + 1}. ${question.text}`);
    });
  }
  briefLines.push("", "BEFORE I LEAVE I SHOULD BE ABLE TO ANSWER", ...ASK_ME_3.map((question) => `  - ${question}`));
  if (outcome) briefLines.push("", "WHAT I WANT FROM TODAY", `  ${outcome}`);

  return {
    reason,
    appointmentMinutes,
    appointmentDate: appointmentDate || null,
    capacity,
    questionMinutes: appointmentMinutes * QUESTION_TIME_FRACTION,
    totalQuestions: ranked.length,
    mustCount,
    askToday,
    deferred,
    socratesLines,
    socratesAnswered,
    socratesCompleteness,
    severity,
    durationDays,
    durationText: describeDuration(durationDays),
    flags,
    emergencyFlags,
    askMe3: ASK_ME_3,
    medicines,
    allergies,
    desiredOutcome: outcome,
    briefText: briefLines.join("\n"),
    warnings,
  };
}
