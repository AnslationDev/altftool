/**
 * AI learning roadmap builder.
 *
 * A small curriculum graph plus a deterministic scheduler. Pure module: no
 * React, no DOM, no clock — the start date is always passed in by the caller.
 *
 * Hour estimates are study-hour budgets (reading, watching, and building the
 * module's practice project). They are planning figures, not a promise: pace
 * varies with background and with how much you build rather than read.
 */

/** Curriculum stages, from prompting through to training your own weights. */
export const STAGES = [
  { id: 1, name: "Working with models" },
  { id: 2, name: "Building with APIs" },
  { id: 3, name: "Retrieval, tools and evaluation" },
  { id: 4, name: "Machine-learning foundations" },
  { id: 5, name: "Training and adapting models" },
];

/**
 * Modules. `prereqs` are hard dependencies — the scheduler will pull them in
 * automatically and never place a module before one of its prerequisites.
 */
export const MODULES = [
  {
    id: "how-llms-work",
    title: "How language models actually work",
    stage: 1,
    hours: 4,
    prereqs: [],
    outcome: "Explain tokens, context windows, sampling temperature and why models make things up.",
  },
  {
    id: "prompt-anatomy",
    title: "Prompt anatomy: role, task, context, format",
    stage: 1,
    hours: 5,
    prereqs: ["how-llms-work"],
    outcome: "Write a prompt whose instructions, inputs and output format are separated and explicit.",
  },
  {
    id: "iterative-prompting",
    title: "Few-shot examples and step-by-step reasoning",
    stage: 1,
    hours: 6,
    prereqs: ["prompt-anatomy"],
    outcome: "Improve a weak answer by adding examples, decomposition and an explicit rubric.",
  },
  {
    id: "verification",
    title: "Checking output: hallucinations, citations, spot checks",
    stage: 1,
    hours: 4,
    prereqs: ["iterative-prompting"],
    outcome: "Design a verification step for any task where a wrong answer would be costly.",
  },
  {
    id: "structured-output",
    title: "Structured output: JSON, schemas and validation",
    stage: 2,
    hours: 5,
    prereqs: ["iterative-prompting"],
    outcome: "Get machine-readable output reliably and fail safely when it does not validate.",
  },
  {
    id: "responsible-use",
    title: "Privacy, licensing and responsible use",
    stage: 2,
    hours: 6,
    prereqs: ["how-llms-work"],
    outcome: "Know what you may paste into a hosted model and how to document AI use at work.",
  },
  {
    id: "python-basics",
    title: "Python for AI work",
    stage: 2,
    hours: 20,
    prereqs: [],
    optionalIfKnown: "python",
    outcome: "Read and write scripts with functions, files, virtual environments and HTTP calls.",
  },
  {
    id: "model-apis",
    title: "Calling model APIs: streaming, retries, rate limits",
    stage: 2,
    hours: 8,
    prereqs: ["python-basics", "structured-output"],
    outcome: "Build a small script that calls a model API and handles timeouts and 429s.",
  },
  {
    id: "cost-latency",
    title: "Cost and latency engineering",
    stage: 3,
    hours: 6,
    prereqs: ["model-apis"],
    outcome: "Estimate token cost per request and cut it with caching, batching and shorter context.",
  },
  {
    id: "embeddings",
    title: "Embeddings and vector search",
    stage: 3,
    hours: 10,
    prereqs: ["model-apis"],
    outcome: "Chunk a corpus, embed it, and run similarity search with sensible chunk sizes.",
  },
  {
    id: "rag",
    title: "Retrieval-augmented generation end to end",
    stage: 3,
    hours: 14,
    prereqs: ["embeddings", "structured-output"],
    outcome: "Ship a question-answering app over your own documents, with citations.",
  },
  {
    id: "tools-agents",
    title: "Tool use, function calling and agent loops",
    stage: 3,
    hours: 12,
    prereqs: ["structured-output", "model-apis"],
    outcome: "Give a model typed tools and control the loop, budget and failure paths.",
  },
  {
    id: "evaluation",
    title: "Evaluation: golden sets, judges and regression tests",
    stage: 3,
    hours: 10,
    prereqs: ["model-apis", "verification"],
    outcome: "Build a scored test set so a prompt or model change can be measured, not guessed.",
  },
  {
    id: "ml-foundations",
    title: "ML foundations: data, loss, training loop, overfitting",
    stage: 4,
    hours: 25,
    prereqs: ["python-basics"],
    optionalIfKnown: "ml",
    outcome: "Train a small model from scratch and read a loss curve without hand-waving.",
  },
  {
    id: "transformers",
    title: "Transformer architecture and attention",
    stage: 4,
    hours: 15,
    prereqs: ["ml-foundations"],
    outcome: "Trace a token through attention, feed-forward blocks and the output head.",
  },
  {
    id: "dataset-curation",
    title: "Dataset curation and instruction formatting",
    stage: 4,
    hours: 10,
    prereqs: ["ml-foundations"],
    outcome: "Turn raw examples into a clean, deduplicated, correctly templated training set.",
  },
  {
    id: "peft",
    title: "Parameter-efficient fine-tuning (LoRA and QLoRA)",
    stage: 5,
    hours: 16,
    prereqs: ["transformers", "dataset-curation"],
    outcome: "Fine-tune an open-weight model on one GPU and measure whether it actually improved.",
  },
  {
    id: "preference-tuning",
    title: "Preference tuning: SFT, DPO and RLHF concepts",
    stage: 5,
    hours: 14,
    prereqs: ["peft"],
    outcome: "Explain how preference data shapes behaviour and when it beats more supervised data.",
  },
  {
    id: "full-finetune",
    title: "Full fine-tuning and continued pretraining",
    stage: 5,
    hours: 14,
    prereqs: ["peft"],
    outcome: "Judge when full-weight training is justified and estimate the compute it needs.",
  },
  {
    id: "serving",
    title: "Serving, quantisation and inference cost",
    stage: 5,
    hours: 10,
    prereqs: ["peft", "cost-latency"],
    outcome: "Deploy a tuned model, quantise it, and measure tokens per second against cost.",
  },
];

const MODULE_BY_ID = MODULES.reduce((map, learningModule) => {
  map[learningModule.id] = learningModule;
  return map;
}, {});

/** Goal tracks. `targets` are the end points; prerequisites are pulled in. */
export const GOALS = [
  {
    id: "prompting",
    label: "Prompt reliably at work",
    blurb: "Get consistent, checkable answers out of hosted assistants without writing code.",
    targets: ["verification", "structured-output", "responsible-use"],
  },
  {
    id: "builder",
    label: "Build AI features and RAG apps",
    blurb: "Ship retrieval, tool use and evaluation on top of model APIs.",
    targets: ["rag", "tools-agents", "evaluation", "cost-latency", "responsible-use"],
  },
  {
    id: "finetuner",
    label: "Fine-tune open models",
    blurb: "Adapt open-weight models to a domain and serve them yourself.",
    targets: ["peft", "serving", "evaluation", "responsible-use"],
  },
  {
    id: "researcher",
    label: "Go deep on training and alignment",
    blurb: "The full path, including preference tuning and full-weight training.",
    targets: ["preference-tuning", "full-finetune", "serving", "evaluation", "responsible-use"],
  },
];

const GOAL_BY_ID = GOALS.reduce((map, goal) => {
  map[goal.id] = goal;
  return map;
}, {});

/** Prompting experience levels and the modules each one lets you skip. */
export const PROMPTING_LEVELS = [
  { id: "new", label: "New to AI tools", skips: [] },
  { id: "casual", label: "Use chatbots most weeks", skips: ["how-llms-work"] },
  {
    id: "confident",
    label: "Confident prompter",
    skips: ["how-llms-work", "prompt-anatomy", "iterative-prompting"],
  },
];

/** Coding / ML background and the modules it lets you skip. */
export const CODING_LEVELS = [
  { id: "none", label: "No coding background", skips: [] },
  { id: "some-code", label: "Code in another language", skips: [] },
  { id: "python", label: "Comfortable in Python", skips: ["python-basics"] },
  { id: "ml", label: "Have trained ML models before", skips: ["python-basics", "ml-foundations"] },
];

export const MIN_HOURS_PER_WEEK = 1;
export const MAX_HOURS_PER_WEEK = 60;

const isIsoDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** Add whole days to an ISO date. Pure — no clock read. */
export function addDays(iso, days) {
  if (!isIsoDate(iso) || !Number.isFinite(days)) return null;
  const stamp = Date.parse(`${iso}T00:00:00Z`) + Math.round(days) * 86400000;
  return new Date(stamp).toISOString().slice(0, 10);
}

/** All modules needed to reach `targets`, including transitive prerequisites. */
export function closure(targets) {
  const needed = new Set();
  const visit = (id) => {
    const learningModule = MODULE_BY_ID[id];
    if (!learningModule || needed.has(id)) return;
    needed.add(id);
    learningModule.prereqs.forEach(visit);
  };
  (Array.isArray(targets) ? targets : []).forEach(visit);
  return needed;
}

/** Depth-first topological sort so no module is scheduled before a prerequisite. */
function topoSort(ids) {
  const ordered = [];
  const done = new Set();
  const visit = (id) => {
    if (done.has(id) || !ids.has(id)) return;
    done.add(id);
    MODULE_BY_ID[id].prereqs.forEach(visit);
    ordered.push(id);
  };
  // Walk in declaration order so the result is stable and stage-ascending.
  MODULES.forEach((learningModule) => {
    if (ids.has(learningModule.id)) visit(learningModule.id);
  });
  return ordered;
}

/**
 * Build a scheduled roadmap.
 *
 * @param {object} input
 * @param {string} input.goalId one of GOALS
 * @param {string} input.promptingLevel one of PROMPTING_LEVELS
 * @param {string} input.codingLevel one of CODING_LEVELS
 * @param {number} input.hoursPerWeek study hours available each week
 * @param {string} input.startDate ISO date the plan begins (supplied, not read)
 * @param {number} [input.weeksAvailable] optional deadline in weeks
 * @returns {object|{error: string}}
 */
export function buildRoadmap(input = {}) {
  const goal = GOAL_BY_ID[input.goalId];
  if (!goal) return { error: "Choose a learning goal." };

  const prompting = PROMPTING_LEVELS.find((level) => level.id === input.promptingLevel);
  if (!prompting) return { error: "Choose your current prompting experience." };

  const coding = CODING_LEVELS.find((level) => level.id === input.codingLevel);
  if (!coding) return { error: "Choose your coding background." };

  const hoursPerWeek = Number(input.hoursPerWeek);
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0) {
    return { error: "Enter how many study hours you have each week." };
  }
  if (hoursPerWeek < MIN_HOURS_PER_WEEK || hoursPerWeek > MAX_HOURS_PER_WEEK) {
    return {
      error: `Study hours per week should be between ${MIN_HOURS_PER_WEEK} and ${MAX_HOURS_PER_WEEK}.`,
    };
  }
  if (!isIsoDate(input.startDate)) {
    return { error: "Pick a valid start date." };
  }

  const weeksAvailable =
    input.weeksAvailable === "" || input.weeksAvailable == null ? null : Number(input.weeksAvailable);
  if (weeksAvailable !== null && (!Number.isFinite(weeksAvailable) || weeksAvailable <= 0)) {
    return { error: "Weeks available must be a positive number, or left blank." };
  }

  const needed = closure(goal.targets);
  const skipped = new Set([...prompting.skips, ...coding.skips].filter((id) => needed.has(id)));

  // A skipped module still counts as satisfied for anything that depends on it.
  const study = [...needed].filter((id) => !skipped.has(id));
  if (study.length === 0) {
    return {
      error: "Your experience already covers this goal — pick a deeper goal to get a study plan.",
    };
  }

  const order = topoSort(new Set(study));

  let cumulative = 0;
  const plan = order.map((id) => {
    const learningModule = MODULE_BY_ID[id];
    const startHours = cumulative;
    cumulative += learningModule.hours;
    return {
      ...learningModule,
      stageName: STAGES.find((stage) => stage.id === learningModule.stage)?.name ?? "",
      cumulativeHours: cumulative,
      weekStart: Math.floor(startHours / hoursPerWeek) + 1,
      weekEnd: Math.max(Math.ceil(cumulative / hoursPerWeek), Math.floor(startHours / hoursPerWeek) + 1),
    };
  });

  const totalHours = cumulative;
  const totalWeeks = Math.ceil(totalHours / hoursPerWeek);
  const finishDate = addDays(input.startDate, totalWeeks * 7);

  const skippedModules = [...skipped].map((id) => MODULE_BY_ID[id]);
  const skippedHours = skippedModules.reduce((sum, learningModule) => sum + learningModule.hours, 0);

  const byStage = STAGES.map((stage) => {
    const modules = plan.filter((learningModule) => learningModule.stage === stage.id);
    return {
      ...stage,
      count: modules.length,
      hours: modules.reduce((sum, learningModule) => sum + learningModule.hours, 0),
    };
  }).filter((stage) => stage.count > 0);

  let deadline = null;
  if (weeksAvailable !== null) {
    const fits = totalWeeks <= weeksAvailable;
    deadline = {
      weeksAvailable,
      fits,
      weeksOver: fits ? 0 : totalWeeks - weeksAvailable,
      hoursPerWeekNeeded: Math.ceil((totalHours / weeksAvailable) * 10) / 10,
    };
  }

  return {
    goal,
    plan,
    byStage,
    totalHours,
    totalWeeks,
    totalMonths: Math.round((totalWeeks / 4.345) * 10) / 10, // 52 weeks / 12 months
    hoursPerWeek,
    startDate: input.startDate,
    finishDate,
    moduleCount: plan.length,
    skippedModules,
    skippedHours,
    deadline,
  };
}

/** Plain-text export of a roadmap. Pure string builder. */
export function roadmapToText(roadmap) {
  if (!roadmap || roadmap.error) return "";
  const lines = [
    `AI Learning Roadmap — ${roadmap.goal.label}`,
    `${roadmap.moduleCount} modules · ${roadmap.totalHours} study hours · ${roadmap.totalWeeks} weeks at ${roadmap.hoursPerWeek} h/week`,
    `${roadmap.startDate} to ${roadmap.finishDate}`,
    "",
  ];
  for (const learningModule of roadmap.plan) {
    const weeks =
      learningModule.weekStart === learningModule.weekEnd
        ? `Week ${learningModule.weekStart}`
        : `Weeks ${learningModule.weekStart}-${learningModule.weekEnd}`;
    lines.push(`${weeks}: ${learningModule.title} (${learningModule.hours} h)`);
    lines.push(`    ${learningModule.outcome}`);
  }
  return lines.join("\n");
}
