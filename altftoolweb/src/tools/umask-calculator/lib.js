/**
 * umask arithmetic — POSIX umask(2) / sh umask builtin.
 *
 * A process's umask is a bit mask that CLEARS permission bits from the mode a
 * program requests when creating a file:
 *
 *   effective mode = requested mode & ~umask
 *
 * Almost every program requests 0666 for new regular files (open(2) with
 * O_CREAT) and 0777 for new directories (mkdir(2)), so:
 *   files       = 666 & ~umask
 *   directories = 777 & ~umask
 *
 * The umask never ADDS bits — it can only remove them — and it does not touch
 * files that already exist.
 *
 * Pure module — no React, no DOM.
 */

/** Mode requested by open(2)/creat(2) for new regular files in virtually all tools. */
export const FILE_BASE_MODE = 0o666;
/** Mode requested by mkdir(2)/mkdir(1) for new directories. */
export const DIR_BASE_MODE = 0o777;
/** Full 12-bit permission mask (special bits + rwxrwxrwx). */
export const FULL_MODE_MASK = 0o7777;

/** Umask values people actually use. */
export const COMMON_UMASKS = [
  { value: "022", note: "Default on most Linux distros — group/others lose write" },
  { value: "002", note: "Group-collaboration default (Debian/Ubuntu user-private groups)" },
  { value: "027", note: "Hardened — group loses write, others lose everything" },
  { value: "077", note: "Private — only the owner gets any access" },
  { value: "000", note: "No masking — world-writable files (dangerous)" },
];

/** Octal string (3 digits, or 4 when special bits are involved). */
export function toOctal(mode) {
  const value = mode & FULL_MODE_MASK;
  const special = (value >> 9) & 0o7;
  const core = (value & 0o777).toString(8).padStart(3, "0");
  return special > 0 ? `${special}${core}` : core;
}

/** rwx string of the low 9 bits, e.g. 0o644 -> "rw-r--r--". */
export function toSymbolic(mode) {
  const flags = ["r", "w", "x"];
  let out = "";
  for (let shift = 8; shift >= 0; shift -= 1) {
    out += mode & (1 << shift) ? flags[(8 - shift) % 3] : "-";
  }
  return out;
}

/**
 * Parse a umask of 1-4 octal digits (the shell accepts "22" as 022).
 * @returns {{ok:true, value:number}} | {ok:false, message:string}
 */
export function parseUmask(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return { ok: false, message: "Enter a umask such as 022." };
  if (!/^[0-7]{1,4}$/.test(raw)) {
    return { ok: false, message: "A umask is 1 to 4 octal digits (0-7 only), e.g. 022 or 077." };
  }
  return { ok: true, value: parseInt(raw, 8) };
}

/** Per-class plain-English description of what the umask removes. */
export function describeMaskedBits(umask) {
  const classes = [
    { label: "Owner", shift: 6 },
    { label: "Group", shift: 3 },
    { label: "Others", shift: 0 },
  ];
  return classes.map(({ label, shift }) => {
    const digit = (umask >> shift) & 0o7;
    const removed = [];
    if (digit & 0o4) removed.push("read");
    if (digit & 0o2) removed.push("write");
    if (digit & 0o1) removed.push("execute");
    return { label, removed: removed.length > 0 ? removed.join(", ") : "nothing" };
  });
}

/**
 * Compute resulting file and directory modes for a umask.
 * @returns result object or { error }
 */
export function computeUmask({ umaskText }) {
  const parsed = parseUmask(umaskText);
  if (!parsed.ok) return { error: parsed.message };
  const umask = parsed.value;

  // POSIX: mode & ~umask
  const fileMode = FILE_BASE_MODE & ~umask & FULL_MODE_MASK;
  const dirMode = DIR_BASE_MODE & ~umask & FULL_MODE_MASK;

  const warnings = [];
  const othersDigit = umask & 0o7;
  if ((othersDigit & 0o2) === 0) {
    warnings.push("Others keep WRITE on new files — any user can modify them. Use at least umask 002.");
  }
  if (umask === 0) {
    warnings.push("umask 000 creates world-writable files and directories. Never use it on a shared system.");
  }
  if (((umask >> 6) & 0o7) !== 0) {
    warnings.push("This umask removes permissions from the OWNER — files you create will be partly inaccessible to you.");
  }

  return {
    umaskOctal: toOctal(umask).padStart(3, "0"),
    fileOctal: toOctal(fileMode),
    fileSymbolic: toSymbolic(fileMode),
    dirOctal: toOctal(dirMode),
    dirSymbolic: toSymbolic(dirMode),
    maskedByClass: describeMaskedBits(umask),
    warnings,
  };
}

/**
 * Reverse: which umask produces the desired directory mode?
 * umask = 777 & ~desiredDirMode. (Files then get desired & 666 automatically.)
 * @returns result object or { error }
 */
export function umaskForDirMode({ dirModeText }) {
  const raw = String(dirModeText ?? "").trim();
  if (raw === "") return { error: "Enter the directory mode you want, e.g. 755." };
  if (!/^[0-7]{3}$/.test(raw)) {
    return { error: "Enter the desired directory mode as 3 octal digits, e.g. 750." };
  }
  const desired = parseInt(raw, 8);
  const umask = DIR_BASE_MODE & ~desired;
  const fileMode = FILE_BASE_MODE & ~umask;
  return {
    umaskOctal: toOctal(umask).padStart(3, "0"),
    dirOctal: toOctal(desired),
    fileOctal: toOctal(fileMode),
    fileSymbolic: toSymbolic(fileMode),
    dirSymbolic: toSymbolic(desired),
  };
}
