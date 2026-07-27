/**
 * Hearing aid notes tracker.
 *
 * A structured version of the notebook audiologists ask new wearers to keep during the
 * acclimatisation period. It records, per listening situation, which programme was used
 * and how clear and how comfortable it was, then reports which programme scores best in
 * each situation and which recurring problems are worth raising at a follow-up.
 *
 * Why these particular fields:
 *  - Situation, not just time of day: hearing aids are fitted with prescriptive targets
 *    (NAL-NL2, DSL v5) and verified with real-ear measurement, but programme preference
 *    in real environments is something only the wearer can report.
 *  - Clarity and comfort separately: a setting can be intelligible and still be
 *    unpleasantly sharp, and the fix for each is different.
 *  - Volume-wheel offset: consistently winding the volume up or down from the fitted
 *    setting is the single most useful thing to show an audiologist, because it points at
 *    prescribed gain rather than at programme choice.
 *  - Feedback whistling and own-voice complaints are common early fitting issues with
 *    specific remedies (dome or mould fit, venting, feedback-manager calibration), so they
 *    are flagged rather than averaged away.
 *
 * Nothing here diagnoses anything or replaces a fitting appointment.
 */

/** Rating scale for clarity and comfort. */
export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Volume-control offset from the fitted position, in steps. */
export const VOLUME_MIN = -4;
export const VOLUME_MAX = 4;

/** Notes needed in a situation-and-programme pair before it is recommended. */
export const MIN_NOTES_FOR_RECOMMENDATION = 2;

/** Notes needed before a recurring problem is flagged. */
export const MIN_NOTES_FOR_FLAG = 2;

/** Mean absolute volume offset that suggests the fitted gain is worth reviewing. */
export const VOLUME_OFFSET_FLAG = 1.5;

/** Typical acclimatisation window quoted at fitting, in weeks. */
export const ACCLIMATISATION_WEEKS = 6;

/** Standard listening situations. */
export const SITUATIONS = [
  { id: "quiet", label: "One-to-one in a quiet room" },
  { id: "group", label: "Group conversation" },
  { id: "restaurant", label: "Restaurant or cafe noise" },
  { id: "tv", label: "Television" },
  { id: "phone", label: "Phone call" },
  { id: "car", label: "In a car" },
  { id: "meeting", label: "Meeting or lecture" },
  { id: "music", label: "Live or recorded music" },
  { id: "outdoors", label: "Outdoors or windy" },
  { id: "loop", label: "Loop or telecoil venue" },
];

/** Default programme slots; wearers can rename them. */
export const DEFAULT_PROGRAMMES = [
  { id: "p1", label: "P1 Automatic" },
  { id: "p2", label: "P2 Speech in noise" },
  { id: "p3", label: "P3 Music" },
  { id: "p4", label: "P4 Telecoil / loop" },
];

/** Recurring problems worth raising, with what they usually point at. */
export const ISSUE_TYPES = [
  {
    id: "feedback",
    label: "Whistling or feedback",
    advice:
      "Recurring whistling usually points at dome or mould fit, wax in the ear canal, or a feedback manager that needs recalibrating at the clinic.",
  },
  {
    id: "ownvoice",
    label: "Own voice sounds boomy or odd",
    advice:
      "The occlusion effect is common in the first weeks and is usually addressed with venting, a different dome, or low-frequency gain adjustment.",
  },
  {
    id: "sharp",
    label: "Sounds harsh or too sharp",
    advice: "Persistent sharpness is normally a high-frequency gain or compression setting to review at follow-up.",
  },
  {
    id: "muffled",
    label: "Speech still muffled",
    advice:
      "If speech remains muffled after acclimatisation, ask whether real-ear measurement confirmed the fitting matched prescriptive targets.",
  },
];

function findLabel(list, id) {
  const found = list.find((entry) => entry.id === id);
  return found ? found.label : null;
}

/** Convert an ISO yyyy-mm-dd date to a whole day number for ordering. */
export function isoToDayNumber(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return Math.round(stamp / 86400000);
}

/**
 * Validate one note.
 * @returns {object} normalised note or { error }
 */
export function validateNote(
  { date, programmeId, situationId, clarity, comfort, volumeOffset = 0, issues = [], note = "" } = {},
  programmes = DEFAULT_PROGRAMMES,
) {
  const dayNumber = isoToDayNumber(date);
  if (dayNumber === null) return { error: "Pick a valid date for this note." };

  if (!programmes.some((programme) => programme.id === programmeId)) {
    return { error: "Choose which programme you were using." };
  }
  if (!SITUATIONS.some((situation) => situation.id === situationId)) {
    return { error: "Choose the listening situation." };
  }

  const clear = Number(clarity);
  const comf = Number(comfort);
  if (!Number.isFinite(clear) || clear < RATING_MIN || clear > RATING_MAX) {
    return { error: `Clarity must be between ${RATING_MIN} and ${RATING_MAX}.` };
  }
  if (!Number.isFinite(comf) || comf < RATING_MIN || comf > RATING_MAX) {
    return { error: `Comfort must be between ${RATING_MIN} and ${RATING_MAX}.` };
  }

  const volume = Number(volumeOffset);
  if (!Number.isFinite(volume) || volume < VOLUME_MIN || volume > VOLUME_MAX) {
    return { error: `Volume offset must be between ${VOLUME_MIN} and ${VOLUME_MAX} steps.` };
  }

  const validIssues = Array.isArray(issues)
    ? issues.filter((id) => ISSUE_TYPES.some((issue) => issue.id === id))
    : [];

  return {
    id: `${date}-${situationId}-${programmeId}`,
    date: String(date),
    dayNumber,
    programmeId,
    situationId,
    clarity: clear,
    comfort: comf,
    score: (clear + comf) / 2,
    volumeOffset: volume,
    issues: validIssues,
    note: String(note).slice(0, 300),
  };
}

function mean(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * For each situation, the mean score of every programme used in it and the best one.
 * @returns {object[]} one row per situation that has any notes
 */
export function bestProgrammePerSituation(notes, programmes = DEFAULT_PROGRAMMES) {
  if (!Array.isArray(notes) || notes.length === 0) return [];

  return SITUATIONS.map((situation) => {
    const inSituation = notes.filter((note) => note.situationId === situation.id);
    if (inSituation.length === 0) return null;

    const perProgramme = programmes
      .map((programme) => {
        const rows = inSituation.filter((note) => note.programmeId === programme.id);
        if (rows.length === 0) return null;
        return {
          programmeId: programme.id,
          label: programme.label,
          count: rows.length,
          meanScore: mean(rows.map((row) => row.score)),
          meanClarity: mean(rows.map((row) => row.clarity)),
          meanComfort: mean(rows.map((row) => row.comfort)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.meanScore - a.meanScore || b.count - a.count);

    const eligible = perProgramme.filter((row) => row.count >= MIN_NOTES_FOR_RECOMMENDATION);
    const best = eligible.length > 0 ? eligible[0] : null;
    const runnerUp = eligible.length > 1 ? eligible[1] : null;

    return {
      situationId: situation.id,
      label: situation.label,
      noteCount: inSituation.length,
      perProgramme,
      best,
      margin: best && runnerUp ? best.meanScore - runnerUp.meanScore : null,
      needsMoreData: best === null,
    };
  }).filter(Boolean);
}

/**
 * Per-programme totals across all situations, including the average volume offset.
 */
export function programmeStats(notes, programmes = DEFAULT_PROGRAMMES) {
  if (!Array.isArray(notes) || notes.length === 0) return [];
  return programmes
    .map((programme) => {
      const rows = notes.filter((note) => note.programmeId === programme.id);
      if (rows.length === 0) return null;
      const offsets = rows.map((row) => row.volumeOffset);
      const meanOffset = mean(offsets);
      return {
        programmeId: programme.id,
        label: programme.label,
        count: rows.length,
        meanClarity: mean(rows.map((row) => row.clarity)),
        meanComfort: mean(rows.map((row) => row.comfort)),
        meanScore: mean(rows.map((row) => row.score)),
        meanVolumeOffset: meanOffset,
        volumeFlagged: rows.length >= 3 && Math.abs(meanOffset) >= VOLUME_OFFSET_FLAG,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count);
}

/**
 * Recurring problems worth raising at a follow-up.
 */
export function recurringIssues(notes) {
  if (!Array.isArray(notes) || notes.length === 0) return [];
  return ISSUE_TYPES.map((issue) => {
    const rows = notes.filter((note) => note.issues.includes(issue.id));
    return {
      id: issue.id,
      label: issue.label,
      advice: issue.advice,
      count: rows.length,
      flagged: rows.length >= MIN_NOTES_FOR_FLAG,
      dates: rows.map((row) => row.date),
    };
  }).filter((row) => row.count > 0);
}

/**
 * Overall summary across the whole log.
 * @returns {object} summary or { error }
 */
export function summariseNotes(notes, programmes = DEFAULT_PROGRAMMES) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return { error: "Add at least one note to see a summary." };
  }
  const sorted = notes.slice().sort((a, b) => a.dayNumber - b.dayNumber);
  const situationRows = bestProgrammePerSituation(sorted, programmes);
  const solved = situationRows.filter((row) => row.best !== null);
  const spanDays = sorted[sorted.length - 1].dayNumber - sorted[0].dayNumber + 1;

  return {
    count: sorted.length,
    spanDays,
    weeksLogged: spanDays / 7,
    meanClarity: mean(sorted.map((row) => row.clarity)),
    meanComfort: mean(sorted.map((row) => row.comfort)),
    meanScore: mean(sorted.map((row) => row.score)),
    meanVolumeOffset: mean(sorted.map((row) => row.volumeOffset)),
    situationsLogged: situationRows.length,
    situationsWithRecommendation: solved.length,
    situationsTotal: SITUATIONS.length,
    firstDate: sorted[0].date,
    lastDate: sorted[sorted.length - 1].date,
    sorted,
  };
}

/** Plain-text export to take to an appointment. */
export function notesToText(notes, summary, programmes = DEFAULT_PROGRAMMES) {
  if (!Array.isArray(notes) || notes.length === 0) return "Hearing aid notes — nothing logged yet.";
  const lines = ["Hearing aid notes", ""];
  if (summary && !summary.error) {
    lines.push(`Notes: ${summary.count} over ${summary.spanDays} days`);
    lines.push(`Mean clarity: ${summary.meanClarity.toFixed(1)} / ${RATING_MAX}`);
    lines.push(`Mean comfort: ${summary.meanComfort.toFixed(1)} / ${RATING_MAX}`);
    lines.push(`Mean volume offset: ${summary.meanVolumeOffset.toFixed(2)} steps`);
    lines.push("");
  }
  const best = bestProgrammePerSituation(notes, programmes);
  if (best.length > 0) {
    lines.push("Best programme by situation");
    for (const row of best) {
      lines.push(
        row.best
          ? `  ${row.label}: ${row.best.label} (${row.best.meanScore.toFixed(1)}/${RATING_MAX} over ${row.best.count} notes)`
          : `  ${row.label}: not enough notes yet (${row.noteCount})`,
      );
    }
    lines.push("");
  }
  const issues = recurringIssues(notes).filter((row) => row.flagged);
  if (issues.length > 0) {
    lines.push("Recurring issues to raise");
    for (const issue of issues) lines.push(`  ${issue.label} on ${issue.count} occasions`);
    lines.push("");
  }
  lines.push("Date | Programme | Situation | Clarity | Comfort | Volume | Note");
  for (const note of notes.slice().sort((a, b) => b.dayNumber - a.dayNumber)) {
    lines.push(
      [
        note.date,
        findLabel(programmes, note.programmeId) || note.programmeId,
        findLabel(SITUATIONS, note.situationId) || note.situationId,
        note.clarity,
        note.comfort,
        note.volumeOffset > 0 ? `+${note.volumeOffset}` : String(note.volumeOffset),
        note.note || "",
      ].join(" | "),
    );
  }
  lines.push("");
  lines.push("Self-recorded notes. Not a hearing test and not a substitute for an audiology appointment.");
  return lines.join("\n");
}
