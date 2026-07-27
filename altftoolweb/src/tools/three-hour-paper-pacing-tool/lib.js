/**
 * Pacing planner for a fixed-duration written paper.
 *
 * The method is the standard mark-weighted time allocation taught in exam
 * technique guides: after subtracting a reading window and a final review
 * buffer, the remaining working time is divided across sections in
 * proportion to the marks each section carries ("a mark a minute" scaled
 * to the actual paper). Checkpoints are cumulative clock times.
 */

/** Standard length of a "three hour" board/university paper, in minutes. */
export const DEFAULT_DURATION_MINUTES = 180;

/**
 * CBSE and most Indian boards grant 15 minutes of reading time before
 * writing starts; used as the default reading window.
 */
export const DEFAULT_READING_MINUTES = 15;

/**
 * Exam-technique convention: keep roughly 5-10% of the paper for revision.
 * 10 minutes on a 180-minute paper is the common recommendation.
 */
export const DEFAULT_REVIEW_MINUTES = 10;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:MM" (24h) into minutes after midnight, or null when invalid. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format minutes-after-midnight back to "HH:MM", wrapping past midnight. */
export function formatClock(totalMinutes) {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Build the mark-weighted pacing plan.
 *
 * @param {object} input
 * @param {string} input.startTime        Exam start, "HH:MM" 24-hour.
 * @param {number} input.durationMinutes  Total paper length in minutes.
 * @param {number} input.readingMinutes   Reading window before writing.
 * @param {number} input.reviewMinutes    Review buffer kept at the end.
 * @param {Array<{name:string, marks:number, questions:number}>} input.sections
 * @returns {object} plan or { error }
 */
export function computePacingPlan({
  startTime,
  durationMinutes,
  readingMinutes,
  reviewMinutes,
  sections,
}) {
  const start = parseClock(startTime);
  if (start === null) return { error: "Enter the exam start time as HH:MM, e.g. 09:00." };

  const duration = Number(durationMinutes);
  const reading = Number(readingMinutes);
  const review = Number(reviewMinutes);

  if (!Number.isFinite(duration) || duration <= 0) {
    return { error: "Paper duration must be a positive number of minutes." };
  }
  if (duration > 600) return { error: "Paper duration looks too long — enter minutes, not seconds." };
  if (!Number.isFinite(reading) || reading < 0) {
    return { error: "Reading time cannot be negative." };
  }
  if (!Number.isFinite(review) || review < 0) {
    return { error: "Review buffer cannot be negative." };
  }

  const working = duration - reading - review;
  if (working <= 0) {
    return {
      error:
        "Reading time plus review buffer uses up the whole paper — reduce one of them so writing time remains.",
    };
  }

  if (!Array.isArray(sections) || sections.length === 0) {
    return { error: "Add at least one section with its marks." };
  }

  let totalMarks = 0;
  let totalQuestions = 0;
  for (const section of sections) {
    const marks = Number(section.marks);
    const questions = Number(section.questions);
    if (!section.name || String(section.name).trim() === "") {
      return { error: "Every section needs a name." };
    }
    if (!Number.isFinite(marks) || marks <= 0) {
      return { error: `Section "${section.name}" needs marks greater than zero.` };
    }
    if (!Number.isFinite(questions) || questions < 1 || !Number.isInteger(questions)) {
      return { error: `Section "${section.name}" needs a whole number of questions (at least 1).` };
    }
    totalMarks += marks;
    totalQuestions += questions;
  }

  // Mark-weighted allocation of the working window.
  let cursor = start + reading;
  const readingEndsAt = formatClock(cursor);

  const plan = sections.map((section) => {
    const marks = Number(section.marks);
    const questions = Number(section.questions);
    const minutes = (working * marks) / totalMarks;
    const startsAt = formatClock(cursor);
    cursor += minutes;
    return {
      name: String(section.name).trim(),
      marks,
      questions,
      minutes: Math.round(minutes * 10) / 10,
      minutesPerQuestion: Math.round((minutes / questions) * 10) / 10,
      minutesPerMark: Math.round((minutes / marks) * 100) / 100,
      startsAt,
      checkpoint: formatClock(cursor),
    };
  });

  const reviewStartsAt = formatClock(start + duration - review);
  const endsAt = formatClock(start + duration);

  return {
    startsAt: formatClock(start),
    readingMinutes: reading,
    readingEndsAt,
    workingMinutes: working,
    reviewMinutes: review,
    reviewStartsAt,
    endsAt,
    totalMarks,
    totalQuestions,
    minutesPerMark: Math.round((working / totalMarks) * 100) / 100,
    sections: plan,
  };
}
