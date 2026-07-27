/**
 * Lesson Plan Prompt Builder — turns lesson parameters into a structured prompt for a
 * language model, and time-boxes the lesson across the phases of a real instructional model.
 *
 * Sources for the frameworks and vocabulary encoded below:
 * - Revised Bloom's taxonomy of the cognitive domain: Anderson, L. W. & Krathwohl, D. R.
 *   (2001), "A Taxonomy for Learning, Teaching, and Assessing". Six levels, remember through
 *   create, each paired with observable verbs suitable for a measurable objective.
 * - BSCS 5E Instructional Model: Bybee et al. (2006). Engage, Explore, Explain, Elaborate,
 *   Evaluate.
 * - Hunter's Elements of Effective Instruction: Hunter, M. (1982), "Mastery Teaching".
 * - Gagné's Nine Events of Instruction: Gagné, R. M. (1965), "The Conditions of Learning".
 * - Gradual Release of Responsibility: Pearson, P. D. & Gallagher, M. C. (1983), popularised
 *   as "I do / We do / You do" by Fisher & Frey (2008).
 * - Objective wording follows Mager's three criteria (Mager, R. F., 1962, "Preparing
 *   Instructional Objectives"): observable performance, the condition it happens under, and
 *   the criterion for success — commonly taught as the A-B-C-D pattern.
 *
 * The phase percentages are the splits used in the common classroom templates for each model.
 * None of these models mandates a percentage in its primary source, so the weights are a
 * starting point the teacher is expected to adjust, not a rule.
 */

/** A lesson shorter than this is a activity fragment, not a plannable lesson. */
export const MIN_LESSON_MINUTES = 5;

/** Upper bound of one instructional block: a full 8-hour day. Beyond this, plan a unit. */
export const MAX_LESSON_MINUTES = 480;

/** Guard rail on class size so the prompt never asks for grouping maths that cannot work. */
export const MIN_CLASS_SIZE = 1;
export const MAX_CLASS_SIZE = 500;

/**
 * Revised Bloom's taxonomy (Anderson & Krathwohl, 2001).
 * `order` is the level number, 1 = remember (lowest) through 6 = create (highest).
 * Verbs are the standard observable verbs for each level; vague verbs such as
 * "understand", "know" or "appreciate" are deliberately excluded because they cannot be
 * assessed.
 */
export const BLOOM_LEVELS = [
  {
    id: "remember",
    order: 1,
    label: "Remember",
    description: "Retrieve relevant knowledge from long-term memory.",
    verbs: ["define", "list", "recall", "identify", "name", "state"],
  },
  {
    id: "understand",
    order: 2,
    label: "Understand",
    description: "Construct meaning from instructional messages.",
    verbs: ["explain", "summarise", "classify", "compare", "interpret", "paraphrase"],
  },
  {
    id: "apply",
    order: 3,
    label: "Apply",
    description: "Carry out or use a procedure in a given situation.",
    verbs: ["apply", "demonstrate", "solve", "use", "calculate", "implement"],
  },
  {
    id: "analyse",
    order: 4,
    label: "Analyse",
    description: "Break material into parts and show how the parts relate.",
    verbs: ["analyse", "differentiate", "organise", "contrast", "attribute", "deconstruct"],
  },
  {
    id: "evaluate",
    order: 5,
    label: "Evaluate",
    description: "Make judgements based on criteria and standards.",
    verbs: ["critique", "judge", "justify", "assess", "defend", "appraise"],
  },
  {
    id: "create",
    order: 6,
    label: "Create",
    description: "Put elements together into a coherent or original whole.",
    verbs: ["design", "construct", "compose", "formulate", "generate", "produce"],
  },
];

/**
 * Instructional models with their phases. `weight` is the share of lesson time that phase
 * takes in the common template for that model; weights within a framework sum to 100.
 */
export const LESSON_FRAMEWORKS = [
  {
    id: "five-e",
    label: "5E Instructional Model",
    source: "BSCS 5E, Bybee et al. (2006)",
    phases: [
      { name: "Engage", weight: 10, purpose: "Surface prior ideas and create a need to know." },
      { name: "Explore", weight: 25, purpose: "Hands-on investigation before any explanation is given." },
      { name: "Explain", weight: 25, purpose: "Students articulate their thinking; teacher introduces formal terms." },
      { name: "Elaborate", weight: 25, purpose: "Apply the new idea to a fresh context." },
      { name: "Evaluate", weight: 15, purpose: "Check understanding against the stated objective." },
    ],
  },
  {
    id: "hunter",
    label: "Hunter's Elements of Effective Instruction",
    source: "Hunter, M. (1982), Mastery Teaching",
    phases: [
      { name: "Anticipatory set", weight: 8, purpose: "Hook attention and connect to prior learning." },
      { name: "Objective and purpose", weight: 5, purpose: "State what students will be able to do and why it matters." },
      { name: "Input", weight: 17, purpose: "Deliver the new content in digestible chunks." },
      { name: "Modelling", weight: 15, purpose: "Show a worked example of the target performance." },
      { name: "Check for understanding", weight: 10, purpose: "Sample the whole class, not the volunteers." },
      { name: "Guided practice", weight: 20, purpose: "Students attempt it with immediate correction." },
      { name: "Independent practice", weight: 17, purpose: "Students work unaided at the target standard." },
      { name: "Closure", weight: 8, purpose: "Students restate the learning in their own words." },
    ],
  },
  {
    id: "gagne",
    label: "Gagné's Nine Events of Instruction",
    source: "Gagné, R. M. (1965), The Conditions of Learning",
    phases: [
      { name: "Gain attention", weight: 7, purpose: "A stimulus that makes the topic worth attending to." },
      { name: "Inform learners of objectives", weight: 5, purpose: "Set the expectation for what success looks like." },
      { name: "Stimulate recall of prior learning", weight: 8, purpose: "Activate the schema the new material attaches to." },
      { name: "Present the content", weight: 20, purpose: "Present stimulus material with distinctive features." },
      { name: "Provide learning guidance", weight: 15, purpose: "Scaffolds, analogies and worked examples." },
      { name: "Elicit performance", weight: 17, purpose: "Learners practise the target behaviour." },
      { name: "Provide feedback", weight: 10, purpose: "Specific and immediate, not just a score." },
      { name: "Assess performance", weight: 10, purpose: "Independent evidence against the objective." },
      { name: "Enhance retention and transfer", weight: 8, purpose: "Spacing, varied contexts and a link forward." },
    ],
  },
  {
    id: "gradual-release",
    label: "Gradual Release of Responsibility (I do / We do / You do)",
    source: "Pearson & Gallagher (1983); Fisher & Frey (2008)",
    phases: [
      { name: "Focused instruction (I do)", weight: 20, purpose: "Teacher models thinking aloud." },
      { name: "Guided instruction (We do)", weight: 25, purpose: "Teacher prompts and cues; students lead the work." },
      { name: "Collaborative learning (You do together)", weight: 30, purpose: "Peers negotiate meaning with productive struggle." },
      { name: "Independent learning (You do alone)", weight: 25, purpose: "Solo performance that produces assessable evidence." },
    ],
  },
];

/** Assessment types the prompt can ask the model to design. */
export const ASSESSMENT_TYPES = [
  { id: "diagnostic", label: "Diagnostic check at the start", note: "Reveals misconceptions before teaching." },
  { id: "exit-ticket", label: "Exit ticket", note: "One or two questions tied directly to the objective." },
  { id: "observation", label: "Observation checklist", note: "Look-fors the teacher circulates with." },
  { id: "quiz", label: "Short summative quiz", note: "Scored evidence against the objective." },
  { id: "performance", label: "Performance task with rubric", note: "Students produce something to a stated standard." },
  { id: "peer-self", label: "Peer or self-assessment", note: "Students apply the success criteria themselves." },
];

/** Differentiation levers, in the language of Tomlinson's differentiated instruction. */
export const DIFFERENTIATION_OPTIONS = [
  { id: "content", label: "Content", note: "Different texts, sources or entry points to the same idea." },
  { id: "process", label: "Process", note: "Different routes through the task — scaffolds, grouping, time." },
  { id: "product", label: "Product", note: "Different ways of showing what was learned." },
  { id: "eal", label: "Language support (EAL/ESL)", note: "Sentence frames, glossaries, visuals." },
  { id: "sen", label: "Additional learning needs", note: "Access arrangements and reduced cognitive load." },
  { id: "extension", label: "Extension for early finishers", note: "Deeper, not merely more." },
];

/** Look up a framework by id; falls back to the first framework. */
export function getFramework(frameworkId) {
  return (
    LESSON_FRAMEWORKS.find((framework) => framework.id === frameworkId) ??
    LESSON_FRAMEWORKS[0]
  );
}

/**
 * Split lesson minutes across a framework's phases.
 *
 * Every phase is guaranteed at least one whole minute, and the allocated minutes always sum
 * to exactly `totalMinutes`. The remainder after the one-minute floor is shared out by the
 * largest-remainder (Hare) method over the phase weights, with ties broken by phase order so
 * the function stays pure and deterministic.
 *
 * @param {object} input
 * @param {string} input.frameworkId
 * @param {number} input.totalMinutes
 * @returns {{ phases: Array<object>, totalMinutes: number } | { error: string }}
 */
export function allocatePhaseMinutes({ frameworkId, totalMinutes }) {
  const framework = getFramework(frameworkId);
  const total = Number(totalMinutes);

  if (!Number.isFinite(total)) {
    return { error: "Enter the lesson length in minutes as a number." };
  }
  const minutes = Math.floor(total);
  if (minutes < MIN_LESSON_MINUTES) {
    return { error: `A lesson needs at least ${MIN_LESSON_MINUTES} minutes to plan.` };
  }
  if (minutes > MAX_LESSON_MINUTES) {
    return {
      error: `${MAX_LESSON_MINUTES} minutes is the longest single lesson this tool plans — split anything longer into a unit.`,
    };
  }
  if (minutes < framework.phases.length) {
    return {
      error: `${framework.label} has ${framework.phases.length} phases, so it needs at least ${framework.phases.length} minutes.`,
    };
  }

  const weightTotal = framework.phases.reduce((sum, phase) => sum + phase.weight, 0);
  if (weightTotal <= 0) {
    return { error: "This framework has no usable phase weights." };
  }

  // One guaranteed minute per phase, then share the rest by weight.
  const shareable = minutes - framework.phases.length;
  const provisional = framework.phases.map((phase, index) => {
    const exact = (shareable * phase.weight) / weightTotal;
    const whole = Math.floor(exact);
    return { index, phase, whole, remainder: exact - whole };
  });

  let assigned = provisional.reduce((sum, row) => sum + row.whole, 0);
  const leftover = shareable - assigned;

  const byRemainder = [...provisional].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  );
  for (let i = 0; i < leftover; i += 1) {
    byRemainder[i % byRemainder.length].whole += 1;
  }

  const phases = provisional.map((row) => ({
    name: row.phase.name,
    purpose: row.phase.purpose,
    weight: row.phase.weight,
    minutes: row.whole + 1,
  }));

  assigned = phases.reduce((sum, phase) => sum + phase.minutes, 0);

  return {
    frameworkId: framework.id,
    frameworkLabel: framework.label,
    frameworkSource: framework.source,
    phases,
    totalMinutes: assigned,
  };
}

/**
 * Build a measurable objective stem for one Bloom level, in Mager's A-B-C-D shape:
 * Audience, Behaviour (an observable verb), Condition, Degree.
 */
export function buildObjectiveStem({ levelId, audience, topic, condition, degree }) {
  const level = BLOOM_LEVELS.find((item) => item.id === levelId);
  if (!level) return null;
  const verb = level.verbs[0];
  return {
    levelId: level.id,
    levelLabel: level.label,
    order: level.order,
    verbs: level.verbs,
    stem: `By the end of the lesson, ${audience} will be able to ${verb} ${topic} ${condition}, ${degree}.`,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Assemble the full lesson-plan prompt.
 *
 * @param {object} input
 * @param {string} input.topic            Lesson topic, e.g. "photosynthesis".
 * @param {string} input.gradeLevel       Year group or age band.
 * @param {string} input.subject          Subject area.
 * @param {number} input.durationMinutes  Lesson length.
 * @param {string} input.frameworkId      One of LESSON_FRAMEWORKS ids.
 * @param {string[]} input.bloomLevelIds  Target cognitive levels.
 * @param {number} input.classSize        Number of students.
 * @param {string} input.priorKnowledge   What students already know.
 * @param {string} input.materials        Available resources and constraints.
 * @param {string[]} input.assessmentIds  Selected ASSESSMENT_TYPES ids.
 * @param {string[]} input.differentiationIds Selected DIFFERENTIATION_OPTIONS ids.
 * @param {boolean} input.includeHomework Ask for follow-up work.
 * @returns {object} the prompt and its supporting parts, or { error }.
 */
export function buildLessonPlanPrompt({
  topic,
  gradeLevel,
  subject,
  durationMinutes,
  frameworkId,
  bloomLevelIds = [],
  classSize,
  priorKnowledge,
  materials,
  assessmentIds = [],
  differentiationIds = [],
  includeHomework = false,
}) {
  const topicText = clean(topic);
  if (!topicText) return { error: "Enter the lesson topic — the prompt has nothing to plan without it." };

  const gradeText = clean(gradeLevel) || "the class";
  const subjectText = clean(subject);

  const size = Number(classSize);
  if (!Number.isFinite(size) || size < MIN_CLASS_SIZE) {
    return { error: `Class size must be at least ${MIN_CLASS_SIZE} student.` };
  }
  if (size > MAX_CLASS_SIZE) {
    return { error: `Class size above ${MAX_CLASS_SIZE} is outside what a single lesson plan can sensibly cover.` };
  }

  const allocation = allocatePhaseMinutes({ frameworkId, totalMinutes: durationMinutes });
  if (allocation.error) return { error: allocation.error };

  const levels = BLOOM_LEVELS.filter((level) => bloomLevelIds.includes(level.id)).sort(
    (a, b) => a.order - b.order,
  );
  if (levels.length === 0) {
    return { error: "Pick at least one Bloom's taxonomy level so the objectives are measurable." };
  }

  const audience = `${Math.round(size)} ${gradeText} students`;
  const objectives = levels
    .map((level) =>
      buildObjectiveStem({
        levelId: level.id,
        audience: gradeText === "the class" ? "students" : `${gradeText} students`,
        topic: `<what specifically about ${topicText}>`,
        condition: "<under what conditions>",
        degree: "<to what standard>",
      }),
    )
    .filter(Boolean);

  const assessments = ASSESSMENT_TYPES.filter((item) => assessmentIds.includes(item.id));
  const differentiation = DIFFERENTIATION_OPTIONS.filter((item) =>
    differentiationIds.includes(item.id),
  );

  const priorText = clean(priorKnowledge);
  const materialsText = clean(materials);

  const lines = [];
  lines.push(
    `Act as an experienced ${subjectText ? `${subjectText} ` : ""}teacher and instructional designer. Write a complete, classroom-ready lesson plan.`,
  );
  lines.push("");
  lines.push("CONTEXT");
  lines.push(`- Topic: ${topicText}`);
  if (subjectText) lines.push(`- Subject: ${subjectText}`);
  lines.push(`- Learners: ${audience}`);
  lines.push(`- Lesson length: ${allocation.totalMinutes} minutes`);
  lines.push(`- Instructional model: ${allocation.frameworkLabel} (${allocation.frameworkSource})`);
  lines.push(`- Prior knowledge: ${priorText || "assume the standard prerequisites for this level and state what you assumed"}`);
  lines.push(`- Materials and constraints: ${materialsText || "ordinary classroom resources only; flag anything else you need"}`);
  lines.push("");
  lines.push("LEARNING OBJECTIVES");
  lines.push(
    `Write ${objectives.length} objective${objectives.length === 1 ? "" : "s"}, one per cognitive level below, using the revised Bloom's taxonomy (Anderson & Krathwohl, 2001). Each objective must name an observable behaviour, the condition it is performed under and the criterion for success. Do not use "understand", "know" or "appreciate" — they cannot be observed.`,
  );
  for (const objective of objectives) {
    lines.push(
      `- ${objective.levelLabel} (level ${objective.order}) — use one of: ${objective.verbs.join(", ")}`,
    );
    lines.push(`  Pattern: ${objective.stem}`);
  }
  lines.push("");
  lines.push("LESSON STRUCTURE AND TIMING");
  lines.push("Fill in every phase below. Keep to the minute budget; if a phase cannot be done in the time, say so and propose a cut.");
  for (const phase of allocation.phases) {
    lines.push(`- ${phase.name} — ${phase.minutes} min. ${phase.purpose}`);
  }
  lines.push("For each phase give: what the teacher says or does, what students do, and the one thing that tells you the phase worked.");
  lines.push("");
  lines.push("ASSESSMENT");
  if (assessments.length > 0) {
    lines.push("Design each of these so it maps to a specific objective above:");
    for (const item of assessments) {
      lines.push(`- ${item.label}: ${item.note}`);
    }
  } else {
    lines.push("Propose one formative check during the lesson and one piece of end-of-lesson evidence, each tied to a specific objective.");
  }
  lines.push("State the success criteria in student-facing language.");
  lines.push("");
  if (differentiation.length > 0) {
    lines.push("DIFFERENTIATION");
    lines.push("Give a concrete adaptation — not a generic statement — for each of:");
    for (const item of differentiation) {
      lines.push(`- ${item.label}: ${item.note}`);
    }
    lines.push("");
  }
  lines.push("ALSO INCLUDE");
  lines.push("- Two misconceptions students commonly hold about this topic and the question you would ask to expose each one.");
  lines.push("- A materials list with quantities for the class size above.");
  if (includeHomework) {
    lines.push("- Follow-up work that practises the objective rather than repeating the lesson, with an estimated completion time.");
  }
  lines.push("");
  lines.push("OUTPUT FORMAT");
  lines.push("Use markdown headings in the order above, with a timing table for the lesson structure. Be specific enough that another teacher could deliver this lesson without asking you a question. Do not pad with generic teaching advice.");

  const prompt = lines.join("\n");

  return {
    prompt,
    objectives,
    phases: allocation.phases,
    frameworkLabel: allocation.frameworkLabel,
    frameworkSource: allocation.frameworkSource,
    totalMinutes: allocation.totalMinutes,
    phaseCount: allocation.phases.length,
    objectiveCount: objectives.length,
    assessmentCount: assessments.length,
    differentiationCount: differentiation.length,
    classSize: Math.round(size),
    characterCount: prompt.length,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
