/**
 * Narration session time estimator.
 *
 * The model is additive and every term is a working assumption you can change:
 *
 *   readMinutes    = words / wordsPerMinute
 *   retakeMinutes  = (words / 100) x errorsPerHundredWords x secondsPerRetake / 60
 *   breakMinutes   = (readMinutes + retakeMinutes) x breakMinutesPerHour / 60
 *   workMinutes    = readMinutes + retakeMinutes + breakMinutes
 *   sessions       = ceil(workMinutes / (sessionCapMinutes - setupMinutes))
 *   boothMinutes   = workMinutes + sessions x setupMinutes
 *
 * Why each term exists:
 *  - Retakes: in punch-and-roll the narrator backs up to the last clean sentence and
 *    re-reads it, so every flub costs roughly 15-30 seconds, not just the flubbed word.
 *    A fluent narrator on familiar material makes something like 2-4 errors per hundred
 *    words; dense technical copy, unfamiliar names and character voices push it higher.
 *  - Breaks: vocal-health guidance for professional voice users is a short rest every
 *    30-60 minutes of continuous voicing, plus hydration; 10 minutes per hour is a common
 *    working allowance.
 *  - Setup: mic placement, level check, room tone and a warm-up have to happen once per
 *    session, so they scale with the number of days, not with the length of the script.
 */

/** Default narration pace, matching the audiobook planning figure of 155 wpm. */
export const DEFAULT_WPM = 155;
export const MIN_WPM = 80;
export const MAX_WPM = 260;

/** Seconds lost to one punch-and-roll retake: back up, re-read, verify. */
export const DEFAULT_SECONDS_PER_RETAKE = 20;

/** Vocal rest allowance in minutes per hour of voicing. */
export const DEFAULT_BREAK_MINUTES_PER_HOUR = 10;

/** Setup, level check and warm-up, once per session. */
export const DEFAULT_SETUP_MINUTES = 15;

/** Material difficulty presets, expressed as errors per hundred words. */
export const DIFFICULTY_PRESETS = [
  { id: "familiar", label: "Familiar copy, own script", errorsPerHundredWords: 1.5 },
  { id: "standard", label: "Standard prose or narration", errorsPerHundredWords: 3 },
  { id: "technical", label: "Technical, names, numbers", errorsPerHundredWords: 5 },
  { id: "character", label: "Character voices, dialects", errorsPerHundredWords: 7 },
  { id: "coldread", label: "Cold read, no prep", errorsPerHundredWords: 10 },
];

/** Format minutes as "2h 12m". */
export function formatHoursMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const rounded = Math.round(totalMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * Estimate booth time for a script.
 * @returns {object} estimate or { error }
 */
export function estimateSession({
  wordCount,
  wordsPerMinute = DEFAULT_WPM,
  errorsPerHundredWords = 3,
  secondsPerRetake = DEFAULT_SECONDS_PER_RETAKE,
  breakMinutesPerHour = DEFAULT_BREAK_MINUTES_PER_HOUR,
  setupMinutes = DEFAULT_SETUP_MINUTES,
  sessionCapMinutes = 240,
  sessionsPerDay = 1,
} = {}) {
  const words = Number(wordCount);
  const wpm = Number(wordsPerMinute);
  const errors = Number(errorsPerHundredWords);
  const retakeSeconds = Number(secondsPerRetake);
  const breakPerHour = Number(breakMinutesPerHour);
  const setup = Number(setupMinutes);
  const cap = Number(sessionCapMinutes);
  const perDay = Math.trunc(Number(sessionsPerDay));

  if (!Number.isFinite(words)) return { error: "Enter the script word count." };
  if (words <= 0) return { error: "Word count must be greater than zero." };
  if (words > 2000000) return { error: "That word count is too large to schedule as one job." };

  if (!Number.isFinite(wpm) || wpm < MIN_WPM || wpm > MAX_WPM) {
    return { error: `Read pace should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }
  if (!Number.isFinite(errors) || errors < 0 || errors > 50) {
    return { error: "Errors per hundred words must be between 0 and 50." };
  }
  if (!Number.isFinite(retakeSeconds) || retakeSeconds < 0 || retakeSeconds > 300) {
    return { error: "Seconds lost per retake must be between 0 and 300." };
  }
  if (!Number.isFinite(breakPerHour) || breakPerHour < 0 || breakPerHour >= 60) {
    return { error: "Break time must be between 0 and 59 minutes per hour." };
  }
  if (!Number.isFinite(setup) || setup < 0 || setup > 180) {
    return { error: "Setup time must be between 0 and 180 minutes." };
  }
  if (!Number.isFinite(cap) || cap <= 0 || cap > 720) {
    return { error: "A session should be between 0 and 720 minutes long." };
  }
  if (cap <= setup) {
    return { error: "The session length must be longer than the setup time, or no reading fits in it." };
  }
  if (!Number.isFinite(perDay) || perDay < 1 || perDay > 4) {
    return { error: "Sessions per day must be between 1 and 4." };
  }

  const readMinutes = words / wpm;
  const retakeCount = (words / 100) * errors;
  const retakeMinutes = (retakeCount * retakeSeconds) / 60;
  const voicingMinutes = readMinutes + retakeMinutes;
  const breakMinutes = (voicingMinutes * breakPerHour) / 60;
  const workMinutes = voicingMinutes + breakMinutes;

  const usablePerSession = cap - setup;
  const sessions = Math.max(1, Math.ceil(workMinutes / usablePerSession));
  const boothMinutes = workMinutes + sessions * setup;
  const days = Math.ceil(sessions / perDay);

  return {
    words,
    wordsPerMinute: wpm,
    readMinutes,
    retakeCount,
    retakeMinutes,
    voicingMinutes,
    breakMinutes,
    workMinutes,
    setupTotalMinutes: sessions * setup,
    boothMinutes,
    boothHours: boothMinutes / 60,
    sessions,
    days,
    usablePerSession,
    minutesPerFinishedMinute: readMinutes > 0 ? boothMinutes / readMinutes : 0,
    lastSessionMinutes:
      sessions > 0 ? workMinutes - usablePerSession * (sessions - 1) + setup : 0,
  };
}

/**
 * How many words fit in one booked session, working the model backwards.
 * @returns {object} { words } or { error }
 */
export function wordsPerSession({
  wordsPerMinute = DEFAULT_WPM,
  errorsPerHundredWords = 3,
  secondsPerRetake = DEFAULT_SECONDS_PER_RETAKE,
  breakMinutesPerHour = DEFAULT_BREAK_MINUTES_PER_HOUR,
  setupMinutes = DEFAULT_SETUP_MINUTES,
  sessionCapMinutes = 240,
} = {}) {
  const probe = estimateSession({
    wordCount: 1000,
    wordsPerMinute,
    errorsPerHundredWords,
    secondsPerRetake,
    breakMinutesPerHour,
    setupMinutes,
    sessionCapMinutes,
  });
  if (probe.error) return { error: probe.error };
  // workMinutes is linear in wordCount, so one probe gives the minutes-per-word slope.
  const minutesPerWord = probe.workMinutes / 1000;
  if (!(minutesPerWord > 0)) return { error: "With these settings no time is spent per word." };
  return { words: Math.floor(probe.usablePerSession / minutesPerWord) };
}
