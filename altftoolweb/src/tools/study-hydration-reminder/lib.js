/**
 * Study hydration planning.
 *
 * Reference values: EFSA (European Food Safety Authority), Scientific Opinion
 * on Dietary Reference Values for water, EFSA Journal 2010; 8(3):1459.
 *  - Adequate total water intake (all sources, including food):
 *      adult men 2.5 L/day, adult women 2.0 L/day,
 *      boys 9-13 y 2.1 L/day, girls 9-13 y 1.9 L/day;
 *      adolescents 14 y and over follow adult values.
 *  - EFSA assumes roughly 80% of total water comes from drinks and 20% from
 *    food, so the drinkable share is total x 0.8.
 *
 * The session target simply pro-rates the daily drinkable amount over a
 * 16-hour waking day — steady sipping rather than catch-up gulping.
 */

/** Share of total water intake normally taken as drinks (EFSA 2010, ~80%). */
export const FLUID_SHARE = 0.8;

/** Waking minutes per day used to pro-rate the daily amount (16 h). */
export const WAKING_MINUTES_PER_DAY = 16 * 60;

/**
 * Approximate uplift for a hot room or summer weather. EFSA notes water needs
 * rise with heat and activity but sets no fixed figure; +20% is a deliberate,
 * clearly-labelled heuristic, not an EFSA value.
 */
export const HOT_UPLIFT_PERCENT = 20;

/** EFSA 2010 adequate total water intakes, ml/day. */
export const PROFILES = [
  { id: "female-adult", label: "Female, 14 years and over", totalMl: 2000 },
  { id: "male-adult", label: "Male, 14 years and over", totalMl: 2500 },
  { id: "girl-9-13", label: "Girl, 9-13 years", totalMl: 1900 },
  { id: "boy-9-13", label: "Boy, 9-13 years", totalMl: 2100 },
];

export const MIN_SESSION_MINUTES = 15;
export const MAX_SESSION_MINUTES = 720; // 12 h
export const MIN_SIP_ML = 30;
export const MAX_SIP_ML = 500;

/**
 * Build a sip schedule for one study session.
 *
 * @param {object} input
 * @param {number} input.sessionMinutes  Study session length, minutes.
 * @param {string} input.profileId       One of PROFILES ids.
 * @param {number} [input.sipMl]         Comfortable amount per drink (default 150 ml).
 * @param {boolean} [input.hot]          Hot room / summer weather uplift.
 * @returns {{targetMl, sipCount, perSipMl, intervalMinutes, schedule,
 *            dailyTotalMl, dailyFluidsMl, profile}|{error:string}}
 */
export function planHydration({ sessionMinutes, profileId, sipMl = 150, hot = false }) {
  const profile = PROFILES.find((p) => p.id === profileId);
  if (!profile) return { error: "Choose who this plan is for." };

  const session = Number(sessionMinutes);
  if (!Number.isFinite(session)) return { error: "Enter your session length in minutes." };
  if (session < MIN_SESSION_MINUTES) {
    return { error: `Sessions under ${MIN_SESSION_MINUTES} minutes do not need a sip schedule.` };
  }
  if (session > MAX_SESSION_MINUTES) {
    return { error: "Keep one plan at 12 hours or less — split longer days into two sessions." };
  }

  const sip = Number(sipMl);
  if (!Number.isFinite(sip) || sip < MIN_SIP_ML || sip > MAX_SIP_ML) {
    return { error: `Amount per drink must be between ${MIN_SIP_ML} and ${MAX_SIP_ML} ml.` };
  }

  const upliftFactor = hot ? 1 + HOT_UPLIFT_PERCENT / 100 : 1;
  const dailyFluidsMl = Math.round(profile.totalMl * FLUID_SHARE * upliftFactor);
  const targetMl = Math.round((dailyFluidsMl * session) / WAKING_MINUTES_PER_DAY);

  const sipCount = Math.max(1, Math.round(targetMl / sip));
  const perSipMl = Math.round(targetMl / sipCount);
  const intervalMinutes = Math.round(session / sipCount);

  const schedule = [];
  for (let i = 1; i <= sipCount; i += 1) {
    schedule.push({
      minute: Math.round((session * i) / sipCount),
      cumulativeMl: Math.round((targetMl * i) / sipCount),
    });
  }

  return {
    profile: { id: profile.id, label: profile.label },
    sessionMinutes: session,
    hot: Boolean(hot),
    dailyTotalMl: Math.round(profile.totalMl * upliftFactor),
    dailyFluidsMl,
    targetMl,
    sipCount,
    perSipMl,
    intervalMinutes,
    schedule,
  };
}
