/**
 * Video Production Checklist Generator — task selection and time budgeting.
 *
 * Pure module. Clock times are derived from a call time passed in as a string,
 * never from the system clock.
 */

export const MINUTES_PER_DAY = 1440;

/**
 * Video types with default planning ratios.
 * `shootRatio` is minutes of footage recorded per finished minute.
 * `editRatio` is minutes of editing per minute of footage.
 * Both are starting points — override them with your own tracked numbers.
 */
export const VIDEO_TYPES = [
  { id: "talking-head", label: "Talking head / piece to camera", shootRatio: 3, editRatio: 4 },
  { id: "interview", label: "Interview", shootRatio: 6, editRatio: 5 },
  { id: "tutorial", label: "Tutorial / screencast", shootRatio: 4, editRatio: 6 },
  { id: "product-review", label: "Product review or unboxing", shootRatio: 5, editRatio: 5 },
  { id: "event", label: "Event coverage", shootRatio: 10, editRatio: 3 },
  { id: "vlog", label: "Vlog / b-roll package", shootRatio: 8, editRatio: 4 },
];

export const LIMITS = {
  minRuntime: 0.5,
  maxRuntime: 240,
  minShootRatio: 0.5,
  maxShootRatio: 60,
  minEditRatio: 0.1,
  maxEditRatio: 60,
  minCrew: 1,
  maxCrew: 50,
  minContingency: 0,
  maxContingency: 100,
};

/**
 * Task library.
 *   fixedMinutes      — flat cost regardless of length
 *   perFootageMinutes — minutes per minute of recorded footage
 *   perRuntimeMinutes — minutes per minute of finished runtime
 *   editWeight        — share of the editing budget (footage x editRatio)
 *   types             — null for every video type, otherwise a list
 *   requires          — condition flags that must all be true
 */
export const TASKS = [
  // Pre-production
  {
    id: "brief",
    phase: "Pre",
    title: "Write the one-line brief and the promise of the video",
    detail: "One sentence on who it is for and what they can do afterwards. Everything else is judged against it.",
    fixedMinutes: 20,
    types: null,
  },
  {
    id: "outline",
    phase: "Pre",
    title: "Outline or script the piece",
    detail: "Scripted delivery cuts shoot time far more than it costs to write.",
    fixedMinutes: 20,
    perRuntimeMinutes: 8,
    types: null,
  },
  {
    id: "questions",
    phase: "Pre",
    title: "Draft and send interview questions",
    detail: "Send themes rather than exact wording so the answers stay conversational.",
    fixedMinutes: 45,
    types: ["interview"],
  },
  {
    id: "demo-rehearse",
    phase: "Pre",
    title: "Rehearse the demo end to end",
    detail: "Run the software or product path once so you are not discovering a bug on camera.",
    fixedMinutes: 30,
    types: ["tutorial", "product-review"],
  },
  {
    id: "shotlist",
    phase: "Pre",
    title: "Build the shot list",
    detail: "Every setup, lens and framing you need, in the order you will shoot them.",
    fixedMinutes: 25,
    types: null,
  },
  {
    id: "recce",
    phase: "Pre",
    title: "Scout the location and check permissions",
    detail: "Light direction at the shoot time, ambient noise, power access and who has to say yes.",
    fixedMinutes: 45,
    requires: ["outdoor"],
    types: null,
  },
  {
    id: "runsheet",
    phase: "Pre",
    title: "Agree the run of show with the organiser",
    detail: "What is happening when, and which moments are non-negotiable to capture.",
    fixedMinutes: 40,
    types: ["event"],
  },
  {
    id: "gear-check",
    phase: "Pre",
    title: "Check and charge every battery, format every card",
    detail: "Formatting in camera the day before is the cheapest insurance in production.",
    fixedMinutes: 25,
    types: null,
  },
  {
    id: "graphics-brief",
    phase: "Pre",
    title: "Brief the lower thirds, titles and end card",
    detail: "Naming the graphics before the shoot stops the edit stalling later.",
    fixedMinutes: 30,
    requires: ["graphics"],
    types: null,
  },

  // Shoot day
  {
    id: "setup-light",
    phase: "Shoot",
    title: "Set the key, fill and background lights",
    detail: "Key first, then subtract. Kill any mixed colour temperature before you start.",
    fixedMinutes: 30,
    types: null,
  },
  {
    id: "setup-audio",
    phase: "Shoot",
    title: "Rig audio and set levels",
    detail: "Aim for peaks around -12 dBFS, record a backup track, and listen on headphones, not the meters alone.",
    fixedMinutes: 20,
    types: null,
  },
  {
    id: "setup-camera",
    phase: "Shoot",
    title: "Set exposure, white balance and focus",
    detail: "Lock the white balance to a card. Auto white balance drifting mid-take is unfixable in the grade.",
    fixedMinutes: 15,
    types: null,
  },
  {
    id: "multicam-sync",
    phase: "Shoot",
    title: "Match all cameras and record a sync clap",
    detail: "Same frame rate, shutter and white balance on every body, then one clap in frame for every camera.",
    fixedMinutes: 15,
    requires: ["multicam"],
    types: null,
  },
  {
    id: "test-take",
    phase: "Shoot",
    title: "Record a test take and play it back",
    detail: "Watch and listen to thirty seconds before committing to the day.",
    fixedMinutes: 10,
    types: null,
  },
  {
    id: "record",
    phase: "Shoot",
    title: "Record the main content",
    detail: "Rolling time for every take, including resets between them.",
    perFootageMinutes: 1,
    types: null,
  },
  {
    id: "safety",
    phase: "Shoot",
    title: "Shoot safety takes of the opening and closing",
    detail: "The two moments most likely to be re-cut are the hook and the call to action.",
    fixedMinutes: 15,
    types: null,
  },
  {
    id: "broll",
    phase: "Shoot",
    title: "Collect cutaways and b-roll",
    detail: "Cutaways are what make a jump cut invisible. Get more than feels necessary.",
    fixedMinutes: 25,
    types: null,
  },
  {
    id: "room-tone",
    phase: "Shoot",
    title: "Record 60 seconds of room tone",
    detail: "Silent-room ambience the editor can lay under cuts so the audio floor never jumps.",
    fixedMinutes: 5,
    types: null,
  },
  {
    id: "on-set-backup",
    phase: "Shoot",
    title: "Copy cards to two drives before striking the set",
    detail: "Verify the copy, then keep the cards untouched until the edit is locked.",
    fixedMinutes: 20,
    perFootageMinutes: 0.2,
    types: null,
  },

  // Post
  {
    id: "ingest",
    phase: "Post",
    title: "Ingest, rename and back up",
    detail: "One naming convention, two copies, one of them somewhere else.",
    fixedMinutes: 15,
    perFootageMinutes: 0.25,
    types: null,
  },
  {
    id: "assembly",
    phase: "Post",
    title: "Sync, select and build the assembly",
    detail: "Get the story in order before touching a transition.",
    editWeight: 4,
    types: null,
  },
  {
    id: "fine-cut",
    phase: "Post",
    title: "Fine cut for pace",
    detail: "Cut the first ten seconds hardest; that is where most of the audience is lost.",
    editWeight: 3,
    types: null,
  },
  {
    id: "audio-mix",
    phase: "Post",
    title: "Clean and mix the audio",
    detail: "Noise reduction, levels and music ducking. Target around -14 LUFS integrated for online delivery.",
    editWeight: 2,
    types: null,
  },
  {
    id: "colour",
    phase: "Post",
    title: "Balance and grade",
    detail: "Match shots to each other first, then apply a look.",
    editWeight: 2,
    types: null,
  },
  {
    id: "graphics-build",
    phase: "Post",
    title: "Build titles, lower thirds and the end card",
    detail: "Check every name and job title against a written source, not memory.",
    fixedMinutes: 30,
    editWeight: 1,
    requires: ["graphics"],
    types: null,
  },
  {
    id: "captions",
    phase: "Post",
    title: "Generate and correct captions",
    detail: "Auto-generate, then fix names, jargon and numbers by hand.",
    perRuntimeMinutes: 3,
    types: null,
  },
  {
    id: "qc",
    phase: "Post",
    title: "Watch the export end to end before publishing",
    detail: "Full screen, headphones on, no scrubbing. Check the last frame and the audio tail.",
    fixedMinutes: 10,
    perRuntimeMinutes: 1,
    types: null,
  },
  {
    id: "package",
    phase: "Post",
    title: "Write the title, description, chapters and thumbnail",
    detail: "Chapters come from the outline you already wrote in pre-production.",
    fixedMinutes: 35,
    types: null,
  },
];

/** Parse "HH:MM" into minutes since midnight; NaN when malformed. */
export function parseClock(value) {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) return NaN;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

/** Format minutes since midnight as "HH:MM", wrapping past midnight. */
export function formatClock(totalMinutes) {
  const value = Number(totalMinutes);
  if (!Number.isFinite(value)) return "--:--";
  const wrapped = ((Math.round(value) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Human duration such as "2 h 15 min". */
export function formatDuration(totalMinutes) {
  const value = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/**
 * Largest remainder apportionment so the editing budget splits into whole
 * minutes that still sum to the total.
 */
export function allocateByLargestRemainder(total, weights) {
  const keys = Object.keys(weights);
  const sum = keys.reduce((acc, key) => acc + Math.max(0, weights[key] || 0), 0);
  const result = {};
  keys.forEach((key) => {
    result[key] = 0;
  });
  if (!(total > 0) || !(sum > 0)) return result;

  const parts = keys.map((key) => {
    const share = (Math.max(0, weights[key] || 0) / sum) * total;
    return { key, floor: Math.floor(share), remainder: share - Math.floor(share) };
  });

  let assigned = 0;
  parts.forEach((part) => {
    result[part.key] = part.floor;
    assigned += part.floor;
  });

  const ordered = parts
    .slice()
    .sort((a, b) => b.remainder - a.remainder || keys.indexOf(a.key) - keys.indexOf(b.key));

  let index = 0;
  while (assigned < total && ordered.length > 0) {
    result[ordered[index % ordered.length].key] += 1;
    assigned += 1;
    index += 1;
  }
  return result;
}

/**
 * Build the full production plan.
 *
 * @param {object} input
 * @param {string} input.videoTypeId   one of VIDEO_TYPES.
 * @param {number} input.runtimeMinutes finished length.
 * @param {number} [input.shootRatio]  footage minutes per finished minute.
 * @param {number} [input.editRatio]   edit minutes per footage minute.
 * @param {number} input.crewSize      people available on the shoot day.
 * @param {boolean} input.outdoor      shooting on location or outdoors.
 * @param {boolean} input.multicam     more than one camera.
 * @param {boolean} input.graphics     the edit needs titles or lower thirds.
 * @param {number} input.contingencyPercent buffer added to every phase.
 * @param {string} input.callTime      "HH:MM" the shoot day starts.
 */
export function buildProductionPlan({
  videoTypeId,
  runtimeMinutes,
  shootRatio,
  editRatio,
  crewSize = 1,
  outdoor = false,
  multicam = false,
  graphics = false,
  contingencyPercent = 20,
  callTime = "09:00",
} = {}) {
  const type = VIDEO_TYPES.find((item) => item.id === videoTypeId);
  if (!type) return { error: "Choose a video type." };

  const runtime = Number(runtimeMinutes);
  const shoot = Number(shootRatio ?? type.shootRatio);
  const edit = Number(editRatio ?? type.editRatio);
  const crew = Number(crewSize);
  const contingency = Number(contingencyPercent);
  const call = parseClock(callTime);

  if (![runtime, shoot, edit, crew, contingency].every(Number.isFinite)) {
    return { error: "Enter valid numbers for runtime, ratios, crew and contingency." };
  }
  if (runtime < LIMITS.minRuntime || runtime > LIMITS.maxRuntime) {
    return { error: `Finished runtime must be between ${LIMITS.minRuntime} and ${LIMITS.maxRuntime} minutes.` };
  }
  if (shoot < LIMITS.minShootRatio || shoot > LIMITS.maxShootRatio) {
    return { error: `Shooting ratio must be between ${LIMITS.minShootRatio} and ${LIMITS.maxShootRatio}.` };
  }
  if (edit < LIMITS.minEditRatio || edit > LIMITS.maxEditRatio) {
    return { error: `Editing ratio must be between ${LIMITS.minEditRatio} and ${LIMITS.maxEditRatio}.` };
  }
  if (crew < LIMITS.minCrew || crew > LIMITS.maxCrew) {
    return { error: `Crew size must be between ${LIMITS.minCrew} and ${LIMITS.maxCrew}.` };
  }
  if (contingency < LIMITS.minContingency || contingency > LIMITS.maxContingency) {
    return { error: "Contingency must be between 0% and 100%." };
  }
  if (!Number.isFinite(call)) {
    return { error: "Call time must be in 24-hour HH:MM form." };
  }

  const flags = { outdoor, multicam, graphics };
  const selected = TASKS.filter((task) => {
    if (task.types && !task.types.includes(type.id)) return false;
    if (task.requires && !task.requires.every((flag) => flags[flag])) return false;
    return true;
  });

  const footageMinutes = runtime * shoot;
  const editingBudget = Math.round(footageMinutes * edit);

  const weights = {};
  selected.forEach((task) => {
    if (task.editWeight) weights[task.id] = task.editWeight;
  });
  const editShares = allocateByLargestRemainder(editingBudget, weights);

  // Extra hands mainly help the physical shoot-day setup, and with diminishing
  // returns — two people are not twice as fast at lighting one interview.
  const crewFactor = 1 / (1 + (Math.min(crew, 4) - 1) * 0.35);

  const items = selected.map((task) => {
    const base =
      (task.fixedMinutes || 0) +
      (task.perFootageMinutes || 0) * footageMinutes +
      (task.perRuntimeMinutes || 0) * runtime +
      (editShares[task.id] || 0);
    const helped = task.phase === "Shoot" && task.id !== "record" ? base * crewFactor : base;
    return {
      id: task.id,
      phase: task.phase,
      title: task.title,
      detail: task.detail,
      minutes: Math.max(1, Math.round(helped)),
    };
  });

  const phases = ["Pre", "Shoot", "Post"].map((phase) => {
    const phaseItems = items.filter((item) => item.phase === phase);
    const raw = phaseItems.reduce((acc, item) => acc + item.minutes, 0);
    return {
      phase,
      items: phaseItems,
      rawMinutes: raw,
      minutes: Math.round(raw * (1 + contingency / 100)),
    };
  });

  const shootPhase = phases.find((phase) => phase.phase === "Shoot");
  let cursor = call;
  const timeline = shootPhase.items.map((item) => {
    const start = cursor;
    cursor += item.minutes;
    return {
      id: item.id,
      title: item.title,
      minutes: item.minutes,
      start: formatClock(start),
      end: formatClock(cursor),
    };
  });
  const wrapMinutes = Math.round((cursor - call) * (1 + contingency / 100));

  const totalRaw = phases.reduce((acc, phase) => acc + phase.rawMinutes, 0);
  const total = phases.reduce((acc, phase) => acc + phase.minutes, 0);

  return {
    type,
    runtimeMinutes: runtime,
    shootRatio: shoot,
    editRatio: edit,
    footageMinutes,
    editingBudgetMinutes: editingBudget,
    crewSize: crew,
    contingencyPercent: contingency,
    phases,
    timeline,
    callTime: formatClock(call),
    wrapTime: formatClock(call + wrapMinutes),
    shootDayMinutes: wrapMinutes,
    totalRawMinutes: totalRaw,
    totalMinutes: total,
    taskCount: items.length,
  };
}
