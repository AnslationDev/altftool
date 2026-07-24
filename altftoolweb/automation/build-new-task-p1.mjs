import path from "node:path";
import { fileURLToPath } from "node:url";
import backlog from "./new-tasks-backlog.json" with { type: "json" };
import { emitTool } from "./lib/spec.mjs";
import { validateRawSpec } from "./generator/validate.mjs";
import { qualityLint } from "./verify/quality.mjs";

const automationDir = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(automationDir, "..", "src", "tools");
const requested = new Set(
  (process.argv.find((arg) => arg.startsWith("--slugs=")) || "")
    .replace("--slugs=", "")
    .split(",")
    .filter(Boolean),
);
const dryRun = process.argv.includes("--dry");

const entryBySlug = new Map(backlog.tools.map((entry) => [entry.slug, entry]));
const q = (value) => JSON.stringify(value);
const base = (slug, raw) => {
  const entry = entryBySlug.get(slug);
  if (!entry) throw new Error(`Missing backlog entry for ${slug}`);
  return {
    slug,
    title: entry.name,
    description: entry.description,
    badge: raw.badge || entry.category,
    category: raw.category,
    icon: raw.icon || "shield-check",
    iconColor: "text-primary",
    note:
      raw.note ||
      "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions.",
    ...raw,
  };
};

function keywordAudit(slug, {
  keywords,
  label = "Text to inspect",
  placeholder = "Paste the notice, policy, payload, or observations here…",
  category = ["Security & Privacy", "Business"],
  icon = "scan-search",
  note,
}) {
  const checks = keywords.map(([name, patterns]) => ({
    name,
    patterns: Array.isArray(patterns) ? patterns : [patterns],
  }));
  return base(slug, {
    category,
    icon,
    note,
    fields: [
      {
        key: "text",
        label,
        type: "textarea",
        default: "",
        placeholder,
      },
      {
        key: "strict",
        label: "Strict review",
        type: "toggle",
        default: true,
        checkboxLabel: "Require every checklist signal",
      },
    ],
    presets: [
      {
        label: "Example",
        values: {
          text: checks.map((check) => check.patterns[0]).join(". "),
          strict: true,
        },
      },
    ],
    outputLabel: "Audit report",
    compute: `(values) => {
      const source = String(values.text || "");
      const lower = source.toLowerCase();
      const checks = ${q(checks)};
      const rows = checks.map((check) => {
        const hit = check.patterns.some((pattern) => lower.includes(String(pattern).toLowerCase()));
        return [check.name, hit ? "Found" : "Missing"];
      });
      const found = rows.filter((row) => row[1] === "Found").length;
      const score = checks.length ? Math.round((found / checks.length) * 100) : 0;
      const missing = rows.filter((row) => row[1] === "Missing").map((row) => row[0]);
      return {
        result: score + "% checklist coverage",
        caption: values.strict && missing.length ? missing.length + " required signal(s) need review" : found + " of " + checks.length + " signals found",
        rows,
        list: missing.length ? missing.map((item) => "Review: " + item) : ["All configured signals were found. Verify wording and legal accuracy manually."],
      };
    }`,
  });
}

function delimitedWorkbench(slug, {
  headers,
  sample,
  label = "Records (one per line)",
  category = ["Productivity", "Business"],
  icon = "table-properties",
  note,
}) {
  return base(slug, {
    category,
    icon,
    note,
    fields: [
      {
        key: "records",
        label,
        type: "textarea",
        default: sample,
        hint: `Use | between: ${headers.join(" | ")}`,
      },
      {
        key: "required",
        label: "Require complete rows",
        type: "toggle",
        default: true,
        checkboxLabel: "Flag missing columns",
      },
    ],
    presets: [{ label: "Example records", values: { records: sample, required: true } }],
    outputLabel: "Structured inventory",
    compute: `(values) => {
      const headers = ${q(headers)};
      const lines = String(values.records || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean);
      const parsed = lines.map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = parsed.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      const tableRows = parsed.map((row) => headers.map((_, index) => row[index] || "—"));
      return {
        result: lines.length + " record" + (lines.length === 1 ? "" : "s") + " mapped",
        caption: values.required ? incomplete + " incomplete row(s)" : headers.length + " tracked fields",
        rows: [["Complete rows", Math.max(0, lines.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]],
        table: { headers, rows: tableRows.slice(0, 100) },
        list: lines.length ? [] : ["Add one record per line and separate fields with |."],
      };
    }`,
  });
}

const specs = [
  keywordAudit("dpdp-consent-notice-checker", {
    label: "Consent notice",
    keywords: [
      ["Data fiduciary identity", ["data fiduciary", "organisation", "organization"]],
      ["Personal data described", ["personal data", "data collected"]],
      ["Purpose stated", ["purpose", "why we collect"]],
      ["Consent action", ["consent", "agree"]],
      ["Withdrawal route", ["withdraw", "revoke consent"]],
      ["Rights route", ["rights", "access", "correction"]],
      ["Grievance contact", ["grievance", "complaint"]],
      ["Language clarity", ["plain language", "clear language"]],
    ],
    note:
      "Checklist aid for India DPDP notice review; it does not certify statutory compliance. Confirm current rules and sector-specific duties with qualified counsel.",
  }),
  delimitedWorkbench("consent-inventory-mapper", {
    headers: ["Collection point", "Purpose", "Consent action", "Withdrawal route", "Owner"],
    sample:
      "Signup form | Account creation | Unticked checkbox | Profile settings | Product\nNewsletter | Marketing email | Separate opt-in | Email footer | Marketing",
  }),
  delimitedWorkbench("ropa-builder", {
    headers: ["Activity", "Purpose", "Data categories", "People", "Processor", "Retention", "Safeguards"],
    sample:
      "Customer support | Resolve tickets | Contact and message data | Customers | Helpdesk vendor | 24 months | Role access\nPayroll | Pay employees | Identity and bank data | Staff | Payroll processor | 8 years | Encryption",
    note:
      "This creates a working ROPA inventory, not a legal filing. Validate lawful basis, transfers, retention, and jurisdiction-specific fields.",
  }),
  delimitedWorkbench("data-retention-schedule-builder", {
    headers: ["Data category", "Purpose", "System", "Retention period", "Trigger", "Deletion method", "Owner"],
    sample:
      "Support tickets | Customer service | Helpdesk | 24 months | Ticket closed | Hard delete | Support\nFailed applicants | Recruitment | ATS | 12 months | Decision date | Vendor deletion | People",
  }),
  base("dsar-request-tracker", {
    category: ["Security & Privacy", "Productivity"],
    icon: "calendar-clock",
    fields: [
      { key: "requests", label: "Requests", type: "textarea", default: "DSAR-001 | 2026-07-01 | 30 | In progress | Privacy\nDSAR-002 | 2026-06-01 | 30 | Completed | Privacy", hint: "ID | received date | deadline days | status | owner" },
      { key: "as_of", label: "Review date", type: "date", default: "2026-07-24" },
    ],
    presets: [{ label: "Example queue", values: { requests: "DSAR-001 | 2026-07-01 | 30 | In progress | Privacy\nDSAR-002 | 2026-06-01 | 30 | Completed | Privacy", as_of: "2026-07-24" } }],
    compute: `(values) => {
      const asOf = new Date(values.as_of + "T00:00:00");
      const rows = String(values.requests || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const table = rows.map((row) => {
        const received = new Date((row[1] || "") + "T00:00:00");
        const days = Math.max(1, Number(row[2]) || 30);
        if (Number.isNaN(received.getTime())) {
          return [row[0] || "—", row[1] || "—", "Invalid date", row[3] || "Open", row[4] || "—", "Review date"];
        }
        const due = new Date(received);
        due.setDate(due.getDate() + days);
        const status = row[3] || "Open";
        const remaining = Math.ceil((due - asOf) / 86400000);
        const clock = /complete|closed/i.test(status) ? "Closed" : remaining < 0 ? Math.abs(remaining) + "d overdue" : remaining + "d left";
        return [row[0] || "—", row[1] || "—", due.toISOString().slice(0, 10), status, row[4] || "—", clock];
      });
      const overdue = table.filter((row) => /overdue/.test(row[5])).length;
      return { result: table.length + " request(s) tracked", caption: overdue + " overdue open request(s)", rows: [["Open", table.filter((row) => row[3] !== "Completed").length], ["Overdue", overdue]], table: { headers: ["ID", "Received", "Due", "Status", "Owner", "Clock"], rows: table } };
    }`,
  }),
  base("privacy-policy-version-diff", {
    category: ["Security & Privacy", "Text & Writing"],
    icon: "file-diff",
    fields: [
      { key: "before", label: "Previous policy", type: "textarea", default: "We collect email for account access.\nWe retain support messages for 12 months." },
      { key: "after", label: "Updated policy", type: "textarea", default: "We collect email and phone for account access.\nWe retain support messages for 24 months." },
      { key: "ignore_case", label: "Ignore letter case", type: "toggle", default: true, checkboxLabel: "Treat capitalization-only changes as equal" },
    ],
    presets: [{ label: "Retention change", values: { before: "We retain logs for 30 days.", after: "We retain logs for 90 days.", ignore_case: true } }],
    compute: `(values) => {
      const normalize = (line) => values.ignore_case ? line.trim().toLowerCase() : line.trim();
      const before = String(values.before || "").split(/\\r?\\n/).filter((line) => line.trim());
      const after = String(values.after || "").split(/\\r?\\n/).filter((line) => line.trim());
      const beforeSet = new Set(before.map(normalize));
      const afterSet = new Set(after.map(normalize));
      const removed = before.filter((line) => !afterSet.has(normalize(line)));
      const added = after.filter((line) => !beforeSet.has(normalize(line)));
      const sensitive = [...added, ...removed].filter((line) => /collect|share|retain|delete|sell|consent|right|transfer|processor|cookie/i.test(line));
      return { result: added.length + " added · " + removed.length + " removed", caption: sensitive.length + " privacy-sensitive changed line(s)", rows: [["Before lines", before.length], ["After lines", after.length], ["Sensitive changes", sensitive.length]], list: [...added.map((line) => "+ " + line), ...removed.map((line) => "− " + line)].slice(0, 100) };
    }`,
  }),
  base("dpia-starter-wizard", {
    category: ["Security & Privacy", "Business"],
    icon: "clipboard-list",
    fields: [
      { key: "feature", label: "Feature or project", type: "text", default: "Location-based recommendations" },
      { key: "data", label: "Personal data involved", type: "textarea", default: "Precise location, device identifier, preference history" },
      { key: "people", label: "Affected people", type: "text", default: "Signed-in customers" },
      { key: "scale", label: "Scale", type: "select", default: "medium", choices: [{ value: "small", label: "Small / limited" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large / systematic" }] },
      { key: "sensitive", label: "Sensitive or vulnerable context", type: "toggle", default: false, checkboxLabel: "Includes sensitive data or vulnerable people" },
      { key: "mitigations", label: "Existing safeguards", type: "textarea", default: "Opt-in, coarse-location fallback, short retention, access logging" },
    ],
    presets: [{ label: "Location feature", values: { feature: "Location recommendations", data: "Precise location and device ID", people: "Customers", scale: "medium", sensitive: false, mitigations: "Opt-in and 30-day retention" } }],
    compute: `(values) => {
      const text = (values.data + " " + values.feature).toLowerCase();
      let score = values.scale === "large" ? 4 : values.scale === "medium" ? 2 : 1;
      if (values.sensitive) score += 4;
      if (/location|biometric|health|children|financial|tracking|profile/.test(text)) score += 3;
      const mitigations = String(values.mitigations || "").split(/[,;\\n]+/).map((item) => item.trim()).filter(Boolean);
      score = Math.max(0, score - Math.min(3, mitigations.length));
      const level = score >= 7 ? "High" : score >= 4 ? "Medium" : "Lower";
      return { result: level + " initial privacy risk", caption: "Structured starter for " + values.feature, rows: [["Risk score", score + "/11"], ["Affected people", values.people], ["Safeguards listed", mitigations.length]], list: ["Describe necessity and proportionality", "Map collection, sharing, retention, and deletion", "Record risks to people, not only the business", "Assign mitigation owners and residual risk", "Schedule approval and review"] };
    }`,
  }),
  keywordAudit("cookie-gpc-behavior-auditor", {
    label: "Observed requests, response headers, or test notes",
    keywords: [
      ["Reject is available", ["reject", "decline"]],
      ["Reject stops non-essential tags", ["blocked", "not loaded", "no analytics"]],
      ["GPC signal tested", ["sec-gpc", "global privacy control", "gpc"]],
      ["Preference persists", ["cookie preference", "consent saved", "persist"]],
      ["Change-control route", ["manage preferences", "cookie settings"]],
      ["No preselected consent", ["not preselected", "default off", "unchecked"]],
    ],
  }),
  keywordAudit("dark-pattern-self-audit", {
    label: "Consent, checkout, or cancellation copy and observations",
    keywords: [
      ["Equal visual choice", ["equal prominence", "same size", "balanced"]],
      ["No preselection", ["not preselected", "unchecked"]],
      ["No confirmshaming", ["neutral copy", "no guilt"]],
      ["No hidden cost", ["total price", "all fees"]],
      ["Cancellation is direct", ["cancel button", "self-service cancellation"]],
      ["No repeated obstruction", ["single prompt", "no repeated prompt"]],
    ],
    note:
      "A self-audit prompt, not a definitive legal determination. Test the complete journey with keyboard, mobile, and assistive technology.",
  }),
  base("analytics-pii-checker", {
    category: ["Security & Privacy", "Developer"],
    icon: "shield-alert",
    fields: [
      { key: "payload", label: "Analytics payload or request log", type: "textarea", default: "{\"event\":\"checkout\",\"email\":\"person@example.com\",\"order_id\":\"A-100\"}" },
      { key: "include_values", label: "Show masked findings", type: "toggle", default: true, checkboxLabel: "Include masked examples in the report" },
    ],
    presets: [{ label: "JSON payload", values: { payload: "{\"email\":\"person@example.com\",\"phone\":\"+91 9876543210\",\"ip\":\"203.0.113.10\"}", include_values: true } }],
    compute: `(values) => {
      const text = String(values.payload || "");
      const detectors = [
        ["Email", /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/gi],
        ["Phone", /(?:\\+?\\d[\\d .()-]{7,}\\d)/g],
        ["IPv4", /\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/g],
        ["Authorization token", /(?:authorization|bearer|api[_-]?key|token)[\\"'=:\\s]+[A-Za-z0-9._-]{8,}/gi],
        ["Sensitive key", /[\\"']?(?:name|email|phone|address|dob|aadhaar|pan|passport|user_id)[\\"']?\\s*[:=]/gi],
      ];
      const findings = [];
      for (const [type, pattern] of detectors) {
        const matches = [...text.matchAll(pattern)];
        if (!matches.length) continue;
        const sample = matches[0][0];
        const masked = sample.length < 5 ? "•••" : sample.slice(0, 2) + "…" + sample.slice(-2);
        findings.push([type, matches.length, values.include_values ? masked : "Hidden"]);
      }
      return { result: findings.length ? findings.reduce((sum, row) => sum + row[1], 0) + " possible exposure(s)" : "No configured PII signals found", caption: findings.length + " detector type(s) triggered", table: { headers: ["Type", "Count", "Masked example"], rows: findings }, list: findings.length ? ["Confirm whether each value is necessary, documented, consented, and appropriately minimized."] : ["Review custom identifiers and nested payload fields manually."] };
    }`,
  }),
  base("breach-notification-timeline-planner", {
    category: ["Security & Privacy", "Productivity"],
    icon: "clock-alert",
    fields: [
      { key: "discovered", label: "Incident discovery", type: "date", default: "2026-07-24" },
      { key: "authority_hours", label: "Authority review target (hours)", type: "number", min: 1, default: 72 },
      { key: "people_hours", label: "Affected-person review target (hours)", type: "number", min: 1, default: 96 },
      { key: "jurisdiction", label: "Jurisdiction / policy", type: "text", default: "Internal incident response policy" },
    ],
    presets: [{ label: "72-hour review", values: { discovered: "2026-07-24", authority_hours: 72, people_hours: 96, jurisdiction: "Selected policy" } }],
    compute: `(values) => {
      const start = new Date(values.discovered + "T09:00:00");
      const add = (hours) => new Date(start.getTime() + Math.max(1, Number(hours) || 1) * 3600000);
      const authority = add(values.authority_hours);
      const people = add(values.people_hours);
      const format = (date) => date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
      return { result: "Timeline starts " + format(start), caption: values.jurisdiction, table: { headers: ["Milestone", "Target"], rows: [["Preserve evidence and contain", format(add(4))], ["Initial scope and risk review", format(add(12))], ["Legal / authority decision", format(authority)], ["Affected-person decision", format(people)], ["Post-incident review", format(add(168))]] }, list: ["Document when awareness occurred", "Keep decision evidence even when notification is not required", "Confirm the current law and regulator guidance"] };
    }`,
  }),
  delimitedWorkbench("vendor-data-processing-inventory", {
    headers: ["Vendor", "Purpose", "Data categories", "People", "Location", "Retention", "DPA / terms", "Owner"],
    sample:
      "Helpdesk Co | Support | Contact and ticket data | Customers | India | 24 months | DPA-2026-01 | Support\nPayroll Co | Payroll | Identity and bank data | Staff | India | 8 years | DPA-2025-14 | People",
    category: ["Security & Privacy", "Business"],
  }),
  delimitedWorkbench("personal-data-flow-mapper", {
    headers: ["Step", "Source", "Data", "Purpose", "Destination", "Retention / deletion", "Control"],
    sample:
      "1 | Signup form | Email | Create account | Identity service | Account life + 30d | TLS and role access\n2 | Identity service | User ID | Product access | App database | Account life | Pseudonymous key",
    category: ["Security & Privacy", "Business"],
    icon: "workflow",
  }),
  base("identity-minimizing-dsar-planner", {
    category: ["Security & Privacy", "Productivity"],
    icon: "badge-check",
    fields: [
      { key: "request", label: "Request type", type: "select", default: "access", choices: [{ value: "access", label: "Access / copy" }, { value: "correction", label: "Correction" }, { value: "deletion", label: "Deletion" }, { value: "account", label: "Account control" }] },
      { key: "risk", label: "Disclosure risk", type: "select", default: "medium", choices: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }] },
      { key: "factors", label: "Already-held verification factors", type: "textarea", default: "Signed-in session\nVerified email\nRecent support ticket ID" },
      { key: "sensitive", label: "Sensitive data involved", type: "toggle", default: false, checkboxLabel: "The response may expose sensitive or third-party data" },
    ],
    presets: [{ label: "Signed-in access request", values: { request: "access", risk: "medium", factors: "Signed-in session\nVerified email", sensitive: false } }],
    compute: `(values) => {
      const factors = String(values.factors || "").split(/\\r?\\n|,/).map((item) => item.trim()).filter(Boolean);
      let needed = values.risk === "high" ? 3 : values.risk === "medium" ? 2 : 1;
      if (values.sensitive) needed += 1;
      const selected = factors.slice(0, Math.min(needed, factors.length));
      return { result: selected.length + " existing factor(s) selected", caption: "Target " + needed + " proportionate factor(s) for " + values.request, rows: [["Available factors", factors.length], ["Target assurance", values.risk], ["Sensitive context", values.sensitive ? "Yes" : "No"]], list: [...selected.map((item) => "Use: " + item), "Avoid requesting new identity documents unless the risk cannot be managed with already-held factors.", "Delete temporary proof promptly under a documented schedule."] };
    }`,
  }),
  delimitedWorkbench("data-deletion-proof-log", {
    headers: ["Request ID", "System", "Record scope", "Action", "Completed at", "Evidence reference", "Reviewer"],
    sample:
      "DEL-104 | CRM | Contact record | Hard delete | 2026-07-22 11:20 | crm-audit-8841 | AK\nDEL-104 | Backups | Encrypted snapshot | Expiry queued | 2026-07-22 12:10 | backup-job-592 | AK",
    category: ["Security & Privacy", "Productivity"],
    icon: "file-check-2",
  }),
  base("ifsc-decoder-validator", {
    category: ["Finance", "India"],
    icon: "landmark",
    fields: [
      { key: "ifsc", label: "IFSC code", type: "text", default: "HDFC0001234", placeholder: "Example: HDFC0001234" },
      { key: "normalize", label: "Normalize input", type: "toggle", default: true, checkboxLabel: "Remove spaces and use uppercase" },
    ],
    presets: [{ label: "HDFC example", values: { ifsc: "HDFC0001234", normalize: true } }, { label: "SBI example", values: { ifsc: "SBIN0000456", normalize: true } }],
    note: "Validates and decodes the IFSC structure locally. Bank-prefix labels are a convenience list; confirm the exact active branch against the RBI or the bank.",
    compute: `(values) => {
      const raw = String(values.ifsc || "");
      const code = values.normalize ? raw.replace(/\\s+/g, "").toUpperCase() : raw;
      const valid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);
      const banks = { SBIN: "State Bank of India", HDFC: "HDFC Bank", ICIC: "ICICI Bank", UTIB: "Axis Bank", PUNB: "Punjab National Bank", BARB: "Bank of Baroda", CNRB: "Canara Bank", BKID: "Bank of India", KKBK: "Kotak Mahindra Bank", IDIB: "Indian Bank", UBIN: "Union Bank of India", YESB: "YES Bank", INDB: "IndusInd Bank", IOBA: "Indian Overseas Bank" };
      const prefix = code.slice(0, 4);
      return { result: valid ? "Structurally valid IFSC" : "Invalid IFSC structure", caption: valid ? (banks[prefix] || "Bank prefix not in local convenience list") : "Expected 4 letters, 0, then 6 letters/digits", rows: [["Normalized", code || "—"], ["Bank prefix", prefix || "—"], ["Bank", banks[prefix] || "Confirm with RBI"], ["Branch identifier", valid ? code.slice(5) : "—"]] };
    }`,
  }),
  base("micr-cheque-code-decoder", {
    category: ["Finance", "India"],
    icon: "scan-line",
    fields: [
      { key: "micr", label: "9-digit MICR code", type: "text", default: "400002001" },
      { key: "strip", label: "Remove spaces", type: "toggle", default: true, checkboxLabel: "Normalize pasted code" },
    ],
    presets: [{ label: "Mumbai example", values: { micr: "400002001", strip: true } }],
    note: "Decodes the standard 3+3+3 MICR structure. It does not confirm that a cheque or bank account is genuine.",
    compute: `(values) => {
      const code = values.strip ? String(values.micr || "").replace(/\\D/g, "") : String(values.micr || "");
      const valid = /^\\d{9}$/.test(code);
      return { result: valid ? "Valid 9-digit MICR structure" : "Invalid MICR structure", caption: valid ? "City · bank · branch fields decoded" : "Enter exactly 9 digits", rows: [["Normalized", code || "—"], ["City code", valid ? code.slice(0, 3) : "—"], ["Bank code", valid ? code.slice(3, 6) : "—"], ["Branch code", valid ? code.slice(6, 9) : "—"]] };
    }`,
  }),
  base("section-138-notice-draft-assistant", {
    category: ["Text & Writing", "India", "Legal"],
    icon: "file-pen-line",
    fields: [
      { key: "drawer", label: "Cheque drawer", type: "text", default: "Example Customer" },
      { key: "payee", label: "Payee / claimant", type: "text", default: "Example Business" },
      { key: "cheque", label: "Cheque number", type: "text", default: "123456" },
      { key: "amount", label: "Cheque amount (₹)", type: "number", min: 0, default: 50000 },
      { key: "cheque_date", label: "Cheque date", type: "date", default: "2026-07-01" },
      { key: "return_date", label: "Bank return memo date", type: "date", default: "2026-07-10" },
      { key: "reason", label: "Return reason", type: "text", default: "Funds insufficient" },
      { key: "facts", label: "Underlying liability and evidence", type: "textarea", default: "Invoice INV-104 and delivery acknowledgement dated 2026-06-15." },
    ],
    presets: [{ label: "Example notice", values: { drawer: "Example Customer", payee: "Example Business", cheque: "123456", amount: 50000, cheque_date: "2026-07-01", return_date: "2026-07-10", reason: "Funds insufficient", facts: "Invoice and delivery record." } }],
    note: "Drafting and checklist aid only, not legal advice. Section 138 timelines and service requirements are strict; have an Indian lawyer verify dates, parties, evidence, wording, and current law.",
    outputLabel: "Draft structure",
    compute: `(values) => {
      const amount = Math.max(0, Number(values.amount) || 0);
      const returnDate = new Date(values.return_date + "T00:00:00");
      const reviewBy = new Date(returnDate);
      if (!Number.isNaN(reviewBy.getTime())) reviewBy.setDate(reviewBy.getDate() + 30);
      const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
      const paragraphs = [
        "To: " + values.drawer,
        "From: " + values.payee,
        "Subject: Demand concerning dishonour of cheque " + values.cheque,
        "The cheque dated " + values.cheque_date + " for " + money + " was returned on " + values.return_date + " with the reason: " + values.reason + ".",
        "Recorded liability/evidence: " + values.facts,
        "Demand: pay the cheque amount within the legally applicable period after receipt of a valid notice.",
      ];
      return { result: "Draft checklist for cheque " + values.cheque, caption: "Initial issue-review target: " + (Number.isNaN(reviewBy.getTime()) ? "verify return date" : reviewBy.toISOString().slice(0, 10)), rows: [["Amount", money], ["Drawer", values.drawer], ["Payee", values.payee], ["Return reason", values.reason]], list: paragraphs };
    }`,
  }),
  base("consumer-complaint-draft-builder", {
    category: ["Text & Writing", "India", "Legal"],
    icon: "file-warning",
    fields: [
      { key: "consumer", label: "Consumer name", type: "text", default: "Example Consumer" },
      { key: "business", label: "Business / service provider", type: "text", default: "Example Seller" },
      { key: "purchase", label: "Purchase / service date", type: "date", default: "2026-07-01" },
      { key: "amount", label: "Amount paid (₹)", type: "number", min: 0, default: 2499 },
      { key: "facts", label: "Facts in date order", type: "textarea", default: "Product delivered damaged on 2026-07-03. Replacement request denied on 2026-07-05." },
      { key: "relief", label: "Relief requested", type: "textarea", default: "Replacement or full refund, plus documented delivery expense." },
      { key: "evidence", label: "Evidence available", type: "textarea", default: "Invoice, delivery photos, support emails, payment receipt." },
    ],
    presets: [{ label: "Damaged delivery", values: { consumer: "Example Consumer", business: "Example Seller", purchase: "2026-07-01", amount: 2499, facts: "Damaged item delivered; support denied replacement.", relief: "Replacement or refund.", evidence: "Invoice, photos, email." } }],
    note: "Creates an organized draft, not legal advice or a guaranteed filing format. Confirm jurisdiction, limitation, pecuniary jurisdiction, portal requirements, and current consumer law.",
    compute: `(values) => {
      const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Math.max(0, Number(values.amount) || 0));
      const sections = [
        "Complainant: " + values.consumer,
        "Opposite party: " + values.business,
        "Transaction: " + values.purchase + " · " + money,
        "Facts: " + values.facts,
        "Deficiency / grievance: The recorded facts should be reviewed and tied to the promised product or service.",
        "Relief requested: " + values.relief,
        "Evidence index: " + values.evidence,
        "Verification: dates, amounts, names, and annexures should be checked before submission.",
      ];
      return { result: "Complaint draft organized", caption: sections.length + " review sections", rows: [["Consumer", values.consumer], ["Business", values.business], ["Amount", money], ["Purchase date", values.purchase]], list: sections };
    }`,
  }),
  base("devanagari-transliteration-keyboard", {
    category: ["Text & Writing", "India"],
    icon: "languages",
    modes: [{ id: "roman-to-devanagari", label: "Roman → Devanagari" }, { id: "devanagari-to-roman", label: "Devanagari → Roman" }],
    fields: [
      { key: "text", label: "Source phrase", type: "textarea", default: "namaste bharat" },
      { key: "preserve", label: "Preserve punctuation", type: "toggle", default: true, checkboxLabel: "Keep spaces, digits, and punctuation" },
    ],
    presets: [{ label: "Namaste Bharat", mode: "roman-to-devanagari", values: { text: "namaste bharat", preserve: true } }, { label: "नमस्ते भारत", mode: "devanagari-to-roman", values: { text: "नमस्ते भारत", preserve: true } }],
    note: "Rule-based local transliteration for common Hindi spellings. Names, conjuncts, schwa deletion, and regional spellings may need manual correction.",
    compute: `(values, mode) => {
      const input = String(values.text || "");
      const source = values.preserve ? input : input.replace(/[^\\p{L}\\p{M}\\s]/gu, "");
      const commonToDeva = { namaste: "नमस्ते", bharat: "भारत", hindi: "हिंदी", mera: "मेरा", naam: "नाम", hai: "है", aap: "आप", kaise: "कैसे", hain: "हैं", dhanyavaad: "धन्यवाद", shukriya: "शुक्रिया", swagat: "स्वागत", dilli: "दिल्ली", mumbai: "मुंबई", pani: "पानी", suraksha: "सुरक्षा" };
      const commonToRoman = Object.fromEntries(Object.entries(commonToDeva).map(([roman, deva]) => [deva, roman]));
      let output;
      if (mode === "devanagari-to-roman") {
        output = source.split(/(\\s+|[.,!?;:]+)/).map((token) => commonToRoman[token] || token).join("");
        const letters = { "अ":"a", "आ":"aa", "इ":"i", "ई":"ii", "उ":"u", "ऊ":"uu", "ए":"e", "ऐ":"ai", "ओ":"o", "औ":"au", "क":"k", "ख":"kh", "ग":"g", "घ":"gh", "च":"ch", "ज":"j", "ट":"t", "ड":"d", "त":"t", "थ":"th", "द":"d", "ध":"dh", "न":"n", "प":"p", "फ":"ph", "ब":"b", "भ":"bh", "म":"m", "य":"y", "र":"r", "ल":"l", "व":"v", "श":"sh", "ष":"sh", "स":"s", "ह":"h", "ा":"aa", "ि":"i", "ी":"ii", "ु":"u", "ू":"uu", "े":"e", "ै":"ai", "ो":"o", "ौ":"au", "ं":"n", "ः":"h", "्":"" };
        output = [...output].map((char) => letters[char] ?? char).join("");
      } else {
        output = source.split(/(\\s+|[.,!?;:]+)/).map((token) => commonToDeva[token.toLowerCase()] || token).join("");
      }
      const changed = [...input].filter((char, index) => char !== output[index]).length;
      return { result: output || "—", caption: mode === "devanagari-to-roman" ? "Devanagari to Roman" : "Roman to Devanagari", rows: [["Input characters", input.length], ["Output characters", output.length], ["Rule substitutions", changed]] };
    }`,
  }),
  base("tds-calculator-by-section", {
    category: ["Finance", "India", "Calculator"],
    icon: "badge-indian-rupee",
    fields: [
      { key: "section", label: "Section / payment type", type: "select", default: "194c_individual", choices: [{ value: "194c_individual", label: "194C contractor — individual/HUF (1%)" }, { value: "194c_other", label: "194C contractor — other (2%)" }, { value: "194h", label: "194H commission (5%)" }, { value: "194i_land", label: "194-I land/building rent (10%)" }, { value: "194i_plant", label: "194-I plant/equipment rent (2%)" }, { value: "194j_professional", label: "194J professional fee (10%)" }, { value: "194j_technical", label: "194J technical fee (2%)" }, { value: "194q", label: "194Q purchase of goods (0.1%)" }] },
      { key: "amount", label: "Payment / aggregate amount (₹)", type: "number", min: 0, default: 100000 },
      { key: "pan", label: "Valid PAN available", type: "toggle", default: true, checkboxLabel: "Deductee has furnished a valid PAN" },
      { key: "custom_rate", label: "Override rate (%) — 0 keeps section rate", type: "number", min: 0, default: 0 },
    ],
    presets: [{ label: "194J professional", values: { section: "194j_professional", amount: 100000, pan: true, custom_rate: 0 } }, { label: "194C contractor", values: { section: "194c_individual", amount: 50000, pan: true, custom_rate: 0 } }],
    note: "Illustrative calculation using common section rates and simplified thresholds. Rates, thresholds, surcharge, treaty, lower-deduction certificates, PAN rules, and Finance Act changes must be checked for the relevant year.",
    compute: `(values) => {
      const rules = {
        "194c_individual": { label: "194C individual/HUF contractor", rate: 1, threshold: 30000 },
        "194c_other": { label: "194C other contractor", rate: 2, threshold: 30000 },
        "194h": { label: "194H commission", rate: 5, threshold: 15000 },
        "194i_land": { label: "194-I land/building rent", rate: 10, threshold: 240000 },
        "194i_plant": { label: "194-I plant/equipment rent", rate: 2, threshold: 240000 },
        "194j_professional": { label: "194J professional fee", rate: 10, threshold: 30000 },
        "194j_technical": { label: "194J technical fee", rate: 2, threshold: 30000 },
        "194q": { label: "194Q purchase of goods", rate: 0.1, threshold: 5000000 },
      };
      const rule = rules[values.section] || rules["194c_individual"];
      const amount = Math.max(0, Number(values.amount) || 0);
      let rate = Number(values.custom_rate) > 0 ? Number(values.custom_rate) : rule.rate;
      if (!values.pan) rate = Math.max(rate, 20);
      const baseAmount = amount > rule.threshold ? amount : 0;
      const tds = baseAmount * rate / 100;
      const money = (number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(number);
      return { result: money(tds) + " estimated TDS", caption: baseAmount ? rate + "% applied" : "Simplified threshold not crossed", rows: [["Section", rule.label], ["Amount", money(amount)], ["Threshold used", money(rule.threshold)], ["Rate", rate + "%"], ["Net after TDS", money(amount - tds)]] };
    }`,
  }),
  base("advance-tax-installment-planner", {
    category: ["Finance", "India", "Calculator"],
    icon: "calendar-range",
    fields: [
      { key: "estimated_tax", label: "Estimated annual tax liability (₹)", type: "number", min: 0, default: 250000 },
      { key: "tds", label: "Expected TDS / TCS credits (₹)", type: "number", min: 0, default: 50000 },
      { key: "paid", label: "Advance tax already paid (₹)", type: "number", min: 0, default: 0 },
      { key: "presumptive", label: "Eligible presumptive taxpayer", type: "toggle", default: false, checkboxLabel: "Use single 100% target by 15 March" },
    ],
    presets: [{ label: "Regular schedule", values: { estimated_tax: 250000, tds: 50000, paid: 0, presumptive: false } }, { label: "Presumptive", values: { estimated_tax: 120000, tds: 10000, paid: 0, presumptive: true } }],
    note: "Planning estimate only. Confirm eligibility, due dates, interest, credits, relief, and current assessment-year rules with official Income Tax guidance.",
    compute: `(values) => {
      const net = Math.max(0, (Number(values.estimated_tax) || 0) - (Number(values.tds) || 0));
      const paid = Math.max(0, Number(values.paid) || 0);
      const targets = values.presumptive ? [["15 Mar", 1]] : [["15 Jun", 0.15], ["15 Sep", 0.45], ["15 Dec", 0.75], ["15 Mar", 1]];
      const money = (number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.max(0, number));
      let previous = paid;
      const rows = targets.map(([date, fraction]) => {
        const cumulative = net * fraction;
        const installment = Math.max(0, cumulative - previous);
        previous += installment;
        return [date, Math.round(fraction * 100) + "%", money(cumulative), money(installment)];
      });
      return { result: money(Math.max(0, net - paid)) + " remaining", caption: values.presumptive ? "Presumptive schedule selected" : "Regular cumulative schedule", rows: [["Net advance-tax base", money(net)], ["Already paid", money(paid)]], table: { headers: ["Target date", "Cumulative target", "Cumulative amount", "Next amount"], rows } };
    }`,
  }),
  base("e-way-bill-validity-calculator", {
    category: ["Business", "India", "Calculator"],
    icon: "truck",
    fields: [
      { key: "distance", label: "Approximate distance (km)", type: "number", min: 1, default: 420 },
      { key: "generated", label: "Generation date", type: "date", default: "2026-07-24" },
      { key: "time", label: "Generation time (24h HH:MM)", type: "text", default: "10:00" },
      { key: "cargo", label: "Movement type", type: "select", default: "regular", choices: [{ value: "regular", label: "Regular / non-ODC" }, { value: "odc", label: "Over-dimensional cargo" }] },
    ],
    presets: [{ label: "420 km regular", values: { distance: 420, generated: "2026-07-24", time: "10:00", cargo: "regular" } }, { label: "65 km ODC", values: { distance: 65, generated: "2026-07-24", time: "10:00", cargo: "odc" } }],
    note: "Uses the common distance slabs as an estimate. Special cargo, multimodal movement, extensions, portal computation, and current GST rules can differ; confirm on the official e-way bill system.",
    compute: `(values) => {
      const distance = Math.max(1, Number(values.distance) || 1);
      const slab = values.cargo === "odc" ? 20 : 200;
      const days = Math.max(1, Math.ceil(distance / slab));
      const start = new Date(values.generated + "T" + (/^\\d{2}:\\d{2}$/.test(values.time) ? values.time : "00:00") + ":00");
      const end = new Date(start);
      if (!Number.isNaN(end.getTime())) end.setDate(end.getDate() + days);
      return { result: days + " day" + (days === 1 ? "" : "s") + " estimated validity", caption: values.cargo === "odc" ? "ODC slab: 20 km/day" : "Regular slab: 200 km/day", rows: [["Distance", distance + " km"], ["Slab", slab + " km per day"], ["Generated", Number.isNaN(start.getTime()) ? "Invalid date/time" : start.toLocaleString()], ["Estimated end", Number.isNaN(end.getTime()) ? "Invalid date/time" : end.toLocaleString()]] };
    }`,
  }),
  base("indian-mobile-number-validator", {
    category: ["India", "Productivity"],
    icon: "smartphone",
    fields: [
      { key: "number", label: "Indian mobile number", type: "text", default: "+91 98765 43210" },
      { key: "strict", label: "Strict mobile prefix", type: "toggle", default: true, checkboxLabel: "Require first national digit 6–9" },
    ],
    presets: [{ label: "+91 format", values: { number: "+91 98765 43210", strict: true } }, { label: "10 digits", values: { number: "8765432109", strict: true } }],
    note: "Checks syntax only. It does not reveal ownership, carrier status, SIM validity, or whether the number is safe.",
    compute: `(values) => {
      const raw = String(values.number || "").trim();
      let digits = raw.replace(/\\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
      else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
      const prefixOk = values.strict ? /^[6-9]/.test(digits) : /^\\d/.test(digits);
      const valid = /^\\d{10}$/.test(digits) && prefixOk;
      return { result: valid ? "Valid mobile-number format" : "Invalid mobile-number format", caption: valid ? "+91 " + digits.slice(0, 5) + " " + digits.slice(5) : "Expected 10 national digits" + (values.strict ? " beginning 6–9" : ""), rows: [["Normalized E.164", valid ? "+91" + digits : "—"], ["National number", digits || "—"], ["Length", digits.length], ["Prefix check", prefixOk ? "Pass" : "Fail"]] };
    }`,
  }),
  base("voter-id-format-validator", {
    category: ["India", "Productivity"],
    icon: "badge-check",
    fields: [
      { key: "epic", label: "EPIC / Voter ID", type: "text", default: "ABC1234567" },
      { key: "normalize", label: "Normalize", type: "toggle", default: true, checkboxLabel: "Remove spaces and use uppercase" },
    ],
    presets: [{ label: "EPIC example", values: { epic: "ABC1234567", normalize: true } }],
    note: "Checks the common EPIC pattern only. It does not confirm enrolment, identity, constituency, or record status; use the Election Commission's official services.",
    compute: `(values) => {
      const raw = String(values.epic || "");
      const code = values.normalize ? raw.replace(/\\s+/g, "").toUpperCase() : raw;
      const valid = /^[A-Z]{3}\\d{7}$/.test(code);
      return { result: valid ? "Valid common EPIC format" : "Invalid common EPIC format", caption: valid ? "Format only — official verification still required" : "Expected 3 letters followed by 7 digits", rows: [["Normalized", code || "—"], ["Letter block", code.slice(0, 3) || "—"], ["Serial block", code.slice(3) || "—"]] };
    }`,
  }),
  base("driving-licence-number-decoder", {
    category: ["India", "Productivity"],
    icon: "car-front",
    fields: [
      { key: "licence", label: "Driving licence number", type: "text", default: "DL-0420110012345" },
      { key: "normalize", label: "Normalize", type: "toggle", default: true, checkboxLabel: "Remove spaces and hyphens" },
    ],
    presets: [{ label: "Delhi example", values: { licence: "DL-0420110012345", normalize: true } }],
    note: "Parses a common state/RTO/year/serial structure. Older and state-specific formats vary; this does not confirm licence validity or ownership.",
    compute: `(values) => {
      const raw = String(values.licence || "");
      const code = values.normalize ? raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase() : raw;
      const match = code.match(/^([A-Z]{2})(\\d{2})(\\d{4})(\\d{7})$/);
      const states = { DL: "Delhi", MH: "Maharashtra", GJ: "Gujarat", KA: "Karnataka", TN: "Tamil Nadu", UP: "Uttar Pradesh", RJ: "Rajasthan", WB: "West Bengal", HR: "Haryana", PB: "Punjab", MP: "Madhya Pradesh", KL: "Kerala", TS: "Telangana", AP: "Andhra Pradesh" };
      return { result: match ? "Common DL structure decoded" : "Unrecognized common DL structure", caption: match ? (states[match[1]] || "State code " + match[1]) : "Expected state(2) + RTO(2) + year(4) + serial(7)", rows: [["Normalized", code || "—"], ["State", match ? (states[match[1]] || match[1]) : "—"], ["RTO code", match ? match[2] : "—"], ["Issue-year field", match ? match[3] : "—"], ["Serial", match ? match[4] : "—"]] };
    }`,
  }),
  base("vehicle-document-reminder", {
    category: ["India", "Productivity"],
    icon: "calendar-check-2",
    fields: [
      { key: "documents", label: "Vehicle documents", type: "textarea", default: "RC | 2027-06-30 | MH01AB1234\nInsurance | 2026-08-15 | Policy POL-104\nPUC | 2026-08-02 | Certificate PUC-92\nDriving licence | 2029-04-20 | DL record", hint: "Document | expiry date | reference" },
      { key: "as_of", label: "Review date", type: "date", default: "2026-07-24" },
      { key: "warn_days", label: "Warning window (days)", type: "number", min: 1, default: 30 },
    ],
    presets: [{ label: "Example vehicle", values: { documents: "RC | 2027-06-30 | MH01AB1234\nInsurance | 2026-08-15 | POL-104\nPUC | 2026-08-02 | PUC-92", as_of: "2026-07-24", warn_days: 30 } }],
    compute: `(values) => {
      const asOf = new Date(values.as_of + "T00:00:00");
      const warning = Math.max(1, Number(values.warn_days) || 30);
      const rows = String(values.documents || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name = "Item", dateText = "", reference = "—"] = line.split("|").map((cell) => cell.trim());
        const date = new Date(dateText + "T00:00:00");
        const days = Math.ceil((date - asOf) / 86400000);
        const status = Number.isNaN(days) ? "Invalid date" : days < 0 ? Math.abs(days) + "d overdue" : days <= warning ? days + "d · renew soon" : days + "d";
        return [name, dateText || "—", reference, status];
      });
      const urgent = rows.filter((row) => /overdue|renew soon|Invalid/.test(row[3])).length;
      return { result: rows.length + " record(s) tracked", caption: urgent + " need attention", rows: [["Warning window", warning + " days"], ["Needs attention", urgent]], table: { headers: ["Item", "Expiry", "Reference", "Status"], rows } };
    }`,
  }),
  base("post-office-scheme-calculator", {
    category: ["Finance", "India", "Calculator"],
    icon: "landmark",
    fields: [
      { key: "scheme", label: "Scheme", type: "select", default: "nsc", choices: [{ value: "nsc", label: "NSC — compound maturity estimate" }, { value: "kvp", label: "KVP — maturity estimate" }, { value: "mis", label: "MIS — monthly income estimate" }] },
      { key: "principal", label: "Deposit (₹)", type: "number", min: 0, default: 100000 },
      { key: "rate", label: "Annual rate (%)", type: "number", min: 0, default: 7.7 },
      { key: "years", label: "Term (years)", type: "number", min: 0.1, default: 5 },
      { key: "compound", label: "Compounds per year", type: "number", min: 1, default: 1 },
    ],
    presets: [{ label: "NSC example", values: { scheme: "nsc", principal: 100000, rate: 7.7, years: 5, compound: 1 } }, { label: "MIS example", values: { scheme: "mis", principal: 100000, rate: 7.4, years: 5, compound: 1 } }],
    note: "User-supplied-rate estimate only. Verify current India Post rates, limits, eligibility, compounding method, tax treatment, and premature-closure rules officially.",
    compute: `(values) => {
      const principal = Math.max(0, Number(values.principal) || 0);
      const rate = Math.max(0, Number(values.rate) || 0) / 100;
      const years = Math.max(0.1, Number(values.years) || 0.1);
      const compounds = Math.max(1, Math.round(Number(values.compound) || 1));
      const maturity = principal * Math.pow(1 + rate / compounds, compounds * years);
      const monthly = principal * rate / 12;
      const money = (number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(number);
      if (values.scheme === "mis") return { result: money(monthly) + " estimated monthly income", caption: rate * 100 + "% user-supplied rate", rows: [["Deposit", money(principal)], ["Annual income", money(monthly * 12)], ["Term income", money(monthly * 12 * years)], ["Principal returned separately", money(principal)]] };
      return { result: money(maturity) + " estimated maturity", caption: values.scheme === "kvp" ? "KVP-style compound estimate" : "NSC-style compound estimate", rows: [["Deposit", money(principal)], ["Estimated interest", money(maturity - principal)], ["Term", years + " years"], ["Compounding", compounds + "× / year"]] };
    }`,
  }),
  base("price-evidence-locker", {
    category: ["Shopping", "Security & Privacy"],
    icon: "archive-restore",
    fields: [
      { key: "url", label: "Product or offer URL", type: "text", default: "https://shop.example/product" },
      { key: "seller", label: "Seller", type: "text", default: "Example Seller" },
      { key: "price", label: "Observed price", type: "text", default: "₹2,499 including delivery" },
      { key: "claim", label: "Offer claim and conditions", type: "textarea", default: "30% off until 31 July; new customers only." },
      { key: "captured", label: "Capture date", type: "date", default: "2026-07-24" },
      { key: "evidence", label: "Screenshot or saved page", type: "file", required: false, hint: "Optional local evidence file" },
    ],
    presets: [{ label: "Example offer", values: { url: "https://shop.example/product", seller: "Example Seller", price: "₹2,499", claim: "30% off until 31 July.", captured: "2026-07-24", evidence: null } }],
    note: "Creates a local evidence manifest and checksum; it does not independently timestamp, notarize, or prove what a remote page displayed. Preserve the original file and transaction records.",
    outputLabel: "Evidence manifest",
    compute: `async (values) => {
      const file = values.evidence;
      const source = [values.url, values.seller, values.price, values.claim, values.captured, file?.name || "", file?.size || 0, file?.dataUrl || file?.text || ""].join("\\n");
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
      const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      return { result: "Evidence manifest " + checksum.slice(0, 12), caption: file ? file.name + " included in local checksum" : "Metadata-only manifest; attach a saved file for stronger evidence", rows: [["Seller", values.seller], ["Observed price", values.price], ["Capture date", values.captured], ["File", file?.name || "Not attached"], ["SHA-256", checksum]], list: ["URL: " + values.url, "Claim: " + values.claim, "Keep the original evidence file unchanged alongside this downloaded manifest."] };
    }`,
  }),
  base("repair-quote-comparator", {
    category: ["Lifestyle", "Business"],
    icon: "wrench",
    fields: [
      { key: "quotes", label: "Repair quotes", type: "textarea", default: "RepairCo A | 2500 | 1200 | 300 | 180 | Parts 12m; labour 3m | Diagnostics excluded\nRepairCo B | 2200 | 1500 | 0 | 120 | Parts 6m; labour 6m | Pickup excluded", hint: "Provider | parts | labour | other | turnaround hours | warranty | exclusions" },
      { key: "tax_rate", label: "Tax rate to add (%)", type: "number", min: 0, default: 18 },
    ],
    presets: [{ label: "Two quotes", values: { quotes: "RepairCo A | 2500 | 1200 | 300 | 180 | Parts 12m | Diagnostics excluded\nRepairCo B | 2200 | 1500 | 0 | 120 | Parts 6m | Pickup excluded", tax_rate: 18 } }],
    compute: `(values) => {
      const taxRate = Math.max(0, Number(values.tax_rate) || 0);
      const parsed = String(values.quotes || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const rows = parsed.map((row) => {
        const subtotal = [row[1], row[2], row[3]].reduce((sum, value) => sum + (Number(value) || 0), 0);
        const total = subtotal * (1 + taxRate / 100);
        return [row[0] || "—", subtotal.toFixed(2), total.toFixed(2), row[4] || "—", row[5] || "—", row[6] || "—"];
      }).sort((a, b) => Number(a[2]) - Number(b[2]));
      return { result: rows.length ? rows[0][0] + " has the lowest entered total" : "No quotes entered", caption: taxRate + "% tax assumption", rows: [["Quotes compared", rows.length], ["Lowest total", rows.length ? rows[0][2] : "—"], ["Highest total", rows.length ? rows[rows.length - 1][2] : "—"]], table: { headers: ["Provider", "Subtotal", "Total", "Hours", "Warranty", "Exclusions"], rows } };
    }`,
  }),
  base("loan-fee-extractor", {
    category: ["Finance", "Security & Privacy"],
    icon: "scan-text",
    fields: [
      { key: "agreement", label: "Loan agreement text", type: "textarea", default: "Processing fee: ₹2,500. Late payment charge: 2% per month. Prepayment penalty: 3% of outstanding principal. Interest rate may reset every 12 months." },
      { key: "currency", label: "Currency label", type: "text", default: "INR" },
      { key: "include_context", label: "Include matched context", type: "toggle", default: true, checkboxLabel: "Show extracted clause snippets" },
    ],
    presets: [{ label: "Fee clauses", values: { agreement: "Processing fee: ₹2,500. Late payment charge: 2% per month. Prepayment penalty: 3%. Rate resets annually.", currency: "INR", include_context: true } }],
    note: "Local keyword and amount extraction, not legal interpretation. Read the full agreement and key-fact statement; confirm fees, interest, tax, reset clauses, and lender disclosures.",
    compute: `(values) => {
      const text = String(values.agreement || "");
      const sentences = text.split(/(?<=[.!?])\\s+|\\r?\\n/).map((sentence) => sentence.trim()).filter(Boolean);
      const rules = [["Processing / origination", /processing|origination|application fee/i], ["Late payment", /late|overdue|default charge/i], ["Prepayment / foreclosure", /prepay|foreclos|early repayment/i], ["Rate reset", /reset|floating|benchmark|spread/i], ["Insurance / add-on", /insurance|protection plan|add-on/i], ["Collection / bounce", /collection|bounce|dishonou?r|ecs|nach/i]];
      const findings = [];
      for (const [type, pattern] of rules) {
        const matches = sentences.filter((sentence) => pattern.test(sentence));
        for (const sentence of matches) {
          const amounts = sentence.match(/(?:₹|rs\\.?|inr|\\$)?\\s*\\d[\\d,]*(?:\\.\\d+)?\\s*%?/gi) || [];
          findings.push([type, amounts.join(", ") || "No numeric amount found", values.include_context ? sentence.slice(0, 240) : "Context hidden"]);
        }
      }
      return { result: findings.length + " possible fee / reset clause(s)", caption: values.currency + " · review every match manually", rows: [["Text characters", text.length], ["Clause types", new Set(findings.map((row) => row[0])).size]], table: { headers: ["Type", "Amount / rate", "Context"], rows: findings }, list: findings.length ? [] : ["No configured fee keywords found; manually review schedules, annexures, and key-fact statements."] };
    }`,
  }),
  base("insurance-policy-comparator", {
    category: ["Finance", "Lifestyle"],
    icon: "shield-check",
    fields: [
      { key: "policies", label: "Policy comparison rows", type: "textarea", default: "Policy A | 12000 | 500000 | 30 days | 10% co-pay | Room cap ₹5,000 | Pre-existing 3 years\nPolicy B | 14500 | 750000 | 60 days | No co-pay | No room cap | Pre-existing 2 years", hint: "Policy | premium | coverage | waiting | co-pay | key limits | exclusions" },
      { key: "priority", label: "Primary comparison priority", type: "select", default: "coverage", choices: [{ value: "coverage", label: "Higher coverage" }, { value: "premium", label: "Lower premium" }, { value: "waiting", label: "Shorter waiting period" }] },
    ],
    presets: [{ label: "Two health policies", values: { policies: "Policy A | 12000 | 500000 | 30 days | 10% co-pay | Room cap | PED 3 years\nPolicy B | 14500 | 750000 | 60 days | No co-pay | No room cap | PED 2 years", priority: "coverage" } }],
    note: "Comparison organizer only. Read official policy wording, schedules, exclusions, sub-limits, network, claims rules, renewability, taxes, and current insurer disclosures.",
    compute: `(values) => {
      const parsed = String(values.policies || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const rows = parsed.map((row) => [row[0] || "—", Number(row[1]) || 0, Number(row[2]) || 0, row[3] || "—", row[4] || "—", row[5] || "—", row[6] || "—"]);
      const ranked = [...rows].sort((a, b) => values.priority === "premium" ? a[1] - b[1] : values.priority === "coverage" ? b[2] - a[2] : (parseFloat(a[3]) || 9999) - (parseFloat(b[3]) || 9999));
      return { result: ranked.length ? ranked[0][0] + " ranks first for " + values.priority : "No policies entered", caption: "Ranking uses only the entered fields", rows: [["Policies compared", rows.length], ["Lowest premium", rows.length ? Math.min(...rows.map((row) => row[1])) : "—"], ["Highest coverage", rows.length ? Math.max(...rows.map((row) => row[2])) : "—"]], table: { headers: ["Policy", "Premium", "Coverage", "Waiting", "Co-pay", "Limits", "Exclusions"], rows: ranked } };
    }`,
  }),
  base("salary-slip-anomaly-checker", {
    category: ["Finance", "Productivity"],
    icon: "file-chart-column",
    fields: [
      { key: "slips", label: "Monthly salary figures", type: "textarea", default: "2026-05 | 80000 | 12000 | 68000\n2026-06 | 80000 | 12000 | 68000\n2026-07 | 80000 | 18000 | 62000", hint: "Month | gross | deductions | net" },
      { key: "tolerance", label: "Change alert threshold (%)", type: "number", min: 0, default: 5 },
    ],
    presets: [{ label: "Three months", values: { slips: "2026-05 | 80000 | 12000 | 68000\n2026-06 | 80000 | 12000 | 68000\n2026-07 | 80000 | 18000 | 62000", tolerance: 5 } }],
    note: "Arithmetic and month-to-month anomaly aid only. It does not determine tax, payroll, employment rights, or whether a deduction is lawful.",
    compute: `(values) => {
      const tolerance = Math.max(0, Number(values.tolerance) || 0);
      const source = String(values.slips || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      let previousNet = null;
      const rows = source.map((row) => {
        const gross = Number(row[1]) || 0, deductions = Number(row[2]) || 0, net = Number(row[3]) || 0;
        const mathGap = net - (gross - deductions);
        const change = previousNet ? ((net - previousNet) / Math.abs(previousNet)) * 100 : 0;
        const flags = [Math.abs(mathGap) > 0.01 ? "Totals mismatch" : "", previousNet && Math.abs(change) > tolerance ? "Net changed " + change.toFixed(1) + "%" : ""].filter(Boolean).join("; ") || "No configured anomaly";
        previousNet = net;
        return [row[0] || "—", gross, deductions, net, mathGap.toFixed(2), flags];
      });
      const flagged = rows.filter((row) => row[5] !== "No configured anomaly").length;
      return { result: flagged + " month(s) flagged", caption: tolerance + "% net-change threshold", rows: [["Months", rows.length], ["Flagged", flagged]], table: { headers: ["Month", "Gross", "Deductions", "Net", "Math gap", "Review"], rows } };
    }`,
  }),
  base("senior-device-permission-audit", {
    category: ["Security & Privacy", "Lifestyle"],
    icon: "shield-question",
    fields: [
      { key: "permissions", label: "Apps and permissions", type: "textarea", default: "Flashlight | Camera, microphone, contacts, location | Rarely used\nBanking app | SMS, notifications | Used weekly\nVideo call | Camera, microphone, contacts | Used daily", hint: "App | permissions | usage note" },
      { key: "explain", label: "Use plain-language guidance", type: "toggle", default: true, checkboxLabel: "Add senior-friendly action wording" },
    ],
    presets: [{ label: "Example phone", values: { permissions: "Flashlight | Camera, microphone, contacts, location | Rarely used\nVideo call | Camera, microphone, contacts | Used daily", explain: true } }],
    note: "Permission-cleanup guide only. Do not remove accessibility, emergency, authenticator, banking, caregiver, or medical permissions without understanding the impact and having a recovery plan.",
    compute: `(values) => {
      const sensitive = ["microphone", "camera", "contacts", "location", "sms", "phone", "accessibility", "files", "photos"];
      const rows = String(values.permissions || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [app = "App", list = "", usage = ""] = line.split("|").map((cell) => cell.trim());
        const found = sensitive.filter((permission) => list.toLowerCase().includes(permission));
        const rarely = /rare|never|unused/.test(usage.toLowerCase());
        const score = found.length + (rarely ? 2 : 0);
        const action = score >= 5 ? "Review now" : score >= 3 ? "Review" : "Lower concern";
        return [app, list || "—", usage || "—", found.length, values.explain ? action + (rarely ? " — ask why an unused app still needs access" : " — confirm this access matches the app's job") : action];
      });
      return { result: rows.filter((row) => /Review/.test(row[4])).length + " app(s) to review", caption: "Nothing is changed automatically", rows: [["Apps listed", rows.length], ["Sensitive permissions tracked", sensitive.length]], table: { headers: ["App", "Permissions", "Usage", "Sensitive count", "Suggested conversation"], rows } };
    }`,
  }),
  base("lost-phone-response-planner", {
    category: ["Security & Privacy", "Productivity"],
    icon: "smartphone-off",
    fields: [
      { key: "platform", label: "Phone platform", type: "select", default: "android", choices: [{ value: "android", label: "Android" }, { value: "ios", label: "iPhone / iOS" }, { value: "other", label: "Other" }] },
      { key: "locked", label: "Screen lock enabled", type: "toggle", default: true, checkboxLabel: "Phone had PIN/password/biometric lock" },
      { key: "financial", label: "Financial apps or cards", type: "toggle", default: true, checkboxLabel: "Banking, wallet, UPI, or saved cards are present" },
      { key: "work", label: "Work or sensitive accounts", type: "toggle", default: false, checkboxLabel: "Work email, admin, health, or other sensitive access is present" },
      { key: "number", label: "Mobile number / SIM reference", type: "text", default: "Primary SIM" },
    ],
    presets: [{ label: "Android with banking", values: { platform: "android", locked: true, financial: true, work: false, number: "Primary SIM" } }],
    note: "Prioritization aid only. Use a safe device/network and official provider contacts. Do not confront a suspected thief or travel to an unsafe location based on tracking.",
    compute: `(values) => {
      const steps = [
        "From a safe device, open the official " + (values.platform === "ios" ? "Apple Find My" : values.platform === "android" ? "Google Find My Device" : "device-account") + " service; mark the phone lost and show a safe callback message.",
        "Call the mobile operator through an independently verified number to suspend " + values.number + " and request a replacement SIM/eSIM.",
        "Preserve the device serial/IMEI, last known location, time, screenshots, and police/insurer reference where appropriate.",
        "Change the primary email/account password, review active sessions, and protect the recovery email and authenticator.",
      ];
      if (values.financial) steps.splice(2, 0, "Contact banks/wallets through official channels, freeze risky cards/UPI access, and review recent transactions.");
      if (values.work) steps.splice(2, 0, "Notify the employer/security team so work tokens, MDM, VPN, and sessions can be revoked.");
      if (!values.locked) steps.unshift("Highest priority: the phone lacked a screen lock; revoke account sessions and financial access immediately.");
      steps.push("Remote-erase only after weighing evidence, location tracking, backups, and recovery needs; erase can be irreversible.");
      return { result: (values.locked ? "Urgent" : "Critical") + " response plan", caption: steps.length + " prioritized actions", rows: [["Platform", values.platform], ["Screen lock", values.locked ? "Enabled" : "Not enabled"], ["Financial apps", values.financial ? "Yes" : "No"], ["Sensitive work access", values.work ? "Yes" : "No"]], list: steps };
    }`,
  }),
  base("personal-crisis-safety-plan", {
    category: ["Health & Wellness", "Productivity"],
    icon: "heart-handshake",
    fields: [
      { key: "warning", label: "Personal warning signs", type: "textarea", default: "Not sleeping, withdrawing, racing thoughts" },
      { key: "coping", label: "Self-selected grounding or coping steps", type: "textarea", default: "Move to a shared safe place\nDrink water and slow breathing\nAvoid driving and major decisions" },
      { key: "people", label: "Trusted contacts and how to reach them", type: "textarea", default: "Trusted person — phone saved as Favourite\nClinician — appointment portal" },
      { key: "safe_place", label: "Safer place", type: "text", default: "Trusted person's home" },
      { key: "reduce_risk", label: "User-chosen ways to reduce immediate risk", type: "textarea", default: "Hand over keys and risky items to a trusted person; stay with someone." },
      { key: "immediate", label: "Immediate danger right now", type: "toggle", default: false, checkboxLabel: "There may be immediate danger or inability to stay safe" },
    ],
    presets: [{ label: "Private starter", values: { warning: "Not sleeping and withdrawing", coping: "Go to a shared safe place\nCall a trusted person", people: "Trusted person — saved contact", safe_place: "Trusted person's home", reduce_risk: "Stay with someone and reduce access to risky items", immediate: false } }],
    note: "Private planning aid, not emergency care or treatment. If there is immediate danger, use local emergency services or a trusted in-person support route now. This tool deliberately does not guess country-specific hotline numbers.",
    compute: `(values) => {
      const split = (text) => String(text || "").split(/\\r?\\n/).map((item) => item.trim()).filter(Boolean);
      const warnings = split(values.warning), coping = split(values.coping), people = split(values.people), risk = split(values.reduce_risk);
      const list = [
        ...(values.immediate ? ["Immediate action: move to a safer shared place, contact a trusted person in person, and use local emergency services if needed."] : []),
        ...warnings.map((item) => "Warning sign: " + item),
        ...coping.map((item) => "Coping step: " + item),
        "Safer place: " + values.safe_place,
        ...people.map((item) => "Contact: " + item),
        ...risk.map((item) => "Reduce risk: " + item),
      ];
      return { result: values.immediate ? "Immediate-support plan" : "Personal safety plan", caption: list.length + " private plan item(s)", rows: [["Warning signs", warnings.length], ["Coping steps", coping.length], ["Trusted contacts", people.length], ["Risk-reduction steps", risk.length]], list };
    }`,
  }),
  base("sobriety-recovery-journal", {
    category: ["Health & Wellness", "Productivity"],
    icon: "calendar-heart",
    fields: [
      { key: "entries", label: "Private journal entries", type: "textarea", default: "2026-07-22 | 4 | Stress after work | Walked and called a friend | Stayed sober\n2026-07-23 | 2 | Social invitation | Chose alcohol-free option | Left early and rested\n2026-07-24 | 3 | Poor sleep | Ate, hydrated, attended meeting | Asked for support", hint: "Date | urge 0–10 | trigger | coping response | win / note" },
      { key: "start", label: "Recovery start date", type: "date", default: "2026-07-01" },
    ],
    presets: [{ label: "Three private entries", values: { entries: "2026-07-22 | 4 | Stress | Walked and called a friend | Stayed sober\n2026-07-23 | 2 | Social invitation | Alcohol-free option | Left early", start: "2026-07-01" } }],
    note: "Private reflection aid, not addiction treatment or a safety monitor. A setback is information, not failure; seek qualified and trusted support for withdrawal risk, emergencies, or treatment decisions.",
    compute: `(values) => {
      const rows = String(values.entries || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const urges = rows.map((row) => Math.max(0, Math.min(10, Number(row[1]) || 0)));
      const average = urges.length ? urges.reduce((sum, value) => sum + value, 0) / urges.length : 0;
      const today = new Date();
      const start = new Date(values.start + "T00:00:00");
      const days = Number.isNaN(start.getTime()) ? 0 : Math.max(0, Math.floor((today - start) / 86400000));
      const triggers = new Map();
      for (const row of rows) if (row[2]) triggers.set(row[2], (triggers.get(row[2]) || 0) + 1);
      const common = [...triggers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      return { result: days + " day(s) since selected start", caption: rows.length + " journal entries · average urge " + average.toFixed(1) + "/10", rows: [["Entries", rows.length], ["Average urge", average.toFixed(1)], ["Highest urge", urges.length ? Math.max(...urges) : 0], ["Distinct triggers", triggers.size]], table: { headers: ["Trigger", "Times noted"], rows: common }, list: rows.slice(-5).map((row) => (row[0] || "Date") + ": " + (row[4] || row[3] || "Reflection recorded")) };
    }`,
  }),
  base("elimination-diet-correlation-log", {
    category: ["Health & Wellness", "Productivity"],
    icon: "salad",
    fields: [
      { key: "entries", label: "Food and reaction log", type: "textarea", default: "2026-07-20 | Milk, oats | Bloating | 6 | 3\n2026-07-21 | Rice, vegetables | None | 0 | 2\n2026-07-22 | Milk, tea | Bloating | 5 | 4", hint: "Date | foods (comma-separated) | symptom | severity 0–10 | hours after" },
      { key: "minimum", label: "Minimum food appearances", type: "number", min: 1, default: 1 },
    ],
    presets: [{ label: "Example log", values: { entries: "2026-07-20 | Milk, oats | Bloating | 6 | 3\n2026-07-21 | Rice, vegetables | None | 0 | 2\n2026-07-22 | Milk, tea | Bloating | 5 | 4", minimum: 1 } }],
    note: "Shows co-occurrence, not causation or diagnosis. Elimination diets can cause nutritional harm; involve a qualified clinician/dietitian for severe reactions, children, pregnancy, chronic illness, or broad restriction.",
    compute: `(values) => {
      const minimum = Math.max(1, Number(values.minimum) || 1);
      const lines = String(values.entries || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const foods = new Map();
      for (const row of lines) {
        const severity = Math.max(0, Math.min(10, Number(row[3]) || 0));
        for (const food of String(row[1] || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)) {
          const current = foods.get(food) || { count: 0, total: 0, symptoms: new Set() };
          current.count += 1; current.total += severity; if (row[2]) current.symptoms.add(row[2]); foods.set(food, current);
        }
      }
      const rows = [...foods.entries()].filter(([, data]) => data.count >= minimum).map(([food, data]) => [food, data.count, (data.total / data.count).toFixed(1), [...data.symptoms].join(", ") || "—"]).sort((a, b) => Number(b[2]) - Number(a[2]));
      return { result: rows.length + " food pattern(s) summarized", caption: lines.length + " dated observations; no causal claim", rows: [["Log entries", lines.length], ["Foods meeting minimum", rows.length]], table: { headers: ["Food", "Appearances", "Average entered severity", "Symptoms noted"], rows }, list: ["Change one planned variable at a time where clinically appropriate and record portion, timing, medication, sleep, and illness as possible confounders."] };
    }`,
  }),
  base("sexual-health-test-tracker", {
    category: ["Health & Wellness", "Productivity"],
    icon: "shield-plus",
    fields: [
      { key: "tests", label: "Private test records", type: "textarea", default: "HIV screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal\nSyphilis screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal", hint: "Test | date | result / status | next review date | private reference" },
      { key: "as_of", label: "Review date", type: "date", default: "2026-07-24" },
      { key: "warn_days", label: "Reminder window (days)", type: "number", min: 1, default: 30 },
    ],
    presets: [{ label: "Private example", values: { tests: "HIV screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal\nSyphilis screening | 2026-05-01 | Negative | 2026-11-01 | Clinic portal", as_of: "2026-07-24", warn_days: 30 } }],
    note: "Private reminder organizer, not medical interpretation. Testing type, timing, window periods, exposure-specific prophylaxis, vaccination, and follow-up require a qualified clinician; urgent exposures may be time-sensitive.",
    compute: `(values) => {
      const asOf = new Date(values.as_of + "T00:00:00");
      const warning = Math.max(1, Number(values.warn_days) || 30);
      const rows = String(values.tests || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [test = "Test", date = "", result = "", next = "", reference = ""] = line.split("|").map((cell) => cell.trim());
        const nextDate = new Date(next + "T00:00:00");
        const days = Math.ceil((nextDate - asOf) / 86400000);
        const status = Number.isNaN(days) ? "Review date" : days < 0 ? Math.abs(days) + "d overdue" : days <= warning ? days + "d · upcoming" : days + "d";
        return [test, date || "—", result || "—", next || "—", status, reference || "—"];
      });
      const due = rows.filter((row) => /overdue|upcoming|Review/.test(row[4])).length;
      return { result: rows.length + " private record(s)", caption: due + " reminder(s) need review", rows: [["Records", rows.length], ["Reminder window", warning + " days"], ["Needs review", due]], table: { headers: ["Test", "Date", "Entered result", "Next review", "Reminder", "Reference"], rows } };
    }`,
  }),
  delimitedWorkbench("travel-disruption-evidence-pack", {
    headers: ["Evidence item", "Date / time", "Provider", "Booking / claim ref", "Amount", "File / message reference", "Why it matters"],
    sample:
      "Delay notification | 2026-07-20 18:40 | Example Air | PNR123 | — | screenshot-01.png | Shows announced delay\nReplacement hotel | 2026-07-21 00:10 | Example Hotel | INV-92 | 6800 | receipt-92.pdf | Consequential expense",
    category: ["Travel", "Productivity"],
    icon: "plane",
    note: "Builds a local claim index. Preserve original files, headers, booking terms, receipts, provider messages, and official disruption records; eligibility and deadlines vary.",
  }),
  delimitedWorkbench("family-emergency-contact-tree", {
    headers: ["Priority", "Person / service", "Relationship / role", "Primary contact", "Backup contact", "Responsibility", "Offline note"],
    sample:
      "1 | Asha | Family coordinator | Saved mobile | Neighbour | Account for everyone | Printed copy in kitchen\n2 | Dr Rao | Clinician | Clinic number | Patient portal | Medication advice | Medication list attached",
    category: ["Lifestyle", "Productivity"],
    icon: "network",
    note: "Keep printed/offline copies where appropriate and review regularly. Do not include secrets, passwords, or unnecessary sensitive details in a shared contact tree.",
  }),
];

let built = 0;
for (const raw of specs) {
  if (requested.size && !requested.has(raw.slug)) continue;
  const entry = entryBySlug.get(raw.slug);
  const validation = await validateRawSpec(
    {
      slug: raw.slug,
      name: raw.title,
      description: raw.description,
      category: raw.category,
    },
    raw,
  );
  if (!validation.ok) {
    throw new Error(`${raw.slug}: ${validation.error}`);
  }
  const quality = qualityLint(validation.spec);
  if (quality.grade === "poor") {
    throw new Error(
      `${raw.slug}: quality ${quality.score} (${quality.issues
        .map((issue) => issue.code)
        .join(", ")})`,
    );
  }
  if (!dryRun) emitTool(validation.spec, toolsDir);
  built += 1;
  console.log(
    `${dryRun ? "Validated" : "Built"} ${entry.id} ${raw.slug} · quality ${quality.score}`,
  );
}

console.log(`${dryRun ? "Validated" : "Built"} ${built} P1 tools.`);
