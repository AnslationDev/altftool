/**
 * Trimester symptom timeline.
 *
 * Gestational age is counted from the first day of the last menstrual period
 * (LMP), not from conception, so week 1 begins on the LMP date itself.
 * Estimated due date uses Naegele's rule: LMP + 280 days (40 weeks).
 *
 * Trimester boundaries follow standard obstetric convention:
 *   first  = 0w0d through 13w6d
 *   second = 14w0d through 27w6d
 *   third  = 28w0d onwards
 *
 * Everything here is general information about what is commonly experienced and
 * commonly scheduled. It is not a diagnosis and not a substitute for antenatal
 * care.
 */

export const MS_PER_DAY = 86400000;
export const DAYS_PER_WEEK = 7;

/** Naegele's rule: estimated due date = LMP + 280 days. */
export const GESTATION_DAYS = 280;

/** Second trimester starts at 14w0d = day 98. */
export const SECOND_TRIMESTER_START_DAY = 98;

/** Third trimester starts at 28w0d = day 196. */
export const THIRD_TRIMESTER_START_DAY = 196;

/** 44 weeks (308 days) is past any plausible gestation - beyond this the dates are wrong. */
export const MAX_PLAUSIBLE_DAYS = 308;

/** ACOG term definitions, in completed weeks. */
export const TERM_BANDS = [
  { key: "preterm", label: "Preterm", fromWeek: 0, toWeek: 36 },
  { key: "early-term", label: "Early term", fromWeek: 37, toWeek: 38 },
  { key: "full-term", label: "Full term", fromWeek: 39, toWeek: 40 },
  { key: "late-term", label: "Late term", fromWeek: 41, toWeek: 41 },
  { key: "post-term", label: "Post term", fromWeek: 42, toWeek: 99 },
];

/**
 * Commonly reported symptoms with the weeks they usually span.
 * Windows are typical ranges reported in antenatal patient information, not
 * guarantees - many pregnancies skip a symptom entirely.
 */
export const SYMPTOMS = [
  { id: "spotting", name: "Light implantation spotting", from: 4, to: 6, trimester: 1, note: "Brief, light and pink or brown; heavy bleeding is not this." },
  { id: "missed-period", name: "Missed period and positive test", from: 4, to: 6, trimester: 1, note: "Home tests detect hCG from about the day of the missed period." },
  { id: "breast", name: "Breast tenderness and fullness", from: 4, to: 13, trimester: 1, note: "Driven by rising oestrogen and progesterone; often the earliest sign." },
  { id: "fatigue", name: "Heavy fatigue", from: 5, to: 14, trimester: 1, note: "Usually lifts early in the second trimester." },
  { id: "nausea", name: "Nausea and vomiting", from: 6, to: 14, trimester: 1, note: "Peaks around week 9. Affects roughly 7 in 10 pregnancies and is not limited to mornings." },
  { id: "smell", name: "Food aversions and sharper sense of smell", from: 6, to: 14, trimester: 1, note: "Often tracks the nausea curve and fades with it." },
  { id: "urination-early", name: "Needing to pass urine more often", from: 6, to: 14, trimester: 1, note: "Blood volume rises early; burning or pain instead suggests infection." },
  { id: "nausea-easing", name: "Nausea easing", from: 13, to: 17, trimester: 2, note: "Most people feel noticeably better between weeks 13 and 16." },
  { id: "ligament", name: "Round ligament pain", from: 14, to: 24, trimester: 2, note: "Short, sharp pulls low on one side when you move suddenly." },
  { id: "congestion", name: "Blocked nose and bleeding gums", from: 14, to: 28, trimester: 2, note: "Pregnancy rhinitis and gingivitis both come from increased blood flow." },
  { id: "quickening", name: "First felt movements (quickening)", from: 16, to: 22, trimester: 2, note: "Around 18-20 weeks in a first pregnancy, often earlier in later ones." },
  { id: "skin", name: "Stretching skin, linea nigra, itching", from: 16, to: 40, trimester: 2, note: "Widespread intense itching, especially palms and soles, needs same-week review." },
  { id: "braxton", name: "Braxton Hicks tightenings", from: 20, to: 40, trimester: 2, note: "Irregular and painless; regular painful tightenings are different." },
  { id: "heartburn", name: "Heartburn and reflux", from: 20, to: 40, trimester: 2, note: "Progesterone relaxes the valve at the top of the stomach." },
  { id: "backache", name: "Lower back and pelvic ache", from: 20, to: 40, trimester: 2, note: "Shifting centre of gravity plus ligament softening." },
  { id: "breathless", name: "Breathlessness on stairs", from: 26, to: 38, trimester: 3, note: "The uterus limits diaphragm movement; sudden severe breathlessness is not normal." },
  { id: "cramps", name: "Leg cramps at night", from: 26, to: 40, trimester: 3, note: "One-sided calf pain with redness or swelling needs urgent review instead." },
  { id: "swelling", name: "Swollen feet and ankles", from: 28, to: 40, trimester: 3, note: "Gradual and end-of-day is usual; sudden face or hand swelling is not." },
  { id: "sleep", name: "Broken sleep and awkward positioning", from: 28, to: 40, trimester: 3, note: "Side-lying is advised from the third trimester onwards." },
  { id: "colostrum", name: "Colostrum leaking", from: 30, to: 40, trimester: 3, note: "Thick yellowish drops; entirely normal and no sign of early labour." },
  { id: "urination-late", name: "Frequent urination returns", from: 32, to: 40, trimester: 3, note: "The baby's head presses on the bladder as it descends." },
  { id: "lightening", name: "Lightening as the head engages", from: 36, to: 40, trimester: 3, note: "Breathing eases, pelvic pressure increases; can happen days or hours before labour." },
];

/**
 * Routine antenatal contacts and screening windows.
 * Exact offers differ by country and by clinic - treat these as the usual
 * windows to ask your own provider about.
 */
export const MILESTONES = [
  { id: "booking", name: "Booking appointment and first blood tests", from: 6, to: 12, note: "Blood group, haemoglobin, infection screen and blood pressure baseline." },
  { id: "dating", name: "Dating scan (with nuchal translucency if offered)", from: 11, to: 14, note: "Offered between 11w0d and 13w6d, when crown-rump length dates best." },
  { id: "anomaly", name: "Anomaly (mid-pregnancy) scan", from: 18, to: 22, note: "Detailed structural scan, usually 18-22 weeks." },
  { id: "gtt", name: "Gestational diabetes screening", from: 24, to: 28, note: "Glucose tolerance test at 24-28 weeks, earlier if risk factors are present." },
  { id: "antid", name: "Anti-D prophylaxis if RhD negative", from: 28, to: 30, note: "Given around 28 weeks to RhD-negative people; ask if you do not know your group." },
  { id: "tdap", name: "Whooping cough (Tdap) vaccination", from: 27, to: 36, note: "Offered in the 27-36 week window so antibodies reach the baby." },
  { id: "gbs", name: "Group B strep swab (where offered)", from: 36, to: 38, note: "Collected at 36w0d-37w6d where routine screening is practised." },
  { id: "growth", name: "Growth, position and birth-plan review", from: 36, to: 41, note: "Presentation is checked; a breech baby may prompt a discussion about turning." },
];

/** Symptoms that are never in the "wait and see" bucket. */
export const URGENT_SIGNS = [
  "Bleeding from the vagina at any stage",
  "Severe or constant headache with visual changes or upper abdominal pain",
  "Sudden swelling of the face, hands or feet",
  "A noticeable reduction or change in the baby's movements after 24 weeks",
  "Fluid leaking from the vagina before 37 weeks",
  "Fever above 38 C, burning when passing urine, or persistent vomiting with no fluids kept down",
  "Regular painful tightenings before 37 weeks",
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" as a UTC midnight timestamp. Returns null if invalid. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

/** Timestamp -> "YYYY-MM-DD". */
export function formatISODate(ms) {
  if (!Number.isFinite(ms)) return "";
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function trimesterForDay(dayCount) {
  if (dayCount < SECOND_TRIMESTER_START_DAY) return 1;
  if (dayCount < THIRD_TRIMESTER_START_DAY) return 2;
  return 3;
}

export function termBandForWeek(week) {
  return TERM_BANDS.find((band) => week >= band.fromWeek && week <= band.toWeek) ?? TERM_BANDS[0];
}

/** Shared timeline lookup once a gestational day count is known. */
function buildTimeline(dayCount) {
  const weeks = Math.floor(dayCount / DAYS_PER_WEEK);
  const days = dayCount % DAYS_PER_WEEK;
  const trimester = trimesterForDay(dayCount);
  const inWindow = (item) => weeks >= item.from && weeks <= item.to;

  return {
    dayCount,
    weeks,
    days,
    gestationLabel: `${weeks}w ${days}d`,
    trimester,
    trimesterLabel: ["First", "Second", "Third"][trimester - 1],
    progressPercent: Math.min(100, Math.max(0, (dayCount / GESTATION_DAYS) * 100)),
    termBand: termBandForWeek(weeks),
    activeSymptoms: SYMPTOMS.filter(inWindow),
    upcomingSymptoms: SYMPTOMS.filter((item) => item.from > weeks && item.from <= weeks + 4),
    currentMilestones: MILESTONES.filter(inWindow),
    nextMilestone: MILESTONES.find((item) => item.from > weeks) ?? null,
    urgentSigns: URGENT_SIGNS,
  };
}

/**
 * Timeline for a gestational age you already know, e.g. from a scan report.
 * @param {object} input
 * @param {number} input.weeks completed weeks
 * @param {number} input.days  extra days, 0-6
 */
export function assessByGestation({ weeks, days = 0 } = {}) {
  if (!Number.isFinite(weeks) || !Number.isFinite(days)) {
    return { error: "Enter gestational age as whole weeks plus 0-6 days." };
  }
  if (weeks < 0 || days < 0) return { error: "Gestational age cannot be negative." };
  if (days > 6) return { error: "Days must be between 0 and 6 - 7 days is a whole week." };

  const dayCount = Math.round(weeks) * DAYS_PER_WEEK + Math.round(days);
  if (dayCount > MAX_PLAUSIBLE_DAYS) {
    return { error: "Gestational age above 44 weeks is not plausible - check the figure." };
  }

  return { ...buildTimeline(dayCount), dueDate: null, daysToDue: null, weeksToDue: null };
}

/**
 * @param {object} input
 * @param {string} input.lmpDate  first day of the last menstrual period, "YYYY-MM-DD"
 * @param {string} input.onDate   the date you are asking about, "YYYY-MM-DD"
 */
export function assessPregnancyWeek({ lmpDate, onDate } = {}) {
  const lmp = parseISODate(lmpDate);
  if (lmp === null) return { error: "Enter the first day of your last period as a valid date." };

  const on = parseISODate(onDate);
  if (on === null) return { error: "Enter the date you want the guide for as a valid date." };

  const dayCount = Math.round((on - lmp) / MS_PER_DAY);
  if (dayCount < 0) return { error: "The chosen date is before your last period started." };
  if (dayCount > MAX_PLAUSIBLE_DAYS) {
    return {
      error: `That is ${Math.floor(dayCount / DAYS_PER_WEEK)} weeks after your last period, which is past 44 weeks. Check the dates.`,
    };
  }

  const dueMs = lmp + GESTATION_DAYS * MS_PER_DAY;
  const daysToDue = Math.round((dueMs - on) / MS_PER_DAY);

  return {
    ...buildTimeline(dayCount),
    dueDate: formatISODate(dueMs),
    daysToDue,
    weeksToDue: Math.floor(Math.max(0, daysToDue) / DAYS_PER_WEEK),
  };
}
