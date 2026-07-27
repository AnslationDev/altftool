/**
 * Deprecation timeline planner.
 *
 * The four-stage lifecycle (announce -> warn -> brownout/disable -> remove) is
 * the standard staged-deprecation pattern: Node.js documents its deprecation
 * levels (documentation-only, runtime warning, end-of-life removal), and large
 * API providers run temporary "brownout" outages before final shutdown (GitHub
 * used scheduled brownouts before removing password-based API authentication
 * in 2020). Notice-period guidance: many public API policies promise 6-12
 * months for stable surfaces; 90 days is a common floor for smaller services.
 */

/** Common floor for public deprecation notice, in days. */
export const RECOMMENDED_MIN_NOTICE_DAYS = 90;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function formatIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STAGES = [
  {
    id: "announce",
    label: "Announce",
    description: "Publish the deprecation notice: what is going away, the replacement, and every date below.",
  },
  {
    id: "warn",
    label: "Warn",
    description: "Old path keeps working but emits a runtime/deprecation warning pointing at the replacement.",
  },
  {
    id: "disable",
    label: "Brownout / disable",
    description: "Temporarily disable the old path for short windows so stragglers notice before the hard cut.",
  },
  {
    id: "remove",
    label: "Remove",
    description: "Old path is permanently removed; requests fail and the code is deleted in the next release.",
  },
];

function buildTemplates({ featureName, replacement, dates }) {
  const name = featureName;
  const alt = replacement !== "" ? replacement : "the documented replacement";
  return {
    announcement: [
      `Deprecation notice: ${name}`,
      "",
      `${name} is deprecated as of ${dates.announce} and will be removed on ${dates.remove}.`,
      `Please migrate to ${alt}.`,
      "",
      `Timeline:`,
      `- ${dates.announce}: deprecation announced; documentation updated`,
      `- ${dates.warn}: runtime deprecation warnings begin`,
      `- ${dates.disable}: temporary brownout windows — ${name} will be intermittently unavailable`,
      `- ${dates.remove}: ${name} is permanently removed`,
      "",
      `Questions or blockers? Reply to this notice before ${dates.warn}.`,
    ].join("\n"),
    warning: `DeprecationWarning: ${name} is deprecated and will be removed on ${dates.remove}. Migrate to ${alt}. Details: <link to notice>.`,
    removalChangelog: [
      `### Removed`,
      `- ${name} (deprecated ${dates.announce}) has been removed as scheduled on ${dates.remove}. Use ${alt} instead.`,
    ].join("\n"),
  };
}

/**
 * Build the deprecation timeline.
 *
 * @param {object} input
 * @param {string} input.featureName       What is being deprecated.
 * @param {string} [input.replacement]     What consumers should use instead.
 * @param {string} input.announceDate      yyyy-mm-dd of the announcement.
 * @param {number} input.warnAfterDays     Days after announce when warnings start.
 * @param {number} input.disableAfterDays  Days after announce when brownouts start.
 * @param {number} input.removeAfterDays   Days after announce of permanent removal.
 * @returns {{milestones:Array, totalDays:number, shortNotice:boolean, templates:object}|{error:string}}
 */
export function planDeprecationTimeline({
  featureName,
  replacement = "",
  announceDate,
  warnAfterDays,
  disableAfterDays,
  removeAfterDays,
}) {
  const name = typeof featureName === "string" ? featureName.trim() : "";
  if (name === "") return { error: "Name the feature, endpoint or API being deprecated." };

  const announce = parseIsoDate(announceDate);
  if (!announce) return { error: "Enter the announcement date in yyyy-mm-dd form." };

  const offsets = [
    ["warnAfterDays", Number(warnAfterDays)],
    ["disableAfterDays", Number(disableAfterDays)],
    ["removeAfterDays", Number(removeAfterDays)],
  ];
  for (const [key, value] of offsets) {
    if (!Number.isInteger(value) || value < 0) {
      return { error: "Each stage offset must be a whole number of days, 0 or more." };
    }
    if (value > 3650) return { error: "Stage offsets above 10 years are almost certainly a typo." };
  }
  const warn = Number(warnAfterDays);
  const disable = Number(disableAfterDays);
  const remove = Number(removeAfterDays);
  if (!(warn <= disable && disable <= remove)) {
    return { error: "Stages must be in order: warn ≤ brownout ≤ removal (days after the announcement)." };
  }
  if (remove === 0) {
    return { error: "Removal cannot be on the announcement day — consumers need notice to migrate." };
  }

  const offsetById = { announce: 0, warn, disable, remove };
  const milestones = STAGES.map((stage) => {
    const days = offsetById[stage.id];
    return {
      id: stage.id,
      label: stage.label,
      description: stage.description,
      daysFromAnnounce: days,
      date: formatIsoDate(addDays(announce, days)),
    };
  });

  const dates = Object.fromEntries(milestones.map((milestone) => [milestone.id, milestone.date]));

  return {
    milestones,
    totalDays: remove,
    shortNotice: remove < RECOMMENDED_MIN_NOTICE_DAYS,
    templates: buildTemplates({ featureName: name, replacement: replacement.trim(), dates }),
  };
}
