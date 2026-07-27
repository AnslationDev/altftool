/**
 * Commute study micro planner.
 *
 * Splits weekly commute time between audio lectures and flashcard reviews:
 *
 *   weeklyCommute = minutesPerLeg x legsPerDay x daysPerWeek
 *   audioMinutes  = weeklyCommute x audioShare%
 *   cardMinutes   = weeklyCommute x flashcardShare%
 *   cards/week    = cardMinutes x 60 / SECONDS_PER_FLASHCARD
 *
 * Anything not allocated stays as buffer (boarding, crowd, interruptions).
 */

/**
 * Average seconds per flashcard review. Spaced-repetition users typically
 * average 10-20 seconds per card (Anki's own stats screens commonly show
 * this range); 12 s is a realistic mid value for well-made cards.
 */
export const SECONDS_PER_FLASHCARD = 12;

/**
 * A commute leg shorter than this is too fragmented for audio lectures —
 * by the time attention settles the leg is over — so the planner recommends
 * flashcards-only below it.
 */
export const MIN_AUDIO_LEG_MINUTES = 10;

/** Average weeks per month: 365.25 days / 12 months / 7 days. */
export const WEEKS_PER_MONTH = 365.25 / 12 / 7;

/** Sanity bounds. */
export const MAX_LEG_MINUTES = 300; // 5 h one way is already extreme
export const MAX_LEGS_PER_DAY = 10;

/**
 * Build the weekly micro plan.
 *
 * @param {object} input
 * @param {number} input.minutesPerLeg     One-way commute duration in minutes.
 * @param {number} input.legsPerDay        Trips per day (2 = simple round trip).
 * @param {number} input.daysPerWeek       Commuting days per week.
 * @param {number} input.audioSharePct     % of commute given to audio lectures.
 * @param {number} input.flashcardSharePct % of commute given to flashcards.
 * @returns {object} plan, or { error } for unusable input.
 */
export function planCommuteStudy({
  minutesPerLeg,
  legsPerDay,
  daysPerWeek,
  audioSharePct,
  flashcardSharePct,
}) {
  const leg = Number(minutesPerLeg);
  const legs = Number(legsPerDay);
  const days = Number(daysPerWeek);
  const audioShare = Number(audioSharePct);
  const cardShare = Number(flashcardSharePct);

  if (!Number.isFinite(leg) || leg <= 0) {
    return { error: "Enter your one-way commute time in minutes (more than 0)." };
  }
  if (leg > MAX_LEG_MINUTES) {
    return { error: `One leg cannot exceed ${MAX_LEG_MINUTES} minutes.` };
  }
  if (!Number.isInteger(legs) || legs < 1 || legs > MAX_LEGS_PER_DAY) {
    return { error: `Legs per day must be a whole number from 1 to ${MAX_LEGS_PER_DAY}.` };
  }
  if (!Number.isInteger(days) || days < 1 || days > 7) {
    return { error: "Commuting days per week must be a whole number from 1 to 7." };
  }
  if (!Number.isFinite(audioShare) || audioShare < 0 || audioShare > 100) {
    return { error: "Audio share must be between 0% and 100%." };
  }
  if (!Number.isFinite(cardShare) || cardShare < 0 || cardShare > 100) {
    return { error: "Flashcard share must be between 0% and 100%." };
  }
  if (audioShare + cardShare > 100) {
    return { error: "Audio and flashcard shares cannot add up to more than 100%." };
  }

  const dailyCommute = leg * legs;
  const weeklyCommute = dailyCommute * days;
  const bufferShare = 100 - audioShare - cardShare;

  const audioWeekly = (weeklyCommute * audioShare) / 100;
  const cardWeekly = (weeklyCommute * cardShare) / 100;
  const bufferWeekly = (weeklyCommute * bufferShare) / 100;

  const cardsPerWeek = Math.floor((cardWeekly * 60) / SECONDS_PER_FLASHCARD);
  const round1 = (n) => Math.round(n * 10) / 10;

  return {
    dailyCommuteMinutes: round1(dailyCommute),
    weeklyCommuteMinutes: round1(weeklyCommute),
    monthlyCommuteHours: round1((weeklyCommute * WEEKS_PER_MONTH) / 60),
    audio: {
      weeklyMinutes: round1(audioWeekly),
      dailyMinutes: round1(audioWeekly / days),
      monthlyHours: round1((audioWeekly * WEEKS_PER_MONTH) / 60),
    },
    flashcards: {
      weeklyMinutes: round1(cardWeekly),
      dailyMinutes: round1(cardWeekly / days),
      cardsPerWeek,
      cardsPerDay: Math.floor(cardsPerWeek / days),
      secondsPerCard: SECONDS_PER_FLASHCARD,
    },
    buffer: {
      sharePct: bufferShare,
      weeklyMinutes: round1(bufferWeekly),
    },
    // Short legs fragment audio too much; recommend cards-first below the threshold.
    audioFeasible: leg >= MIN_AUDIO_LEG_MINUTES,
    minAudioLegMinutes: MIN_AUDIO_LEG_MINUTES,
  };
}
