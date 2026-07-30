/**
 * Attachment File Type Risk Explainer — pure filename analysis.
 *
 * Ratings come from what the operating system does with the file when it is
 * double-clicked, not from any scan of the contents:
 *  - Microsoft's "Blocked attachments in Outlook" Level 1 list is the reference
 *    for extensions mail clients refuse outright.
 *  - Office macro formats (.docm, .xlsm, .pptm) are treated separately because
 *    Microsoft has blocked VBA macros in files carrying the Mark of the Web by
 *    default since 2022, which pushed attackers towards .lnk, .iso and .one.
 *  - Container formats matter because an archive both hides its contents from
 *    scanners and, when encrypted, cannot be scanned at all.
 */

/** Risk families, ordered from most to least dangerous when opened blind. */
export const FAMILIES = {
  executable: {
    label: "Runs as a program",
    base: 60,
    summary: "Double-clicking hands the file full control of your user account.",
  },
  script: {
    label: "Runs as a script",
    base: 55,
    summary: "A built-in interpreter executes it — no installer and no prompt.",
  },
  shortcut: {
    label: "Launches something else",
    base: 50,
    summary: "The file is a pointer; the command it runs is hidden in its properties.",
  },
  macro: {
    label: "Document that can carry code",
    base: 40,
    summary: "Safe until macros or content are enabled — the click that matters is the yellow bar.",
  },
  archive: {
    label: "Container",
    base: 30,
    summary: "Hides what is inside from mail filters; a password on it defeats scanning entirely.",
  },
  document: {
    label: "Document",
    base: 18,
    summary: "Usually inert, but can embed links, remote content or an exploit for the reader.",
  },
  media: {
    label: "Image, audio or video",
    base: 10,
    summary: "Rarely dangerous on its own; keep the player and OS patched.",
  },
  data: {
    label: "Plain data",
    base: 8,
    summary: "No code path of its own. Check where the data ends up rather than the file itself.",
  },
  unknown: {
    label: "Unrecognised",
    base: 20,
    summary: "Not in this reference. Treat an unfamiliar extension as executable until you know better.",
  },
};

/**
 * Extension reference. outlookBlocked marks the Microsoft Outlook Level 1
 * blocked-attachment list, which mail servers commonly mirror.
 */
export const EXTENSION_TABLE = {
  exe: { family: "executable", outlookBlocked: true, note: "A Windows program. Nothing else needs to go wrong once it runs." },
  msi: { family: "executable", outlookBlocked: true, note: "Windows installer package — runs with installation privileges." },
  msix: { family: "executable", outlookBlocked: false, note: "Modern Windows app package; installs an application." },
  scr: { family: "executable", outlookBlocked: true, note: "A screensaver is an ordinary executable with a different extension." },
  com: { family: "executable", outlookBlocked: true, note: "Legacy DOS executable; also confusable with the .com in a domain name." },
  pif: { family: "executable", outlookBlocked: true, note: "Old shortcut-to-DOS format that Windows still runs as a program." },
  cpl: { family: "executable", outlookBlocked: true, note: "Control Panel item — a DLL that runs on open." },
  jar: { family: "executable", outlookBlocked: true, note: "Runs on any machine with a Java runtime, Windows or not." },
  apk: { family: "executable", outlookBlocked: false, note: "Android package. Installing one from outside a store needs sideloading to be switched on." },
  dmg: { family: "archive", outlookBlocked: false, note: "macOS disk image; usually contains an app you then drag and run." },
  pkg: { family: "executable", outlookBlocked: false, note: "macOS installer package — can run scripts before and after install." },
  deb: { family: "executable", outlookBlocked: false, note: "Debian/Ubuntu package; maintainer scripts run as root during install." },
  rpm: { family: "executable", outlookBlocked: false, note: "Red Hat package; scriptlets run as root during install." },
  bat: { family: "script", outlookBlocked: true, note: "Batch file — the commands inside run in a console window." },
  cmd: { family: "script", outlookBlocked: true, note: "Batch file for cmd.exe; same effect as .bat." },
  ps1: { family: "script", outlookBlocked: true, note: "PowerShell script with full access to the system and the network." },
  psm1: { family: "script", outlookBlocked: true, note: "PowerShell module — loaded and executed like a script." },
  vbs: { family: "script", outlookBlocked: true, note: "VBScript run by wscript.exe. A long-standing malware favourite." },
  vbe: { family: "script", outlookBlocked: true, note: "Encoded VBScript — the encoding exists only to hide the contents." },
  js: { family: "script", outlookBlocked: true, note: "Outside a browser, Windows Script Host runs .js with no sandbox at all." },
  jse: { family: "script", outlookBlocked: true, note: "Encoded JScript; same execution, obfuscated source." },
  wsf: { family: "script", outlookBlocked: true, note: "Windows Script File that can mix VBScript and JScript." },
  wsh: { family: "script", outlookBlocked: true, note: "Windows Script Host settings file used to launch a script." },
  hta: { family: "script", outlookBlocked: true, note: "HTML Application: web markup that runs outside the browser sandbox." },
  reg: { family: "script", outlookBlocked: true, note: "Merging it rewrites the Windows registry, including startup entries." },
  sh: { family: "script", outlookBlocked: false, note: "Shell script for macOS or Linux; harmless as text, dangerous when executed." },
  py: { family: "script", outlookBlocked: false, note: "Python script — runs with your permissions if Python is installed." },
  scpt: { family: "script", outlookBlocked: false, note: "AppleScript can drive any app on a Mac, including Mail and Finder." },
  lnk: { family: "shortcut", outlookBlocked: true, note: "A shortcut whose target can be a long PowerShell command. Became a leading payload after macros were blocked." },
  url: { family: "shortcut", outlookBlocked: true, note: "Internet shortcut; opens a location you cannot see in the file name." },
  inf: { family: "shortcut", outlookBlocked: true, note: "Setup information file that can be invoked to install a driver or run a command." },
  scf: { family: "shortcut", outlookBlocked: true, note: "Explorer command file — historically triggered on mere folder view." },
  docm: { family: "macro", outlookBlocked: false, note: "Macro-enabled Word document. Macros in internet-sourced files are blocked by default since 2022." },
  xlsm: { family: "macro", outlookBlocked: false, note: "Macro-enabled Excel workbook; also the home of XLM/Excel 4.0 macros." },
  xlsb: { family: "macro", outlookBlocked: false, note: "Binary Excel workbook that can hold macros and is harder for scanners to read." },
  pptm: { family: "macro", outlookBlocked: false, note: "Macro-enabled PowerPoint file." },
  dotm: { family: "macro", outlookBlocked: false, note: "Macro-enabled Word template — loads code when a document based on it opens." },
  xlam: { family: "macro", outlookBlocked: false, note: "Excel add-in; loads its code into Excel at startup." },
  doc: { family: "macro", outlookBlocked: false, note: "Legacy binary Word format. It can contain macros, unlike .docx." },
  xls: { family: "macro", outlookBlocked: false, note: "Legacy binary Excel format; supports both VBA and Excel 4.0 macros." },
  ppt: { family: "macro", outlookBlocked: false, note: "Legacy binary PowerPoint format that can carry macros." },
  one: { family: "macro", outlookBlocked: false, note: "OneNote section. Pages can embed a file that runs when double-clicked." },
  mdb: { family: "macro", outlookBlocked: true, note: "Access database — can contain macros and VBA modules." },
  accdb: { family: "macro", outlookBlocked: false, note: "Access database with the same macro and VBA capability." },
  zip: { family: "archive", outlookBlocked: false, note: "Hides its contents from filters. What matters is the extension of the file inside." },
  rar: { family: "archive", outlookBlocked: false, note: "Needs extra software to open and is common in malware delivery." },
  "7z": { family: "archive", outlookBlocked: false, note: "Supports strong encryption, which stops mail gateways scanning the contents." },
  gz: { family: "archive", outlookBlocked: false, note: "Compressed stream, usually wrapping a tar archive." },
  tar: { family: "archive", outlookBlocked: false, note: "Bundle of files with permissions preserved; inert until extracted." },
  iso: { family: "archive", outlookBlocked: false, note: "Mounts as a drive. Used because files inside historically lost the Mark of the Web." },
  img: { family: "archive", outlookBlocked: false, note: "Disk image with the same mount-and-run behaviour as .iso." },
  vhd: { family: "archive", outlookBlocked: false, note: "Virtual hard disk that Windows will mount on double-click." },
  cab: { family: "archive", outlookBlocked: false, note: "Windows cabinet archive, sometimes paired with an .inf to install." },
  pdf: { family: "document", outlookBlocked: false, note: "Inert text and images, but can hold links, forms and embedded files. Most PDF attacks are just a link to a fake login." },
  docx: { family: "document", outlookBlocked: false, note: "Modern Word format that cannot store macros — but can pull remote content." },
  xlsx: { family: "document", outlookBlocked: false, note: "Modern Excel format without macro storage." },
  pptx: { family: "document", outlookBlocked: false, note: "Modern PowerPoint format without macro storage." },
  rtf: { family: "document", outlookBlocked: false, note: "Rich text can embed objects and has a long history of reader exploits." },
  html: { family: "document", outlookBlocked: false, note: "Opens in your browser and can rebuild a file in JavaScript — the HTML smuggling trick." },
  htm: { family: "document", outlookBlocked: false, note: "Same as .html: a local page that can script and redirect." },
  svg: { family: "document", outlookBlocked: false, note: "An image format that is really XML and can contain scripts when opened in a browser." },
  xml: { family: "data", outlookBlocked: false, note: "Structured text. Risk depends entirely on the program that consumes it." },
  csv: { family: "data", outlookBlocked: false, note: "Plain text, but a cell starting with = can become a formula when opened in a spreadsheet." },
  txt: { family: "data", outlookBlocked: false, note: "Just text. Check that the extension really is .txt and not a disguise." },
  json: { family: "data", outlookBlocked: false, note: "Data only; harmless to view in a text editor." },
  jpg: { family: "media", outlookBlocked: false, note: "Photo. Modern decoders are hardened, though not immune." },
  jpeg: { family: "media", outlookBlocked: false, note: "Photo; same as .jpg." },
  png: { family: "media", outlookBlocked: false, note: "Image; safe to preview on a patched system." },
  gif: { family: "media", outlookBlocked: false, note: "Animated image; inert." },
  webp: { family: "media", outlookBlocked: false, note: "Image format; keep the browser updated, as decoder bugs have been exploited." },
  mp4: { family: "media", outlookBlocked: false, note: "Video container; playback is the only risk surface." },
  mp3: { family: "media", outlookBlocked: false, note: "Audio; inert." },
};

/** Extensions people expect to be harmless — the ones used as the bait half of a double extension. */
export const DECOY_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv",
  "jpg", "jpeg", "png", "gif", "mp4", "mp3", "zip", "html", "json", "xml",
];

/** Families whose files execute without any further confirmation. */
export const EXECUTING_FAMILIES = ["executable", "script", "shortcut"];

/** Extra points added by each disguise. */
export const FINDING_WEIGHTS = {
  bidi: 40,
  doubleExtension: 25,
  homoglyph: 15,
  outlookBlocked: 10,
  archiveNesting: 10,
  trailingSpace: 10,
  noExtension: 10,
  longName: 5,
  spacedPadding: 10,
};

/** Score bands. */
export const VERDICT_BANDS = [
  { min: 70, label: "Do not open", advice: "Report it and delete it. If it came from a colleague, phone them — accounts get taken over." },
  { min: 45, label: "High risk", advice: "Open only in a sandbox or a throwaway VM, and only if you were expecting this exact file." },
  { min: 20, label: "Handle with care", advice: "Confirm with the sender through a channel you chose, then open with content and macros disabled." },
  { min: 0, label: "Low structural risk", advice: "The file type is not the problem here. Judge the message and the sender instead." },
];

const BIDI_RANGES = [
  [0x202a, 0x202e],
  [0x2066, 0x2069],
  [0x200e, 0x200f],
];

/** Characters that make a file name display differently from what it is. */
export function findBidiCharacters(text) {
  const s = String(text == null ? "" : text);
  const found = [];
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (BIDI_RANGES.some(([lo, hi]) => code >= lo && code <= hi)) {
      found.push(`U+${code.toString(16).toUpperCase().padStart(4, "0")}`);
    }
  }
  return found;
}

/** Non-ASCII letters inside a name, which can imitate Latin characters. */
export function hasNonAscii(text) {
  const s = String(text == null ? "" : text);
  for (let i = 0; i < s.length; i += 1) {
    if (s.charCodeAt(i) > 127) return true;
  }
  return false;
}

/**
 * Split a file name into its base and its chain of extensions.
 * "invoice.pdf.exe" -> { base: "invoice", extensions: ["pdf", "exe"] }
 */
export function splitFileName(name) {
  const raw = String(name == null ? "" : name);
  const stripped = raw.split(/[\\/]/).pop() || "";
  const leadingDot = stripped.startsWith(".");
  const body = leadingDot ? stripped.slice(1) : stripped;
  const pieces = body.split(".");
  const base = (leadingDot ? "." : "") + pieces[0];
  const extensions = pieces
    .slice(1)
    .map((piece) => piece.trim().toLowerCase())
    .filter((piece) => piece !== "");
  return { base, extensions, hadPath: stripped !== raw };
}

/** Look up one extension, falling back to the unknown family. */
export function describeExtension(ext) {
  const key = String(ext || "").toLowerCase();
  const entry = EXTENSION_TABLE[key];
  if (!entry) {
    return { ext: key, family: "unknown", outlookBlocked: false, note: FAMILIES.unknown.summary, known: false };
  }
  return { ext: key, ...entry, known: true };
}

/**
 * Assess a single attachment file name.
 * Returns { error } when there is nothing usable to assess.
 */
export function assessAttachment(name) {
  const raw = String(name == null ? "" : name);
  const trimmed = raw.trim();
  if (trimmed === "") return { error: "Type the exact file name of the attachment, including its extension." };
  if (trimmed.length > 400) return { error: "That is longer than 400 characters — paste just the file name." };

  const { base, extensions, hadPath } = splitFileName(raw);
  const findings = [];
  const add = (id, level, title, detail, weight) => findings.push({ id, level, title, detail, weight });

  const last = extensions.length > 0 ? extensions[extensions.length - 1] : "";
  const primary = describeExtension(last);
  const family = FAMILIES[primary.family] || FAMILIES.unknown;
  let score = extensions.length === 0 ? FAMILIES.unknown.base : family.base;

  if (extensions.length === 0) {
    score += FINDING_WEIGHTS.noExtension;
    add(
      "no-extension",
      "warn",
      "No extension in the name",
      "Windows hides extensions for known file types by default, so a name with none showing may still be an .exe. Turn on 'File name extensions' in Explorer's View tab before you judge any attachment.",
      FINDING_WEIGHTS.noExtension
    );
  }

  const bidi = findBidiCharacters(raw);
  if (bidi.length > 0) {
    score += FINDING_WEIGHTS.bidi;
    add(
      "bidi",
      "danger",
      `Hidden text-direction character (${bidi.join(", ")})`,
      "A right-to-left override reverses how the rest of the name is drawn, so a file that ends in .exe can display as if it ended in .doc. There is no legitimate reason for this character in an attachment name.",
      FINDING_WEIGHTS.bidi
    );
  }

  if (extensions.length >= 2) {
    const previous = extensions[extensions.length - 2];
    const disguise = DECOY_EXTENSIONS.includes(previous) && EXECUTING_FAMILIES.includes(primary.family);
    if (disguise) {
      score += FINDING_WEIGHTS.doubleExtension;
      add(
        "double-extension",
        "danger",
        `.${previous}.${last} — a double extension`,
        `Only the last extension decides what happens: this file is a ${FAMILIES[primary.family].label.toLowerCase()}, not a ${previous.toUpperCase()}. With extensions hidden, Windows displays it as "${base}.${previous}".`,
        FINDING_WEIGHTS.doubleExtension
      );
    } else if (DECOY_EXTENSIONS.includes(previous)) {
      add(
        "multi-extension",
        "info",
        "More than one extension",
        `Two dotted parts are usually harmless (a version or a date), but always read the final one — here that is .${last}.`,
        0
      );
    }
    const archiveCount = extensions.filter((ext) => describeExtension(ext).family === "archive").length;
    if (archiveCount >= 2) {
      score += FINDING_WEIGHTS.archiveNesting;
      add(
        "archive-nesting",
        "warn",
        "An archive inside an archive",
        "Nested containers exist to get past scanners that only look one layer deep. Legitimate senders rarely double-wrap a file.",
        FINDING_WEIGHTS.archiveNesting
      );
    }
  }

  if (primary.outlookBlocked) {
    score += FINDING_WEIGHTS.outlookBlocked;
    add(
      "outlook-blocked",
      "warn",
      `.${last} is on Outlook's blocked list`,
      "Microsoft blocks this extension in Outlook by default, so a sender who reaches you with it has usually renamed it or wrapped it in an archive to get around the filter. That effort is itself the warning.",
      FINDING_WEIGHTS.outlookBlocked
    );
  }

  if (/[ .]$/.test(trimmed)) {
    score += FINDING_WEIGHTS.trailingSpace;
    add(
      "trailing-space",
      "warn",
      "Name ends in a space or dot",
      "Windows silently strips trailing spaces and dots, so the name you see is not the name on disk. It is a padding trick, not a typo.",
      FINDING_WEIGHTS.trailingSpace
    );
  }

  if (/ {4,}/.test(raw)) {
    score += FINDING_WEIGHTS.spacedPadding;
    add(
      "space-padding",
      "warn",
      "Long run of spaces in the name",
      "Runs of spaces push the real extension past the edge of the attachment box so only the harmless-looking part is visible.",
      FINDING_WEIGHTS.spacedPadding
    );
  }

  if (hasNonAscii(raw) && bidi.length === 0) {
    score += FINDING_WEIGHTS.homoglyph;
    add(
      "non-ascii",
      "warn",
      "Non-ASCII characters in the name",
      "Letters from other alphabets can look identical to Latin ones. Harmless in a genuinely non-English file name — worth a second look when the rest of the name is English.",
      FINDING_WEIGHTS.homoglyph
    );
  }

  if (trimmed.length > 100) {
    score += FINDING_WEIGHTS.longName;
    add(
      "long-name",
      "info",
      `${trimmed.length}-character file name`,
      "Very long names get truncated in the attachment list, hiding whatever is at the end — including the extension.",
      FINDING_WEIGHTS.longName
    );
  }

  if (hadPath) {
    add(
      "path-stripped",
      "info",
      "Folder path removed",
      "Only the final file name is assessed; the folders it sits in do not change what opening it does.",
      0
    );
  }

  if (!primary.known && extensions.length > 0) {
    add(
      "unknown-extension",
      "warn",
      `.${last} is not in this reference`,
      "An extension you do not recognise should be treated as executable until you have identified it. Never open it to find out what it is.",
      0
    );
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const band = VERDICT_BANDS.find((entry) => score >= entry.min) || VERDICT_BANDS[VERDICT_BANDS.length - 1];

  const handling = [];
  if (EXECUTING_FAMILIES.includes(primary.family)) {
    handling.push("Do not double-click it. There is no 'preview' for a file that executes.");
    handling.push("If you must identify it, upload it to a multi-engine scanner from a machine you can rebuild.");
  }
  if (primary.family === "macro") {
    handling.push("Open it in Protected View and never press 'Enable Content' on a file you did not ask for.");
  }
  if (primary.family === "archive") {
    handling.push("Extract in a folder you can delete, then re-check the extension of what comes out.");
  }
  if (primary.family === "document" || primary.family === "media" || primary.family === "data") {
    handling.push("Preview it in the browser or the mail client rather than downloading it, if you can.");
  }
  handling.push("Confirm with the sender on a number or address you already had, not one from the message.");

  return {
    name: trimmed,
    base,
    extensions,
    primaryExtension: last,
    family: primary.family,
    familyLabel: family.label,
    familySummary: family.summary,
    extensionNote: primary.note,
    known: primary.known,
    outlookBlocked: Boolean(primary.outlookBlocked),
    findings,
    score,
    verdict: band.label,
    advice: band.advice,
    handling,
  };
}

/** Reference table grouped by family, for the on-page cheat sheet. */
export function extensionsByFamily() {
  const grouped = {};
  Object.keys(FAMILIES).forEach((family) => {
    if (family === "unknown") return;
    grouped[family] = [];
  });
  Object.keys(EXTENSION_TABLE).forEach((ext) => {
    const family = EXTENSION_TABLE[ext].family;
    if (!grouped[family]) grouped[family] = [];
    grouped[family].push(ext);
  });
  Object.keys(grouped).forEach((family) => grouped[family].sort());
  return grouped;
}
