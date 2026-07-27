/**
 * Course caption and transcript coverage tracker.
 *
 * Coverage is reported two ways because they answer different questions:
 *   - by lesson count  = how many items are ticked off your production board
 *   - by runtime       = how much of the actual watch time a deaf or
 *                        hard-of-hearing learner can follow
 * Runtime coverage is the one that matters for accessibility, because ten short
 * captioned intros do not offset one uncaptioned 90-minute masterclass.
 *
 * Standards referenced (informational, not legal advice):
 *   - WCAG 2.2 Success Criterion 1.2.2 "Captions (Prerecorded)" — Level A.
 *     Captions are required for all prerecorded audio in synchronised media.
 *   - WCAG 2.2 Success Criterion 1.2.3 "Audio Description or Media Alternative
 *     (Prerecorded)" — Level A. A full text transcript is one accepted way to
 *     satisfy it.
 *
 * Effort estimates use the well-established multiple-of-runtime rule: captioning
 * work is quoted as a multiple of the media's own duration.
 */

/** WCAG 2.2 criteria this tracker maps to. */
export const WCAG_REFS = {
  captions: { sc: "1.2.2", name: "Captions (Prerecorded)", level: "A" },
  transcripts: { sc: "1.2.3", name: "Audio Description or Media Alternative (Prerecorded)", level: "A" },
};

/**
 * Effort presets, expressed as a multiple of the media runtime.
 * Cleaning up automatic speech recognition output is commonly budgeted at
 * 1.5–3x runtime; captioning from scratch by hand at 5–10x.
 */
export const CAPTION_EFFORT_PRESETS = [
  { id: "asr-light", label: "Light ASR cleanup (1.5x runtime)", multiplier: 1.5 },
  { id: "asr-full", label: "Full ASR edit and timing (3x runtime)", multiplier: 3 },
  { id: "manual", label: "Caption from scratch (6x runtime)", multiplier: 6 },
];

/** Producing a transcript from a finished caption file is mostly reformatting. */
export const TRANSCRIPT_EFFORT_PRESETS = [
  { id: "from-captions", label: "Export from captions (0.5x runtime)", multiplier: 0.5 },
  { id: "tidy", label: "Tidy into readable prose (1.5x runtime)", multiplier: 1.5 },
  { id: "scratch", label: "Type from scratch (4x runtime)", multiplier: 4 },
];

/** Longest single lesson the tracker will accept, in minutes. */
export const MAX_LESSON_MINUTES = 600;

/** Widest sensible effort multiplier. */
export const MIN_MULTIPLIER = 0.1;
export const MAX_MULTIPLIER = 20;

const round1 = (value) => Math.round(value * 10) / 10;

/** "1h 24m" from a minute count. */
export function formatMinutes(totalMinutes) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * @param {{lessons: Array, captionMultiplier: number, transcriptMultiplier: number}} input
 * @returns {{error: string} | object}
 */
export function computeCoverage({ lessons, captionMultiplier, transcriptMultiplier } = {}) {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return { error: "Add at least one lesson to track coverage." };
  }

  const capMult = Number(captionMultiplier);
  const traMult = Number(transcriptMultiplier);
  if (!Number.isFinite(capMult) || !Number.isFinite(traMult)) {
    return { error: "Effort multipliers must be numbers." };
  }
  if (
    capMult < MIN_MULTIPLIER ||
    capMult > MAX_MULTIPLIER ||
    traMult < MIN_MULTIPLIER ||
    traMult > MAX_MULTIPLIER
  ) {
    return {
      error: `Effort multipliers must be between ${MIN_MULTIPLIER}x and ${MAX_MULTIPLIER}x the runtime.`,
    };
  }

  const rows = [];
  for (let index = 0; index < lessons.length; index += 1) {
    const lesson = lessons[index] ?? {};
    const minutes = Number(lesson.minutes);
    const label = String(lesson.title ?? "").trim() || `Lesson ${index + 1}`;
    if (!Number.isFinite(minutes)) {
      return { error: `"${label}" needs a numeric duration in minutes.` };
    }
    if (minutes <= 0) {
      return { error: `"${label}" must be longer than zero minutes.` };
    }
    if (minutes > MAX_LESSON_MINUTES) {
      return { error: `"${label}" is longer than ${MAX_LESSON_MINUTES} minutes — split it into parts.` };
    }
    rows.push({
      id: lesson.id ?? `lesson-${index}`,
      title: label,
      minutes,
      captioned: Boolean(lesson.captioned),
      transcribed: Boolean(lesson.transcribed),
    });
  }

  const lessonCount = rows.length;
  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);

  const captionedRows = rows.filter((row) => row.captioned);
  const transcribedRows = rows.filter((row) => row.transcribed);
  const bothRows = rows.filter((row) => row.captioned && row.transcribed);

  const captionedMinutes = captionedRows.reduce((sum, row) => sum + row.minutes, 0);
  const transcribedMinutes = transcribedRows.reduce((sum, row) => sum + row.minutes, 0);

  const remainingCaptionMinutes = totalMinutes - captionedMinutes;
  const remainingTranscriptMinutes = totalMinutes - transcribedMinutes;

  // Effort = remaining runtime x the quoted multiple of runtime, converted to hours.
  const captionWorkHours = (remainingCaptionMinutes * capMult) / 60;
  const transcriptWorkHours = (remainingTranscriptMinutes * traMult) / 60;

  const captionRuntimePercent = round1((captionedMinutes / totalMinutes) * 100);
  const transcriptRuntimePercent = round1((transcribedMinutes / totalMinutes) * 100);
  const captionCountPercent = round1((captionedRows.length / lessonCount) * 100);
  const transcriptCountPercent = round1((transcribedRows.length / lessonCount) * 100);

  const captionsComplete = remainingCaptionMinutes === 0;
  const transcriptsComplete = remainingTranscriptMinutes === 0;

  const nextUp = rows
    .filter((row) => !row.captioned)
    .sort((a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title))
    .slice(0, 3);

  const summaryText = [
    "Course caption coverage",
    `Lessons: ${lessonCount} · Total runtime: ${formatMinutes(totalMinutes)}`,
    `Captions: ${captionedRows.length}/${lessonCount} lessons, ${captionRuntimePercent}% of runtime`,
    `Transcripts: ${transcribedRows.length}/${lessonCount} lessons, ${transcriptRuntimePercent}% of runtime`,
    `Both done: ${bothRows.length}/${lessonCount} lessons`,
    `Caption work left: ${formatMinutes(remainingCaptionMinutes)} of media, about ${round1(captionWorkHours)} h at ${capMult}x`,
    `Transcript work left: ${formatMinutes(remainingTranscriptMinutes)} of media, about ${round1(transcriptWorkHours)} h at ${traMult}x`,
    captionsComplete
      ? `Captions cover the full runtime (maps to WCAG 2.2 SC ${WCAG_REFS.captions.sc}, Level ${WCAG_REFS.captions.level}).`
      : `Captions do not yet cover the full runtime (WCAG 2.2 SC ${WCAG_REFS.captions.sc} is Level ${WCAG_REFS.captions.level}).`,
  ].join("\n");

  return {
    rows,
    lessonCount,
    totalMinutes,
    totalRuntimeLabel: formatMinutes(totalMinutes),
    captionedCount: captionedRows.length,
    transcribedCount: transcribedRows.length,
    bothCount: bothRows.length,
    captionedMinutes,
    transcribedMinutes,
    remainingCaptionMinutes,
    remainingTranscriptMinutes,
    captionRuntimePercent,
    transcriptRuntimePercent,
    captionCountPercent,
    transcriptCountPercent,
    captionWorkHours: round1(captionWorkHours),
    transcriptWorkHours: round1(transcriptWorkHours),
    totalWorkHours: round1(captionWorkHours + transcriptWorkHours),
    captionsComplete,
    transcriptsComplete,
    captionMultiplier: capMult,
    transcriptMultiplier: traMult,
    nextUp,
    summaryText,
  };
}
