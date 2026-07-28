/**
 * Eye Checkup Reminder Planner — logic only. No React, no DOM, no clock reads.
 * The "today" date is always passed in so the maths stays pure.
 *
 * Intervals below follow the American Optometric Association recommended
 * examination frequency for asymptomatic, low-risk patients:
 *   - 6 to 12 months of age: first examination
 *   - 3 to 5 years: at least one examination
 *   - 6 to 17 years: before first grade and annually thereafter
 *   - 18 to 39 years: at least every two years
 *   - 40 to 64 years: at least every two years
 *   - 65 years and older: annually
 * Patients at risk are advised to be seen annually, or more often as
 * recommended. The American Academy of Ophthalmology separately advises a
 * baseline comprehensive eye examination at age 40 for adults with no signs or
 * risk factors, because that is when early changes typically start.
 *
 * Contact lens wearers are conventionally reviewed annually as a condition of
 * the fitting, which is why lens wear here forces the interval to 12 months.
 */

export const MS_PER_DAY = 86400000;

/** AOA low-risk interval for adults aged 18 to 64, in months. */
export const ADULT_INTERVAL_MONTHS = 24;

/** AOA interval for school-age children and for anyone at risk, in months. */
export const ANNUAL_INTERVAL_MONTHS = 12;

/** Age at which the AAO advises a baseline comprehensive examination. */
export const BASELINE_EXAM_AGE = 40;

/** Age from which the AOA advises an annual examination regardless of risk. */
export const SENIOR_AGE = 65;

/** Screen hours per day above which digital eye strain becomes a common complaint. */
export const HEAVY_SCREEN_HOURS = 6;

export const AGE_BANDS = [
  {
    id: "infant",
    label: "Under 3 years",
    minAge: 0,
    maxAge: 2,
    months: ANNUAL_INTERVAL_MONTHS,
    guidance:
      "The first examination is recommended between 6 and 12 months of age, then again at about age 3. Intervals here are a prompt, not a schedule — follow what the optometrist sets.",
  },
  {
    id: "preschool",
    label: "3 to 5 years",
    minAge: 3,
    maxAge: 5,
    months: ANNUAL_INTERVAL_MONTHS,
    guidance:
      "At least one examination between ages 3 and 5, before starting school, so that amblyopia and squint are picked up while they are still treatable.",
  },
  {
    id: "school",
    label: "6 to 17 years",
    minAge: 6,
    maxAge: 17,
    months: ANNUAL_INTERVAL_MONTHS,
    guidance:
      "An examination before first grade and annually after that. This is the age myopia usually starts and progresses fastest.",
  },
  {
    id: "adult",
    label: "18 to 39 years",
    minAge: 18,
    maxAge: 39,
    months: ADULT_INTERVAL_MONTHS,
    guidance:
      "At least every two years if you have no symptoms and no risk factors. Anything new — flashes, floaters, double vision, sudden blur — is a same-week appointment, not a wait.",
  },
  {
    id: "midlife",
    label: "40 to 64 years",
    minAge: 40,
    maxAge: 64,
    months: ADULT_INTERVAL_MONTHS,
    guidance:
      "A baseline comprehensive examination is advised at 40, then at least every two years. This is when presbyopia arrives and when glaucoma screening starts to matter.",
  },
  {
    id: "senior",
    label: "65 and older",
    minAge: 65,
    maxAge: 120,
    months: ANNUAL_INTERVAL_MONTHS,
    guidance:
      "Annually from 65. Cataract, macular degeneration and glaucoma all become more common, and all are easier to manage early.",
  },
];

/** Risk factors that move an adult to an annual examination. */
export const RISK_FACTORS = [
  { id: "diabetes", label: "Diabetes (type 1 or type 2)", note: "Diabetic retinopathy screening is a separate annual programme in many countries — keep both." },
  { id: "hypertension", label: "High blood pressure", note: "Hypertension shows up in the retinal vessels before it shows up elsewhere." },
  { id: "glaucoma-family", label: "Family history of glaucoma", note: "First-degree relatives of someone with glaucoma have a substantially higher lifetime risk." },
  { id: "high-myopia", label: "High myopia (-6.00 D or beyond)", note: "Raised risk of retinal detachment and myopic maculopathy — report flashes or a curtain in the vision immediately." },
  { id: "eye-surgery", label: "Previous eye surgery or serious eye injury", note: "Follow-up intervals are set by the surgeon and usually override the general schedule." },
  { id: "medication", label: "Long-term medication with known eye effects", note: "Hydroxychloroquine, ethambutol and long-term steroids all have their own monitoring schedules." },
  { id: "occupational", label: "Visually demanding or safety-critical job", note: "Driving, aviation and precision work often carry their own certification intervals." },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function findAgeBand(age) {
  return AGE_BANDS.find((band) => age >= band.minAge && age <= band.maxAge) || null;
}

export function findRiskFactor(id) {
  return RISK_FACTORS.find((factor) => factor.id === id) || null;
}

/** Parse YYYY-MM-DD to a UTC timestamp, or NaN. */
export function parseIsoDay(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Add whole calendar months to a UTC timestamp, clamping short months. */
export function addMonthsIso(ms, months) {
  if (!isNum(ms) || !isNum(months)) return "";
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay)),
  )
    .toISOString()
    .slice(0, 10);
}

/**
 * @param {object} input
 * @param {number} input.age             Age in years.
 * @param {string} input.lastExamDate    YYYY-MM-DD of the last examination.
 * @param {string} input.todayDate       YYYY-MM-DD to evaluate against.
 * @param {string[]} input.riskIds       Risk factor ids that apply.
 * @param {boolean} input.contactLenses  Whether the person wears contact lenses.
 * @param {number} input.screenHours     Screen hours per day.
 * @param {boolean} input.symptoms       Whether there are current visual symptoms.
 * @returns {object} plan, or { error }.
 */
export function planCheckup({
  age,
  lastExamDate,
  todayDate,
  riskIds = [],
  contactLenses = false,
  screenHours = 0,
  symptoms = false,
} = {}) {
  if (!isNum(age) || !isNum(screenHours)) return { error: "Enter a number for age and screen hours." };
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120." };
  if (screenHours < 0 || screenHours > 24) return { error: "Screen hours must be between 0 and 24." };
  if (!Array.isArray(riskIds)) return { error: "Risk factors must be a list." };

  const last = parseIsoDay(lastExamDate);
  const today = parseIsoDay(todayDate);
  if (Number.isNaN(last)) return { error: "Enter the last examination date as YYYY-MM-DD." };
  if (Number.isNaN(today)) return { error: "Enter a valid 'today' date as YYYY-MM-DD." };
  if (last > today) return { error: "The last examination date cannot be in the future." };

  const band = findAgeBand(Math.floor(age));
  if (!band) return { error: "Enter an age between 0 and 120." };

  const risks = riskIds.map(findRiskFactor).filter(Boolean);

  const reasons = [`Age band: ${band.label} — ${band.months} month interval for low-risk patients.`];
  let months = band.months;

  if (risks.length > 0) {
    months = Math.min(months, ANNUAL_INTERVAL_MONTHS);
    reasons.push(
      `${risks.length} risk factor${risks.length === 1 ? "" : "s"} recorded, so the interval shortens to ${ANNUAL_INTERVAL_MONTHS} months.`,
    );
  }
  if (contactLenses) {
    months = Math.min(months, ANNUAL_INTERVAL_MONTHS);
    reasons.push("Contact lens wear normally carries an annual aftercare appointment as part of the fitting.");
  }

  const dueIso = addMonthsIso(last, months);
  const dueMs = parseIsoDay(dueIso);
  const daysUntilDue = Math.round((dueMs - today) / MS_PER_DAY);
  const daysSinceLast = Math.round((today - last) / MS_PER_DAY);

  let status;
  if (symptoms) status = "symptoms";
  else if (daysUntilDue < 0) status = "overdue";
  else if (daysUntilDue <= 30) status = "due-soon";
  else status = "ok";

  const statusLabel = {
    symptoms: "Book now — symptoms reported",
    overdue: "Overdue",
    "due-soon": "Due within a month",
    ok: "Up to date",
  }[status];

  const notes = [];
  if (symptoms) {
    notes.push(
      "You have flagged current visual symptoms. New flashes, floaters, a curtain across the vision, sudden blur, double vision or eye pain are urgent — the routine interval does not apply.",
    );
  }
  if (age >= BASELINE_EXAM_AGE && age < BASELINE_EXAM_AGE + 1) {
    notes.push(
      `Age ${BASELINE_EXAM_AGE} is the point at which a baseline comprehensive examination is advised even with no symptoms and no risk factors.`,
    );
  }
  if (age >= SENIOR_AGE) {
    notes.push("From 65 the recommendation is annual, because cataract, glaucoma and macular degeneration all become more common.");
  }
  if (screenHours >= HEAVY_SCREEN_HOURS) {
    notes.push(
      `${screenHours} hours a day of screen work does not by itself shorten the examination interval, but it does make digital eye strain likely — mention it at the appointment so near vision and any small uncorrected error get checked.`,
    );
  }
  for (const risk of risks) notes.push(`${risk.label}: ${risk.note}`);

  return {
    band,
    months,
    reasons,
    risks,
    contactLenses,
    lastExamDate: lastExamDate.trim(),
    todayDate: todayDate.trim(),
    dueIso,
    daysUntilDue,
    daysSinceLast,
    monthsSinceLast: Math.round((daysSinceLast / 365.25) * 12 * 10) / 10,
    status,
    statusLabel,
    symptoms,
    screenHours,
    guidance: band.guidance,
    notes,
  };
}
