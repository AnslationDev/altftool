/**
 * Grievance officer / grievance redressal page builder for Indian websites.
 *
 * Statutory sources encoded below (all Indian law, informational only):
 *  - Digital Personal Data Protection Act, 2023 (DPDP Act)
 *      s.5 + s.8(9)  : the Data Fiduciary must publish the business contact information of a
 *                      Data Protection Officer, or of a person able to answer questions about
 *                      the processing of personal data.
 *      s.13(1)/(2)   : the Data Fiduciary must provide a readily available means of grievance
 *                      redressal and respond within the period prescribed by the Rules.
 *      s.13(3)       : a Data Principal must exhaust that redressal before approaching the
 *                      Data Protection Board of India.
 *      s.10(2)(a)    : a Significant Data Fiduciary must appoint a Data Protection Officer who
 *                      is based in India and reports to the board/governing body.
 *  - Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
 *      Rule 3(2)(a)  : acknowledge a complaint within 24 hours and dispose of it within 15 days.
 *      Rule 3(2)(b)  : act on complaints about non-consensual intimate imagery within 24 hours.
 *      Rule 4(1)(c)  : a significant social media intermediary needs a Resident Grievance Officer.
 *      Rule 3A       : appeal to a Grievance Appellate Committee within 30 days of the decision.
 *  - Consumer Protection (E-Commerce) Rules, 2020
 *      Rule 4(5)     : appoint a Grievance Officer, acknowledge within 48 hours and redress the
 *                      complaint within one month of receipt.
 *
 * The DPDP Act itself fixes no number of days for a grievance reply — the period comes from the
 * Rules made under it, so the "dpdp" regime below leaves the period to the publisher and only
 * requires that whatever period is chosen is stated on the page.
 */

/** Hours in a day — used to express statutory acknowledgement windows. */
const HOURS_PER_DAY = 24;

/** Days treated as "one month" for Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5). */
const ONE_MONTH_DAYS = 30;

/** IT Rules, 2021 Rule 3A: window to appeal to a Grievance Appellate Committee. */
export const GAC_APPEAL_DAYS = 30;

/** National Consumer Helpline short code (Department of Consumer Affairs). */
export const NATIONAL_CONSUMER_HELPLINE = "1915";

export const GRIEVANCE_REGIMES = [
  {
    id: "dpdp",
    label: "Personal data only (DPDP Act, 2023)",
    statute: "Digital Personal Data Protection Act, 2023, s.13",
    ackHours: HOURS_PER_DAY * 2,
    resolveDays: 30,
    fixedByLaw: false,
    escalation:
      "If you are not satisfied with our response, you may make a complaint to the Data Protection Board of India. Under section 13(3) of the Act you must first use the grievance route above.",
    note: "The Act does not itself fix a reply deadline — you must publish the period you commit to, and meet it.",
  },
  {
    id: "intermediary",
    label: "Intermediary / platform (IT Rules, 2021)",
    statute: "IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, Rule 3(2)",
    ackHours: HOURS_PER_DAY,
    resolveDays: 15,
    fixedByLaw: true,
    escalation:
      "If you are not satisfied with the Grievance Officer's decision, you may appeal to a Grievance Appellate Committee constituted under Rule 3A of the IT Rules, 2021 within 30 days of receiving that decision.",
    note: "Rule 3(2)(a) fixes 24 hours to acknowledge and 15 days to dispose of the complaint. Complaints about non-consensual intimate imagery must be acted on within 24 hours under Rule 3(2)(b).",
  },
  {
    id: "ecommerce",
    label: "E-commerce entity (Consumer Protection E-Commerce Rules, 2020)",
    statute: "Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5)",
    ackHours: HOURS_PER_DAY * 2,
    resolveDays: ONE_MONTH_DAYS,
    fixedByLaw: true,
    escalation:
      "If your complaint is not redressed, you may contact the National Consumer Helpline on 1915 or file a complaint with the appropriate Consumer Disputes Redressal Commission.",
    note: "Rule 4(5) fixes 48 hours to acknowledge and one month from receipt to redress the complaint.",
  },
  {
    id: "combined",
    label: "Both platform and personal data (strictest timelines)",
    statute:
      "IT (Intermediary Guidelines) Rules, 2021, Rule 3(2) read with the Digital Personal Data Protection Act, 2023, s.13",
    ackHours: HOURS_PER_DAY,
    resolveDays: 15,
    fixedByLaw: true,
    escalation:
      "You may appeal a Grievance Officer decision to a Grievance Appellate Committee under Rule 3A of the IT Rules, 2021 within 30 days. For personal data complaints you may approach the Data Protection Board of India after using the route above.",
    note: "Where two regimes apply, the shorter acknowledgement and disposal windows govern.",
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Formats an ISO yyyy-mm-dd string as "28 July 2026" without touching the system clock. */
export function formatLongDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function describeAck(hours) {
  if (hours % HOURS_PER_DAY === 0 && hours >= HOURS_PER_DAY) {
    const days = hours / HOURS_PER_DAY;
    return days === 1 ? "24 hours" : `${hours} hours (${days} working days)`;
  }
  return `${hours} hours`;
}

/**
 * Builds the grievance redressal block in Markdown, HTML and plain text.
 * Pure: every date is supplied by the caller.
 */
export function buildGrievancePage(input = {}) {
  const organisation = String(input.organisation || "").trim();
  const brand = String(input.brand || "").trim();
  const website = String(input.website || "").trim();
  const officerName = String(input.officerName || "").trim();
  const designation = String(input.designation || "").trim() || "Grievance Officer";
  const email = String(input.email || "").trim();
  const phone = String(input.phone || "").trim();
  const addressLines = cleanLines(input.address);
  const workingHours = String(input.workingHours || "").trim();
  const effectiveDate = String(input.effectiveDate || "").trim();
  const isSdf = Boolean(input.significantDataFiduciary);
  const dpoName = String(input.dpoName || "").trim();
  const dpoEmail = String(input.dpoEmail || "").trim();

  const regime =
    GRIEVANCE_REGIMES.find((item) => item.id === input.regimeId) || GRIEVANCE_REGIMES[0];

  const ackHours = Number(input.ackHours ?? regime.ackHours);
  const resolveDays = Number(input.resolveDays ?? regime.resolveDays);

  if (!organisation) return { error: "Enter the registered name of the company or entity." };
  if (!officerName) return { error: "Enter the name of the person acting as Grievance Officer." };
  if (!isValidEmail(email)) {
    return { error: "Enter a working email address for the Grievance Officer, e.g. grievance@example.in." };
  }
  if (addressLines.length === 0) {
    return { error: "Enter a physical postal address — an email address alone is not a published contact." };
  }
  if (!Number.isFinite(ackHours) || ackHours <= 0 || ackHours > 720) {
    return { error: "Acknowledgement time must be between 1 and 720 hours." };
  }
  if (!Number.isFinite(resolveDays) || resolveDays <= 0 || resolveDays > 365) {
    return { error: "Resolution time must be between 1 and 365 days." };
  }
  if (isSdf && dpoEmail && !isValidEmail(dpoEmail)) {
    return { error: "The Data Protection Officer email address is not a valid address." };
  }

  const publicName = brand || organisation;
  const ackText = describeAck(ackHours);
  const dateText = formatLongDate(effectiveDate);

  const warnings = [];
  if (regime.fixedByLaw && ackHours > regime.ackHours) {
    warnings.push(
      `${regime.statute} requires acknowledgement within ${describeAck(regime.ackHours)} — your page promises ${ackText}.`,
    );
  }
  if (regime.fixedByLaw && resolveDays > regime.resolveDays) {
    warnings.push(
      `${regime.statute} requires disposal within ${regime.resolveDays} days — your page promises ${resolveDays} days.`,
    );
  }
  if (!phone) {
    warnings.push(
      "No telephone number given. Rule 4(5) of the E-Commerce Rules and Rule 4(1)(c) of the IT Rules expect a contact number alongside the email.",
    );
  }
  if (isSdf && !dpoName) {
    warnings.push(
      "Significant Data Fiduciaries must appoint a Data Protection Officer based in India (DPDP Act s.10(2)(a)) and publish that person's business contact information.",
    );
  }
  if (!dateText && effectiveDate) {
    warnings.push("The effective date could not be read; use the yyyy-mm-dd format.");
  }

  const checklist = [
    { label: "Named officer published", done: Boolean(officerName) },
    { label: "Email address published", done: isValidEmail(email) },
    { label: "Telephone number published", done: Boolean(phone) },
    { label: "Postal address published", done: addressLines.length > 0 },
    { label: "Acknowledgement window stated", done: ackHours > 0 },
    { label: "Resolution window stated", done: resolveDays > 0 },
    { label: "Escalation route stated", done: Boolean(regime.escalation) },
    { label: "Page dated", done: Boolean(dateText) },
    { label: "DPO named (if Significant Data Fiduciary)", done: !isSdf || Boolean(dpoName) },
  ];
  const score = checklist.filter((item) => item.done).length;

  const contactRows = [
    ["Name", officerName],
    ["Designation", designation],
    ["Company", organisation],
    ["Email", email],
  ];
  if (phone) contactRows.push(["Telephone", phone]);
  contactRows.push(["Address", addressLines.join(", ")]);
  if (workingHours) contactRows.push(["Hours", workingHours]);

  const complaintItems = [
    "your name and the email address or phone number linked to your account",
    "the page, order or communication the complaint relates to",
    "a clear description of what happened and what you want us to do",
    "any screenshots, order numbers or reference IDs that help us trace the issue",
  ];

  const md = [];
  md.push(`# Grievance Redressal — ${publicName}`);
  md.push("");
  md.push(
    `${organisation}${brand && brand !== organisation ? ` (operating as ${brand})` : ""} has appointed a ${designation} to receive and resolve complaints about ${website ? `${website}, ` : ""}our services and our handling of personal data.`,
  );
  md.push("");
  md.push(`## ${designation}`);
  md.push("");
  contactRows.forEach(([key, value]) => md.push(`- **${key}:** ${value}`));
  if (isSdf && dpoName) {
    md.push("");
    md.push("## Data Protection Officer");
    md.push("");
    md.push(
      `- **Name:** ${dpoName}${dpoEmail ? `\n- **Email:** ${dpoEmail}` : ""}`,
    );
    md.push(
      "- **Basis:** appointed under section 10(2)(a) of the Digital Personal Data Protection Act, 2023, based in India and answerable to our governing body.",
    );
  }
  md.push("");
  md.push("## What to include in your complaint");
  md.push("");
  complaintItems.forEach((item) => md.push(`- ${item}`));
  md.push("");
  md.push("## How we handle your complaint");
  md.push("");
  md.push(`1. We acknowledge every complaint within ${ackText} of receiving it.`);
  md.push(`2. We investigate and give you a decision within ${resolveDays} days of receipt.`);
  md.push("3. We keep a record of the complaint, our decision and the action taken.");
  md.push("");
  md.push("## If you are still not satisfied");
  md.push("");
  md.push(regime.escalation);
  md.push("");
  md.push(`_Legal basis: ${regime.statute}._`);
  if (dateText) {
    md.push("");
    md.push(`_Last updated: ${dateText}._`);
  }

  const markdown = md.join("\n");

  const htmlParts = [];
  htmlParts.push(`<section class="grievance-redressal" id="grievance-redressal">`);
  htmlParts.push(`  <h1>Grievance Redressal &mdash; ${escapeHtml(publicName)}</h1>`);
  htmlParts.push(
    `  <p>${escapeHtml(organisation)}${brand && brand !== organisation ? ` (operating as ${escapeHtml(brand)})` : ""} has appointed a ${escapeHtml(designation)} to receive and resolve complaints about ${website ? `${escapeHtml(website)}, ` : ""}our services and our handling of personal data.</p>`,
  );
  htmlParts.push(`  <h2>${escapeHtml(designation)}</h2>`);
  htmlParts.push("  <dl>");
  contactRows.forEach(([key, value]) => {
    let rendered = escapeHtml(value);
    if (key === "Email") rendered = `<a href="mailto:${escapeHtml(value)}">${rendered}</a>`;
    if (key === "Telephone") rendered = `<a href="tel:${escapeHtml(value.replace(/\s+/g, ""))}">${rendered}</a>`;
    htmlParts.push(`    <dt>${escapeHtml(key)}</dt><dd>${rendered}</dd>`);
  });
  htmlParts.push("  </dl>");
  if (isSdf && dpoName) {
    htmlParts.push("  <h2>Data Protection Officer</h2>");
    htmlParts.push("  <dl>");
    htmlParts.push(`    <dt>Name</dt><dd>${escapeHtml(dpoName)}</dd>`);
    if (dpoEmail) {
      htmlParts.push(
        `    <dt>Email</dt><dd><a href="mailto:${escapeHtml(dpoEmail)}">${escapeHtml(dpoEmail)}</a></dd>`,
      );
    }
    htmlParts.push("  </dl>");
    htmlParts.push(
      "  <p>Appointed under section 10(2)(a) of the Digital Personal Data Protection Act, 2023, based in India and answerable to our governing body.</p>",
    );
  }
  htmlParts.push("  <h2>What to include in your complaint</h2>");
  htmlParts.push("  <ul>");
  complaintItems.forEach((item) => htmlParts.push(`    <li>${escapeHtml(item)}</li>`));
  htmlParts.push("  </ul>");
  htmlParts.push("  <h2>How we handle your complaint</h2>");
  htmlParts.push("  <ol>");
  htmlParts.push(`    <li>We acknowledge every complaint within ${escapeHtml(ackText)} of receiving it.</li>`);
  htmlParts.push(
    `    <li>We investigate and give you a decision within ${resolveDays} days of receipt.</li>`,
  );
  htmlParts.push("    <li>We keep a record of the complaint, our decision and the action taken.</li>");
  htmlParts.push("  </ol>");
  htmlParts.push("  <h2>If you are still not satisfied</h2>");
  htmlParts.push(`  <p>${escapeHtml(regime.escalation)}</p>`);
  htmlParts.push(`  <p><small>Legal basis: ${escapeHtml(regime.statute)}.</small></p>`);
  if (dateText) htmlParts.push(`  <p><small>Last updated: ${escapeHtml(dateText)}.</small></p>`);
  htmlParts.push("</section>");

  const text = markdown
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/_/g, "")
    .replace(/^- /gm, "• ");

  return {
    markdown,
    html: htmlParts.join("\n"),
    text,
    warnings,
    checklist,
    score,
    total: checklist.length,
    ackText,
    resolveDays,
    regimeLabel: regime.label,
    statute: regime.statute,
    regimeNote: regime.note,
  };
}
