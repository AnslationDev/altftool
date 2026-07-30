/**
 * Invoice-attachment phishing anatomy.
 *
 * Pure analysis helpers: no React, no DOM, no network. Everything below is
 * derived from published, checkable rules about how Windows and mail gateways
 * treat file names and attachment types, not from guesswork.
 */

/** U+202E RIGHT-TO-LEFT OVERRIDE — reverses the display of the text after it,
 *  so "Invoice‮fdp.exe" renders as "Invoiceexe.pdf" in most mail clients. */
export const RLO = "‮";

/** U+202D / U+202B are the other Unicode bidi overrides abused the same way. */
export const BIDI_CONTROLS = ["‪", "‫", "‬", "‭", "‮", "⁦", "⁧", "⁨", "⁩"];

/**
 * Extension classes. "Windows executable-by-double-click" types are the set
 * Microsoft itself blocks in Outlook's Level 1 attachment list; the macro list
 * is the Office Open XML macro-enabled set.
 */
export const EXTENSION_CLASSES = {
  executable: {
    label: "Direct executable",
    exts: ["exe", "com", "scr", "pif", "msi", "msix", "appx", "dll", "cpl", "msc", "jar"],
    why: "Runs code the moment it is double-clicked. A genuine invoice is never an executable.",
    weight: 32,
  },
  script: {
    label: "Script / shortcut",
    exts: ["js", "jse", "vbs", "vbe", "wsf", "wsh", "hta", "ps1", "psm1", "bat", "cmd", "lnk", "reg", "chm", "url", "scf"],
    why: "Windows Script Host, PowerShell and .lnk shortcuts execute on open and are the most common 2023-2025 loader format.",
    weight: 32,
  },
  macro: {
    label: "Macro-enabled Office document",
    exts: ["docm", "dotm", "xlsm", "xltm", "xlsb", "xlam", "pptm", "potm", "ppam"],
    why: "Carries VBA. Office now blocks macros in files marked with the Web mark, so the mail will usually coach you into unblocking it.",
    weight: 26,
  },
  motwContainer: {
    label: "Disk-image container",
    exts: ["iso", "img", "vhd", "vhdx"],
    why: "Historically stripped the Mark of the Web from everything inside. Microsoft closed that for ISO/IMG in Windows 11 22H2 (Nov 2022); older builds are still exposed.",
    weight: 26,
  },
  archive: {
    label: "Archive",
    exts: ["zip", "rar", "7z", "tar", "gz", "tgz", "cab", "ace", "arj", "z"],
    why: "Hides the real file type from the mail gateway until you extract it.",
    weight: 12,
  },
  webPage: {
    label: "Web page attachment",
    exts: ["html", "htm", "shtml", "xhtml", "svg", "mhtml", "mht"],
    why: "HTML smuggling: the page is opened from your own disk, so the fake login form never has to be hosted anywhere a blocklist can see it.",
    weight: 26,
  },
  notebook: {
    label: "OneNote notebook",
    exts: ["one", "onepkg"],
    why: "OneNote pages can embed any file behind a fake 'Double click to view' graphic — a mainstream 2023 macro replacement.",
    weight: 24,
  },
  document: {
    label: "Plain document",
    exts: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf", "csv", "txt", "odt", "ods"],
    why: "Normal for an invoice. In these campaigns the document itself is usually clean and only carries the link or QR code.",
    weight: 4,
  },
};

/** Extensions commonly shown as the fake first half of a double extension. */
export const DECOY_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "jpg", "jpeg", "png", "htm", "html", "zip"];

/** Free mailbox providers. A real supplier invoice comes from the supplier's own domain. */
export const FREE_MAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "ymail.com", "rediffmail.com", "aol.com",
  "gmx.com", "gmx.de", "mail.ru", "yandex.com", "proton.me", "protonmail.com", "zoho.com", "icloud.com",
];

/** Phrases that only exist to make you unblock the payload. */
export const MACRO_COACHING_PHRASES = [
  "enable content", "enable editing", "enable macros", "click enable", "protected view",
  "document is protected", "unlock the document", "double click to view", "open with a computer",
];

/** Payment-diversion phrasing. */
export const BANK_CHANGE_PHRASES = [
  "updated bank details", "new bank account", "new account number", "changed our bank",
  "remit to the account below", "revised remittance", "updated iban", "new beneficiary",
];

/** Pressure phrasing typical of overdue-invoice lures. */
export const URGENCY_PHRASES = [
  "overdue", "final notice", "final reminder", "immediate payment", "within 24 hours",
  "within 48 hours", "legal action", "account suspension", "avoid late fees", "past due", "urgent payment",
];

/** Generic openings — a real supplier has your name and an account number. */
export const GENERIC_GREETINGS = ["dear customer", "dear sir or madam", "dear sir/madam", "dear user", "dear client", "to whom it may concern"];

/** Password-protected archive wording: defeats gateway antivirus by design. */
export const ARCHIVE_PASSWORD_PHRASES = ["password is", "password:", "archive password", "zip password", "use the password"];

/** Two-label public suffixes we need so example.co.uk is not read as "co.uk". Approximation, not the full PSL. */
const MULTI_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk",
  "co.in", "net.in", "org.in", "ac.in", "edu.in", "gov.in", "nic.in", "firm.in",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "co.nz", "org.nz", "ac.nz", "co.za", "org.za",
  "co.jp", "or.jp", "ne.jp", "ac.jp", "com.br", "com.mx", "com.ar",
  "com.sg", "com.my", "com.hk", "com.cn", "edu.cn", "gov.cn", "com.tw",
  "co.kr", "com.tr", "co.il", "com.ph", "co.th", "com.vn", "com.pk", "com.bd", "com.ng",
]);

/** Severity weight added when a rule fires. Score is capped at 100. */
const MAX_SCORE = 100;

export const RISK_BANDS = [
  { min: 70, band: "Almost certainly malicious", tone: "danger" },
  { min: 45, band: "High risk", tone: "danger" },
  { min: 20, band: "Suspicious", tone: "warn" },
  { min: 10, band: "Worth a second look", tone: "warn" },
  { min: 0, band: "No strong signals found", tone: "ok" },
];

/**
 * Annotated teardown of the standard fake-invoice email. Static reference data
 * used by the UI; each entry is a part of the message and what to check.
 */
export const INVOICE_LURE_ANATOMY = [
  {
    part: "From / display name",
    lure: "Accounts Payable <billing@acme-invoices-secure.com>",
    tell: "The display name is free text set by the sender. Only the part after the @ matters, and it is a domain registered for this campaign, not the supplier's real one.",
  },
  {
    part: "Reply-To",
    lure: "Reply-To: accounts.acme@gmail.com",
    tell: "Hidden in most clients. A From address on one domain and a Reply-To on another means your reply goes to the attacker, not the sender.",
  },
  {
    part: "Subject",
    lure: "INVOICE 4417 — OVERDUE — action required today",
    tell: "An invoice number you cannot match to a purchase order, plus a deadline. Urgency exists to stop you checking.",
  },
  {
    part: "Body",
    lure: "\"Please find the attached statement. Enable editing to view the invoice.\"",
    tell: "No genuine document needs you to click Enable Editing or Enable Content. That instruction exists only to switch off Office's macro protection.",
  },
  {
    part: "Attachment",
    lure: "Invoice_4417.pdf.lnk inside Invoice_4417.zip (password: 2024)",
    tell: "The archive hides the real type from the gateway, the password stops it being scanned at all, and the .lnk inside runs a command when opened.",
  },
  {
    part: "Payment block",
    lure: "\"Our bank details have changed — please remit to the account below.\"",
    tell: "The actual goal of most invoice fraud. Bank changes are verified by calling a number you already had, never one printed in the email.",
  },
];

/** Steps that actually settle the question, in order. */
export const VERIFICATION_STEPS = [
  "Match the invoice to a purchase order or a service you actually ordered. No PO, no payment.",
  "Call the supplier on the number from your own records or a previous contract — never a number in the email.",
  "Treat any change of bank details as a separate, independently verified request, even if the thread looks real.",
  "Do not open the attachment to 'check'. Ask the sender to confirm the file name and hash first, or view it in a sandbox.",
  "If you already opened it, disconnect the device from the network and report it to IT the same day rather than waiting.",
];

/** Strip bidi controls so the *real* file name can be inspected. */
export function stripBidiControls(text) {
  let out = String(text ?? "");
  for (const ch of BIDI_CONTROLS) out = out.split(ch).join("");
  return out;
}

/** Levenshtein edit distance — used for lookalike-domain detection. */
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

/** Best-effort registrable domain (eTLD+1) for a host. */
export function registrableDomain(host) {
  const clean = String(host ?? "").trim().toLowerCase().replace(/\.+$/, "");
  if (!clean) return "";
  const labels = clean.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return labels.slice(-3).join(".");
  return lastTwo;
}

/** Domain part of an email address, or "" if it does not look like an address. */
export function emailDomain(address) {
  const value = String(address ?? "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return "";
  const domain = value.slice(at + 1).replace(/[>\s]+$/, "");
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? domain : "";
}

/** Split a file name into { base, extensions[] } with bidi controls removed. */
export function parseFileName(filename) {
  const raw = String(filename ?? "").trim();
  const visible = stripBidiControls(raw).replace(/\s+$/, "");
  const parts = visible.split(".");
  if (parts.length < 2) return { base: visible, extensions: [], hadBidi: visible !== raw.trim() };
  const extensions = parts.slice(1).map((p) => p.trim().toLowerCase()).filter(Boolean);
  return { base: parts[0], extensions, hadBidi: visible !== raw.trim() };
}

/** Which class an extension belongs to, or null. */
export function classifyExtension(ext) {
  const key = String(ext ?? "").trim().toLowerCase();
  if (!key) return null;
  for (const [id, def] of Object.entries(EXTENSION_CLASSES)) {
    if (def.exts.includes(key)) return { id, ...def };
  }
  return null;
}

function containsAny(haystack, phrases) {
  const text = String(haystack ?? "").toLowerCase();
  return phrases.filter((p) => text.includes(p));
}

function bandFor(score) {
  return RISK_BANDS.find((b) => score >= b.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Analyse one invoice email + attachment.
 *
 * Every input is optional except that at least one of filename / fromAddress /
 * body must be non-empty, otherwise there is nothing to judge.
 *
 * @returns {{error:string}|{score:number,band:string,tone:string,findings:Array,realName:string,extensionClass:(object|null)}}
 */
export function analyseInvoiceLure({
  filename = "",
  fromAddress = "",
  replyTo = "",
  supplierDomain = "",
  subject = "",
  body = "",
} = {}) {
  const rawName = String(filename ?? "");
  const from = String(fromAddress ?? "").trim();
  const reply = String(replyTo ?? "").trim();
  const supplier = String(supplierDomain ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const text = `${subject ?? ""}\n${body ?? ""}`;

  if (!rawName.trim() && !from && !String(body ?? "").trim() && !String(subject ?? "").trim()) {
    return { error: "Enter at least an attachment file name or the sender address to analyse." };
  }

  const findings = [];
  const add = (severity, weight, title, detail) => findings.push({ severity, weight, title, detail });

  // ---- attachment name -------------------------------------------------
  const parsed = parseFileName(rawName);
  const realName = stripBidiControls(rawName).trim();
  const finalExt = parsed.extensions.length ? parsed.extensions[parsed.extensions.length - 1] : "";
  const extensionClass = classifyExtension(finalExt);

  if (parsed.hadBidi || BIDI_CONTROLS.some((ch) => rawName.includes(ch))) {
    add("critical", 34, "Unicode right-to-left override in the file name",
      `The name contains a bidi control character, so what your mail client displays is not the real name. Stripped of the override it is "${realName}".`);
  }

  if (rawName.trim() && !parsed.extensions.length) {
    add("info", 6, "No file extension", "Without an extension the type is decided by the operating system when you open it. Ask the sender what the file actually is.");
  }

  if (parsed.extensions.length >= 2) {
    const decoy = parsed.extensions[parsed.extensions.length - 2];
    if (DECOY_EXTENSIONS.includes(decoy) && extensionClass && extensionClass.id !== "document" && extensionClass.id !== "archive") {
      add("critical", 32, "Double extension",
        `The name ends ".${decoy}.${finalExt}". Windows hides known extensions by default, so this is shown as a .${decoy} while it is really a .${finalExt} file.`);
    }
  }

  if (/ {8,}/.test(rawName)) {
    add("critical", 18, "Long run of spaces in the file name",
      "Padding pushes the real extension past the end of the visible name in the attachment bar. A genuine file name has no reason to contain a block of spaces.");
  }

  if (extensionClass) {
    const severity = extensionClass.weight >= 26 ? "critical" : extensionClass.weight >= 12 ? "warn" : "info";
    add(severity, extensionClass.weight, `${extensionClass.label} (.${finalExt})`, extensionClass.why);
  } else if (finalExt) {
    add("info", 8, `Unrecognised extension (.${finalExt})`, "Not a normal invoice format. Confirm with the sender what program is meant to open it.");
  }

  const archivePassword = containsAny(text, ARCHIVE_PASSWORD_PHRASES);
  if (archivePassword.length && (extensionClass?.id === "archive" || /\.(zip|rar|7z)\b/i.test(text))) {
    add("critical", 20, "Password-protected archive",
      "A password in the email body means your mail gateway and antivirus cannot open the archive to scan it. That is the only reason to send an invoice this way.");
  }

  // ---- addresses -------------------------------------------------------
  const fromDomain = emailDomain(from);
  const replyDomain = emailDomain(reply);
  const fromReg = registrableDomain(fromDomain);
  const replyReg = registrableDomain(replyDomain);
  const supplierReg = registrableDomain(supplier);

  if (from && !fromDomain) {
    add("warn", 10, "Sender address could not be parsed", "Paste the full address exactly as it appears, including the part after the @.");
  }

  if (fromReg && replyReg && fromReg !== replyReg) {
    add("critical", 22, "Reply-To points to a different domain",
      `Mail claims to come from ${fromReg} but replies go to ${replyReg}. Anything you send back — including a scan of the invoice — reaches the attacker.`);
  }

  if (fromReg && FREE_MAIL_DOMAINS.includes(fromReg)) {
    add("critical", 22, "Business invoice from a free mailbox",
      `${fromReg} is a consumer mail provider. A supplier billing you sends from its own domain; anyone can open an address here in two minutes.`);
  }

  if (fromReg && supplierReg) {
    if (fromReg === supplierReg) {
      add("ok", 0, "Sender domain matches the supplier you named",
        `The From domain resolves to ${supplierReg}. Note that a matching domain can still be spoofed if the supplier has no enforcing DMARC policy, so it lowers suspicion rather than clearing it.`);
    } else {
      const distance = editDistance(fromReg, supplierReg);
      if (distance <= 2) {
        add("critical", 32, "Lookalike sender domain",
          `${fromReg} is ${distance} character${distance === 1 ? "" : "s"} away from ${supplierReg}. Registering a near-miss domain is the cheapest way to pass a quick glance.`);
      } else {
        add("critical", 26, "Sender domain is not the supplier's domain",
          `Mail arrived from ${fromReg}, but you expect ${supplierReg}. Treat the invoice as unverified until the supplier confirms on a number you already had.`);
      }
    }
  }

  // ---- wording ---------------------------------------------------------
  const coaching = containsAny(text, MACRO_COACHING_PHRASES);
  if (coaching.length) {
    add("critical", 30, "Instructions to unblock the document",
      `The message says "${coaching[0]}". Office blocks macros in files that arrived from the internet; this instruction exists purely to make you switch that protection off.`);
  }

  const bankChange = containsAny(text, BANK_CHANGE_PHRASES);
  if (bankChange.length) {
    add("critical", 26, "Request to pay a new account",
      `Wording such as "${bankChange[0]}" is the payload of most invoice fraud — no malware needed. Verify a bank change by calling a known number, not by replying.`);
  }

  const urgency = containsAny(text, URGENCY_PHRASES);
  if (urgency.length) {
    add("warn", 10, "Deadline pressure",
      `Phrases like "${urgency[0]}" are there to stop you checking with the supplier. A real overdue invoice survives a phone call.`);
  }

  const greeting = containsAny(text, GENERIC_GREETINGS);
  if (greeting.length) {
    add("warn", 8, "Generic greeting",
      `"${greeting[0]}" suggests a bulk send. A supplier who bills you knows your name and your account number.`);
  }

  const score = Math.min(MAX_SCORE, findings.reduce((sum, f) => sum + f.weight, 0));
  const { band, tone } = bandFor(score);
  const order = { critical: 0, warn: 1, info: 2, ok: 3 };

  return {
    score,
    band,
    tone,
    realName,
    extensionClass,
    findings: findings.sort((a, b) => (order[a.severity] - order[b.severity]) || (b.weight - a.weight)),
  };
}
