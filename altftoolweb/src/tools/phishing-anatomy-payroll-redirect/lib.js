/**
 * Payroll-redirect (salary diversion) phishing anatomy.
 *
 * Pure helpers — no React, no DOM, no network. The scoring rules below describe
 * business email compromise of the payroll process: an attacker posing as an
 * employee asks HR or payroll to change the bank account salary is paid into.
 */

/** Consumer mailbox providers. An employee's HR request should not arrive from one. */
export const FREE_MAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "ymail.com", "rediffmail.com", "aol.com",
  "gmx.com", "mail.ru", "yandex.com", "proton.me", "protonmail.com", "icloud.com", "zoho.com",
];

/** Wording that removes the attacker's need to ever speak to you. */
export const NO_CONTACT_PHRASES = [
  "cannot take calls", "can't take calls", "unable to take calls", "in meetings all day",
  "email only", "reply by email", "do not call", "phone is not working", "lost my phone",
  "only reachable by email", "travelling and cannot",
];

/** The standard cover story for why the old account no longer works. */
export const ACCOUNT_CHANGE_PHRASES = [
  "no longer have access", "closed my account", "changed my bank", "new bank account",
  "update my bank details", "change my salary account", "update my direct deposit",
  "new account number", "update the account on file", "switch my payroll account",
  "update my salary account", "update my account details", "pay my salary into",
  "change the account", "different account", "new ifsc", "new sort code", "new routing number",
];

/** Timing pressure tied to the payroll calendar. */
export const CUTOFF_PHRASES = [
  "before the payroll run", "before this month", "before cutoff", "before the cut-off",
  "in time for", "this month's salary", "urgent", "as soon as possible", "asap", "today if possible",
];

/** Attacker asks for a receipt so they know the change landed. */
export const CONFIRMATION_PHRASES = ["confirm once updated", "let me know when", "please confirm the change", "acknowledge this email"];

/** Two-label public suffixes so example.co.uk is not read as "co.uk". Approximation, not the full PSL. */
const MULTI_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk",
  "co.in", "net.in", "org.in", "ac.in", "edu.in", "gov.in", "nic.in",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "co.nz", "org.nz", "ac.nz", "co.za", "org.za",
  "co.jp", "or.jp", "ne.jp", "ac.jp", "com.br", "com.mx", "com.ar",
  "com.sg", "com.my", "com.hk", "com.cn", "com.tw", "co.kr", "com.tr",
  "co.il", "com.ph", "co.th", "com.vn", "com.pk", "com.bd", "com.ng",
]);

/**
 * Facts a reader has to supply because they cannot be read out of the message
 * text. Each carries the weight added when the answer is "yes".
 */
export const MANUAL_CHECKS = [
  {
    id: "accountNameMismatch",
    question: "Is the new account in a different name from the employee?",
    weight: 30,
    detail: "Salary paid to a third-party account is the single strongest indicator. Mule accounts are frequently opened in an unrelated name or a slight variation of the employee's.",
  },
  {
    id: "outsideHrSystem",
    question: "Did the change arrive by email instead of the HR self-service portal?",
    weight: 22,
    detail: "Where a self-service portal exists, an emailed bank change bypasses the authentication and audit trail that portal provides. Push the request back into the system rather than actioning it.",
  },
  {
    id: "refusedVoiceCheck",
    question: "Has the requester avoided or refused a phone call to a number already on file?",
    weight: 24,
    detail: "An out-of-band call to the stored number is the control that defeats this fraud, so the attacker must talk you out of making it.",
  },
  {
    id: "nearCutoff",
    question: "Did it land within a few days of the payroll cut-off?",
    weight: 16,
    detail: "Timing is deliberate. Close to cut-off, the pressure to process quickly is highest and there is no slack to verify.",
  },
  {
    id: "alsoChangedContact",
    question: "Did the same request also change a phone number, address or payslip email?",
    weight: 18,
    detail: "Changing the contact details first stops the real employee receiving the confirmation notice, buying the attacker a full pay cycle before anyone notices.",
  },
  {
    id: "newEmployee",
    question: "Is the account with a bank or fintech the employee has never used before?",
    weight: 10,
    detail: "Not suspicious on its own — people do switch banks — but combined with any other flag it raises the priority of verifying.",
  },
];

export const RISK_BANDS = [
  { min: 70, band: "Do not process — treat as fraud", tone: "danger" },
  { min: 45, band: "High risk — verify by voice first", tone: "danger" },
  { min: 20, band: "Suspicious — needs out-of-band checks", tone: "warn" },
  { min: 10, band: "Worth a second look", tone: "warn" },
  { min: 0, band: "No strong signals found", tone: "ok" },
];

/** Annotated teardown of the standard payroll-diversion email. */
export const PAYROLL_LURE_ANATOMY = [
  {
    part: "Display name",
    lure: "Priya Menon <priya.menon.hr@gmail.com>",
    tell: "The name shown in the inbox is free text chosen by the sender. On a phone, most mail apps show only that name and hide the address entirely.",
  },
  {
    part: "Opening line",
    lure: "\"Hi, I've changed banks and need to update my salary account.\"",
    tell: "Mundane and plausible on purpose. Nothing about the request is technically unusual, which is why it gets processed.",
  },
  {
    part: "Reason given",
    lure: "\"I no longer have access to my old account.\"",
    tell: "Pre-empts the obvious control of paying into the account already on file while the change is verified.",
  },
  {
    part: "Availability",
    lure: "\"I'm in meetings all day — email is best.\"",
    tell: "The whole email exists to prevent one phone call to the number in the HR record. Anyone steering you away from a voice check is the reason to make it.",
  },
  {
    part: "Timing",
    lure: "\"Can this be done before this month's payroll run?\"",
    tell: "Aligned to your cut-off date so the change is processed under time pressure and the money leaves before anyone reconciles.",
  },
  {
    part: "The new account",
    lure: "Account name: P. M. Enterprises",
    tell: "Salary should land in an account in the employee's own name. A business or third-party name is a stop-the-payment signal.",
  },
  {
    part: "Follow-up",
    lure: "\"Please confirm once it's updated.\"",
    tell: "The attacker needs to know the change landed so they can plan the withdrawal on pay day.",
  },
];

/** The control set that actually stops this, in order. */
export const VERIFICATION_PROTOCOL = [
  "Call the employee on the number already stored in the HR system — never a number supplied in the request.",
  "Confirm the change with the employee's line manager independently of the email thread.",
  "Require bank changes to be submitted through the HR self-service portal with re-authentication, not by email.",
  "Send a change notification to the previously stored email and phone, so the real employee hears about it.",
  "Hold the change for one pay cycle where policy allows, or pay the first cycle into the old account until confirmed.",
  "If the money has already gone, tell your bank the same day and ask for a recall — recovery odds fall sharply once the funds are withdrawn.",
];

/** Levenshtein edit distance, for lookalike-domain detection. */
export function editDistance(a = "", b = "") {
  const s = String(a);
  const t = String(b);
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  let prev = Array.from({ length: t.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[t.length];
}

/** Best-effort registrable domain (eTLD+1). */
export function registrableDomain(host) {
  const clean = String(host ?? "").trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.+$/, "");
  if (!clean) return "";
  const labels = clean.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return labels.slice(-3).join(".");
  return lastTwo;
}

/** Domain part of an email address, or "". */
export function emailDomain(address) {
  const value = String(address ?? "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return "";
  const domain = value.slice(at + 1).replace(/[>\s]+$/, "");
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? domain : "";
}

function matched(text, phrases) {
  const hay = String(text ?? "").toLowerCase();
  return phrases.filter((p) => hay.includes(p));
}

function bandFor(score) {
  return RISK_BANDS.find((b) => score >= b.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Score a bank-change request that claims to come from an employee.
 *
 * @param {object} input
 * @param {string} input.fromAddress   Sender address as it appears in the header.
 * @param {string} input.replyTo       Reply-To address, if any.
 * @param {string} input.employerDomain Your own organisation's mail domain.
 * @param {string} input.body          Visible message text (subject may be included).
 * @param {object} input.answers       Yes/no answers keyed by MANUAL_CHECKS id.
 * @returns {{error:string}|{score:number,band:string,tone:string,findings:Array}}
 */
export function assessPayrollRedirect({
  fromAddress = "",
  replyTo = "",
  employerDomain = "",
  body = "",
  answers = {},
} = {}) {
  const from = String(fromAddress ?? "").trim();
  const reply = String(replyTo ?? "").trim();
  const text = String(body ?? "");

  if (!from && !text.trim() && !Object.values(answers ?? {}).some(Boolean)) {
    return { error: "Enter the sender address or paste the request text, or answer at least one check below." };
  }

  const findings = [];
  const add = (severity, weight, title, detail) => findings.push({ severity, weight, title, detail });

  const fromReg = registrableDomain(emailDomain(from));
  const replyReg = registrableDomain(emailDomain(reply));
  const employerReg = registrableDomain(employerDomain);

  if (from && !fromReg) {
    add("warn", 8, "Sender address could not be read", "Paste the full address including everything after the @ so the domain can be compared.");
  }

  if (fromReg && FREE_MAIL_DOMAINS.includes(fromReg)) {
    add("critical", 26, "Request sent from a personal mailbox",
      `${fromReg} is a consumer mail provider that anyone can sign up to. A staff bank change should come from the employee's work account or the HR portal, not a free mailbox.`);
  }

  if (fromReg && employerReg && fromReg !== employerReg && !FREE_MAIL_DOMAINS.includes(fromReg)) {
    const distance = editDistance(fromReg, employerReg);
    if (distance <= 2) {
      add("critical", 32, "Lookalike company domain",
        `${fromReg} differs from ${employerReg} by ${distance} character${distance === 1 ? "" : "s"}. Registering a near-identical domain costs a few pounds and survives a glance at the address bar.`);
    } else {
      add("critical", 24, "External sender for an internal request",
        `The request came from ${fromReg}, not ${employerReg}. Internal payroll changes should originate inside your own domain or your HR system.`);
    }
  }

  if (fromReg && employerReg && fromReg === employerReg) {
    add("warn", 6, "Sent from inside your own domain",
      "This lowers the odds of a spoof but does not clear the request: a compromised staff mailbox sends genuinely internal mail. Verify by voice anyway.");
  }

  if (fromReg && replyReg && fromReg !== replyReg) {
    add("critical", 22, "Reply-To points somewhere else",
      `The message is from ${fromReg} but replies go to ${replyReg}. Your confirmation, and any payslip you attach, reaches the attacker instead of the employee.`);
  }

  const accountChange = matched(text, ACCOUNT_CHANGE_PHRASES);
  if (accountChange.length) {
    add("warn", 12, "Asks to change where salary is paid",
      `Wording such as "${accountChange[0]}" is the request itself. Legitimate or not, every bank change needs the same out-of-band verification.`);
  }

  const noContact = matched(text, NO_CONTACT_PHRASES);
  if (noContact.length) {
    add("critical", 22, "Steers you away from a phone call",
      `"${noContact[0]}" removes the one control that reliably stops this fraud. Treat any excuse for avoiding a voice check as the reason to insist on one.`);
  }

  const cutoff = matched(text, CUTOFF_PHRASES);
  if (cutoff.length) {
    add("warn", 12, "Pressure tied to the payroll calendar",
      `"${cutoff[0]}" aims the request at your cut-off date, when there is least time to verify. Missing one cycle costs an employee a few days; paying a fraudster costs the whole salary.`);
  }

  const confirmation = matched(text, CONFIRMATION_PHRASES);
  if (confirmation.length) {
    add("info", 6, "Asks for confirmation that the change went through",
      "The sender needs to know the new account is live before pay day so the withdrawal can be timed. On its own this is normal politeness; alongside other flags it fits the pattern.");
  }

  for (const check of MANUAL_CHECKS) {
    if (answers?.[check.id]) {
      const severity = check.weight >= 22 ? "critical" : check.weight >= 15 ? "warn" : "info";
      add(severity, check.weight, check.question.replace(/\?$/, ""), check.detail);
    }
  }

  const score = Math.min(100, findings.reduce((sum, f) => sum + f.weight, 0));
  const { band, tone } = bandFor(score);
  const order = { critical: 0, warn: 1, info: 2, ok: 3 };

  return {
    score,
    band,
    tone,
    findings: findings.sort((a, b) => (order[a.severity] - order[b.severity]) || (b.weight - a.weight)),
  };
}

/**
 * Money at risk if a diverted salary is not caught.
 *
 * Salary fraud is normally discovered when the employee reports a missing
 * payment, so the minimum exposure is one full pay cycle per affected person.
 *
 * @returns {{error:string}|{perCycle:number,total:number,cycles:number,employees:number}}
 */
export function estimateDiversionExposure({ netPayPerCycle, employees = 1, cycles = 1 } = {}) {
  const pay = Number(netPayPerCycle);
  const people = Number(employees);
  const runs = Number(cycles);

  if (![pay, people, runs].every((v) => Number.isFinite(v))) {
    return { error: "Enter numbers for net pay, employees and pay cycles." };
  }
  if (pay <= 0) return { error: "Net pay per cycle must be greater than zero." };
  if (people < 1 || !Number.isInteger(people)) return { error: "Employees affected must be a whole number of 1 or more." };
  if (runs < 1 || !Number.isInteger(runs)) return { error: "Pay cycles must be a whole number of 1 or more — one cycle is the minimum, because the fraud surfaces on pay day." };
  if (pay > 1e11 || people > 1e6 || runs > 120) return { error: "Those figures are outside a realistic payroll range." };

  const perCycle = pay * people;
  return { perCycle, total: perCycle * runs, cycles: runs, employees: people };
}
