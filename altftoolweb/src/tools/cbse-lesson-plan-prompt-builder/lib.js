/**
 * CBSE lesson plan prompt builder — pure logic.
 *
 * Sources for the fixed rules encoded here:
 *  - CBSE Affiliation Bye-Laws: a school session must have a minimum of 220
 *    working days of teaching.
 *  - CBSE Circular on Assessment for Classes IX-X: Board/annual theory 80 marks
 *    + Internal Assessment 20 marks, where the 20 is split 5 (Periodic Test),
 *    5 (Multiple Assessment), 5 (Portfolio) and 5 (Subject Enrichment).
 *  - CBSE Senior Secondary scheme: practical subjects carry Theory 70 +
 *    Practical/Project 30; non-practical subjects carry Theory 80 + Project 20.
 *  - NCERT/NCF pedagogy: the 5E learning-cycle and the five Herbartian steps.
 */

/** CBSE Affiliation Bye-Laws minimum teaching days in an academic session. */
export const CBSE_MIN_WORKING_DAYS = 220;
/** A standard CBSE school period in most timetables. */
export const TYPICAL_PERIOD_MINUTES = 40;

export const MIN_PERIOD_MINUTES = 10;
export const MAX_PERIOD_MINUTES = 180;
export const MIN_PERIODS = 1;
export const MAX_PERIODS = 20;

/** CBSE stages and the subjects usually timetabled in each. */
export const CBSE_STAGES = {
  "1-5": {
    label: "Classes 1-5 (Foundational & Preparatory)",
    classes: ["1", "2", "3", "4", "5"],
    subjects: [
      "English",
      "Hindi",
      "Mathematics",
      "Environmental Studies (EVS)",
      "Art Education",
      "Health and Physical Education",
    ],
  },
  "6-8": {
    label: "Classes 6-8 (Middle)",
    classes: ["6", "7", "8"],
    subjects: [
      "English",
      "Hindi",
      "Sanskrit",
      "Mathematics",
      "Science",
      "Social Science",
      "Computer Science",
      "Artificial Intelligence",
      "Art Education",
      "Health and Physical Education",
    ],
  },
  "9-10": {
    label: "Classes 9-10 (Secondary)",
    classes: ["9", "10"],
    subjects: [
      "English Language and Literature",
      "Hindi Course A",
      "Hindi Course B",
      "Mathematics (Standard)",
      "Mathematics (Basic)",
      "Science",
      "Social Science",
      "Sanskrit",
      "Information Technology",
      "Artificial Intelligence",
    ],
  },
  "11-12": {
    label: "Classes 11-12 (Senior Secondary)",
    classes: ["11", "12"],
    subjects: [
      "English Core",
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "Applied Mathematics",
      "Computer Science",
      "Informatics Practices",
      "Accountancy",
      "Business Studies",
      "Economics",
      "History",
      "Political Science",
      "Geography",
      "Psychology",
      "Physical Education",
    ],
  },
};

/** Subjects that carry a practical/project component of 30 marks in Classes 11-12. */
export const PRACTICAL_SUBJECTS = new Set([
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Informatics Practices",
  "Psychology",
  "Physical Education",
]);

/**
 * Instructional frameworks. Each phase weight is a percentage of the total
 * teaching time; the weights in every framework sum to exactly 100.
 */
export const FRAMEWORKS = {
  "5e": {
    label: "5E learning cycle",
    phases: [
      ["Engage", 10, "Hook the class with a question, demonstration or local example that surfaces prior knowledge."],
      ["Explore", 25, "Students investigate in pairs or groups before any explanation is given by the teacher."],
      ["Explain", 30, "Formalise the concept, introduce correct terminology and connect it to the NCERT text."],
      ["Elaborate", 20, "Apply the concept to a new situation, a numerical, or a cross-subject link."],
      ["Evaluate", 15, "Check understanding against the stated learning outcomes before the bell."],
    ],
  },
  herbartian: {
    label: "Herbartian five steps",
    phases: [
      ["Preparation", 10, "Recall previous knowledge and state the aim of the lesson."],
      ["Presentation", 35, "Present the new matter in graded steps with questioning throughout."],
      ["Association", 20, "Compare and contrast with what the class already knows."],
      ["Generalisation", 15, "Lead the class to state the rule, formula or principle in their own words."],
      ["Application", 20, "Set problems or tasks that use the generalisation immediately."],
    ],
  },
};

/** Lesson plan output styles. */
export const PLAN_FORMATS = {
  table: "A period-by-period table with columns: Time | Teacher activity | Student activity | Resources | Check for understanding.",
  narrative:
    "A narrative plan written in continuous prose under the phase headings, the way an inspection-ready file expects.",
  bullets: "Tight bullet points under each phase heading, no more than four bullets per phase.",
};

/** Optional differentiation targets. */
export const DIFFERENTIATION = {
  none: "",
  mixed:
    "Differentiate three ways in every task: a scaffolded version for students working below grade level, the core version, and an extension for early finishers.",
  slow: "Scaffold heavily for students working below grade level: smaller steps, worked examples first, vocabulary pre-taught.",
  gifted: "Add extension and enrichment tasks that push beyond the textbook for high-attaining students.",
};

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Split the total teaching time across the framework's phases.
 * Uses the largest-remainder method so the whole-minute allocations always
 * add back up to the exact total — no drift from rounding each phase alone.
 */
export function allocateLessonTime({ periodMinutes, periodCount, framework }) {
  const minutes = Number(periodMinutes);
  const periods = Number(periodCount);
  const spec = FRAMEWORKS[framework];

  if (!spec) return { error: "Pick a lesson framework." };
  if (!Number.isFinite(minutes) || !Number.isFinite(periods)) {
    return { error: "Enter a period length and a number of periods." };
  }
  if (minutes < MIN_PERIOD_MINUTES || minutes > MAX_PERIOD_MINUTES) {
    return {
      error: `Period length must be between ${MIN_PERIOD_MINUTES} and ${MAX_PERIOD_MINUTES} minutes.`,
    };
  }
  if (periods < MIN_PERIODS || periods > MAX_PERIODS) {
    return { error: `Number of periods must be between ${MIN_PERIODS} and ${MAX_PERIODS}.` };
  }

  const totalMinutes = Math.round(minutes * periods);
  const raw = spec.phases.map(([name, weight, note]) => ({
    name,
    weight,
    note,
    exact: (totalMinutes * weight) / 100,
  }));

  const allocated = raw.map((item) => ({ ...item, minutes: Math.floor(item.exact) }));
  let remainder = totalMinutes - allocated.reduce((sum, item) => sum + item.minutes, 0);

  const order = allocated
    .map((item, index) => ({ index, frac: item.exact - Math.floor(item.exact) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    allocated[order[cursor % order.length].index].minutes += 1;
    remainder -= 1;
    cursor += 1;
  }

  return {
    framework: spec.label,
    totalMinutes,
    periods: Math.round(periods),
    periodMinutes: round(minutes, 2),
    phases: allocated.map(({ name, weight, note, minutes: phaseMinutes }) => ({
      name,
      weight,
      note,
      minutes: phaseMinutes,
      sharePct: totalMinutes > 0 ? round((phaseMinutes / totalMinutes) * 100, 1) : 0,
    })),
  };
}

/**
 * The CBSE marks scheme that applies to the class being taught.
 * Classes 1-8 have no board scheme, so this returns a school-level note.
 */
export function assessmentScheme({ classLevel, subject }) {
  const cls = Number(classLevel);
  if (!Number.isFinite(cls) || cls < 1 || cls > 12) {
    return { error: "Class must be between 1 and 12." };
  }

  if (cls <= 8) {
    return {
      scheme: "School-based continuous assessment (no CBSE board component at this stage).",
      components: [
        ["Continuous assessment", 100, "Set by the school under CBSE's holistic progress card guidance."],
      ],
      total: 100,
    };
  }

  if (cls <= 10) {
    return {
      scheme: "CBSE Secondary: Board/annual theory 80 + Internal Assessment 20.",
      components: [
        ["Board / annual theory", 80, "Written paper set to the CBSE sample paper design."],
        ["Periodic Test", 5, "Best of three pen-and-paper tests across the session."],
        ["Multiple Assessment", 5, "Quizzes, oral tests, concept maps, group work."],
        ["Portfolio", 5, "Classwork, peer assessment, reflections, achievements."],
        ["Subject Enrichment", 5, "Practicals in Science, maps/projects in Social Science, speaking-listening in languages."],
      ],
      total: 100,
    };
  }

  const hasPractical = PRACTICAL_SUBJECTS.has(subject);
  return {
    scheme: hasPractical
      ? "CBSE Senior Secondary (practical subject): Theory 70 + Practical/Internal 30."
      : "CBSE Senior Secondary (non-practical subject): Theory 80 + Project/Internal 20.",
    components: hasPractical
      ? [
          ["Theory", 70, "External written paper."],
          ["Practical / Internal", 30, "Lab work, practical file, viva and internal assessment."],
        ]
      : [
          ["Theory", 80, "External written paper."],
          ["Project / Internal", 20, "Project work and internal assessment."],
        ],
    total: 100,
  };
}

/**
 * Compose the lesson plan prompt.
 * Returns { title, prompt, allocation, assessment, wordCount } or { error }.
 */
export function buildLessonPlanPrompt({
  stage,
  classLevel,
  subject,
  topic,
  periodMinutes,
  periodCount,
  framework,
  planFormat,
  differentiation = "none",
  includeRubric = false,
  includeHomework = false,
}) {
  const stageSpec = CBSE_STAGES[stage];
  if (!stageSpec) return { error: "Pick a CBSE stage." };
  if (!stageSpec.classes.includes(String(classLevel))) {
    return { error: `Class ${classLevel} is not part of ${stageSpec.label}.` };
  }
  if (!stageSpec.subjects.includes(subject)) {
    return { error: `${subject} is not listed for ${stageSpec.label}.` };
  }
  const topicText = String(topic || "").trim();
  if (topicText.length < 2) return { error: "Enter the chapter or topic you are teaching." };

  const formatSpec = PLAN_FORMATS[planFormat];
  if (!formatSpec) return { error: "Pick an output format." };
  if (!(differentiation in DIFFERENTIATION)) return { error: "Pick a differentiation option." };

  const allocation = allocateLessonTime({ periodMinutes, periodCount, framework });
  if (allocation.error) return { error: allocation.error };

  const assessment = assessmentScheme({ classLevel, subject });
  if (assessment.error) return { error: assessment.error };

  const phaseLines = allocation.phases.map(
    (phase) => `   - ${phase.name} (${phase.minutes} min, ${phase.weight}%): ${phase.note}`,
  );

  const lines = [
    `Act as an experienced CBSE ${subject} teacher writing a lesson plan for Class ${classLevel}.`,
    "",
    `Topic: ${topicText}`,
    `Total teaching time: ${allocation.totalMinutes} minutes (${allocation.periods} period(s) of ${allocation.periodMinutes} minutes).`,
    `Framework: ${allocation.framework}. Keep to this exact time split:`,
    ...phaseLines,
    "",
    "Requirements:",
    "1. Open with 3-5 learning outcomes written as observable student behaviours ('the student will be able to...'), using action verbs from Bloom's revised taxonomy.",
    `2. Map the lesson to the current NCERT textbook for Class ${classLevel} ${subject}. Name the chapter and the specific sections covered. If you are not certain of the chapter number in the latest edition, describe the content instead of guessing a number.`,
    `3. State how learning will be evidenced against the CBSE scheme in force for this class: ${assessment.scheme}`,
    "4. List every teaching aid needed, and give a no-cost fallback for each in case the classroom has no projector.",
    "5. Include at least two questions that surface a common misconception on this topic, with the correction.",
    "6. Note one Indian or local context example so the concept lands with the class.",
  ];

  let ruleNumber = 7;
  if (DIFFERENTIATION[differentiation]) {
    lines.push(`${ruleNumber}. ${DIFFERENTIATION[differentiation]}`);
    ruleNumber += 1;
  }
  if (includeRubric) {
    lines.push(
      `${ruleNumber}. Add a 4-level assessment rubric (Beginning / Developing / Proficient / Exemplary) with one observable descriptor per level for each learning outcome.`,
    );
    ruleNumber += 1;
  }
  if (includeHomework) {
    lines.push(
      `${ruleNumber}. End with homework that takes no more than 20 minutes, is checkable in under a minute per student, and does not need internet access at home.`,
    );
    ruleNumber += 1;
  }

  lines.push(
    "",
    `Output format: ${formatSpec}`,
    "",
    "Constraints: do not invent CBSE circular numbers, marks weightings or NCERT page numbers. If a detail is uncertain, write 'verify with the current CBSE curriculum document' instead of stating a figure.",
  );

  const prompt = lines.join("\n");

  return {
    title: `Class ${classLevel} ${subject} — ${topicText}`,
    prompt,
    allocation,
    assessment,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
