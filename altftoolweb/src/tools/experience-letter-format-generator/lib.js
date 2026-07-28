/**
 * Experience / service certificate builder.
 *
 * Conventions and rules:
 *  - Tenure is inclusive of both the joining date and the last working day, the
 *    way employment records and background-verification agencies read it, so a
 *    single-day stint counts as one day rather than zero.
 *  - Calendar months are walked one at a time with end-of-month clamping, so a
 *    31 March start does not drift when the target month is shorter.
 *  - Several state Shops and Establishments Acts require an employer to issue a
 *    service certificate stating the period of employment and the nature of the
 *    work when employment ends. There is no prescribed central format, so the
 *    letter here follows the structure verification agencies actually check:
 *    identity, tenure, designation, employment type and a contact for
 *    verification.
 *  - Salary is not stated by default. Most employers omit it from an experience
 *    certificate and put it in the separate salary certificate.
 */

export const LETTER_STYLES = [
  {
    id: "standard",
    label: "Standard experience certificate",
    note: "Tenure, designations and a short conduct line. What most employers issue.",
  },
  {
    id: "detailed",
    label: "Detailed — includes duties",
    note: "Adds a responsibilities paragraph. Useful for visa files and professional body applications.",
  },
  {
    id: "verification",
    label: "Brief service certificate",
    note: "Facts only, no adjectives. What a background-verification vendor wants.",
  },
];

export const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time, permanent" },
  { id: "probation-confirmed", label: "Full-time (probation, later confirmed)" },
  { id: "contract", label: "Fixed-term contract" },
  { id: "intern", label: "Internship / trainee" },
  { id: "consultant", label: "Consultant / retainer" },
];

const MS_PER_DAY = 86400000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(Number(match[1]), month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

/** Add calendar months, clamping to the last day of the target month. */
export function addMonthsISO(isoDate, months) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(months)) return null;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(year, month + months, Math.min(day, lastDay))));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Years / months / days between two inclusive dates. */
export function tenureBreakdown(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to || to.getTime() < from.getTime()) return null;
  let months = 0;
  while (months < 1200) {
    const next = addMonthsISO(fromISO, months + 1);
    if (!next || parseISODate(next).getTime() > to.getTime()) break;
    months += 1;
  }
  const anchorISO = addMonthsISO(fromISO, months);
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: daysBetweenISO(anchorISO, toISODate),
    totalMonths: months,
    totalDays: daysBetweenISO(fromISO, toISODate) + 1,
  };
}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function formatTenure(tenure) {
  if (!tenure) return "";
  const parts = [];
  if (tenure.years) parts.push(plural(tenure.years, "year"));
  if (tenure.months) parts.push(plural(tenure.months, "month"));
  if (tenure.days || parts.length === 0) parts.push(plural(tenure.days, "day"));
  return parts.join(", ");
}

/**
 * Validate a designation timeline against the overall employment period and
 * compute the duration of each stint.
 *
 * @returns {object} { error } or { roles, issues, totalTenure, coveredDays }
 */
export function buildRoleTimeline({ roles, joiningDateISO, lastWorkingDayISO }) {
  if (!parseISODate(joiningDateISO)) return { error: "Enter a valid date of joining." };
  if (!parseISODate(lastWorkingDayISO)) return { error: "Enter a valid last working day." };
  if (daysBetweenISO(joiningDateISO, lastWorkingDayISO) < 0) {
    return { error: "The last working day is before the date of joining. Check the two dates." };
  }
  if (!Array.isArray(roles) || roles.length === 0) {
    return { error: "Add at least one designation with its start and end date." };
  }

  const parsed = [];
  for (const role of roles) {
    const title = typeof role.title === "string" ? role.title.trim() : "";
    if (!title) return { error: "Every designation needs a title." };
    if (!parseISODate(role.fromISO)) return { error: `Enter a valid start date for "${title}".` };
    if (!parseISODate(role.toISO)) return { error: `Enter a valid end date for "${title}".` };
    if (daysBetweenISO(role.fromISO, role.toISO) < 0) {
      return { error: `"${title}" ends before it starts. Check its dates.` };
    }
    parsed.push({ title, fromISO: role.fromISO, toISO: role.toISO });
  }

  parsed.sort((a, b) => parseISODate(a.fromISO) - parseISODate(b.fromISO));

  const issues = [];
  if (parsed[0].fromISO !== joiningDateISO) {
    issues.push(
      `The first designation starts on ${formatLongDate(parsed[0].fromISO)} but the date of joining is ${formatLongDate(joiningDateISO)}.`,
    );
  }
  const last = parsed[parsed.length - 1];
  if (last.toISO !== lastWorkingDayISO) {
    issues.push(
      `The last designation ends on ${formatLongDate(last.toISO)} but the last working day is ${formatLongDate(lastWorkingDayISO)}.`,
    );
  }

  for (let index = 1; index < parsed.length; index += 1) {
    const previous = parsed[index - 1];
    const current = parsed[index];
    const gap = daysBetweenISO(previous.toISO, current.fromISO);
    if (gap > 1) {
      issues.push(
        `${gap - 1} day(s) are unaccounted for between "${previous.title}" ending on ${formatLongDate(previous.toISO)} and "${current.title}" starting on ${formatLongDate(current.fromISO)}.`,
      );
    } else if (gap < 1) {
      issues.push(
        `"${previous.title}" and "${current.title}" overlap. A designation should end the day before the next one starts.`,
      );
    }
  }

  const withDurations = parsed.map((role) => {
    const tenure = tenureBreakdown(role.fromISO, role.toISO);
    return { ...role, tenure, tenureText: formatTenure(tenure), days: tenure.totalDays };
  });

  const totalTenure = tenureBreakdown(joiningDateISO, lastWorkingDayISO);
  const coveredDays = withDurations.reduce((sum, role) => sum + role.days, 0);
  if (issues.length === 0 && coveredDays !== totalTenure.totalDays) {
    issues.push(
      `The designations add up to ${coveredDays} days but the employment period is ${totalTenure.totalDays} days.`,
    );
  }

  return {
    roles: withDurations,
    issues,
    totalTenure,
    totalTenureText: formatTenure(totalTenure),
    coveredDays,
    clean: issues.length === 0,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Compose the experience certificate on the employer's behalf. */
export function buildExperienceLetter({
  companyName,
  companyAddress,
  companyCin,
  employeeName,
  employeeId,
  pronoun = "they",
  employmentTypeId = "full-time",
  joiningDateISO,
  lastWorkingDayISO,
  issueDateISO,
  styleId = "standard",
  duties,
  signatoryName,
  signatoryDesignation,
  verificationEmail,
  verificationPhone,
  timeline,
}) {
  if (!timeline || timeline.error) {
    return { error: timeline?.error || "Fix the designation timeline before generating the certificate." };
  }
  const company = clean(companyName) || "[Company name]";
  const address = clean(companyAddress) || "[Registered address]";
  const name = clean(employeeName) || "[Employee name]";
  const empId = clean(employeeId) || "[Employee ID]";
  const style = LETTER_STYLES.find((item) => item.id === styleId) || LETTER_STYLES[0];
  const employment = EMPLOYMENT_TYPES.find((item) => item.id === employmentTypeId) || EMPLOYMENT_TYPES[0];

  const subjects = { he: "he", she: "she", they: "they" };
  const possessives = { he: "his", she: "her", they: "their" };
  const objects = { he: "him", she: "her", they: "them" };
  const subject = subjects[pronoun] || "they";
  const possessive = possessives[pronoun] || "their";
  const object = objects[pronoun] || "them";
  const verb = pronoun === "they" ? "were" : "was";

  const finalRole = timeline.roles[timeline.roles.length - 1];

  const roleLines = timeline.roles.map(
    (role) =>
      `${role.title}: ${formatLongDate(role.fromISO)} to ${formatLongDate(role.toISO)} (${role.tenureText})`,
  );

  const header = [
    company,
    address,
    clean(companyCin) ? `CIN: ${clean(companyCin)}` : "",
    "",
    formatLongDate(issueDateISO) || "[date of issue]",
    "",
    "TO WHOMSOEVER IT MAY CONCERN",
    "",
  ];

  const core = [
    // The subject of this sentence is the employee's name, so the verb is always singular.
    `This is to certify that ${name}${clean(employeeId) ? ` (Employee ID: ${empId})` : ""} was employed with ${company} from ${formatLongDate(joiningDateISO)} to ${formatLongDate(lastWorkingDayISO)}, a total period of ${timeline.totalTenureText}.`,
    "",
    timeline.roles.length > 1
      ? `During this period ${subject} held the following designations:`
      : `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${verb} employed as ${finalRole.title}.`,
    ...(timeline.roles.length > 1 ? roleLines.map((line, index) => `${index + 1}. ${line}`) : []),
    "",
    `Nature of employment: ${employment.label}.`,
    `Designation at the time of leaving: ${finalRole.title}.`,
  ];

  const dutiesBlock =
    style.id === "detailed" && clean(duties)
      ? ["", `${possessive.charAt(0).toUpperCase()}${possessive.slice(1)} principal responsibilities included: ${clean(duties)}`]
      : [];

  const conductBlock =
    style.id === "verification"
      ? ["", "This certificate is issued at the request of the employee for record and verification purposes."]
      : [
          "",
          `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${verb} relieved from ${possessive} duties on ${formatLongDate(lastWorkingDayISO)} on ${possessive} own request, and all dues between ${object} and the company have been settled.`,
          "",
          `We found ${object} to be sincere and diligent, and we wish ${object} well in ${possessive} future endeavours.`,
        ];

  const footer = [
    "",
    "For " + company,
    "",
    "",
    clean(signatoryName) || "[Authorised signatory]",
    clean(signatoryDesignation) || "[Designation, e.g. Head of Human Resources]",
    clean(verificationEmail) ? `Verification email: ${clean(verificationEmail)}` : "",
    clean(verificationPhone) ? `Verification phone: ${clean(verificationPhone)}` : "",
    "",
    "(Issued on company letterhead. Please verify at the contact given above.)",
  ];

  const body = [...header, ...core, ...dutiesBlock, ...conductBlock, ...footer]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const verificationLine = `${name} — ${finalRole.title} at ${company}, ${formatLongDate(joiningDateISO)} to ${formatLongDate(lastWorkingDayISO)} (${timeline.totalTenureText}), ${employment.label.toLowerCase()}.`;

  return {
    body,
    verificationLine,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    style,
  };
}
