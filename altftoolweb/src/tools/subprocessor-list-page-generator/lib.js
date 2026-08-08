/**
 * Public subprocessor list builder.
 *
 * Legal basis encoded here (informational, not legal advice):
 *  - GDPR Art. 28(2): a processor may engage another processor only with the controller's prior
 *    specific or general written authorisation; under a general authorisation the processor must
 *    inform the controller of intended additions or replacements so the controller can object.
 *  - GDPR Art. 28(4): the sub-processor must be bound by the same data protection obligations.
 *  - GDPR Art. 30(2)(d): a processor's record of processing must list transfers to third countries.
 *  - GDPR Chapter V: a transfer outside the EEA needs a legal basis — an adequacy decision
 *    (Art. 45), appropriate safeguards such as the Standard Contractual Clauses adopted by
 *    Commission Implementing Decision (EU) 2021/914 (Art. 46(2)(c)) or Binding Corporate Rules
 *    (Art. 47), or a derogation (Art. 49).
 *  - UK GDPR: transfers out of the UK use the ICO International Data Transfer Agreement or the
 *    UK Addendum to the EU SCCs.
 *  - DPDP Act, 2023 s.8(2): an Indian Data Fiduciary stays responsible for a processor's
 *    compliance, whether or not the Data Principal agreed to that arrangement.
 *
 * Neither the GDPR nor the SCCs fix a number of days of advance notice for a new sub-processor;
 * 30 days is the common contractual figure and is used as the default here.
 */

/** Default advance notice before a new subprocessor starts. Contractual norm, not a statute. */
export const DEFAULT_NOTICE_DAYS = 30;

/** EEA = the 27 EU member states plus Iceland, Liechtenstein and Norway. */
export const EEA_COUNTRIES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

/**
 * Countries covered by a European Commission adequacy decision under GDPR Art. 45.
 * Canada is adequate only for organisations subject to PIPEDA, and the United States only for
 * organisations that are certified under the EU-US Data Privacy Framework — both are flagged.
 */
export const ADEQUATE_COUNTRIES = [
  { name: "Andorra", partial: false },
  { name: "Argentina", partial: false },
  { name: "Canada", partial: true, note: "commercial organisations subject to PIPEDA only" },
  { name: "Faroe Islands", partial: false },
  { name: "Guernsey", partial: false },
  { name: "Isle of Man", partial: false },
  { name: "Israel", partial: false },
  { name: "Japan", partial: false },
  { name: "Jersey", partial: false },
  { name: "New Zealand", partial: false },
  { name: "South Korea", partial: false },
  { name: "Switzerland", partial: false },
  { name: "United Kingdom", partial: false },
  { name: "United States", partial: true, note: "Data Privacy Framework certified organisations only" },
  { name: "Uruguay", partial: false },
];

export const TRANSFER_MECHANISMS = [
  { id: "eea", label: "Stored in the EEA — no transfer tool needed", article: "GDPR Chapter V not engaged" },
  { id: "adequacy", label: "Adequacy decision", article: "GDPR Art. 45" },
  { id: "sccs", label: "EU Standard Contractual Clauses (2021/914)", article: "GDPR Art. 46(2)(c)" },
  { id: "uk-addendum", label: "UK Addendum / IDTA", article: "UK GDPR Art. 46" },
  { id: "bcr", label: "Binding Corporate Rules", article: "GDPR Art. 47" },
  { id: "derogation", label: "Art. 49 derogation", article: "GDPR Art. 49" },
  { id: "none", label: "Not documented yet", article: "—" },
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

export function formatLongDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || "").trim());
  if (!match) return "";
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  return `${day} ${MONTHS[month - 1]} ${match[1]}`;
}

/** Common alternate names/abbreviations mapped to the canonical name used in the lists above. */
const COUNTRY_ALIASES = {
  "czech republic": "czechia",
  "slovak republic": "slovakia",
  holland: "netherlands",
  usa: "united states",
  "u.s.": "united states",
  "u.s.a.": "united states",
  us: "united states",
  "united states of america": "united states",
  uk: "united kingdom",
  "u.k.": "united kingdom",
  "great britain": "united kingdom",
};

function normaliseCountry(value) {
  const key = String(value || "").trim().toLowerCase();
  return COUNTRY_ALIASES[key] || key;
}

/** Classifies a destination country as inside the EEA, adequate, or a third country. */
export function classifyCountry(country) {
  const key = normaliseCountry(country);
  if (!key) return { status: "unknown", label: "Country not given" };
  if (EEA_COUNTRIES.some((item) => item.toLowerCase() === key)) {
    return { status: "eea", label: "Inside the EEA" };
  }
  const adequate = ADEQUATE_COUNTRIES.find((item) => item.name.toLowerCase() === key);
  if (adequate) {
    return {
      status: adequate.partial ? "adequate-partial" : "adequate",
      label: adequate.partial ? `Adequate (${adequate.note})` : "Adequacy decision in force",
    };
  }
  return { status: "third", label: "Third country — needs a Chapter V transfer tool" };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").trim();
}

function csvCell(value) {
  const text = String(value == null ? "" : value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function mechanismLabel(id) {
  const found = TRANSFER_MECHANISMS.find((item) => item.id === id);
  return found ? found.label : TRANSFER_MECHANISMS[TRANSFER_MECHANISMS.length - 1].label;
}

/**
 * Builds the public subprocessor page.
 * Pure: dates arrive as yyyy-mm-dd strings, nothing reads the clock.
 */
export function buildSubprocessorPage(input = {}) {
  const company = String(input.company || "").trim();
  const product = String(input.product || "").trim();
  const contactEmail = String(input.contactEmail || "").trim();
  const effectiveDate = String(input.effectiveDate || "").trim();
  const noticeDaysRaw = input.noticeDays ?? DEFAULT_NOTICE_DAYS;
  const noticeDays = Number(noticeDaysRaw);
  const rows = Array.isArray(input.rows) ? input.rows : [];

  if (!company) return { error: "Enter the name of the company that publishes this page." };
  if (!Number.isFinite(noticeDays) || noticeDays < 0 || noticeDays > 365) {
    return { error: "Advance notice must be between 0 and 365 days." };
  }

  const clean = rows
    .map((row) => ({
      vendor: String(row.vendor || "").trim(),
      entity: String(row.entity || "").trim(),
      purpose: String(row.purpose || "").trim(),
      dataTypes: String(row.dataTypes || "").trim(),
      country: String(row.country || "").trim(),
      mechanism: String(row.mechanism || "none").trim(),
    }))
    .filter((row) => row.vendor || row.purpose || row.country);

  if (clean.length === 0) {
    return { error: "Add at least one subprocessor with a vendor name and a purpose." };
  }

  const missingPurpose = clean.filter((row) => !row.purpose).map((row) => row.vendor || "unnamed row");
  const missingVendor = clean.some((row) => !row.vendor);
  if (missingVendor) return { error: "Every row needs a vendor name." };

  const enriched = clean.map((row) => {
    const classification = classifyCountry(row.country);
    const needsTool = classification.status === "third" || classification.status === "adequate-partial";
    const hasTool = row.mechanism !== "none" && row.mechanism !== "eea";
    return {
      ...row,
      classification,
      mechanismText: mechanismLabel(row.mechanism),
      gap: needsTool && !hasTool,
    };
  });

  const countries = Array.from(new Set(enriched.map((row) => row.country).filter(Boolean)));
  const outsideEea = enriched.filter((row) => row.classification.status !== "eea" && row.classification.status !== "unknown").length;
  const unknownLocation = enriched.filter((row) => row.classification.status === "unknown").length;
  const gaps = enriched.filter((row) => row.gap);

  const warnings = [];
  gaps.forEach((row) => {
    warnings.push(
      `${row.vendor} sends data to ${row.country || "an unstated country"} with no transfer tool recorded — GDPR Chapter V needs an adequacy decision, SCCs, BCRs or an Art. 49 derogation.`,
    );
  });
  missingPurpose.forEach((vendor) => {
    warnings.push(`${vendor} has no stated purpose. Art. 28(3) requires the subject matter and purpose of processing to be documented.`);
  });
  enriched
    .filter((row) => !row.country)
    .forEach((row) => warnings.push(`${row.vendor} has no hosting location. Art. 30(2)(d) expects the destination country to be recorded.`));
  if (noticeDays === 0) {
    warnings.push(
      "Zero days of advance notice leaves a controller no chance to object under Art. 28(2). Most data processing agreements promise at least 30 days.",
    );
  }
  if (!contactEmail) {
    warnings.push("No subscription address given for change notices — controllers need a way to be told about new subprocessors.");
  }

  const dateText = formatLongDate(effectiveDate);
  const subject = product ? `${product}` : `the ${company} services`;

  const header = ["Subprocessor", "Purpose of processing", "Data processed", "Location", "Transfer mechanism"];
  const bodyRows = enriched.map((row) => [
    escapeCell(row.entity ? `${row.vendor} (${row.entity})` : row.vendor),
    escapeCell(row.purpose || "—"),
    escapeCell(row.dataTypes || "—"),
    escapeCell(row.country || "—"),
    escapeCell(row.mechanismText),
  ]);

  const md = [];
  md.push(`# Subprocessors`);
  md.push("");
  md.push(
    `${company} uses the third parties listed below to help deliver ${subject}. Each of them is engaged as a sub-processor under a written agreement that imposes the same data protection obligations we owe our customers, as required by Article 28(4) of the GDPR.`,
  );
  md.push("");
  md.push(`| ${header.join(" | ")} |`);
  md.push(`| ${header.map(() => "---").join(" | ")} |`);
  bodyRows.forEach((row) => md.push(`| ${row.join(" | ")} |`));
  md.push("");
  md.push("## Changes to this list");
  md.push("");
  md.push(
    noticeDays > 0
      ? `We will give at least ${noticeDays} days' notice before a new subprocessor starts processing customer personal data, so that you can object under Article 28(2) of the GDPR.${contactEmail ? ` To receive those notices, subscribe at ${contactEmail}.` : ""}`
      : `New subprocessors are published on this page.${contactEmail ? ` To be told when it changes, write to ${contactEmail}.` : ""}`,
  );
  md.push("");
  md.push("## International transfers");
  md.push("");
  md.push(
    "Where a subprocessor processes personal data outside the European Economic Area, the transfer relies on the mechanism named in the table: an adequacy decision under Article 45, the Standard Contractual Clauses adopted by Commission Implementing Decision (EU) 2021/914 under Article 46(2)(c), Binding Corporate Rules under Article 47, or the UK Addendum for UK transfers.",
  );
  if (dateText) {
    md.push("");
    md.push(`_Last updated: ${dateText}._`);
  }

  const htmlParts = [`<section id="subprocessors">`, `  <h1>Subprocessors</h1>`];
  htmlParts.push(
    `  <p>${escapeHtml(company)} uses the third parties listed below to help deliver ${escapeHtml(subject)}. Each is engaged under a written agreement imposing the same data protection obligations, as required by Article 28(4) of the GDPR.</p>`,
  );
  htmlParts.push('  <table>');
  htmlParts.push("    <thead><tr>");
  header.forEach((cell) => htmlParts.push(`      <th scope="col">${escapeHtml(cell)}</th>`));
  htmlParts.push("    </tr></thead>");
  htmlParts.push("    <tbody>");
  enriched.forEach((row) => {
    htmlParts.push("      <tr>");
    htmlParts.push(`        <td>${escapeHtml(row.entity ? `${row.vendor} (${row.entity})` : row.vendor)}</td>`);
    htmlParts.push(`        <td>${escapeHtml(row.purpose || "—")}</td>`);
    htmlParts.push(`        <td>${escapeHtml(row.dataTypes || "—")}</td>`);
    htmlParts.push(`        <td>${escapeHtml(row.country || "—")}</td>`);
    htmlParts.push(`        <td>${escapeHtml(row.mechanismText)}</td>`);
    htmlParts.push("      </tr>");
  });
  htmlParts.push("    </tbody>");
  htmlParts.push("  </table>");
  htmlParts.push("  <h2>Changes to this list</h2>");
  htmlParts.push(
    `  <p>${escapeHtml(
      noticeDays > 0
        ? `We will give at least ${noticeDays} days' notice before a new subprocessor starts processing customer personal data, so that you can object under Article 28(2) of the GDPR.`
        : "New subprocessors are published on this page.",
    )}${contactEmail ? ` <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>` : ""}</p>`,
  );
  if (dateText) htmlParts.push(`  <p><small>Last updated: ${escapeHtml(dateText)}.</small></p>`);
  htmlParts.push("</section>");

  const csvRows = enriched.map((row) => [
    row.entity ? `${row.vendor} (${row.entity})` : row.vendor,
    row.purpose || "—",
    row.dataTypes || "—",
    row.country || "—",
    row.mechanismText,
  ]);
  const csv = [header, ...csvRows].map((row) => row.map(csvCell).join(",")).join("\n");

  return {
    markdown: md.join("\n"),
    html: htmlParts.join("\n"),
    csv,
    rows: enriched,
    warnings,
    stats: {
      total: enriched.length,
      countryCount: countries.length,
      outsideEea,
      unknownLocation,
      gapCount: gaps.length,
      noticeDays,
    },
  };
}
