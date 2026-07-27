/**
 * AI certification study planner.
 *
 * Pure module — no React, no DOM, no clock. Today's date is always passed in.
 *
 * Domain weights come from each vendor's published exam guide ("skills
 * measured" / "exam content outline"). Where a vendor publishes a range
 * (Microsoft does), both ends are stored and the midpoint is used, then the
 * whole set is normalised to 100% so the allocation always adds up.
 * Vendors revise these outlines periodically — always confirm against the
 * official guide before booking.
 */

export const EXAMS = [
  {
    id: "aif-c01",
    name: "AWS Certified AI Practitioner",
    code: "AIF-C01",
    vendor: "AWS",
    level: "Foundational",
    minutes: 90,
    questions: 65, // delivered items; a subset is unscored and used for pretesting
    passingScore: 700,
    scoreScale: "100-1000",
    baseHours: 30,
    domains: [
      ["Fundamentals of AI and ML", 20, 20],
      ["Fundamentals of generative AI", 24, 24],
      ["Applications of foundation models", 28, 28],
      ["Guidelines for responsible AI", 14, 14],
      ["Security, compliance and governance for AI solutions", 14, 14],
    ],
  },
  {
    id: "mla-c01",
    name: "AWS Certified Machine Learning Engineer - Associate",
    code: "MLA-C01",
    vendor: "AWS",
    level: "Associate",
    minutes: 130,
    questions: 85, // 85 items delivered, of which 65 are scored
    passingScore: 720,
    scoreScale: "100-1000",
    baseHours: 70,
    domains: [
      ["Data preparation for machine learning", 28, 28],
      ["ML model development", 26, 26],
      ["Deployment and orchestration of ML workflows", 22, 22],
      ["ML solution monitoring, maintenance and security", 24, 24],
    ],
  },
  {
    id: "mls-c01",
    name: "AWS Certified Machine Learning - Specialty",
    code: "MLS-C01",
    vendor: "AWS",
    level: "Specialty",
    minutes: 180,
    questions: 65,
    passingScore: 750,
    scoreScale: "100-1000",
    baseHours: 95,
    domains: [
      ["Data engineering", 20, 20],
      ["Exploratory data analysis", 24, 24],
      ["Modeling", 36, 36],
      ["Machine learning implementation and operations", 20, 20],
    ],
  },
  {
    id: "ai-900",
    name: "Microsoft Azure AI Fundamentals",
    code: "AI-900",
    vendor: "Microsoft",
    level: "Fundamentals",
    minutes: 45,
    questions: 45, // Microsoft publishes 40-60 items; 45 is the working midpoint
    passingScore: 700,
    scoreScale: "1-1000",
    baseHours: 20,
    domains: [
      ["AI workloads and considerations", 15, 20],
      ["Fundamentals of machine learning on Azure", 15, 20],
      ["Computer vision workloads on Azure", 15, 20],
      ["Natural language processing workloads on Azure", 15, 20],
      ["Generative AI workloads on Azure", 20, 25],
    ],
  },
  {
    id: "ai-102",
    name: "Microsoft Azure AI Engineer Associate",
    code: "AI-102",
    vendor: "Microsoft",
    level: "Associate",
    minutes: 100,
    questions: 50, // Microsoft publishes 40-60 items
    passingScore: 700,
    scoreScale: "1-1000",
    baseHours: 65,
    domains: [
      ["Plan and manage an Azure AI solution", 20, 25],
      ["Implement generative AI solutions", 15, 20],
      ["Implement computer vision solutions", 10, 15],
      ["Implement natural language processing solutions", 15, 20],
      ["Implement knowledge mining and information extraction", 15, 20],
      ["Implement agentic and content-safety solutions", 5, 10],
    ],
  },
  {
    id: "gcp-pmle",
    name: "Google Cloud Professional Machine Learning Engineer",
    code: "PMLE",
    vendor: "Google Cloud",
    level: "Professional",
    minutes: 120,
    questions: 55, // Google publishes 50-60 items
    passingScore: null, // Google does not publish a passing score for this exam
    scoreScale: "Pass / fail",
    baseHours: 85,
    domains: [
      ["Architecting low-code AI solutions", 13, 13],
      ["Collaborating to manage data and models", 14, 14],
      ["Scaling prototypes into ML models", 18, 18],
      ["Serving and scaling models", 20, 20],
      ["Automating and orchestrating ML pipelines", 22, 22],
      ["Monitoring AI solutions", 13, 13],
    ],
  },
];

const EXAM_BY_ID = EXAMS.reduce((map, exam) => {
  map[exam.id] = exam;
  return map;
}, {});

/**
 * Preparation-time multipliers applied to the exam's base hour budget.
 * Planning heuristics, not vendor figures.
 */
export const BACKGROUNDS = [
  { id: "new", label: "New to the topic and the cloud platform", multiplier: 1.5 },
  { id: "some", label: "Some hands-on exposure", multiplier: 1.0 },
  { id: "daily", label: "Work with it most weeks", multiplier: 0.7 },
];

/**
 * Share of total study time reserved for practice exams, flashcards and a final
 * revision pass rather than first-time domain study.
 */
export const REVISION_SHARE = 0.2;

export const MIN_HOURS_PER_WEEK = 1;
export const MAX_HOURS_PER_WEEK = 40;

const isIsoDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const MS_PER_DAY = 86400000;

/** Whole days from `fromIso` to `toIso`. NaN when either date is invalid. */
export function daysBetween(fromIso, toIso) {
  if (!isIsoDate(fromIso) || !isIsoDate(toIso)) return NaN;
  return Math.round(
    (Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / MS_PER_DAY
  );
}

export function addDays(iso, days) {
  if (!isIsoDate(iso) || !Number.isFinite(days)) return null;
  return new Date(Date.parse(`${iso}T00:00:00Z`) + Math.round(days) * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Normalised domain weights. Midpoint of each published range, rescaled so the
 * set sums to exactly 100.
 */
export function normalizedDomains(exam) {
  const midpoints = exam.domains.map(([name, min, max]) => ({
    name,
    published: min === max ? `${min}%` : `${min}-${max}%`,
    midpoint: (min + max) / 2,
  }));
  const total = midpoints.reduce((sum, domain) => sum + domain.midpoint, 0);
  if (!(total > 0)) return [];
  return midpoints.map((domain) => ({
    ...domain,
    weight: (domain.midpoint / total) * 100,
  }));
}

/**
 * Build a study plan.
 *
 * @param {object} input
 * @param {string} input.examId one of EXAMS
 * @param {string} input.background one of BACKGROUNDS
 * @param {number} input.hoursPerWeek study hours available each week
 * @param {string} input.today ISO date supplied by the caller
 * @param {string} [input.examDate] ISO exam date, optional
 * @returns {object|{error: string}}
 */
export function buildStudyPlan(input = {}) {
  const exam = EXAM_BY_ID[input.examId];
  if (!exam) return { error: "Choose a certification." };

  const background = BACKGROUNDS.find((item) => item.id === input.background);
  if (!background) return { error: "Choose your current background." };

  const hoursPerWeek = Number(input.hoursPerWeek);
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) {
    return { error: "Enter the study hours you have each week." };
  }
  if (hoursPerWeek < MIN_HOURS_PER_WEEK || hoursPerWeek > MAX_HOURS_PER_WEEK) {
    return {
      error: `Study hours per week should be between ${MIN_HOURS_PER_WEEK} and ${MAX_HOURS_PER_WEEK}.`,
    };
  }
  if (!isIsoDate(input.today)) return { error: "A valid start date is required." };

  const examDate = input.examDate === "" || input.examDate == null ? null : input.examDate;
  if (examDate !== null && !isIsoDate(examDate)) return { error: "Pick a valid exam date." };

  const daysUntilExam = examDate ? daysBetween(input.today, examDate) : null;
  if (daysUntilExam !== null && daysUntilExam < 0) {
    return { error: "That exam date has already passed — pick a future date." };
  }

  const totalHours = Math.round(exam.baseHours * background.multiplier);
  const revisionHours = Math.round(totalHours * REVISION_SHARE);
  const domainHours = totalHours - revisionHours;

  const domains = normalizedDomains(exam);
  let cumulative = 0;
  const schedule = domains.map((domain) => {
    const hours = round1((domain.weight / 100) * domainHours);
    const startHours = cumulative;
    cumulative += hours;
    return {
      ...domain,
      weight: round1(domain.weight),
      hours,
      minutesInExam: Math.round((domain.weight / 100) * exam.minutes),
      questionsApprox: Math.round((domain.weight / 100) * exam.questions),
      weekStart: Math.floor(startHours / hoursPerWeek) + 1,
      weekEnd: Math.max(
        Math.ceil(cumulative / hoursPerWeek),
        Math.floor(startHours / hoursPerWeek) + 1
      ),
    };
  });

  const revisionStart = cumulative;
  const revisionBlock = {
    name: "Practice exams and final revision",
    hours: round1(revisionHours),
    weekStart: Math.floor(revisionStart / hoursPerWeek) + 1,
    weekEnd: Math.max(
      Math.ceil((revisionStart + revisionHours) / hoursPerWeek),
      Math.floor(revisionStart / hoursPerWeek) + 1
    ),
  };

  const totalWeeks = Math.ceil(totalHours / hoursPerWeek);
  const readyDate = addDays(input.today, totalWeeks * 7);

  let readiness = null;
  if (daysUntilExam !== null) {
    const weeksAvailable = daysUntilExam / 7;
    const hoursAvailable = weeksAvailable * hoursPerWeek;
    const onTrack = hoursAvailable >= totalHours;
    readiness = {
      examDate,
      daysUntilExam,
      weeksAvailable: round1(weeksAvailable),
      hoursAvailable: Math.round(hoursAvailable),
      onTrack,
      hoursShort: onTrack ? 0 : Math.round(totalHours - hoursAvailable),
      hoursPerWeekNeeded: weeksAvailable > 0 ? round1(totalHours / weeksAvailable) : null,
    };
  }

  return {
    exam,
    background,
    totalHours,
    domainHours,
    revisionHours,
    hoursPerWeek,
    totalWeeks,
    startDate: input.today,
    readyDate,
    schedule,
    revisionBlock,
    minutesPerQuestion: round1(exam.minutes / exam.questions),
    readiness,
  };
}

/** Plain-text export of a study plan. Pure string builder. */
export function planToText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `${plan.exam.name} (${plan.exam.code}) study plan`,
    `${plan.totalHours} study hours · ${plan.hoursPerWeek} h/week · ${plan.totalWeeks} weeks`,
    `Start ${plan.startDate} · exam-ready by ${plan.readyDate}`,
    "",
  ];
  for (const domain of plan.schedule) {
    const weeks =
      domain.weekStart === domain.weekEnd
        ? `Week ${domain.weekStart}`
        : `Weeks ${domain.weekStart}-${domain.weekEnd}`;
    lines.push(`${weeks}: ${domain.name} — ${domain.hours} h (${domain.weight}% of the exam)`);
  }
  const revisionWeeks =
    plan.revisionBlock.weekStart === plan.revisionBlock.weekEnd
      ? `Week ${plan.revisionBlock.weekStart}`
      : `Weeks ${plan.revisionBlock.weekStart}-${plan.revisionBlock.weekEnd}`;
  lines.push(`${revisionWeeks}: ${plan.revisionBlock.name} — ${plan.revisionBlock.hours} h`);
  if (plan.readiness) {
    lines.push(
      "",
      plan.readiness.onTrack
        ? `On track: ${plan.readiness.daysUntilExam} days until the exam covers the plan.`
        : `Short by ${plan.readiness.hoursShort} h — ${plan.readiness.hoursPerWeekNeeded} h/week needed.`
    );
  }
  return lines.join("\n");
}
